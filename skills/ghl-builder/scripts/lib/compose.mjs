import { randomUUID } from 'node:crypto';

const ACTION_NAMES = {
  sms: 'SMS',
  email: 'Email',
  wait: 'Wait',
  add_contact_tag: 'Add Tag',
  remove_contact_tag: 'Remove Tag',
  add_notes: 'Note',
  if_else: 'If/Else',
  goto: 'Go To',
  create_opportunity: 'Create or update opportunity',
  assign_user: 'Assign to user',
  update_contact_field: 'Update contact field',
  internal_notification: 'Internal Notification'
};

function required(value, label) {
  if (value === undefined || value === null || value === '') throw new Error(`${label} is required`);
  return value;
}

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`${label} must be unique: ${value}`);
    seen.add(value);
  }
}

export function validateSpec(spec) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) throw new Error('spec must be an object');
  required(spec.name, 'spec.name');
  if (!Array.isArray(spec.triggers) || spec.triggers.length === 0) throw new Error('spec.triggers must contain at least one trigger');
  if (!Array.isArray(spec.actions)) throw new Error('spec.actions must be an array');
  if (spec.publish !== undefined && typeof spec.publish !== 'boolean') throw new Error('spec.publish must be boolean');

  const refs = [];
  const visit = (actions, path) => {
    actions.forEach((action, index) => {
      const here = `${path}[${index}]`;
      required(action?.type, `${here}.type`);
      if (action.ref) refs.push(action.ref);
      const config = action.config ?? {};
      if (action.type === 'wait') {
        if (config.mode === 'appointment') {
          const distributed = config.distributed ?? {};
          const totalMinutes = Number(distributed.days ?? 0) * 1440 + Number(distributed.hours ?? 0) * 60 + Number(distributed.minutes ?? 0);
          if (Number(distributed.months ?? 0) !== 0) throw new Error(`${here}.config.distributed.months is not supported for appointment waits`);
          if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) throw new Error(`${here}.config.distributed must contain a positive day/hour/minute duration`);
          if (config.when !== 'before') throw new Error(`${here}.config.when must be before for the verified appointment-wait variant`);
          if ((config.appointmentCondition ?? 'next') !== 'next') throw new Error(`${here}.config.appointmentCondition must be next for the verified appointment-wait variant`);
        } else if (config.window) {
          // "Wait until" a day/time window, the shape a production nurture saved.
          const { days, start, end } = config.window;
          if (!Array.isArray(days) || days.length === 0 || !days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)) throw new Error(`${here}.config.window.days must be weekday numbers 0-6 (0 = Sunday)`);
          if (!/^\d{2}:\d{2}$/.test(start ?? '') || !/^\d{2}:\d{2}$/.test(end ?? '') || start >= end) throw new Error(`${here}.config.window needs HH:MM start before end`);
        } else {
          const value = config.value ?? config.startAfter?.value;
          if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new Error(`${here}.config.value must be a positive number`);
        }
      }
      if (['add_contact_tag', 'remove_contact_tag'].includes(action.type) && (!Array.isArray(config.tags) || config.tags.length === 0)) throw new Error(`${here}.config.tags must not be empty`);
      if (action.type === 'assign_user' && (!Array.isArray(config.users) || config.users.length === 0)) throw new Error(`${here}.config.users must not be empty`);
      if (action.type === 'update_contact_field' && (!Array.isArray(config.fields) || config.fields.length === 0)) throw new Error(`${here}.config.fields must not be empty`);
      if (action.type === 'find_opportunity') {
        // Find opportunity is a three-node family: the parent plus two fixed
        // pre-defined transition children. Like if_else, its branches never
        // rejoin, so it must be terminal in its own list.
        if (index !== actions.length - 1) throw new Error(`${here} must be terminal in its action list; Opportunity Found/Not Found branches do not implicitly converge`);
        if (!Array.isArray(config.filters) || config.filters.length === 0) throw new Error(`${here}.config.filters must not be empty; Find opportunity requires at least one filter`);
        config.filters.forEach((filter, filterIndex) => {
          const prefix = `${here}.config.filters[${filterIndex}]`;
          required(filter?.field, `${prefix}.field`);
          required(filter?.operator, `${prefix}.operator`);
        });
        for (const key of ['found', 'notFound']) {
          const branch = config[key];
          if (branch !== undefined && !Array.isArray(branch.actions)) throw new Error(`${here}.config.${key}.actions must be an array`);
          if (branch?.actions) visit(branch.actions, `${here}.config.${key}.actions`);
        }
      }
      if (action.type === 'if_else') {
        if (!Array.isArray(action.branches) || action.branches.length === 0) throw new Error(`${here}.branches must not be empty`);
        if (index !== actions.length - 1) throw new Error(`${here} must be terminal in its action list; branches do not implicitly converge`);
        action.branches.forEach((branch, branchIndex) => {
          required(branch?.name, `${here}.branches[${branchIndex}].name`);
          if (!Array.isArray(branch.conditions) || branch.conditions.length === 0) throw new Error(`${here}.branches[${branchIndex}].conditions must not be empty`);
          branch.conditions.forEach((condition, conditionIndex) => {
            const prefix = `${here}.branches[${branchIndex}].conditions[${conditionIndex}]`;
            if (!condition || typeof condition !== 'object') throw new Error(`${prefix} must be an object`);
            required(condition.conditionType, `${prefix}.conditionType`);
            required(condition.field ?? condition.conditionSubType, `${prefix}.field`);
            required(condition.operator ?? condition.conditionOperator, `${prefix}.operator`);
          });
          if (!Array.isArray(branch.actions)) throw new Error(`${here}.branches[${branchIndex}].actions must be an array`);
          visit(branch.actions, `${here}.branches[${branchIndex}].actions`);
        });
        if (action.else?.actions) visit(action.else.actions, `${here}.else.actions`);
      } else if ('branches' in action || 'else' in action) {
        throw new Error(`${here} may use branches/else only when type is if_else`);
      }
    });
  };
  visit(spec.actions, 'spec.actions');
  spec.triggers.forEach((trigger, index) => {
    required(trigger?.type, `spec.triggers[${index}].type`);
    if (trigger.type === 'contact_tag' && (!Array.isArray(trigger.filters) || trigger.filters.length === 0)) throw new Error(`spec.triggers[${index}].filters must not be empty for contact_tag`);
  });
  unique(refs, 'action refs');
  return spec;
}

function catalog(data, key) {
  return Array.isArray(data?.[key]) ? data[key] : [];
}

function byName(items, value, label, extra = []) {
  required(value, label);
  const needle = String(value).toLowerCase();
  const matches = items.filter(item => [item.name, ...extra.map(key => item[key])].some(candidate => String(candidate ?? '').toLowerCase() === needle));
  if (matches.length === 0) throw new Error(`${label} not found: ${value}`);
  if (matches.length > 1) throw new Error(`${label} is ambiguous: ${value}`);
  return matches[0];
}

/**
 * Resolve one Find opportunity filter row.
 *
 * The verified shape stores the OPERATOR in `value` and the comparison value in
 * `secondValue`, which is the reverse of what the key names suggest. Pipeline
 * filters use snake_case `filterField:"pipeline_id"` and store the pipeline ID,
 * so a spec may pass a pipeline name and have it resolved here.
 */
function resolveOpportunityFilter(filter, data) {
  const field = required(filter.field, 'find_opportunity filter field');
  let value = filter.value;
  if (field === 'pipeline_id' && value !== undefined) {
    const pipelines = catalog(data, 'pipelines');
    if (pipelines.length && !pipelines.some(item => item.id === value)) value = byName(pipelines, value, 'pipeline').id;
  }
  return {
    __customInputs__: {},
    filterField: field,
    value: required(filter.operator, 'find_opportunity filter operator'),
    secondValue: value ?? ''
  };
}

function resolveCondition(condition, data, idFactory) {
  const customFields = catalog(data, 'customFields');
  let field = condition.conditionSubType ?? condition.field;
  if (condition.conditionType && customFields.length && !customFields.some(item => item.id === field)) {
    const needle = String(field).toLowerCase();
    const matches = customFields.filter(item => [item.name, item.fieldKey].some(candidate => String(candidate ?? '').toLowerCase() === needle));
    if (matches.length > 1) throw new Error(`custom field is ambiguous: ${field}`);
    if (matches.length === 1) field = matches[0].id;
  }
  return {
    conditionType: condition.conditionType ?? 'contact_detail',
    conditionSubType: required(field, 'branch condition field'),
    conditionOperator: required(condition.conditionOperator ?? condition.operator, 'branch condition operator'),
    ...(condition.conditionValue !== undefined || condition.value !== undefined ? { conditionValue: condition.conditionValue ?? condition.value } : {}),
    __conditionId: condition.__conditionId ?? idFactory(),
    ifElseNodeId: condition.ifElseNodeId ?? '',
    isWait: condition.isWait ?? false
  };
}

export function windowWaitAttributes(action) {
  const { days, start, end } = action.config.window;
  return {
    type: 'time', name: action.name ?? 'Wait', cat: '', isHybridAction: true, hybridActionType: 'wait', convertToMultipath: false, transitions: [],
    startAfter: { type: 'minutes', value: 0, when: 'after' },
    window: { condition: 'when', days, start, end },
    windowCondition: { field: '', operator: '', value: '' }
  };
}

export function actionAttributes(action, data, refs) {
  const config = action.config ?? {};
  switch (action.type) {
    case 'sms':
      return { body: required(config.body, 'sms.config.body'), attachments: config.attachments ?? [], ...(config.template_id ? { template_id: config.template_id, templatesource: config.templatesource ?? 'other' } : {}) };
    case 'email':
      return {
        isCloned: false,
        fieldDefaults: {},
        trackingOptions: { hasTrackingLinks: false, hasUtmTracking: false, hasTags: false, ...(config.sourceId ? { sourceId: config.sourceId } : {}) },
        conditions: [],
        html: required(config.html, 'email.config.html'),
        subject: required(config.subject, 'email.config.subject'),
        attachments: config.attachments ?? [],
        ...(config.from_name !== undefined ? { from_name: config.from_name } : {}),
        ...(config.from_email !== undefined ? { from_email: config.from_email } : {}),
        ...(config.preHeader !== undefined ? { preHeader: config.preHeader } : {})
      };
    case 'wait':
      if (config.mode === 'appointment') {
        const distributed = { months: 0, days: 0, hours: 0, minutes: 0, ...config.distributed };
        const value = distributed.days * 1440 + distributed.hours * 60 + distributed.minutes;
        return {
          type: 'appointment', name: action.name ?? 'Wait', cat: '',
          appointmentStartAfter: { when: config.when, type: 'minutes', value, distributed },
          appointmentCondition: config.appointmentCondition ?? 'next',
          isHybridAction: true, hybridActionType: 'wait', convertToMultipath: false, transitions: []
        };
      }
      if (config.window) return windowWaitAttributes(action);
      return {
        type: 'time',
        startAfter: { type: config.unit ?? config.startAfter?.type ?? 'minutes', value: required(config.value ?? config.startAfter?.value, 'wait.config.value'), when: config.when ?? config.startAfter?.when ?? 'after' },
        name: action.name ?? 'Wait', cat: '', timePeriodInputMode: 'standard', unitInputMode: 'standard', isHybridAction: true, hybridActionType: 'wait', convertToMultipath: false, transitions: []
      };
    case 'add_contact_tag':
      return { tags: required(config.tags, 'add_contact_tag.config.tags') };
    case 'remove_contact_tag':
      return { tags: required(config.tags, 'remove_contact_tag.config.tags'), type: 'remove_contact_tag' };
    case 'add_notes':
      return { title: required(config.title, 'add_notes.config.title'), html: required(config.html, 'add_notes.config.html'), color: config.color ?? '#FEF0C7', type: 'add_notes' };
    case 'goto': {
      const target = refs.get(required(config.target, 'goto.config.target'));
      if (!target) throw new Error(`goto target ref not found: ${config.target}`);
      return { type: 'goto', targetNodeId: target };
    }
    case 'create_opportunity': {
      const pipeline = byName(catalog(data, 'pipelines'), config.pipeline, 'pipeline');
      const stage = byName(pipeline.stages ?? [], config.stage, `stage in pipeline ${pipeline.name}`);
      return {
        fields: config.fields ?? [], type: 'create_opportunity', pipeline_id: pipeline.id, pipeline_stage_id: stage.id,
        opportunity_name: config.opportunity_name ?? '', opportunity_source: config.opportunity_source ?? '', monetary_value: config.monetary_value ?? '',
        ...(config.allow_multiple ? { allow_multiple: true } : {}), ...(config.allow_backward !== undefined ? { allow_backward: config.allow_backward } : {}),
        ...(config.opportunity_status ? { opportunity_status: config.opportunity_status } : {})
      };
    }
    case 'assign_user': {
      const users = required(config.users, 'assign_user.config.users').map(value => byName(catalog(data, 'users'), value, 'user', ['email']));
      const ids = users.map(user => user.id);
      const weights = config.weights ?? Object.fromEntries(ids.map(id => [id, 1]));
      let cursor = 1;
      const trafficIndex = ids.map(id => {
        const weight = Number(weights[id] ?? 1);
        const indexes = Array.from({ length: weight }, () => cursor++);
        return { id, indexes };
      });
      return { type: 'assign_user', user_list: ids, only_unassigned_contact: config.only_unassigned_contact ?? false, traffic_split: config.traffic_split ?? 'equally', traffic_weightage: weights, traffic_index: trafficIndex, total_index: cursor - 1 };
    }
    case 'update_contact_field': {
      const fields = required(config.fields, 'update_contact_field.config.fields').map(entry => {
        const field = byName(catalog(data, 'customFields'), entry.field, 'custom field', ['fieldKey']);
        const types = { TEXT: 'string', NUMERICAL: 'numerical', DATE: 'date', SINGLE_OPTIONS: 'string', MULTIPLE_OPTIONS: 'string' };
        return { field: field.id, value: entry.value ?? '', title: field.name, type: types[field.dataType] ?? String(field.type ?? 'string').toLowerCase(), date: entry.date ?? '' };
      });
      return { type: 'update_contact_field', actionType: config.actionType ?? 'update_field_data', fields };
    }
    case 'internal_notification': {
      const subtype = config.notificationType ?? config.type ?? 'notification';
      const payload = { ...(config.payload ?? {}) };
      if (config.users) {
        payload.userType = 'user';
        payload.selectedUser = config.users.map(value => byName(catalog(data, 'users'), value, 'user', ['email']).id);
      }
      if (subtype === 'notification') {
        Object.assign(payload, { type: 'send_notification', title: required(config.title ?? payload.title, 'internal_notification.config.title'), body: required(config.body ?? payload.body, 'internal_notification.config.body'), redirectPage: config.redirectPage ?? payload.redirectPage ?? 'contact', userType: payload.userType ?? config.userType ?? 'all' });
      }
      return { type: subtype, [subtype]: payload };
    }
    default:
      if (config.attributes && typeof config.attributes === 'object') return config.attributes;
      throw new Error(`unsupported action type: ${action.type}`);
  }
}

export function composeWorkflow(spec, locationData = {}, { idFactory = randomUUID } = {}) {
  validateSpec(spec);
  const actionIds = new WeakMap();
  const branchIds = new WeakMap();
  const refs = new Map();

  const allocate = actions => actions.forEach(action => {
    const id = idFactory();
    actionIds.set(action, id);
    if (action.ref) refs.set(action.ref, id);
    if (action.type === 'if_else') {
      const ids = [...action.branches.map(() => idFactory()), idFactory()];
      branchIds.set(action, ids);
      action.branches.forEach(branch => allocate(branch.actions));
      allocate(action.else?.actions ?? []);
    }
    if (action.type === 'find_opportunity') {
      // Two fixed transition children, always in this order: Found, then Not Found.
      const config = action.config ?? {};
      branchIds.set(action, [idFactory(), idFactory()]);
      allocate(config.found?.actions ?? []);
      allocate(config.notFound?.actions ?? []);
    }
  });
  allocate(spec.actions);

  const templates = [];
  const composeList = (actions, initialParent, stableParent = null) => {
    let parent = initialParent;
    let previousNode = initialParent ? templates.find(node => node.id === initialParent) : null;
    let firstId = null;
    actions.forEach((action, order) => {
      const id = actionIds.get(action);
      if (!firstId) firstId = id;
      if (previousNode) previousNode.next = id;
      if (action.type === 'find_opportunity') {
        // Three-node multipath family per research/phase1/raw/actions/find-opportunity.md:
        // the parent Find node, plus two cat:"transition" children whose ids match
        // attributes.transitions[].id and next[] in order. Branch contents attach
        // through each transition node's own next.
        const config = action.config ?? {};
        const [foundId, notFoundId] = branchIds.get(action);
        const findName = action.name ?? 'Find opportunity';
        const transitions = [
          { id: foundId, name: 'Opportunity Found', fields: [], meta: { __branchKey__: 'predefined_Opportunity Found' }, conditionType: 'pre-defined' },
          { id: notFoundId, name: 'Opportunity Not Found', fields: [], meta: { __branchKey__: 'predefined_Opportunity Not Found' }, conditionType: 'pre-defined' }
        ];
        const findNode = {
          id, order, name: findName, type: 'find_opportunity', cat: 'multi-path',
          workflowsActionType: 'INTERNAL',
          attributes: {
            sorting: config.sorting ?? 'latest',
            type: 'find_opportunity',
            __customInputFields__: config.filters.map(filter => resolveOpportunityFilter(filter, locationData)),
            __customInputs__: {},
            cat: 'multi-path',
            convertToMultipath: true,
            transitions,
            __name__: findName
          },
          next: [foundId, notFoundId]
        };
        if (parent) findNode.parentKey = parent;
        if (stableParent) findNode.parent = stableParent;
        templates.push(findNode);

        for (const [branchId, branchName, branchKey] of [[foundId, 'Opportunity Found', 'found'], [notFoundId, 'Opportunity Not Found', 'notFound']]) {
          const transitionNode = {
            id: branchId, order: order + 1, name: branchName, type: 'transition', cat: 'transition',
            attributes: {}, parentKey: id, parent: id
          };
          templates.push(transitionNode);
          composeList(config[branchKey]?.actions ?? [], branchId, branchId);
        }
        parent = null;
        previousNode = null;
        return;
      }

      if (action.type !== 'if_else') {
        const node = { id, order, name: action.name ?? ACTION_NAMES[action.type] ?? action.type, type: action.type, attributes: actionAttributes(action, locationData, refs) };
        if (parent) node.parentKey = parent;
        if (stableParent) node.parent = stableParent;
        if (action.type === 'wait') node.cat = '';
        if (action.type === 'goto' && parent && !stableParent) node.parent = parent;
        templates.push(node);
        parent = id;
        previousNode = node;
        return;
      }

      const ids = branchIds.get(action);
      const yesIds = ids.slice(0, -1);
      const noneId = ids.at(-1);
      const branchRecords = action.branches.map((branch, index) => ({
        id: yesIds[index], name: branch.name,
        segments: [{ __segmentId: idFactory(), operator: branch.operator ?? 'and', conditions: branch.conditions.map(condition => resolveCondition(condition, locationData, idFactory)) }],
        operator: branch.operator ?? 'and', showErrors: false, branchNameError: 'Branch name cannot be empty!'
      }));
      const conditionName = action.name ?? 'If/Else';
      const conditionNode = {
        id, order,
        attributes: { currentRecipeType: 'CUSTOM', branches: branchRecords, operator: 'and', if: true, conditionName, version: 2, noneBranchName: action.else?.name ?? 'None' },
        name: conditionName, type: 'if_else', cat: 'conditions', next: ids, comments: [], nodeType: 'condition-node'
      };
      if (parent) conditionNode.parentKey = parent;
      if (stableParent) conditionNode.parent = stableParent;
      templates.push(conditionNode);

      action.branches.forEach((branch, index) => {
        const branchId = yesIds[index];
        const branchNode = {
          id: branchId, order: order + 1, name: branch.name, type: 'if_else', cat: 'conditions', comments: [],
          attributes: { if: false, conditionName, operator: branch.operator ?? 'and', branches: [] },
          sibling: ids.filter(candidate => candidate !== branchId), parentKey: id, parent: id, nodeType: 'branch-yes'
        };
        templates.push(branchNode);
        composeList(branch.actions, branchId, branchId);
      });
      const noneNode = {
        id: noneId, order: order + 1, name: action.else?.name ?? 'None', type: 'if_else', cat: 'conditions', comments: [], attributes: { else: true },
        sibling: yesIds, parentKey: id, parent: id, nodeType: 'branch-no'
      };
      templates.push(noneNode);
      composeList(action.else?.actions ?? [], noneId, noneId);
      parent = null;
      previousNode = null;
    });
    return firstId;
  };

  composeList(spec.actions, null);
  return { templates, createdSteps: templates.map(node => node.id) };
}

export function composeTriggers(spec, workflowId, location) {
  // Mirror the spec's publish state instead of hardcoding draft/inactive. These
  // were fixed values from when every build produced a draft, but repair
  // deep-overlays this onto the LIVE trigger before writing it back — so on a
  // published workflow a trigger repair would push active:false over the live
  // active:true and silently stop the workflow enrolling anyone, while the
  // workflow still displayed as published. It would then re-break the same
  // field on every cycle until the retries ran out.
  const published = spec.publish === true;
  return spec.triggers.map(trigger => ({
    status: published ? 'published' : 'draft', workflowId, schedule_config: trigger.schedule_config ?? {}, conditions: trigger.filters ?? [],
    type: trigger.type, masterType: 'highlevel', name: trigger.name ?? trigger.type.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
    actions: [{ workflow_id: workflowId, type: 'add_to_workflow' }], active: published, triggersChanged: true,
    location_id: location.locationId, company_id: location.companyId, company_age: location.companyAge
  }));
}

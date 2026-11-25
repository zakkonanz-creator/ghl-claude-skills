import { API_BASE, connectGhlClient } from './ghl-client.mjs';

function arrayFrom(result, keys) {
  for (const key of keys) if (Array.isArray(result?.[key])) return result[key];
  return Array.isArray(result) ? result : [];
}

function uniqueByName(items, value, label, aliases = []) {
  const needle = String(value).toLowerCase();
  const matches = items.filter(item => [item.name, ...aliases.map(key => item[key])].some(candidate => String(candidate ?? '').toLowerCase() === needle));
  if (matches.length !== 1) throw new Error(matches.length ? `${label} is ambiguous: ${value}` : `${label} not found: ${value}`);
  return matches[0];
}

export async function resolveLocationData(location, suppliedClient) {
  const descriptor = typeof location === 'string' ? { locationId: location } : location;
  if (!descriptor?.locationId) throw new Error('location.locationId is required');
  const client = suppliedClient ?? await connectGhlClient({ locationId: descriptor.locationId });
  const { locationId } = descriptor;
  const companyId = descriptor.companyId;

  const calls = [
    client.apiFetch('GET', `${API_BASE}/locations/${locationId}/tags?limit=200`),
    client.apiFetch('GET', `${API_BASE}/opportunities/pipelines?locationId=${locationId}`),
    client.apiFetch('GET', `${API_BASE}/locations/${locationId}/customFields/search?parentId=&skip=0&limit=200&documentType=field&model=contact`),
    companyId ? client.apiFetch('GET', `${API_BASE}/users/search?companyId=${companyId}&locationId=${locationId}&limit=500&skip=0`) : Promise.resolve({ users: [] }),
    client.apiFetch('GET', `${API_BASE}/workflow/${locationId}/list?type=workflow&limit=500&offset=0&sortBy=name&sortOrder=asc&includeCustomObjects=true&includeObjectiveBuilder=true`),
    client.apiFetch('GET', `${API_BASE}/locations/${locationId}/templates?type=email&skip=0&limit=2000`),
    client.apiFetch('GET', `${API_BASE}/locations/${locationId}/templates?type=sms&skip=0&limit=2000`),
    // Folders are not in the type=workflow list; they come back as type:'directory'.
    client.apiFetch('GET', `${API_BASE}/workflow/${locationId}/list?type=directory&limit=500&offset=0`)
  ];
  const [tags, pipelines, customFields, users, workflows, emailTemplates, smsTemplates, folders] = await Promise.all(calls);
  const resolved = {
    tags: arrayFrom(tags, ['tags']), pipelines: arrayFrom(pipelines, ['pipelines']),
    customFields: arrayFrom(customFields, ['customFields', 'fields']), users: arrayFrom(users, ['users']),
    workflows: [...arrayFrom(workflows, ['rows', 'workflows']), ...arrayFrom(folders, ['rows', 'workflows'])], templates: [
      ...arrayFrom(emailTemplates, ['templates']).map(template => ({ ...template, templateType: 'email' })),
      ...arrayFrom(smsTemplates, ['templates']).map(template => ({ ...template, templateType: 'sms' }))
    ]
  };
  resolved.resolve = (kind, name, options = {}) => {
    if (kind === 'tag') return uniqueByName(resolved.tags, name, 'tag').name;
    if (kind === 'pipeline') return uniqueByName(resolved.pipelines, name, 'pipeline').id;
    if (kind === 'stage') {
      const pipeline = uniqueByName(resolved.pipelines, options.pipeline, 'pipeline');
      return uniqueByName(pipeline.stages ?? [], name, `stage in pipeline ${pipeline.name}`).id;
    }
    if (kind === 'customField') return uniqueByName(resolved.customFields, name, 'custom field', ['fieldKey']).id;
    if (kind === 'user') return uniqueByName(resolved.users, name, 'user', ['email']).id;
    if (kind === 'workflow') { const workflow = uniqueByName(resolved.workflows, name, 'workflow'); return workflow.id ?? workflow._id; }
    if (kind === 'template') {
      const templates = options.type ? resolved.templates.filter(template => template.templateType === options.type) : resolved.templates;
      const template = uniqueByName(templates, name, 'template');
      return template.id ?? template._id;
    }
    throw new Error(`unknown location-data kind: ${kind}`);
  };
  return resolved;
}

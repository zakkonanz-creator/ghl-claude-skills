#!/usr/bin/env node
/**
 * validate-fields.mjs
 *
 * Blocks a build whose spec references a merge token that is not proven, or
 * writes to a custom field in a shape its type does not accept.
 *
 * Run this at PLAN time, against the spec, before anything is written. Every
 * failure it reports is one the platform itself would have accepted silently
 * and shipped broken.
 *
 *   node scripts/validate-fields.mjs --spec <spec.json> --location <id>
 *
 * Exit codes:
 *   0  everything referenced is known and correctly shaped
 *   1  unknown tokens or wrong-shaped writes; details on stdout
 *   2  bad usage, or the account registry has not been synced yet
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(HERE, '..', 'registry');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const specPath = arg('spec');
const locationId = arg('location');

if (!specPath || !locationId) {
  console.error('usage: validate-fields.mjs --spec <spec.json> --location <id>');
  process.exit(2);
}

const accountPath = path.join(REGISTRY, `${locationId}.json`);
if (!fs.existsSync(accountPath)) {
  console.error(`no registry for ${locationId}.`);
  console.error(`run first:  node scripts/sync-account-registry.mjs --location ${locationId}`);
  process.exit(2);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const account = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
const global = JSON.parse(fs.readFileSync(path.join(REGISTRY, 'global-fields.json'), 'utf8'));

const problems = [];
const unknownFields = new Map();

// Tokens that are valid but come from runtime context rather than the field
// registry, so absence from the registry is not evidence against them.
const CONTEXTUAL = /^\{\{\s*(custom_values\.|trigger\.|workflow\.|account\.|location\.)/;

/** Walk every string in the spec, remembering where it was found. */
function walk(node, trail, visit) {
  if (typeof node === 'string') return visit(node, trail);
  if (Array.isArray(node)) return node.forEach((child, i) => walk(child, `${trail}[${i}]`, visit));
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      walk(value, trail ? `${trail}.${key}` : key, visit);
    }
  }
}

// --- 1. every merge token must be proven -----------------------------------
walk(spec, '', (text, trail) => {
  const tokens = text.match(/\{\{[^}]+\}\}/g);
  if (!tokens) return;
  for (const token of tokens) {
    const normalised = token.replace(/\s+/g, '');
    if (global.disproven?.[normalised]) {
      const entry = global.disproven[normalised];
      problems.push({
        kind: 'disproven field',
        where: trail,
        detail: `${normalised} does not resolve. Use ${entry.correctField}.`,
        evidence: entry.evidence
      });
      continue;
    }
    if (global.contactFields?.[normalised]) continue;
    if (global.systemFields?.[normalised]) continue;
    if (global.provenElsewhere?.[normalised]) continue;
    if (account.customValues?.[normalised]) continue;
    if (CONTEXTUAL.test(normalised)) continue;

    // contact.* references are checkable against this account's custom fields
    const key = normalised.replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '');
    if (account.customFields?.[key]) continue;

    if (!unknownFields.has(normalised)) unknownFields.set(normalised, trail);
  }
});

// --- 2. every field write must match the field's type ----------------------
const TYPE_RULES = {
  SINGLE_OPTIONS: {
    check: (value, field) => field.options?.includes(value),
    message: field => `select one of ${JSON.stringify(field.options)}; free text is silently accepted and never binds`
  },
  RADIO: {
    check: (value, field) => field.options?.includes(value),
    message: field => `select one of ${JSON.stringify(field.options)}`
  },
  CHECKBOX: {
    check: value => ['true', 'false', true, false].includes(value),
    message: () => 'use true or false. In a condition use Includes plus true, never is_checked'
  },
  NUMERICAL: {
    check: value => value === '' || /^-?\d+(\.\d+)?$/.test(String(value)) || /\{\{/.test(String(value)),
    message: () => 'digits only'
  },
  DATE: {
    check: value => value !== '' && value != null,
    message: () => 'needs an explicit value, usually the current date. Empty is a real saved state, not a default'
  }
};

/**
 * Field writes appear in several shapes across the spec dialects, so match on
 * any object that names a field and carries a value rather than on one schema.
 */
function checkWrite(key, value, trail) {
  const field = account.customFields?.[key] ?? account.customFields?.[`contact.${key}`];
  if (!field) {
    // Trigger filters and built-in conditions key off platform attributes
    // (status, dnd, stage, ...), not custom fields. Only flag a miss when the
    // key actually looks like a custom field reference.
    const looksCustom = key.includes('.') || key.includes('_');
    const inFilterContext = /filters|conditions/.test(trail);
    if (looksCustom && !inFilterContext) {
      problems.push({
        kind: 'unknown field',
        where: trail,
        detail: `${key} does not exist on this account. A write to it saves and goes nowhere.`
      });
    }
    return;
  }
  const rule = TYPE_RULES[field.dataType];
  if (!rule) return;
  if (typeof value === 'string' && /\{\{/.test(value) && field.dataType !== 'NUMERICAL') return;
  if (!rule.check(value, field)) {
    problems.push({
      kind: `${field.dataType} write`,
      where: trail,
      detail: `${key} is ${field.dataType}: ${rule.message(field)}. Got ${JSON.stringify(value)}.`
    });
  }
}

(function findWrites(node, trail) {
  if (Array.isArray(node)) return node.forEach((c, i) => findWrites(c, `${trail}[${i}]`));
  if (!node || typeof node !== 'object') return;

  const key = node.field ?? node.fieldKey ?? node.customField ?? node.key;
  const hasValue = 'value' in node || 'fieldValue' in node;
  if (typeof key === 'string' && hasValue) {
    checkWrite(key, node.value ?? node.fieldValue, trail);
  }
  for (const [k, v] of Object.entries(node)) findWrites(v, trail ? `${trail}.${k}` : k);
})(spec, '');

// --- 3. do-not-build rules -------------------------------------------------
// The registry above catches writes of the wrong SHAPE. These catch machinery
// that should not exist at all: work that was built once, reviewed, and struck.
const doNotBuildPath = path.join(REGISTRY, 'do-not-build.json');
const advisories = [];
if (fs.existsSync(doNotBuildPath)) {
  const { rules } = JSON.parse(fs.readFileSync(doNotBuildPath, 'utf8'));
  const haystack = JSON.stringify(spec).toLowerCase();
  for (const rule of rules) {
    if (!rule.detect?.length) continue;
    const hits = rule.detect.filter(needle => haystack.includes(needle.toLowerCase()));
    if (!hits.length) continue;
    const finding = {
      kind: `do-not-build: ${rule.id}`,
      where: `matched ${JSON.stringify(hits)}`,
      detail: `${rule.rule} Instead: ${rule.insteadDo}`,
      evidence: rule.evidence
    };
    if (rule.severity === 'block') problems.push(finding);
    else advisories.push(finding);
  }
}

// --- report -----------------------------------------------------------------
for (const [field, where] of unknownFields) {
  problems.push({
    kind: 'unproven field',
    where,
    detail: `${field} is not a global field and does not exist on this account.`
  });
}

function report(list, heading) {
  if (!list.length) return;
  console.log(heading);
  for (const item of list) {
    console.log(`  [${item.kind}] ${item.where}`);
    console.log(`     ${item.detail}`);
    if (item.evidence) console.log(`     evidence: ${item.evidence}`);
    console.log('');
  }
}

if (!problems.length) {
  console.log(`PASS  every token and field write in ${path.basename(specPath)} is known and correctly shaped.`);
  report(advisories, `\n${advisories.length} advisory note${advisories.length === 1 ? '' : 's'}:\n`);
  process.exit(0);
}

console.log(`FAIL  ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${path.basename(specPath)}\n`);
report(problems, '');
report(advisories, `${advisories.length} advisory note${advisories.length === 1 ? '' : 's'}:\n`);

if (unknownFields.size) {
  console.log('To prove the unknown tokens, put them in a note on a scratch workflow, run one');
  console.log('contact through, and read back which resolved. Then add the survivors to');
  console.log('registry/global-tokens.json with their evidence. Never add one without a run.');
}

process.exit(1);

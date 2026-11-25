#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import { accountForLocation, labLocationId } from './lib/config.mjs';
const locationId = labLocationId();
if (!locationId) { process.stderr.write('regression-check needs a lab location; run `node scripts/setup.mjs`\n'); process.exit(1); }
const canonicalPath = path.join(repo, 'research/phase5/regression-spec.json');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const generatedSpecPath = path.join(repo, 'docs/temp/test', `zzz-spike-regression-${stamp}.json`);
const reportPath = path.join(repo, 'research/phase5', `regression-run-${stamp}.json`);
const labels = [
  'Regression tag added', 'Regression email', 'Regression wait 5 minutes', 'Regression tag branch',
  'Remove regression tag', 'Go to regression wait', 'Add regression tag'
];

function run(script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repo, 'scripts', script), ...args], {
      cwd: repo,
      env: { ...process.env, GHL_AGENT_OWNER: process.env.GHL_AGENT_OWNER ?? `ghl-builder-regression-${process.pid}` },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', chunk => { stderr += chunk; process.stderr.write(chunk); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${script} exited ${code}`)));
  });
}

let workflowId = null;
const report = { startedAt: new Date().toISOString(), canonicalPath, generatedSpecPath, locationId, workflowId };
try {
  const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  const spec = { ...canonical, name: `ZZZ-SPIKE-regression-${stamp.slice(0, 10)}-${stamp.slice(11, 19).replace(/-/g, '')}`, publish: false };
  fs.mkdirSync(path.dirname(generatedSpecPath), { recursive: true });
  fs.writeFileSync(generatedSpecPath, JSON.stringify(spec, null, 2) + '\n');

  await run('build-workflow.mjs', ['--spec', generatedSpecPath, '--location', locationId, '--dry-run']);
  const build = await run('build-workflow.mjs', ['--spec', generatedSpecPath, '--location', locationId]);
  workflowId = JSON.parse(build.stdout).workflowId;
  report.workflowId = workflowId;
  await run('verify-build.mjs', ['--spec', generatedSpecPath, '--workflow', workflowId, '--location', locationId]);
  await run('reload-render.mjs', ['--workflow', workflowId, '--location', locationId, ...labels.flatMap(label => ['--expect', label])]);

  Object.assign(report, {
    ok: true,
    finishedAt: new Date().toISOString(),
    workflowUrl: `${accountForLocation(locationId)?.appOrigin}/v2/location/${locationId}/automation/workflow/${workflowId}`
  });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(`REGRESSION PASS workflow=${workflowId} report=${reportPath}\n`);
  process.exitCode = 0;
} catch (error) {
  Object.assign(report, { ok: false, workflowId, finishedAt: new Date().toISOString(), error: error.stack ?? String(error) });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  process.stderr.write(`REGRESSION FAIL workflow=${workflowId ?? 'not-created'} error=${error.message} report=${reportPath}\n`);
  process.exitCode = 1;
}

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CONFIG_DIR = path.join(os.homedir(), '.config', 'ghl-builder');
export const CONFIG_PATH = process.env.GHL_BUILDER_CONFIG ?? path.join(CONFIG_DIR, 'config.json');
export const CHROME_PROFILE_DIR = path.join(CONFIG_DIR, 'chrome-profile');

// Places the optional ghl-login skill may be installed. It is only ever the login
// action; the location -> origin mapping lives in config.json on every machine.
const LOGIN_SCRIPT_CANDIDATES = [
  path.join(os.homedir(), '.agents', 'skills', 'ghl-login', 'scripts', 'ghl-login.mjs'),
  path.join(os.homedir(), '.claude', 'skills', 'ghl-login', 'scripts', 'ghl-login.mjs')
];

let cached;

export function loadConfig() {
  if (cached) return cached;
  try {
    cached = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error(`could not read ${CONFIG_PATH}: ${error.message}`);
    cached = {};
  }
  cached.accounts ??= {};
  return cached;
}

export function saveConfig(config) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
  cached = config;
}

export function findLoginScript() {
  if (process.env.GHL_LOGIN_SCRIPT) return fs.existsSync(process.env.GHL_LOGIN_SCRIPT) ? process.env.GHL_LOGIN_SCRIPT : null;
  return LOGIN_SCRIPT_CANDIDATES.find(candidate => fs.existsSync(candidate)) ?? null;
}

export function labLocationId() {
  return process.env.GHL_BUILDER_LAB_LOCATION_ID ?? loadConfig().labLocationId ?? null;
}

export function isLabLocation(locationId) {
  const lab = labLocationId();
  return Boolean(lab) && locationId === lab;
}

export function accountForLocation(locationId) {
  return Object.values(loadConfig().accounts).find(account => account.locations?.includes(locationId)) ?? null;
}

export function resolvePlaywrightPath() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    loadConfig().playwrightPath,
    path.join(REPO_ROOT, 'node_modules', 'playwright', 'index.mjs')
  ].filter(Boolean);
  const found = candidates.find(candidate => fs.existsSync(candidate));
  if (!found) throw new Error(`playwright not found (tried ${candidates.join(', ')}); run \`npm install\` in ${REPO_ROOT} or set PLAYWRIGHT_PATH`);
  return found;
}

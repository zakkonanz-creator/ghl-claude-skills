import { API_BASE } from './ghl-client.mjs';

function tokenClaims(client) {
  const token = client.headers?.['token-id'];
  // Say what is actually missing and what to do. The old wording read as "you
  // are signed out", which sent people to re-authenticate a perfectly good
  // session; the header is sniffed from live traffic, so the usual cause is
  // that no request carrying it was observed while the client was starting.
  if (!token) {
    throw new Error(
      'the token-id header was not captured from the tagged tab. The session may still be ' +
      'valid: this header is sniffed from live requests, so it is missed when the tab makes ' +
      'none while the client starts. Interact with the tagged tab (reload the workflow) and retry.'
    );
  }
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url'));
  } catch {
    throw new Error('authenticated token-id metadata was not a valid JWT');
  }
}

function companyAge(dateAdded, now) {
  const added = new Date(dateAdded);
  if (Number.isNaN(added.getTime())) throw new Error('company dateAdded was missing or invalid');
  return (now.getUTCFullYear() - added.getUTCFullYear()) * 12 + now.getUTCMonth() - added.getUTCMonth() + 1;
}

export async function resolveLocationDescriptor(client, locationId, now = new Date()) {
  if (!locationId) throw new Error('locationId is required');
  const locationResult = await client.apiFetch('GET', `${API_BASE}/locations/${locationId}`);
  const location = locationResult.location ?? locationResult;
  const companyId = location.companyId ?? location.company_id;
  if (!companyId) throw new Error(`location ${locationId} did not expose companyId`);

  const claims = tokenClaims(client);
  const userId = claims.user_id ?? claims.sub;
  const sessionCompanyId = claims.company_id;
  if (!userId || !sessionCompanyId) throw new Error('authenticated token-id did not expose user/company metadata');
  if (sessionCompanyId !== companyId) throw new Error(`location ${locationId} is outside the authenticated agency session`);

  const companyResult = await client.apiFetch('GET', `${API_BASE}/companies/${companyId}`);
  const company = companyResult.company ?? companyResult;
  return { locationId, companyId, companyAge: companyAge(company.dateAdded, now), userId };
}

// SPDX-License-Identifier: AGPL-3.0-only
// Web credentials intentionally last only for this tab; never included in backups.
let token: string | null = null;
export async function getSession() {
  return token;
}
export async function saveSession(value: string) {
  token = value;
}
export async function clearSession() {
  token = null;
}

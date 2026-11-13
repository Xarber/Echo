// SPDX-License-Identifier: AGPL-3.0-only
let enteredThisSession = false;
export function rememberEntry() {
  enteredThisSession = true;
  try {
    localStorage.setItem("echo-opened-v1", "true");
  } catch {
    /* Session fallback when storage is unavailable. */
  }
}
export function hasEntered() {
  try {
    return (
      enteredThisSession || localStorage.getItem("echo-opened-v1") === "true"
    );
  } catch {
    return enteredThisSession;
  }
}

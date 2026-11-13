// SPDX-License-Identifier: AGPL-3.0-only
export const configuredApiUrl =
  process.env.EXPO_PUBLIC_ECHO_API_URL?.trim().replace(/\/$/, "") || "";
export const developerOptionsEnabled =
  process.env.EXPO_PUBLIC_ECHO_PRODUCTION !== "true";

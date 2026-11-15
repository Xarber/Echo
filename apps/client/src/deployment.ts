// SPDX-License-Identifier: AGPL-3.0-only
export function productionEndpoint(value?: string): string {
  if (!value) return "";
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return "";
    return url.href.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

const rawApiUrl = process.env.EXPO_PUBLIC_ECHO_API_URL;
export const productionBuild =
  process.env.EXPO_PUBLIC_ECHO_PRODUCTION === "true";
export const configuredApiUrl = productionBuild
  ? productionEndpoint(rawApiUrl)
  : rawApiUrl?.trim().replace(/\/$/, "") || "";
export const developerOptionsEnabled = !productionBuild;
export const missingProductionEndpoint = productionBuild && !configuredApiUrl;

// SPDX-License-Identifier: AGPL-3.0-only
import { existsSync, readFileSync } from "node:fs";
import Ajv from "ajv";

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const manifest = read("../uads.json");
const registry = read("../config/uads-requirements.json");
const check = new Ajv({ allErrors: true }).compile(read("../config/uads-schema.json"));
if (!check(manifest)) throw new Error(JSON.stringify(check.errors));

const registered = new Map(registry.map((entry) => [entry.id, entry]));
const declared = new Set(manifest.requirements.map((entry) => entry.id));
if (registered.size !== registry.length || declared.size !== manifest.requirements.length)
  throw new Error("Duplicate requirement identifiers");
if (declared.size !== registered.size)
  throw new Error("Manifest and registry have different requirement counts");
for (const entry of manifest.requirements) {
  if (registered.get(entry.id)?.applicability !== entry.applicability)
    throw new Error(`Unregistered or inconsistent requirement: ${entry.id}`);
  if (["passed", "waived"].includes(entry.status))
    throw new Error(`Evidence or exception support is required for ${entry.id}`);
}
if (!existsSync(new URL(`../${manifest.qualityWorkflow}`, import.meta.url)))
  throw new Error("Quality workflow is missing");
console.log(`Validated ${declared.size} UADS declarations. Functional evidence is tracked separately.`);

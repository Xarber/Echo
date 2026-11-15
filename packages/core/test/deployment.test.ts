import assert from "node:assert/strict";
import { test } from "node:test";
import { productionEndpoint } from "../../../apps/client/src/deployment";

test("production endpoint requires HTTPS and rejects embedded credentials", () => {
  assert.equal(
    productionEndpoint(" https://echo.xcenter.it/api/ "),
    "https://echo.xcenter.it/api",
  );
  for (const value of [
    undefined,
    "",
    "invalid",
    "http://localhost:4280",
    "https://user:pass@example.com",
    "https://example.com?token=x",
    "https://example.com#fragment",
  ]) {
    assert.equal(productionEndpoint(value), "");
  }
});

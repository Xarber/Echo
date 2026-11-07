// SPDX-License-Identifier: AGPL-3.0-only
import { appendFile } from "node:fs/promises";
if (
  !process.env.ECHO_KEYSTORE_PATH ||
  !process.env.ECHO_KEYSTORE_PASSWORD ||
  !process.env.ECHO_KEY_ALIAS ||
  !process.env.ECHO_KEY_PASSWORD
)
  throw new Error(
    "Release signing credentials are required. Never use a debug key as a release identity.",
  );
await appendFile(
  "apps/client/android/app/build.gradle",
  `\nandroid { signingConfigs { release { storeFile file(System.getenv('ECHO_KEYSTORE_PATH')); storePassword System.getenv('ECHO_KEYSTORE_PASSWORD'); keyAlias System.getenv('ECHO_KEY_ALIAS'); keyPassword System.getenv('ECHO_KEY_PASSWORD') } }; buildTypes { release { signingConfig signingConfigs.release } }; splits { abi { enable false } } }\n`,
);

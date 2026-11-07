// SPDX-License-Identifier: AGPL-3.0-only
import { openDatabase } from "./database.ts";
const db = openDatabase();
db.close();
console.log("Echo database schema v1 ready.");

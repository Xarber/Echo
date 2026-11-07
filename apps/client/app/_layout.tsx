// SPDX-License-Identifier: AGPL-3.0-only
import { randomUUID } from "expo-crypto";
import { setIdFactory } from "@echo/core";
setIdFactory(randomUUID);
import { Slot } from "expo-router";
export default function Layout() {
  return <Slot />;
}

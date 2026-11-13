// SPDX-License-Identifier: AGPL-3.0-only
import { randomUUID } from "expo-crypto";
import { setIdFactory } from "@echo/core";
setIdFactory(randomUUID);
import { MotionProvider } from "../src/motion";
import { Slot } from "expo-router";
export default function Layout() {
  return (
    <MotionProvider>
      <Slot />
    </MotionProvider>
  );
}

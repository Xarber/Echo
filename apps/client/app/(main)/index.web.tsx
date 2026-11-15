// SPDX-License-Identifier: AGPL-3.0-only
import { useLocalSearchParams } from "expo-router";
import { LandingPage } from "../../src/Landing";
import App from "../../src/App";
import { hasEntered } from "../../src/web-entry";
export default function WebRoot() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  return view === "landing" || (view !== "app" && !hasEntered()) ? (
    <LandingPage />
  ) : (
    <App />
  );
}

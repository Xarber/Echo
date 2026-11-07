// SPDX-License-Identifier: AGPL-3.0-only
import * as SecureStore from "expo-secure-store";
export const getSession = () => SecureStore.getItemAsync("echo-session");
export const saveSession = (value: string) =>
  SecureStore.setItemAsync("echo-session", value);
export const clearSession = () => SecureStore.deleteItemAsync("echo-session");

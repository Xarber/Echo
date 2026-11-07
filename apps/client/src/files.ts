// SPDX-License-Identifier: AGPL-3.0-only
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { uid, type Entry } from "@echo/core";
export async function pickText() {
  const r = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
  });
  if (r.canceled) return null;
  return new File(r.assets[0].uri).text();
}
export async function saveFile(
  name: string,
  text: string,
  mime = "application/json",
) {
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(text);
  await Sharing.shareAsync(file.uri, {
    mimeType: mime,
    dialogTitle: "Export from Echo",
  });
}
export async function pickAttachment(): Promise<
  Entry["attachments"][number] | null
> {
  const r = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
  });
  if (r.canceled) return null;
  const a = r.assets[0];
  if ((a.size || 0) > 4_000_000)
    throw new Error("Choose a file smaller than 4 MB.");
  const file = new File(a.uri);
  const data = await file.base64();
  return {
    id: uid(),
    name: a.name,
    mime: a.mimeType || "application/octet-stream",
    size: a.size || 0,
    uri: `data:${a.mimeType || "application/octet-stream"};base64,${data}`,
  };
}

export async function saveAttachment(attachment: Entry["attachments"][number]) {
  const encoded = attachment.uri.split(",")[1];
  if (!encoded || !attachment.uri.startsWith("data:"))
    throw new Error("Unsupported attachment encoding");
  const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const file = new File(Paths.cache, `${uid()}-${safeName}`);
  file.create({ overwrite: true });
  file.write(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
  await Sharing.shareAsync(file.uri, { mimeType: attachment.mime });
}

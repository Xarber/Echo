// SPDX-License-Identifier: AGPL-3.0-only
import { uid, type Entry } from "@echo/core";
function pick(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}
export async function pickText() {
  const file = await pick(".json,application/json");
  if (!file) return null;
  if (file.size > 20_000_000) throw new Error("Backup exceeds 20 MB.");
  return file.text();
}
export async function saveFile(
  name: string,
  text: string,
  mime = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function pickAttachment(): Promise<
  Entry["attachments"][number] | null
> {
  const file = await pick("*/*");
  if (!file) return null;
  if (file.size > 4_000_000)
    throw new Error("Choose a file smaller than 4 MB.");
  const uri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    id: uid(),
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    uri,
  };
}

export async function saveAttachment(attachment: Entry["attachments"][number]) {
  const encoded = attachment.uri.split(",")[1];
  if (!encoded || !attachment.uri.startsWith("data:"))
    throw new Error("Unsupported attachment encoding");
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: attachment.mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

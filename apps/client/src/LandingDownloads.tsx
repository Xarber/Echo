// SPDX-License-Identifier: AGPL-3.0-only
import { useEffect, useState } from "react";
import { Button, Label, Row } from "./ui";

const repository = "https://github.com/Xarber/Echo";
type Download = { name: string; url: string };
type InstallEvent = Event & { prompt(): Promise<void> };
let cached: { expires: number; downloads: Download[] } | undefined;

async function latestDownloads(signal: AbortSignal): Promise<Download[]> {
  if (cached && cached.expires > Date.now()) return cached.downloads;
  const response = await fetch(
    "https://api.github.com/repos/Xarber/Echo/releases/latest",
    { signal },
  );
  if (!response.ok && response.status !== 404)
    throw new Error("Release information unavailable");
  const downloads: Download[] = [];
  if (response.ok) {
    const release = await response.json();
    if (
      !release.draft &&
      !release.prerelease &&
      /^v?\d+\.\d+\.\d+$/.test(release.tag_name) &&
      Array.isArray(release.assets)
    ) {
      for (const [extension, platform] of [
        [".apk", "Android · APK"],
        [".ipa", "iOS · Unsigned IPA"],
      ]) {
        const asset = release.assets.find(
          (asset: {
            name?: string;
            browser_download_url?: string;
            state?: string;
          }) =>
            asset.state === "uploaded" &&
            typeof asset.name === "string" &&
            asset.name.endsWith(extension) &&
            (extension !== ".apk" || asset.name.includes("universal")) &&
            asset.browser_download_url ===
              `${repository}/releases/download/${release.tag_name}/${encodeURIComponent(asset.name)}`,
        );
        if (asset)
          downloads.push({
            name: `${platform} · ${release.tag_name}`,
            url: asset.browser_download_url,
          });
      }
    }
  }
  cached = { expires: Date.now() + 300_000, downloads };
  return downloads;
}

export function LandingDownloads() {
  const [downloads, setDownloads] = useState<Download[]>();
  const [failed, setFailed] = useState(false);
  const [install, setInstall] = useState<InstallEvent>();
  useEffect(() => {
    const cancel = new AbortController();
    latestDownloads(cancel.signal).then(setDownloads, () => {
      if (!cancel.signal.aborted) setFailed(true);
    });
    const ready = (event: Event) => {
      event.preventDefault();
      if (!window.matchMedia("(display-mode: standalone)").matches)
        setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(undefined);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", installed);
    return () => {
      cancel.abort();
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return (
    <>
      <Row>
        <Button
          icon="github"
          onPress={() => window.location.assign(repository)}
        >
          GitHub
        </Button>
        {install && (
          <Button
            icon="download"
            onPress={() => {
              setInstall(undefined);
              void install.prompt().catch(() => undefined);
            }}
          >
            Install Web App
          </Button>
        )}
        {downloads?.map(({ name, url }) => (
          <Button
            key={url}
            icon="download"
            onPress={() => window.location.assign(url)}
          >
            {name}
          </Button>
        ))}
      </Row>
      {failed && (
        <Label muted>Release information is temporarily unavailable.</Label>
      )}
      {downloads?.length === 0 && (
        <Label muted>No native packages have been published yet.</Label>
      )}
    </>
  );
}

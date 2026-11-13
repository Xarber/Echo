// SPDX-License-Identifier: AGPL-3.0-only
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
export default function HTML({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Echo — Private thinking space</title>
        <meta property="og:title" content="Echo — Private thinking space" />
        <meta property="og:description" content="Capture thoughts, connect ideas, and work offline." />
        <meta property="og:image" content="/icons/icon-512.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#6269f5" />
        <meta
          name="description"
          content="A private, local-first space for your thoughts. Capture, connect and develop ideas."
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <ScrollViewStyleReset />
        <style>{`html,body,#root{height:100%;}*{box-sizing:border-box;}input,textarea{outline-color:#6269f5;} :focus-visible{outline:2px solid #6269f5;outline-offset:3px;} [data-testid="material-glass"]{backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);}@media(prefers-reduced-transparency:reduce){[data-testid="material-glass"]{backdrop-filter:none;-webkit-backdrop-filter:none;}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

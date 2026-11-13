// SPDX-License-Identifier: AGPL-3.0-only
import React, { type PropsWithChildren } from "react";
import {
  Image,
  ScrollView,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ThemeProvider,
  light,
  dark,
  useTheme,
  Button,
  Card,
  Chip,
  Disclosure,
  Icon,
  Label,
  Row,
  Section,
} from "./ui";
import { MaterialSurface } from "./MaterialSurface";
import { rememberEntry } from "./web-entry";
import { VERSION } from "@echo/core";

/** Product routes deliberately do not import the store or access diary storage. */
function openApplication(router: ReturnType<typeof useRouter>) {
  rememberEntry();
  router.push("/?view=app");
}
function ProductFrame({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const theme = system === "dark" ? dark : light;
  const router = useRouter();
  const { width } = useWindowDimensions();
  return (
    <ThemeProvider value={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <StatusBar style={system === "dark" ? "light" : "dark"} />
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              padding: width < 600 ? 20 : 36,
              paddingBottom: 60,
            }}
          >
            <View style={{ width: "100%", maxWidth: 1120, gap: 36 }}>
              <MaterialSurface
                style={{
                  borderRadius: 20,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <Row>
                    <Image
                      source={require("../public/icons/icon-192.png")}
                      accessibilityLabel="Echo logo"
                      style={{ width: 36, height: 36, borderRadius: 10 }}
                    />
                    <Label bold size={25}>
                      echo.
                    </Label>
                  </Row>
                  <Row>
                    <Button
                      subtle
                      onPress={() => router.push("/welcome/install")}
                    >
                      Install
                    </Button>
                    <Button
                      primary
                      icon="arrow-up-right"
                      onPress={() => openApplication(router)}
                    >
                      Open Echo
                    </Button>
                  </Row>
                </Row>
              </MaterialSurface>
              {children}
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: theme.border,
                  paddingTop: 24,
                  gap: 12,
                }}
              >
                <Row style={{ justifyContent: "space-between" }}>
                  <Label muted size={12}>
                    Echo · OpenRecode · {VERSION} development preview
                  </Label>
                  <Row>
                    <Button
                      subtle
                      onPress={() => router.push("/?view=landing")}
                    >
                      Overview
                    </Button>
                    <Button subtle onPress={() => router.push("/welcome/docs")}>
                      Documentation
                    </Button>
                    <Button
                      subtle
                      onPress={() => router.push("/welcome/privacy")}
                    >
                      Privacy
                    </Button>
                    <Button
                      subtle
                      onPress={() => router.push("/welcome/license")}
                    >
                      Licensing
                    </Button>
                  </Row>
                </Row>
                <Label muted size={12}>
                  No ads. No account required for the local diary. Your writing
                  stays yours.
                </Label>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
export function LandingPage() {
  return (
    <ProductFrame>
      <LandingContent />
    </ProductFrame>
  );
}
function LandingContent() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  return (
    <View style={{ gap: 48 }}>
      <Row>
        <Chip icon="feather" active>
          A quieter place to think
        </Chip>
        <Chip icon="shield">Local-first by default</Chip>
      </Row>
      <View
        style={{
          flexDirection: wide ? "row" : "column",
          gap: 36,
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, gap: 24 }}>
          <Label
            bold
            size={wide ? 60 : 42}
            style={{ letterSpacing: wide ? -2 : -1.1 }}
          >
            Every thought deserves an echo.
          </Label>
          <Label size={18} muted>
            Catch the thought before it fades. Return to it, connect it to
            something new, and give it room to become.
          </Label>
          <Row>
            <Button
              primary
              icon="plus"
              onPress={() => {
                rememberEntry();
                router.push("/capture");
              }}
            >
              Capture a thought
            </Button>
            <Button
              icon="download"
              onPress={() => router.push("/welcome/install")}
            >
              Install Echo
            </Button>
          </Row>
          <Label size={12} muted>
            Available in your browser and as a PWA. iOS and Android source is
            included; native installation packages are not available yet.
          </Label>
        </View>
        <View style={{ flex: 1, width: "100%", maxWidth: 460 }}>
          <Card style={{ backgroundColor: theme.soft, padding: 30, gap: 24 }}>
            <Row>
              <Icon name="radio" color={theme.accent} />
              <Label bold>An idea finds its thread.</Label>
            </Row>
            {[
              {
                icon: "feather" as const,
                title: "A spark",
                description: "Save it without a perfect title.",
              },
              {
                icon: "git-branch" as const,
                title: "A connection",
                description: "Link it to something you already know.",
              },
              {
                icon: "box" as const,
                title: "A direction",
                description: "Bring the thoughts together in a project.",
              },
            ].map((stage, i) => (
              <View key={stage.title} style={{ gap: 20 }}>
                <Row>
                  <View
                    style={{
                      backgroundColor: theme.surface,
                      padding: 12,
                      borderRadius: 14,
                    }}
                  >
                    <Icon name={stage.icon} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Label bold size={18}>
                      {stage.title}
                    </Label>
                    <Label muted size={13}>
                      {stage.description}
                    </Label>
                  </View>
                </Row>
                {i < 2 && (
                  <View
                    style={{
                      height: 18,
                      borderLeftWidth: 2,
                      borderColor: theme.accent + "55",
                      marginLeft: 21,
                    }}
                  />
                )}
              </View>
            ))}
            <Label size={11} muted>
              Illustration of the workflow · not a product screenshot
            </Label>
          </Card>
        </View>
      </View>
      <Section
        title="A thinking space that stays out of your way"
        icon="layers"
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18 }}>
          {[
            {
              icon: "edit-3" as const,
              title: "Capture now. Shape it later.",
              text: "Text, Markdown and files, with recoverable drafts and a chronological journal.",
            },
            {
              icon: "git-branch" as const,
              title: "See your own connections.",
              text: "Manual links, projects and a knowledge graph help you follow a thread.",
            },
            {
              icon: "shield" as const,
              title: "Choose what leaves your device.",
              text: "Core diary features work offline. Synchronization and selected-text AI are optional.",
            },
          ].map((feature) => (
            <Card key={feature.title} style={{ flex: 1, minWidth: 250 }}>
              <Icon name={feature.icon} color={theme.accent} />
              <Label bold size={19}>
                {feature.title}
              </Label>
              <Label muted>{feature.text}</Label>
            </Card>
          ))}
        </View>
      </Section>
      <Card style={{ gap: 18 }}>
        <Label bold size={26}>
          Private by choice. Transparent about the limits.
        </Label>
        <Label muted>
          The diary does not need an account or a paid AI service. Local storage
          and backups are not encrypted by Echo, and a configured sync server
          can read synchronized content.
        </Label>
        <Row>
          <Button icon="shield" onPress={() => router.push("/welcome/privacy")}>
            Read the privacy details
          </Button>
          <Button icon="book-open" onPress={() => router.push("/welcome/docs")}>
            How Echo works
          </Button>
        </Row>
      </Card>
      <Section title="A few useful answers" icon="help-circle">
        <Card>
          <Disclosure title="Can I use Echo without AI?">
            <Label>
              Yes. Capture, editing, search, collections, projects, manual links
              and backups work without a model or an account. AI starts
              disabled.
            </Label>
          </Disclosure>
          <Disclosure title="Where can I install it?" icon="download">
            <Label>
              You can install the Web/PWA using a supported browser. Native iOS
              and Android code is part of the project, but installable packages
              have not been released.
            </Label>
            <Button onPress={() => router.push("/welcome/install")}>
              Installation guide
            </Button>
          </Disclosure>
          <Disclosure
            title="Can I move or back up my thoughts?"
            icon="database"
          >
            <Label>
              Export a complete JSON backup from Settings. It includes entries,
              attachments, projects, relationships, conversations and
              recoverable deleted content. Imports preview changes and preserve
              existing records by default. Keep these plaintext backups
              somewhere trusted.
            </Label>
          </Disclosure>
        </Card>
      </Section>
      <View style={{ alignItems: "center", gap: 18, paddingVertical: 20 }}>
        <Icon name="feather" color={theme.accent} size={30} />
        <Label bold size={30} style={{ textAlign: "center" }}>
          Start with one unfinished thought.
        </Label>
        <Button
          primary
          icon="arrow-right"
          onPress={() => openApplication(router)}
        >
          Open your thinking space
        </Button>
      </View>
    </View>
  );
}
const pages = {
  install: {
    icon: "download" as const,
    title: "Make a little room for Echo.",
    intro:
      "Install the Web/PWA from your browser. The installed app opens your diary, while this overview stays a separate page.",
    sections: [
      [
        "Desktop",
        "Open the diary in a supported browser, then use the install action in the address bar or browser menu. The first visit needs a connection to cache the app.",
      ],
      [
        "iPhone and iPad",
        "Open the diary in Safari. Use Share → Add to Home Screen. Browser support varies; no native IPA has been released.",
      ],
      [
        "Android",
        "Open the diary in a supported browser and choose Install app or Add to Home screen from its menu. A native APK or Google Play package is not available yet.",
      ],
      [
        "Before moving between addresses",
        "Browser data is tied to its exact origin. A different port, hostname or installed browser profile can be a different diary. Export a JSON backup from Settings before changing where you use Echo.",
      ],
    ],
  },
  docs: {
    icon: "book-open" as const,
    title: "A thought is only the beginning.",
    intro: "A short guide to the working development preview.",
    sections: [
      [
        "Capture",
        "Choose New thought, write or attach a file and save. Titles, tags and categories are optional. Drafts are saved locally; wait for the save confirmation before closing the app.",
      ],
      [
        "Organize and connect",
        "Use the Journal to search and revisit entries. From a thought, choose a project or collection and connect it to another entry. Explore shows those confirmed connections; Evolution shows recorded history.",
      ],
      [
        "Develop with AI",
        "AI is optional and disabled initially. Configure your self-hosted server, sign in and select manual or server-local-only mode. Review the selected entries and authorize each request. Suggestions do not silently replace your writing.",
      ],
      [
        "Self-hosting",
        "X-Center is the default deployment target. Source instructions, container configuration, architecture and validation reports are in this checkout’s README.md and docs/ directory. Public hosting and native releases are not active.",
      ],
      [
        "What is still in development",
        "Native device validation, voice capture, automatic background sync, complete account recovery, end-to-end encryption and native in-app updating are not finished. The source roadmap tracks these limits.",
      ],
    ],
  },
  privacy: {
    icon: "shield" as const,
    title: "Your thoughts belong to you.",
    intro: "Clear choices, with no hidden processing.",
    sections: [
      [
        "Local use",
        "Ordinary diary operations stay in your device’s application database. Echo has no advertising or analytics SDK and does not require an account for local use. The browser may clear or evict local storage; keep backups.",
      ],
      [
        "Storage protection",
        "Echo does not provide application-level database encryption. Anyone with access to your device or browser profile may be able to read local data. JSON and Markdown backups are plaintext.",
      ],
      [
        "Optional synchronization",
        "A configured self-hosted server stores synchronized content in a server-readable database. Use HTTPS for remote access. This is not end-to-end encryption.",
      ],
      [
        "Optional AI",
        "Only permitted entry text you explicitly select and authorize is sent to the configured provider. Attachments are not sent. Local-only refers to a model on the configured server, not necessarily on your phone. Your provider may have its own retention policy.",
      ],
      [
        "Deletion and recovery",
        "Entries moved to Trash remain recoverable. Server account deletion removes current server records and sessions, but not your local copy or external backups. Permanent local erasure and configurable retention are not implemented yet.",
      ],
    ],
  },
  license: {
    icon: "code" as const,
    title: "Open to understand. Built to be yours.",
    intro: "Echo is part of OpenRecode.",
    sections: [
      [
        "Original Echo source",
        "Original application code is licensed under AGPL-3.0-only. The complete license and scope are included in the source checkout’s LICENSE and LICENSES/AGPL-3.0-only.txt files. Modified network deployments must respect the applicable source-availability obligations.",
      ],
      [
        "Preserved starter and dependencies",
        "The original Expo starter retains its MIT license and copyright. Its notice is preserved in LICENSES/Expo-MIT.txt and the starter history. Third-party packages keep their own licenses and notices.",
      ],
      [
        "Availability",
        "Echo’s source is available at github.com/Xarber/Echo. Native installation packages are available only when published through the project’s release channels.",
      ],
    ],
  },
};
export function ProductInfo() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const selected =
    typeof page === "string" && Object.hasOwn(pages, page)
      ? pages[page as keyof typeof pages]
      : undefined;
  return (
    <ProductFrame>
      {selected ? (
        <View style={{ gap: 28 }}>
          <Icon name={selected.icon} size={30} />
          <Label bold size={38}>
            {selected.title}
          </Label>
          <Label size={18} muted>
            {selected.intro}
          </Label>
          {selected.sections.map(([title, text]) => (
            <View key={title} style={{ gap: 10, maxWidth: 820 }}>
              <Label bold size={21}>
                {title}
              </Label>
              <Label size={16} muted>
                {text}
              </Label>
            </View>
          ))}
        </View>
      ) : (
        <Label>
          This information page could not be found. Use Overview or open Echo
          above.
        </Label>
      )}
    </ProductFrame>
  );
}

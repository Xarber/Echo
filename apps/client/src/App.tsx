import { MaterialSurface } from "./MaterialSurface";
import { MotionPressable as Pressable, AnimatedNotice } from "./motion";
// SPDX-License-Identifier: AGPL-3.0-only
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  useColorScheme,
  Platform,
  AppState,
  ActivityIndicator,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  VERSION,
  titleOf,
  search,
  keywordConnections,
  type Entry,
  type Project,
} from "@echo/core";
import { initialize, useStore, preferences, flushLocalWrites } from "./store";
import {
  ThemeProvider,
  light,
  dark,
  Label,
  Button,
  Card,
  Chip,
  Field,
  Row,
  Section,
  Icon,
  Empty,
  useTheme,
} from "./ui";
import {
  Composer,
  EntryDetail,
  EntryCard,
  hydrateEditingDraft,
  type Navigate,
} from "./entries";
import { Projects, Explore, Evolution, Reflect } from "./workspaces";
import { Settings, Developer, Changelog } from "./Settings";
import { AIWorkspace } from "./AIWorkspace";
const nav = [
  { path: "/", label: "Home", icon: "grid" },
  { path: "/journal", label: "Journal", icon: "book-open" },
  { path: "/explore", label: "Explore", icon: "git-branch" },
  { path: "/develop", label: "Develop", icon: "zap" },
  { path: "/reflect", label: "Reflect", icon: "sun" },
] as const;
let initialization: Promise<void> | null = null;
let devExpires = 0;
let previousMain = "";
export default function App() {
  const store = useStore();
  const { width } = useWindowDimensions();
  const system = useColorScheme();
  const path = usePathname();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [globalQuery, setGlobalQuery] = useState("");
  const [developer, setDeveloper] = useState(Date.now() < devExpires);
  const [whatsNew, setWhatsNew] = useState(false);
  const [webUpdate, setWebUpdate] = useState(false);
  const [updateNotes, setUpdateNotes] = useState<
    (typeof import("@echo/core").changelog)[0] | null
  >(null);
  const taps = useRef({ count: 0, at: 0 });
  const activity = useRef(Date.now());
  const wide = width >= 900;
  const isDark =
    store.meta.preferences.theme === "dark" ||
    (store.meta.preferences.theme === "system" && system === "dark");
  const t = isDark ? dark : light;
  const navigate: Navigate = (p) => router.push(p as never);
  const notify = (s: string) => setMessage(s);
  useEffect(() => {
    initialization ??= initialize();
    void initialization;
  }, []);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 6500);
      return () => clearTimeout(timer);
    }
  }, [message]);
  useEffect(() => {
    if (store.loaded && !store.error && store.meta.preferences.welcome) {
      const old = store.meta.preferences.lastVersion;
      if (old && old !== VERSION) setWhatsNew(true);
      if (old !== VERSION) void preferences({ lastVersion: VERSION });
    }
  }, [store.loaded, store.meta.preferences.welcome]);
  useEffect(() => {
    const section = path.split("/")[1];
    const main = ["settings", "developer", "changelog"].includes(section)
      ? "settings"
      : ["entry", "evolution", "capture", "search"].includes(section)
        ? "journal"
        : section || "home";
    if (previousMain && previousMain !== main) {
      devExpires = 0;
      setDeveloper(false);
    }
    previousMain = main;
    taps.current = { count: 0, at: 0 };
    activity.current = Date.now();
    if (path.startsWith("/entry/"))
      void hydrateEditingDraft(path.split("/")[2]);
  }, [path]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() >= devExpires) setDeveloper(false);
    }, 1000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        devExpires = 0;
        setDeveloper(false);
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handle = (event: KeyboardEvent) => {
      activity.current = Date.now();
      const input = ["INPUT", "TEXTAREA"].includes(
        (event.target as HTMLElement)?.tagName,
      );
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        navigate("/capture");
      }
      if (!input && event.key === "Escape") setMessage("");
    };
    const update = () => {
      setWebUpdate(true);
      void navigator.serviceWorker
        ?.getRegistration()
        .then((registration) => {
          if (!registration?.waiting) return;
          const channel = new MessageChannel();
          const timer = setTimeout(() => channel.port1.close(), 5000);
          channel.port1.onmessage = (event) => {
            clearTimeout(timer);
            channel.port1.close();
            const r = event.data;
            if (
              r &&
              typeof r.version === "string" &&
              Array.isArray(r.highlights) &&
              r.highlights.every(
                (h: unknown) =>
                  typeof h === "object" &&
                  h !== null &&
                  "title" in h &&
                  typeof h.title === "string" &&
                  "description" in h &&
                  typeof h.description === "string" &&
                  "icon" in h &&
                  typeof h.icon === "string",
              ) &&
              Array.isArray(r.fixes) &&
              r.fixes.every((f: unknown) => typeof f === "string")
            )
              setUpdateNotes(r);
          };
          registration.waiting.postMessage({ type: "RELEASE_INFO" }, [
            channel.port2,
          ]);
        })
        .catch(() => {});
    };
    void navigator.serviceWorker?.getRegistration().then((r) => {
      if (r?.waiting) update();
    });
    window.addEventListener("keydown", handle);
    window.addEventListener("echo-update-ready", update);
    return () => {
      window.removeEventListener("keydown", handle);
      window.removeEventListener("echo-update-ready", update);
    };
  }, []);
  const tripleTap = () => {
    const at = Date.now();
    taps.current = {
      count: at - taps.current.at < 1200 ? taps.current.count + 1 : 1,
      at,
    };
    if (taps.current.count >= 3) {
      activity.current = at;
      devExpires = at + 30000;
      setDeveloper(true);
      notify(
        "Developer Options unlocked for this tab. Expires after 30 seconds of inactivity.",
      );
      taps.current.count = 0;
    }
  };
  const entries = store.records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt,
  );
  const projects = store.records.filter(
    (r): r is Project =>
      r.kind === "project" && !r.deletedAt && r.status !== "Archived",
  );
  const pageTitle =
    path === "/"
      ? "Your thinking space"
      : path.startsWith("/entry")
        ? "Thought"
        : path.startsWith("/projects/")
          ? "Project workspace"
          : path
              .slice(1)
              .split("/")[0]
              .replace(/^\w/, (c) => c.toUpperCase()) || "Home";
  if (!store.loaded)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.bg,
        }}
      >
        <ActivityIndicator color="#6269f5" />
        <Text style={{ color: t.text, marginTop: 16 }}>
          Opening your thinking space…
        </Text>
      </View>
    );
  const active = path.split("/")[1] || "home";
  const main = () => {
    if (path === "/capture")
      return <Composer navigate={navigate} notify={notify} />;
    if (path.startsWith("/entry/"))
      return (
        <EntryDetail
          key={path}
          id={path.split("/")[2]}
          navigate={navigate}
          notify={notify}
        />
      );
    if (path === "/journal" || path === "/search")
      return <Journal navigate={navigate} initialQuery={globalQuery} />;
    if (path.startsWith("/projects"))
      return (
        <Projects
          key={path}
          id={path.split("/")[2]}
          navigate={navigate}
          notify={notify}
        />
      );
    if (path === "/explore")
      return <Explore navigate={navigate} dark={isDark} notify={notify} />;
    if (path.startsWith("/evolution/"))
      return <Evolution id={path.split("/")[2]} navigate={navigate} />;
    if (path === "/develop" || path.startsWith("/develop/"))
      return (
        <AIWorkspace
          key={path}
          id={path.split("/")[2]}
          navigate={navigate}
          notify={notify}
        />
      );
    if (path === "/ask")
      return <AIWorkspace ask navigate={navigate} notify={notify} />;
    if (path === "/reflect")
      return <Reflect navigate={navigate} notify={notify} />;
    if (path === "/settings")
      return (
        <Settings
          navigate={navigate}
          notify={notify}
          onVersion={tripleTap}
          developer={developer}
        />
      );
    if (path === "/developer")
      return developer ? (
        <Developer notify={notify} />
      ) : (
        <Empty
          icon="lock"
          title="Developer Options locked"
          detail="Tap the version number in Settings three times. Access expires when switching main tabs or after 30 seconds of inactivity."
          action={
            <Button onPress={() => navigate("/settings")}>Open Settings</Button>
          }
        />
      );
    if (path === "/changelog") return <Changelog />;
    if (path !== "/")
      return (
        <Empty
          title="A thread with no end yet"
          detail="This page could not be found."
          action={<Button onPress={() => navigate("/")}>Go home</Button>}
        />
      );
    return <Home navigate={navigate} entries={entries} projects={projects} />;
  };
  return (
    <ThemeProvider value={t}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: t.bg }}
          onTouchStart={() => {
            activity.current = Date.now();
            if (developer) devExpires = Date.now() + 30000;
          }}
        >
          <StatusBar style={isDark ? "light" : "dark"} />
          <View style={{ flex: 1, flexDirection: "row" }}>
            {wide && (
              <View
                style={{
                  width: 236,
                  padding: 24,
                  borderRightWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.surface,
                  gap: 28,
                }}
              >
                {Platform.OS === "web" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="About Echo"
                    onPress={() => navigate("/?view=landing")}
                  >
                    <Brand />
                  </Pressable>
                ) : (
                  <Brand />
                )}
                <Button
                  primary
                  icon="plus"
                  onPress={() => navigate("/capture")}
                >
                  New thought
                </Button>
                <View style={{ gap: 7 }}>
                  <Label
                    muted
                    size={10}
                    style={{ letterSpacing: 1.5, marginBottom: 9 }}
                  >
                    YOUR WORKSPACE
                  </Label>
                  {nav.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      selected={
                        (item.path === "/" && active === "home") ||
                        active === item.path.slice(1)
                      }
                      onPress={() => navigate(item.path)}
                    />
                  ))}
                  <NavItem
                    item={{ label: "Projects", icon: "box" }}
                    selected={active === "projects"}
                    onPress={() => navigate("/projects")}
                  />
                  <NavItem
                    item={{ label: "Ask Echo", icon: "message-circle" }}
                    selected={active === "ask"}
                    onPress={() => navigate("/ask")}
                  />
                </View>
                <View style={{ flex: 1 }} />
                {projects.length > 0 && (
                  <View style={{ gap: 10 }}>
                    <Label muted size={10} style={{ letterSpacing: 1.5 }}>
                      YOUR PROJECTS
                    </Label>
                    {projects.slice(0, 4).map((p) => (
                      <Pressable
                        key={p.id}
                        onPress={() => navigate(`/projects/${p.id}`)}
                        style={{ minHeight: 44, justifyContent: "center" }}
                      >
                        <Row>
                          <View
                            style={{
                              width: 7,
                              height: 7,
                              backgroundColor: p.color,
                              borderRadius: 5,
                            }}
                          />
                          <Label size={12}>{p.name}</Label>
                        </Row>
                      </Pressable>
                    ))}
                  </View>
                )}
                <Card style={{ backgroundColor: t.bg, padding: 14, gap: 7 }}>
                  <Row>
                    <Icon name="shield" size={15} color={t.accent} />
                    <Label bold size={11}>
                      A private place to think
                    </Label>
                  </Row>
                  <Label muted size={11}>
                    Saved on your device. Yours to keep.
                  </Label>
                </Card>
                <NavItem
                  item={{ label: "Settings", icon: "settings" }}
                  selected={active === "settings"}
                  onPress={() => navigate("/settings")}
                />
                <Label size={10} muted>
                  OPENRECODE · ECHO {VERSION}
                </Label>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <MaterialSurface
                style={{
                  paddingHorizontal: wide ? 42 : 20,
                  minHeight: 78,
                  borderBottomWidth: 1,
                  borderColor: t.border,
                  backgroundColor: t.surface,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {wide ? (
                  <Row>
                    <Label bold size={13}>
                      Workspace
                    </Label>
                    <Label muted size={13}>
                      /
                    </Label>
                    <Label muted size={13}>
                      {pageTitle}
                    </Label>
                  </Row>
                ) : Platform.OS === "web" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="About Echo"
                    onPress={() => navigate("/?view=landing")}
                  >
                    <Brand small />
                  </Pressable>
                ) : (
                  <Brand small />
                )}
                <Row>
                  {wide && (
                    <Field
                      placeholder="Search your thoughts…"
                      value={globalQuery}
                      onChangeText={setGlobalQuery}
                      onSubmitEditing={() => navigate("/search")}
                      style={{
                        minHeight: 38,
                        fontSize: 12,
                        width: 230,
                        backgroundColor: t.bg,
                      }}
                    />
                  )}
                  <Button
                    subtle
                    icon="search"
                    onPress={() => navigate("/search")}
                  >
                    {wide ? "Search" : ""}
                  </Button>
                  {!wide && (
                    <Button
                      subtle
                      icon="settings"
                      onPress={() => navigate("/settings")}
                    >
                      Settings
                    </Button>
                  )}
                  <View
                    style={{
                      width: 33,
                      height: 33,
                      borderRadius: 20,
                      backgroundColor: t.soft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="user" size={16} color={t.accent} />
                  </View>
                </Row>
              </MaterialSurface>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  padding: wide ? 42 : 20,
                  paddingBottom: 110,
                  alignItems: "center",
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ width: "100%", maxWidth: 1140, gap: 24 }}>
                  {store.error && (
                    <Card>
                      <Label style={{ color: t.danger }}>{store.error}</Label>
                    </Card>
                  )}
                  {message && (
                    <Pressable
                      accessibilityRole="alert"
                      onPress={() => setMessage("")}
                    >
                      <Card style={{ backgroundColor: t.soft, padding: 14 }}>
                        <Label>{message}</Label>
                      </Card>
                    </Pressable>
                  )}
                  {webUpdate && (
                    <Card>
                      <Label bold>A new Echo is ready</Label>
                      <Label>
                        Review the changes before reloading. Your saved thoughts
                        and drafts remain on this device.
                      </Label>
                      {updateNotes ? (
                        <View style={{ gap: 8 }}>
                          <Label bold>Version {updateNotes.version}</Label>
                          {updateNotes.highlights.map((highlight) => (
                            <Label key={highlight.title}>
                              {highlight.icon} {highlight.title} ·{" "}
                              {highlight.description}
                            </Label>
                          ))}
                          <Label bold>Fixes & Improvements</Label>
                          {updateNotes.fixes.map((fix) => (
                            <Label key={fix}>• {fix}</Label>
                          ))}
                          <Button subtle onPress={() => navigate("/changelog")}>
                            Full changelog
                          </Button>
                        </View>
                      ) : (
                        <Label muted>
                          Release notes are unavailable. Reconnect before
                          updating.
                        </Label>
                      )}
                      <Row>
                        <Button
                          disabled={!updateNotes}
                          onPress={async () => {
                            await flushLocalWrites();
                            if (Platform.OS === "web")
                              void navigator.serviceWorker
                                .getRegistration()
                                .then((r) =>
                                  r?.waiting?.postMessage({ type: "ACTIVATE" }),
                                );
                          }}
                        >
                          Update & reload
                        </Button>
                        <Button onPress={() => setWebUpdate(false)}>
                          Later
                        </Button>
                      </Row>
                    </Card>
                  )}
                  {whatsNew && (
                    <Card>
                      <Label bold>Welcome to Echo {VERSION}</Label>
                      <Button
                        onPress={() => {
                          setWhatsNew(false);
                          navigate("/changelog");
                        }}
                      >
                        See what's new
                      </Button>
                      <Button subtle onPress={() => setWhatsNew(false)}>
                        Continue
                      </Button>
                    </Card>
                  )}
                  {!store.meta.preferences.welcome &&
                    !store.error &&
                    path === "/" && (
                      <Card style={{ backgroundColor: t.soft }}>
                        <Label size={22} bold>
                          A home for your unfinished thoughts.
                        </Label>
                        <Label>
                          Start locally. No account, AI key or connection
                          required.
                        </Label>
                        <Row>
                          <Button
                            primary
                            onPress={() =>
                              void preferences({
                                welcome: true,
                                lastVersion: VERSION,
                              })
                            }
                          >
                            Get started locally
                          </Button>
                          <Button
                            onPress={() => {
                              void preferences({
                                welcome: true,
                                lastVersion: VERSION,
                              });
                              navigate("/settings");
                            }}
                          >
                            Configure sync / Sign in
                          </Button>
                        </Row>
                      </Card>
                    )}
                  {main()}
                </View>
              </ScrollView>
              {!wide && (
                <View
                  style={{
                    flexDirection: "row",
                    borderTopWidth: 1,
                    borderColor: t.border,
                    backgroundColor: t.surface,
                    paddingBottom: 5,
                  }}
                >
                  {nav.map((item) => (
                    <Pressable
                      key={item.path}
                      accessibilityRole="tab"
                      accessibilityState={{
                        selected:
                          (item.path === "/" && active === "home") ||
                          active === item.path.slice(1),
                      }}
                      onPress={() => navigate(item.path)}
                      style={{
                        flex: 1,
                        minHeight: 64,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        color={
                          (item.path === "/" && active === "home") ||
                          active === item.path.slice(1)
                            ? t.accent
                            : t.muted
                        }
                      />
                      <Label size={10}>{item.label}</Label>
                    </Pressable>
                  ))}
                </View>
              )}
              {!wide && path !== "/capture" && (
                <View style={{ position: "absolute", right: 20, bottom: 84 }}>
                  <Button
                    primary
                    icon="plus"
                    onPress={() => navigate("/capture")}
                  >
                    New thought
                  </Button>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
function Brand({ small = false }: { small?: boolean }) {
  const t = useTheme();
  return (
    <Row style={{ gap: 10 }}>
      <View
        style={{
          width: small ? 29 : 38,
          height: small ? 29 : 38,
          borderRadius: 12,
          backgroundColor: "#6269f5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="radio" size={small ? 18 : 23} color="#fff" />
      </View>
      <Label bold size={small ? 23 : 30} style={{ letterSpacing: -1 }}>
        echo<Label style={{ color: t.accent }}>.</Label>
      </Label>
    </Row>
  );
}
function NavItem({
  item,
  selected,
  onPress,
}: {
  item: { label: string; icon: React.ComponentProps<typeof Icon>["name"] };
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: 45,
        paddingHorizontal: 13,
        borderRadius: 10,
        backgroundColor: selected ? t.soft : "transparent",
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
      }}
    >
      <Icon name={item.icon} size={18} color={selected ? t.accent : t.muted} />
      <Label
        size={13}
        bold={selected}
        style={{ color: selected ? t.accent : t.muted }}
      >
        {item.label}
      </Label>
    </Pressable>
  );
}
function Home({
  navigate,
  entries,
  projects,
}: {
  navigate: Navigate;
  entries: Entry[];
  projects: Project[];
}) {
  const t = useTheme();
  const recent = [...entries]
    .filter((e) => !e.archived)
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        b.updatedAt.localeCompare(a.updatedAt),
    )
    .slice(0, 4);
  const newest = recent[0];
  const connections = newest ? keywordConnections(newest, entries) : [];
  return (
    <View style={{ gap: 32 }}>
      <View style={{ gap: 8 }}>
        <Label muted size={11} style={{ letterSpacing: 1.5 }}>
          {new Date()
            .toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })
            .toUpperCase()}
        </Label>
        <Label size={36} bold style={{ letterSpacing: -1.1 }}>
          A quiet place for bright ideas.
        </Label>
        <Label muted size={15}>
          Capture a spark. Follow a thread. See where it takes you.
        </Label>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigate("/capture")}
      >
        <Card
          style={{
            padding: 26,
            backgroundColor: t.soft,
            borderColor: t.accent + "30",
          }}
        >
          <Row style={{ gap: 20 }}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: t.surface,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="plus" color={t.accent} size={25} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Label size={19} bold>
                What's on your mind?
              </Label>
              <Label muted size={13}>
                A fleeting thought could be the start of something.
              </Label>
            </View>
            <Icon name="arrow-up-right" color={t.accent} />
          </Row>
          <Row style={{ paddingLeft: 66 }}>
            <Label muted size={11}>
              Write anything
            </Label>
            <Label muted size={11}>
              ·
            </Label>
            <Label muted size={11}>
              No title needed
            </Label>
            <Label muted size={11}>
              ·
            </Label>
            <Label muted size={11}>
              Saved locally
            </Label>
          </Row>
        </Card>
      </Pressable>
      <Row style={{ gap: 24 }}>
        {[
          {
            value: entries.filter((e) => !e.archived).length,
            label: "thoughts captured",
            icon: "feather",
          },
          { value: projects.length, label: "projects growing", icon: "box" },
          {
            value: entries.filter((e) => e.favorite).length,
            label: "favorites to revisit",
            icon: "star",
          },
        ].map((s) => (
          <View key={s.label} style={{ flex: 1, minWidth: 140 }}>
            <Row>
              <Icon name={s.icon as never} size={16} color={t.accent} />
              <Label size={22} bold>
                {s.value}
              </Label>
            </Row>
            <Label muted size={12}>
              {s.label}
            </Label>
          </View>
        ))}
      </Row>
      <Section
        title="Recent thoughts"
        action={
          <Button
            subtle
            icon="arrow-right"
            onPress={() => navigate("/journal")}
          >
            View journal
          </Button>
        }
      >
        {recent.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {recent.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onOpen={() => navigate(`/entry/${e.id}`)}
              />
            ))}
          </View>
        ) : (
          <Empty
            title="Your next idea starts here."
            detail="A question, a passing observation, a project you can't stop thinking about. There's room for all of it."
            action={
              <Button primary icon="plus" onPress={() => navigate("/capture")}>
                Capture your first thought
              </Button>
            }
          />
        )}
      </Section>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 22 }}>
        <View style={{ flex: 1, minWidth: 260, gap: 16 }}>
          <Label bold size={18}>
            A thread worth following
          </Label>
          <Card style={{ minHeight: 190 }}>
            <Row>
              <Icon name="git-branch" color={t.accent} />
              <Chip>Local discovery</Chip>
            </Row>
            {connections.length ? (
              <>
                <Label bold>
                  {titleOf(newest!)} ↔ {titleOf(connections[0].entry)}
                </Label>
                <Label muted size={13}>
                  {connections[0].explanation}
                </Label>
                <Button subtle onPress={() => navigate(`/entry/${newest!.id}`)}>
                  Review connection →
                </Button>
              </>
            ) : (
              <>
                <Label bold size={17}>
                  Good ideas rarely arrive alone.
                </Label>
                <Label muted size={13}>
                  As your journal grows, overlapping words can help you
                  rediscover related thoughts. You decide what connects.
                </Label>
                <Button subtle onPress={() => navigate("/explore")}>
                  Explore your connections →
                </Button>
              </>
            )}
          </Card>
        </View>
        <View style={{ flex: 1, minWidth: 260, gap: 16 }}>
          <Label bold size={18}>
            A moment to reflect
          </Label>
          <Card style={{ minHeight: 190 }}>
            <Icon name="sun" color="#c99b53" />
            <Label bold size={18}>
              What idea keeps coming back to you?
            </Label>
            <Label muted size={13}>
              You don't need an answer right away. Sometimes noticing is enough.
            </Label>
            <Button subtle onPress={() => navigate("/reflect")}>
              Make a little space →
            </Button>
          </Card>
        </View>
      </View>
      <Row>
        <Button icon="box" onPress={() => navigate("/projects")}>
          Your projects
        </Button>
        <Button icon="message-circle" onPress={() => navigate("/ask")}>
          Ask Echo
        </Button>
      </Row>
      <Row style={{ justifyContent: "center", padding: 10 }}>
        <Icon name="shield" size={12} />
        <Label muted size={11}>
          Your thoughts belong to you. Always.
        </Label>
      </Row>
    </View>
  );
}
function Journal({
  navigate,
  initialQuery,
}: {
  navigate: Navigate;
  initialQuery: string;
}) {
  const { records } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState("All thoughts");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("Newest");
  const [tag, setTag] = useState("");
  const [compact, setCompact] = useState(false);
  const entries = records.filter(
    (r): r is Entry => r.kind === "entry" && !r.deletedAt,
  );
  const tags = [...new Set(entries.flatMap((e) => e.tags))];
  let visible = search(entries, query, { tag }).filter(
    (e) =>
      (filter === "Archive" ? e.archived : !e.archived) &&
      (filter !== "Favorites" || e.favorite) &&
      (filter !== "Pinned" || e.pinned) &&
      (!date || e.createdAt.startsWith(date)),
  );
  visible.sort((a, b) =>
    sort === "Oldest"
      ? a.createdAt.localeCompare(b.createdAt)
      : sort === "Recently edited"
        ? b.updatedAt.localeCompare(a.updatedAt)
        : sort === "Recently revisited"
          ? (b.lastViewedAt || "").localeCompare(a.lastViewedAt || "")
          : b.createdAt.localeCompare(a.createdAt),
  );
  const groups = new Map<string, Entry[]>();
  visible.slice(0, 200).forEach((e) => {
    const day = new Date(e.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    groups.set(day, [...(groups.get(day) || []), e]);
  });
  return (
    <View style={{ gap: 24 }}>
      <Label bold size={30}>
        A record of your becoming.
      </Label>
      <Row>
        <Field
          placeholder="Search thoughts, titles and tags…"
          value={query}
          onChangeText={setQuery}
        />
        <Field
          label="Calendar date YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        <Button icon="plus" primary onPress={() => navigate("/capture")}>
          New thought
        </Button>
      </Row>
      <Row>
        {["All thoughts", "Favorites", "Pinned", "Archive"].map((v) => (
          <Chip key={v} active={filter === v} onPress={() => setFilter(v)}>
            {v}
          </Chip>
        ))}
        <Chip active={compact} onPress={() => setCompact(!compact)}>
          Compact
        </Chip>
      </Row>
      <Row>
        {["Newest", "Oldest", "Recently edited", "Recently revisited"].map(
          (s) => (
            <Chip key={s} active={sort === s} onPress={() => setSort(s)}>
              {s}
            </Chip>
          ),
        )}
      </Row>
      {tags.length > 0 && (
        <Row>
          <Chip active={!tag} onPress={() => setTag("")}>
            All tags
          </Chip>
          {tags.map((t) => (
            <Chip key={t} active={tag === t} onPress={() => setTag(t)}>
              #{t}
            </Chip>
          ))}
        </Row>
      )}
      <Label muted size={12}>
        {visible.length} thoughts
        {visible.length > 200 ? " · first 200 shown, narrow your search" : ""}
      </Label>
      {[...groups].map(([day, es]) => (
        <Section key={day} title={day}>
          <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
            {es.map((e) =>
              compact ? (
                <Card key={e.id} style={{ width: "100%", padding: 12 }}>
                  <Button subtle onPress={() => navigate(`/entry/${e.id}`)}>
                    {titleOf(e)}
                  </Button>
                </Card>
              ) : (
                <EntryCard
                  key={e.id}
                  entry={e}
                  onOpen={() => navigate(`/entry/${e.id}`)}
                />
              ),
            )}
          </View>
        </Section>
      ))}
      {!visible.length && (
        <Empty
          icon="book-open"
          title={query || date ? "No thoughts found" : "A fresh page awaits."}
          detail={
            query || date
              ? "Try a different phrase, tag or date."
              : "Capture something today. It doesn’t have to be perfectly formed."
          }
          action={
            <Button primary onPress={() => navigate("/capture")}>
              New thought
            </Button>
          }
        />
      )}
    </View>
  );
}

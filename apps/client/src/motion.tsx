// SPDX-License-Identifier: AGPL-3.0-only
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  type PressableProps,
  type ViewProps,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export const motionTokens = {
  press: 120,
  enter: 180,
  exit: 140,
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
} as const;
type Preferences = {
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;
};
const defaults: Preferences = {
  reducedMotion: false,
  reducedTransparency: false,
  highContrast: false,
};
const MotionContext = createContext(defaults);
export const useMotionPreferences = () => useContext(MotionContext);
export function MotionProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<Preferences>(() =>
    Platform.OS === "web" && typeof window !== "undefined"
      ? {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
          reducedTransparency: window.matchMedia(
            "(prefers-reduced-transparency: reduce)",
          ).matches,
          highContrast: window.matchMedia("(prefers-contrast: more)").matches,
        }
      : defaults,
  );
  useEffect(() => {
    if (Platform.OS === "web") {
      const queries = [
        window.matchMedia("(prefers-reduced-motion: reduce)"),
        window.matchMedia("(prefers-reduced-transparency: reduce)"),
        window.matchMedia("(prefers-contrast: more)"),
      ];
      const update = () =>
        setPreferences({
          reducedMotion: queries[0].matches,
          reducedTransparency: queries[1].matches,
          highContrast: queries[2].matches,
        });
      queries.forEach((q) => q.addEventListener("change", update));
      update();
      return () =>
        queries.forEach((q) => q.removeEventListener("change", update));
    }
    void AccessibilityInfo.isReduceMotionEnabled().then((value) =>
      setPreferences((p) => ({ ...p, reducedMotion: value })),
    );
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => setPreferences((p) => ({ ...p, reducedMotion: value })),
    );
    if (Platform.OS !== "ios") return () => motion.remove();
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) =>
      setPreferences((p) => ({ ...p, reducedTransparency: value })),
    );
    const transparency = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (value) => setPreferences((p) => ({ ...p, reducedTransparency: value })),
    );
    return () => {
      motion.remove();
      transparency.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={preferences}>
      {children}
    </MotionContext.Provider>
  );
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/** Feedback only: tiny, interruptible two-state CSS transition; no JS frame loop. */
export function MotionPressable({
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableProps) {
  const [pressed, setPressed] = useState(false);
  const { reducedMotion } = useMotionPreferences();
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      pressRetentionOffset={props.pressRetentionOffset ?? 16}
      style={[
        typeof style === "function" ? style({ pressed }) : style,
        {
          transform: [
            { scale: pressed && !disabled && !reducedMotion ? 0.97 : 1 },
          ],
          transitionProperty: "transform",
          transitionDuration: reducedMotion ? 0 : motionTokens.press,
          transitionTimingFunction: motionTokens.easeOut,
        },
      ]}
    />
  );
}
/** Occasional feedback/disclosure only. Never used on recycled rows or tab changes. */
export function AnimatedNotice({ children, ...props }: ViewProps) {
  const { reducedMotion } = useMotionPreferences();
  const enter = useMemo(
    () => FadeIn.duration(reducedMotion ? 0 : motionTokens.enter),
    [reducedMotion],
  );
  const exit = useMemo(
    () => FadeOut.duration(reducedMotion ? 0 : motionTokens.exit),
    [reducedMotion],
  );
  return (
    <Animated.View {...props} entering={enter} exiting={exit}>
      {children}
    </Animated.View>
  );
}

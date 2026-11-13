// SPDX-License-Identifier: AGPL-3.0-only
import { Platform, View, type ViewProps } from "react-native";
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { useMotionPreferences } from "./motion";
import { useTheme } from "./ui";
export function MaterialSurface(props: ViewProps) {
  const theme = useTheme();
  const { reducedTransparency, highContrast } = useMotionPreferences();
  const supported =
    Platform.OS === "ios" &&
    !reducedTransparency &&
    !highContrast &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();
  if (!supported)
    return (
      <View
        {...props}
        style={[props.style, { backgroundColor: theme.surface }]}
      />
    );
  return (
    <GlassView
      {...props}
      colorScheme={theme.bg === "#171824" ? "dark" : "light"}
      glassEffectStyle="regular"
      style={[props.style, { backgroundColor: "transparent" }]}
    />
  );
}

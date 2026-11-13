// SPDX-License-Identifier: AGPL-3.0-only
import { View, type ViewProps } from "react-native";
import { useTheme } from "./ui";
/** Solid fallback on Android and unsupported hosts. */
export function MaterialSurface(props: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      style={[props.style, { backgroundColor: theme.surface }]}
    />
  );
}

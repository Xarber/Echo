// SPDX-License-Identifier: AGPL-3.0-only
import { View, type ViewProps } from "react-native";
import { useMotionPreferences } from "./motion";
import { useTheme } from "./ui";
export function MaterialSurface(props: ViewProps) {
  const theme = useTheme();
  const { reducedTransparency, highContrast } = useMotionPreferences();
  const solid = reducedTransparency || highContrast;
  return (
    <View
      {...props}
      testID={solid ? "material-solid" : "material-glass"}
      style={[
        props.style,
        { backgroundColor: solid ? theme.surface : theme.surface + "F2" },
      ]}
    />
  );
}

// SPDX-License-Identifier: AGPL-3.0-only
import React, { createContext, useContext, useId, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextInputProps,
} from "react-native";
import { MotionPressable, AnimatedNotice } from "./motion";
import Feather from "@expo/vector-icons/Feather";
export const light = {
  bg: "#f7f8fc",
  surface: "#ffffff",
  text: "#25273e",
  muted: "#626780",
  border: "#e9eaf2",
  accent: "#6269f5",
  soft: "#eff0ff",
  danger: "#b33f58",
};
export const dark = {
  bg: "#171824",
  surface: "#202232",
  text: "#eeeef8",
  muted: "#a5a9c1",
  border: "#35374b",
  accent: "#a2a6ff",
  soft: "#30334e",
  danger: "#ff9eae",
};
const Theme = createContext(light);
export const ThemeProvider = Theme.Provider;
export const useTheme = () => useContext(Theme);
export function Icon({
  name,
  size = 19,
  color,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) {
  const t = useTheme();
  return (
    <Feather
      accessible={false}
      aria-hidden={true}
      name={name}
      size={size}
      color={color || t.muted}
    />
  );
}
export function Label({
  children,
  muted = false,
  size = 14,
  bold = false,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
  bold?: boolean;
  style?: any;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          color: muted ? t.muted : t.text,
          fontSize: size,
          lineHeight: size * (size >= 26 ? 1.18 : size >= 18 ? 1.32 : 1.5),
          fontWeight: bold ? "600" : "400",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surface, borderColor: t.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Button({
  children,
  onPress,
  icon,
  primary = false,
  subtle = false,
  danger = false,
  disabled = false,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  primary?: boolean;
  subtle?: boolean;
  danger?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  const t = useTheme();
  const color = disabled
    ? t.muted
    : primary
      ? "#fff"
      : danger
        ? t.danger
        : t.text;
  return (
    <MotionPressable
      testID={testID}
      accessibilityLabel={typeof children === "string" ? children : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: subtle ? "transparent" : primary ? t.accent : t.border,
          backgroundColor: disabled
            ? t.soft
            : primary
              ? "#6269f5"
              : subtle
                ? "transparent"
                : t.surface,
          opacity: 1,
        },
      ]}
    >
      {icon && <Icon name={icon} size={16} color={color} />}
      <Text style={{ color, fontSize: 13, fontWeight: "600" }}>{children}</Text>
    </MotionPressable>
  );
}
export function Field(props: TextInputProps & { label?: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        gap: 6,
        flex:
          props.style &&
          typeof props.style === "object" &&
          "flex" in props.style
            ? 1
            : undefined,
      }}
    >
      {props.label && (
        <Label muted size={12}>
          {props.label}
        </Label>
      )}
      <TextInput
        {...props}
        accessibilityLabel={
          props.accessibilityLabel || props.label || props.placeholder
        }
        placeholderTextColor={t.muted}
        style={[
          styles.input,
          {
            color: t.text,
            borderColor: t.bg === "#f7f8fc" ? "#8d92ab" : "#6f7592",
            backgroundColor: t.surface,
          },
          props.multiline && { textAlignVertical: "top", minHeight: 100 },
          props.style,
        ]}
      />
    </View>
  );
}
export function Chip({
  children,
  onPress,
  active = false,
  icon,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  children: React.ReactNode;
  onPress?: () => void;
  active?: boolean;
}) {
  const t = useTheme();
  return (
    <MotionPressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={onPress ? { selected: active } : undefined}
      aria-selected={onPress ? active : undefined}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 8,
        paddingHorizontal: 11,
        paddingVertical: onPress ? 12 : 5,
        backgroundColor: active ? t.soft : t.bg,
        borderWidth: 1,
        borderColor: active ? t.accent + "55" : t.border,
        minHeight: onPress ? 48 : undefined,
        justifyContent: "center",
      }}
    >
      {icon && (
        <Icon name={icon} size={15} color={active ? t.accent : t.muted} />
      )}
      <Label size={12} style={{ color: active ? t.accent : t.muted }}>
        {children}
      </Label>
    </MotionPressable>
  );
}
export function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Section({
  title,
  action,
  children,
  icon,
}: {
  icon?: React.ComponentProps<typeof Icon>["name"];
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const sectionTheme = useTheme();
  return (
    <View style={{ gap: 16 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <Row>
          {(icon || sectionIcon(title)) && (
            <Icon
              name={(icon || sectionIcon(title))!}
              color={sectionTheme.accent}
            />
          )}
          <Label bold size={18}>
            {title}
          </Label>
        </Row>
        {action}
      </Row>
      {children}
    </View>
  );
}
export function Empty({
  icon = "feather",
  title,
  detail,
  action,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <Card style={{ alignItems: "center", padding: 40, gap: 12 }}>
      <Icon name={icon} size={30} />
      <Label size={19} bold>
        {title}
      </Label>
      <Label muted style={{ textAlign: "center", maxWidth: 380 }}>
        {detail}
      </Label>
      {action}
    </Card>
  );
}
export const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 22, gap: 14 },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
});

function sectionIcon(
  title: string,
): React.ComponentProps<typeof Icon>["name"] | undefined {
  const value = title.toLowerCase();
  if (/privacy|security/.test(value)) return "shield";
  if (/sync|update/.test(value)) return "refresh-cw";
  if (/appearance/.test(value)) return "sun";
  if (/trash/.test(value)) return "trash-2";
  if (/data/.test(value)) return "database";
  if (/task/.test(value)) return "check-square";
  if (/project/.test(value)) return "box";
  if (/collect|organiz/.test(value)) return "layers";
  if (/connect/.test(value)) return "link";
  if (/history|version/.test(value)) return "clock";
  if (/developer/.test(value)) return "code";
  if (/thought|journal/.test(value)) return "feather";
  if (/about/.test(value)) return "info";
  return undefined;
}
export function Disclosure({
  title,
  children,
  icon = "info",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ComponentProps<typeof Icon>["name"];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const theme = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        aria-controls={id}
        onPress={() => setOpen((v) => !v)}
        style={{
          minHeight: 48,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name={icon} color={theme.accent} />
        <Label bold style={{ flex: 1 }}>
          {title}
        </Label>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
      </MotionPressable>
      {open && (
        <AnimatedNotice nativeID={id} style={{ gap: 12 }}>
          {children}
        </AnimatedNotice>
      )}
    </View>
  );
}

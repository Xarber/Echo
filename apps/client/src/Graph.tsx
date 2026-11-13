import { MotionPressable as Pressable } from "./motion";
// SPDX-License-Identifier: AGPL-3.0-only
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SVGText, G } from "react-native-svg";
import { titleOf, type Entry, type Relationship } from "@echo/core";
export function Graph({
  entries,
  links,
  onOpen,
  dark,
}: {
  entries: Entry[];
  links: Relationship[];
  onOpen: (id: string) => void;
  dark: boolean;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [radial, setRadial] = useState(true);
  const nodes = entries.slice(0, 60).map((e, i) => ({
    entry: e,
    x: radial
      ? 300 + Math.cos((i / Math.max(entries.length, 1)) * Math.PI * 2) * 210
      : 70 + (i % 5) * 110,
    y: radial
      ? 230 + Math.sin((i / Math.max(entries.length, 1)) * Math.PI * 2) * 175
      : 60 + Math.floor(i / 5) * 65,
  }));
  const map = new Map(nodes.map((n) => [n.entry.id, n]));
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {[
          ["Zoom in", () => setScale((s) => Math.min(3, s + 0.2))],
          ["Zoom out", () => setScale((s) => Math.max(0.4, s - 0.2))],
          ["Move left", () => setOffset((o) => ({ ...o, x: o.x - 40 }))],
          ["Move right", () => setOffset((o) => ({ ...o, x: o.x + 40 }))],
          ["Move up", () => setOffset((o) => ({ ...o, y: o.y - 40 }))],
          ["Move down", () => setOffset((o) => ({ ...o, y: o.y + 40 }))],
          ["Switch layout", () => setRadial((r) => !r)],
        ].map(([label, action]) => (
          <Pressable
            key={String(label)}
            accessibilityRole="button"
            onPress={action as () => void}
            style={styles.control}
          >
            <Text style={{ color: dark ? "#ddd" : "#575a76" }}>
              {String(label)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Svg
        width="100%"
        height={460}
        viewBox="0 0 600 460"
        accessibilityLabel="Knowledge graph. Use the entry list below for accessible navigation."
      >
        <G
          transform={`translate(${offset.x} ${offset.y}) translate(300 230) scale(${scale}) translate(-300 -230)`}
        >
          {links.map((l) => {
            const a = map.get(l.from),
              b = map.get(l.to);
            return a && b ? (
              <Line
                key={l.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={l.source === "manual" ? "#9398f8" : "#b6bbc9"}
                strokeDasharray={l.source === "suggested" ? "5 5" : undefined}
                strokeWidth={2}
              />
            ) : null;
          })}
          {nodes.map((n, i) => (
            <G key={n.entry.id} onPress={() => onOpen(n.entry.id)}>
              <Circle
                cx={n.x}
                cy={n.y}
                r={i === 0 ? 24 : 16}
                fill={i === 0 ? "#6269f5" : dark ? "#34374f" : "#e4e6ff"}
                stroke="#9398f8"
                strokeWidth={2}
              />
              <SVGText
                x={n.x}
                y={n.y + 38}
                textAnchor="middle"
                fontSize={11}
                fill={dark ? "#ddd" : "#565970"}
              >
                {titleOf(n.entry).slice(0, 22)}
              </SVGText>
            </G>
          ))}
        </G>
      </Svg>
      <Text style={{ color: "#85899d", fontSize: 12 }}>
        Manual links · {nodes.length} entries shown (maximum 60). Search or
        filter to focus the graph.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  control: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#6269f515",
    minHeight: 44,
  },
});

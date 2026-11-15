// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from "react";
import { Image } from "react-native";
import { AnimatedNotice } from "./motion";
import { Button, Card, Icon, Label, Row } from "./ui";

const steps = [
  {
    title: "Write an entry",
    icon: "edit-3",
    detail:
      "Choose New thought to begin. Use a writing prompt if you need a starting point.",
  },
  {
    title: "Revisit your thoughts",
    icon: "book-open",
    detail:
      "Open the journal to find past entries and connect related thoughts.",
  },
  {
    title: "Keep your journal private",
    icon: "shield",
    detail:
      "Echo keeps entries on this device. You can export a backup or choose to sync in Settings.",
  },
] as const;

export function Introduction({ close }: { close: () => Promise<void> }) {
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const step = steps[index];
  async function finish() {
    setSaving(true);
    try {
      await close();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card>
      <Row style={{ justifyContent: "space-between" }}>
        <Image
          source={require("../public/icons/icon-192.png")}
          accessibilityLabel="Echo"
          style={{ width: 48, height: 48 }}
        />
        <Button subtle icon="x" disabled={saving} onPress={() => void finish()}>
          Skip introduction
        </Button>
      </Row>
      <Label size={12} muted>
        Step {index + 1} of {steps.length}
      </Label>
      <AnimatedNotice key={index} accessibilityLiveRegion="polite">
        <Icon name={step.icon} size={24} />
        <Label bold size={24}>
          {step.title}
        </Label>
        <Label>{step.detail}</Label>
      </AnimatedNotice>
      <Row>
        {index > 0 && (
          <Button
            icon="arrow-left"
            disabled={saving}
            onPress={() => setIndex(index - 1)}
          >
            Back
          </Button>
        )}
        {index < steps.length - 1 ? (
          <Button
            primary
            icon="arrow-right"
            onPress={() => setIndex(index + 1)}
          >
            Next
          </Button>
        ) : (
          <Button
            primary
            icon="check"
            disabled={saving}
            onPress={() => void finish()}
          >
            Get started
          </Button>
        )}
      </Row>
    </Card>
  );
}

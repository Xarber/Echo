import { NativeTabs } from "expo-router/native-tabs";

export default function MainLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book" md="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="develop">
        <NativeTabs.Trigger.Label>Develop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bolt" md="bolt" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reflect">
        <NativeTabs.Trigger.Label>Reflect</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sun.max" md="light_mode" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

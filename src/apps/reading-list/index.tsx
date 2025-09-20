import { BaseApp } from "../base/types";
import { ReadingListAppComponent } from "./components/ReadingListAppComponent";

export const appMetadata = {
  name: "Reading List",
  description: "Browse your Notion reading list in an integrated browser window",
  version: "2.0.0",
  creator: {
    name: "RyoS Team",
    url: "https://github.com/ryokun6/ryos",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/reading-list.png",
};

export const helpItems = [
  {
    icon: "📖",
    title: "Simple Browser",
    description: "The app tries to embed your Notion reading list directly. When that's blocked by security restrictions, it opens a clean browser window instead.",
  },
  {
    icon: "🌐",
    title: "Login Persistence",
    description: "Your Notion login is automatically saved by the browser. Once you sign in, subsequent visits will remember your credentials.",
  },
  {
    icon: "🔄",
    title: "Smart Fallback",
    description: "If embedding fails, the app gracefully falls back to opening Notion in a styled browser window that feels integrated with the OS.",
  },
  {
    icon: "🖥️",
    title: "Clean Experience",
    description: "No complex setup or workarounds - just a simple, reliable way to access your Notion reading list from the OS.",
  },
];

export const ReadingListApp: BaseApp = {
  id: "reading-list",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/reading-list.png" },
  component: ReadingListAppComponent,
  helpItems,
  metadata: appMetadata,
};
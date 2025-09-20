import { BaseApp, AddUrlInitialData } from "../base/types";
import { AddUrlAppComponent } from "./components/AddUrlAppComponent";

export const appMetadata = {
  name: "Add URL",
  description: "Create desktop shortcuts to websites",
  version: "1.0.0",
  creator: {
    name: "branOS Team",
    url: "https://github.com/anthropics/claude-code",
  },
  github: "https://github.com/anthropics/claude-code",
  icon: "/icons/default/internet.png",
};

export const helpItems = [
  {
    icon: "🔗",
    title: "Create Shortcut",
    description: "Enter a name and URL to create a desktop shortcut to any website. The shortcut will appear on your desktop and open the URL in a new browser tab when clicked.",
  },
  {
    icon: "🎨",
    title: "Custom Icons",
    description: "Upload your own icon image or click 'Random Vintage' to generate a theme-appropriate icon. Icons are automatically resized to fit the desktop.",
  },
  {
    icon: "🎯",
    title: "Theme Matching",
    description: "Random vintage icons automatically match your current theme (Win98, XP, macOS, etc.) for a consistent desktop experience.",
  },
  {
    icon: "📝",
    title: "Edit Shortcuts",
    description: "Right-click any URL shortcut on the desktop to edit its name, URL, or icon. Changes are saved automatically.",
  },
  {
    icon: "🗑️",
    title: "Remove Shortcuts",
    description: "Delete shortcuts by right-clicking them on the desktop and selecting 'Delete'. This will remove the shortcut from your desktop permanently.",
  },
];

export const AddUrlApp: BaseApp<AddUrlInitialData> = {
  id: "add-url",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/internet.png" },
  component: AddUrlAppComponent,
  helpItems,
  metadata: appMetadata,
};
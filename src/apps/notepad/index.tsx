import { BaseApp } from "../base/types";
import { NotepadAppComponent } from "./components/NotepadAppComponent";

export const appMetadata = {
  name: "Notepad",
  description: "Distraction-free creative writing",
  version: "1.0.0",
  creator: {
    name: "RyoS Team",
    url: "https://github.com/ryokun6/ryos",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/notepad-new.svg",
};

export const helpItems = [
  {
    icon: "📄",
    title: "New Document",
    description: "Click File > New Document or use ⌘N to create a new document. You can choose from templates like Journal, Story Outline, or start with a blank document.",
  },
  {
    icon: "🎯",
    title: "Focus Mode",
    description: "Focus Mode provides a distraction-free writing environment with larger text and minimal UI. Toggle it with View > Focus Mode or ⌘⇧F.",
  },
  {
    icon: "⌨️",
    title: "Typewriter Mode",
    description: "Typewriter Mode keeps your current line centered by automatically scrolling as you type, mimicking a typewriter experience.",
  },
  {
    icon: "📊",
    title: "Daily Writing Goal",
    description: "Use View > Set Daily Goal to set a word count target. Your progress will be shown in the status bar and word count display.",
  },
  {
    icon: "💾",
    title: "Export Documents",
    description: "Use File > Export to save your document as a .txt or .md file. You can also copy the content to your clipboard.",
  },
  {
    icon: "🔄",
    title: "Auto-Save",
    description: "Notepad automatically saves your work every 2 seconds when you're actively writing. Documents are stored in the virtual file system.",
  },
];

export const NotepadApp: BaseApp = {
  id: "notepad",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/notepad-new.svg" },
  component: NotepadAppComponent,
  helpItems,
  metadata: appMetadata,
};
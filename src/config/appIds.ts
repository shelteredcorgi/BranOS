import { getLocalAppIds, getFullLocalAppId } from "./localApps";

export const coreAppIds = [
  "finder",
  "textedit",
  "notepad",
  "memes",
  "add-url",
  "todo",
  "xlists",
  "reading-list",
  "minesweeper",
  "ipod",
  "terminal",
  "control-panels",
] as const;

// Generate local app IDs dynamically
const localAppIds = getLocalAppIds().map(getFullLocalAppId);

// Combine core and local app IDs
export const appIds = [...coreAppIds, ...localAppIds] as const;

export type AppId = typeof coreAppIds[number] | string; // Allow dynamic local app IDs 
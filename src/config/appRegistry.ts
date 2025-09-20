import { TextEditApp } from "@/apps/textedit";
import ControlPanelsApp from "@/apps/control-panels";
import { MinesweeperApp } from "@/apps/minesweeper";
import { FinderApp } from "@/apps/finder";
import { IpodApp } from "@/apps/ipod";
import { TerminalApp } from "@/apps/terminal";
import { NotepadApp } from "@/apps/notepad";
import { MemesApp } from "@/apps/memes";
import { AddUrlApp } from "@/apps/add-url";
import { TodoApp } from "@/apps/todo";
import { XListsApp } from "@/apps/xlists";
import { ReadingListApp } from "@/apps/reading-list";
import { LocalLauncherApp } from "@/apps/local-launcher";
import { appIds } from "./appIds";
import { localApps, getFullLocalAppId, configToInitialData } from "./localApps";
import type {
  BaseApp,
  ControlPanelsInitialData,
  IpodInitialData,
  LocalLauncherInitialData,
} from "@/apps/base/types";

export type AppId = (typeof appIds)[number];

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowConstraints {
  minSize?: WindowSize;
  maxSize?: WindowSize;
  defaultSize: WindowSize;
  mobileDefaultSize?: WindowSize;
}

// Default window constraints for any app not specified
const defaultWindowConstraints: WindowConstraints = {
  defaultSize: { width: 730, height: 475 },
  minSize: { width: 300, height: 200 },
};

// Registry of all available apps with their window configurations
export const appRegistry = {
  [FinderApp.id]: {
    ...FinderApp,
    windowConfig: {
      defaultSize: { width: 400, height: 300 },
      minSize: { width: 300, height: 200 },
    } as WindowConstraints,
  },
  [TextEditApp.id]: {
    ...TextEditApp,
    windowConfig: {
      defaultSize: { width: 430, height: 475 },
      minSize: { width: 430, height: 200 },
    } as WindowConstraints,
  },
  [NotepadApp.id]: {
    ...NotepadApp,
    windowConfig: {
      defaultSize: { width: 600, height: 500 },
      minSize: { width: 400, height: 300 },
    } as WindowConstraints,
  },
  [MemesApp.id]: {
    ...MemesApp,
    windowConfig: {
      defaultSize: { width: 800, height: 600 },
      minSize: { width: 500, height: 400 },
    } as WindowConstraints,
  },
  [AddUrlApp.id]: {
    ...AddUrlApp,
    windowConfig: {
      defaultSize: { width: 500, height: 700 },
      minSize: { width: 400, height: 500 },
    } as WindowConstraints,
  },
  [TodoApp.id]: {
    ...TodoApp,
    windowConfig: {
      defaultSize: { width: 500, height: 600 },
      minSize: { width: 400, height: 400 },
    } as WindowConstraints,
  },
  [XListsApp.id]: {
    ...XListsApp,
    windowConfig: {
      defaultSize: { width: 600, height: 700 },
      minSize: { width: 400, height: 500 },
    } as WindowConstraints,
  },
  [ReadingListApp.id]: {
    ...ReadingListApp,
    windowConfig: {
      defaultSize: { width: 700, height: 800 },
      minSize: { width: 500, height: 600 },
    } as WindowConstraints,
  },
  [MinesweeperApp.id]: {
    ...MinesweeperApp,
    windowConfig: {
      defaultSize: { width: 305, height: 400 },
      minSize: { width: 305, height: 400 },
      maxSize: { width: 305, height: 400 },
    } as WindowConstraints,
  },
  [IpodApp.id]: {
    ...(IpodApp as BaseApp<IpodInitialData>),
    windowConfig: {
      defaultSize: { width: 300, height: 480 },
      minSize: { width: 300, height: 480 },
    } as WindowConstraints,
  },
  [TerminalApp.id]: {
    ...TerminalApp,
    windowConfig: {
      defaultSize: { width: 600, height: 400 },
      minSize: { width: 400, height: 300 },
    } as WindowConstraints,
  },
  [ControlPanelsApp.id]: {
    ...(ControlPanelsApp as BaseApp<ControlPanelsInitialData>),
    windowConfig: {
      defaultSize: { width: 365, height: 415 },
      minSize: { width: 320, height: 415 },
      maxSize: { width: 365, height: 600 },
    } as WindowConstraints,
  },
};

// Dynamically add local launcher apps
localApps.forEach(localApp => {
  const appId = getFullLocalAppId(localApp.id);
  (appRegistry as Record<string, unknown>)[appId] = {
    ...LocalLauncherApp,
    id: appId,
    name: localApp.name,
    icon: { type: "image", src: localApp.icon },
    description: localApp.description,
    windowConfig: {
      defaultSize: { width: 400, height: 500 },
      minSize: { width: 300, height: 400 },
      maxSize: { width: 600, height: 700 },
    } as WindowConstraints,
  };
});

// Make registry immutable after setup
Object.freeze(appRegistry);

// Helper function to get app icon path
export const getAppIconPath = (appId: AppId): string => {
  const app = appRegistry[appId];
  if (typeof app.icon === "string") {
    return app.icon;
  }
  return app.icon.src;
};

// Helper function to get all apps except Finder
export const getNonFinderApps = (): Array<{
  name: string;
  icon: string;
  id: AppId;
}> => {
  return Object.entries(appRegistry)
    .filter(([id]) => id !== "finder")
    .map(([id, app]) => ({
      name: app.name,
      icon: getAppIconPath(id as AppId),
      id: id as AppId,
    }));
};

// Helper function to get app metadata
export const getAppMetadata = (appId: AppId) => {
  return appRegistry[appId].metadata;
};

// Helper function to get app component
export const getAppComponent = (appId: AppId) => {
  // Debug logging for memes app specifically
  if (appId === 'memes') {
    console.log('🔍 getAppComponent called for memes:', {
      appId,
      appExists: !!appRegistry[appId],
      hasComponent: !!(appRegistry[appId]?.component),
      registryKeys: Object.keys(appRegistry)
    });
  }

  const app = appRegistry[appId];
  if (!app) {
    console.error(`App with id "${appId}" not found in registry`);
    return null;
  }
  if (!app.component) {
    console.error(`App "${appId}" does not have a component property`);
    return null;
  }
  return app.component;
};

// Helper function to get window configuration
export const getWindowConfig = (appId: AppId): WindowConstraints => {
  return appRegistry[appId].windowConfig || defaultWindowConstraints;
};

// Helper function to get mobile window size
export const getMobileWindowSize = (appId: AppId): WindowSize => {
  const config = getWindowConfig(appId);
  if (config.mobileDefaultSize) {
    return config.mobileDefaultSize;
  }
  return {
    width: window.innerWidth,
    height: config.defaultSize.height,
  };
};

// Helper function to get initial data for local launcher apps
export const getLocalLauncherInitialData = (appId: AppId): LocalLauncherInitialData | null => {
  if (!appId.startsWith('local-')) return null;
  
  const localAppId = appId.replace('local-', '');
  const localAppConfig = localApps.find(app => app.id === localAppId);
  
  if (!localAppConfig) return null;
  
  return configToInitialData(localAppConfig);
};

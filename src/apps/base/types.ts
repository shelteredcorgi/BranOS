export interface AppProps<TInitialData = unknown> {
  isWindowOpen: boolean;
  onClose: () => void;
  isForeground?: boolean;
  className?: string;
  skipInitialSound?: boolean;
  initialData?: TInitialData;
  helpItems?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  // Instance-specific props (optional for backward compatibility)
  instanceId?: string;
  title?: string;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  // Menu bar prop for XP/98 themes
  menuBar?: React.ReactNode;
}

export interface BaseApp<TInitialData = unknown> {
  id:
    | "textedit"
    | "control-panels"
    | "minesweeper"
    | "finder"
    | "ipod"
    | "terminal"
    | "notepad"
    | "memes"
    | "add-url"
    | "todo"
    | "xlists"
    | "reading-list"
    | "local-launcher"
    | string; // Allow dynamic local app IDs (local-*)
  name: string;
  icon: string | { type: "image"; src: string };
  description: string;
  component: React.ComponentType<AppProps<TInitialData>>;
  windowConstraints?: {
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
  };
  helpItems?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  metadata?: {
    name: string;
    version: string;
    creator: {
      name: string;
      url: string;
    };
    github: string;
    icon: string;
  };
}

export interface AppState<TInitialData = unknown> {
  isOpen: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  isForeground?: boolean;
  initialData?: TInitialData;
}

export interface AppManagerState {
  windowOrder: string[];
  apps: {
    [appId: string]: AppState;
  };
}

// App-specific initial data types
export interface ControlPanelsInitialData {
  defaultTab?: string;
}


export interface IpodInitialData {
  videoId?: string;
}

export interface PaintInitialData {
  path?: string;
  content?: Blob;
}


export interface FinderInitialData {
  path?: string;
}

export interface LocalLauncherInitialData {
  appName: string;
  appDescription: string;
  appIcon: string;
  pythonScript: string;
}

export interface AddUrlInitialData {
  editingShortcut?: {
    id: string;
    name: string;
    url: string;
    icon: string;
    theme: string;
    createdAt: number;
    updatedAt: number;
  };
}

// Union type for all possible app configurations
export type AnyApp =
  | BaseApp<ControlPanelsInitialData>
  | BaseApp<IpodInitialData>
  | BaseApp<PaintInitialData>
  | BaseApp<LocalLauncherInitialData>
  | BaseApp<AddUrlInitialData>
  | BaseApp<unknown>; // For apps without specific initialData

// Type for the initialData that could be any of the specific types
export type AnyInitialData =
  | ControlPanelsInitialData
  | IpodInitialData
  | PaintInitialData
  | FinderInitialData
  | LocalLauncherInitialData
  | AddUrlInitialData
  | unknown;

// Theme-aware menu bar pattern:
// For XP/98 themes, pass the menu bar as a prop to WindowFrame
// For other themes, render the menu bar normally outside WindowFrame
// Example:
// const currentTheme = useThemeStore((state) => state.current);
// const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
// const menuBar = <AppMenuBar ... />;
// return (
//   <>
//     {!isXpTheme && menuBar}
//     <WindowFrame menuBar={isXpTheme ? menuBar : undefined}>
//       ...
//     </WindowFrame>
//   </>
// );

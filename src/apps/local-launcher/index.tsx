import { BaseApp, LocalLauncherInitialData } from "../base/types";
import { LocalLauncherAppComponent } from "./components/LocalLauncherAppComponent";

export const helpItems = [
  {
    icon: "🚀",
    title: "Launch Apps",
    description: "Click the launch button to run the configured application",
  },
  {
    icon: "🐍",
    title: "Python Scripts",
    description: "Executes Python scripts to launch local applications",
  },
  {
    icon: "⚡",
    title: "Quick Access",
    description: "Fast way to open your favorite local tools and apps",
  },
  {
    icon: "🔧",
    title: "Configurable",
    description: "Add new apps by configuring Python script paths",
  },
];

export const LocalLauncherApp: BaseApp<LocalLauncherInitialData> = {
  id: "local-launcher",
  name: "Local App Launcher",
  icon: { type: "image", src: "/icons/default/applications.png" },
  description: "Launch local applications via Python scripts",
  component: LocalLauncherAppComponent,
  helpItems,
};
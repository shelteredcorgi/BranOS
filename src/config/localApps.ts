import { LocalLauncherInitialData } from "@/apps/base/types";

export interface LocalAppConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  pythonScript: string;
  category?: string;
}

// Configure your local applications here
// Update the paths to match your actual Python scripts
export const localApps: LocalAppConfig[] = [
  // Example local apps - replace with your actual applications
  // {
  //   id: "example-app",
  //   name: "Example Application",
  //   description: "Launch an example external application",
  //   icon: "/icons/default/applications.png",
  //   pythonScript: "/path/to/your/launch-script.py",
  //   category: "Utilities"
  // },
  // Add your local apps here
];

// Helper function to get app config by ID
export function getLocalAppConfig(id: string): LocalAppConfig | undefined {
  return localApps.find(app => app.id === id);
}

// Helper function to convert config to initial data
export function configToInitialData(config: LocalAppConfig): LocalLauncherInitialData {
  return {
    appName: config.name,
    appDescription: config.description,
    appIcon: config.icon,
    pythonScript: config.pythonScript,
  };
}

// Helper function to get all app IDs
export function getLocalAppIds(): string[] {
  return localApps.map(app => app.id);
}

// Helper function to get apps by category
export function getLocalAppsByCategory(category?: string): LocalAppConfig[] {
  if (!category) return localApps;
  return localApps.filter(app => app.category === category);
}

// Generate full app ID for use in the main app system
export function getFullLocalAppId(localId: string): string {
  return `local-${localId}`;
}
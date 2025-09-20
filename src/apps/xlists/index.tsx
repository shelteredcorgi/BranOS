import { BaseApp } from "../base/types";
import { XListsAppComponent } from "./components/XListsAppComponent";

export const appMetadata = {
  name: "X Lists",
  description: "Open X Lists directly in browser windows",
  version: "1.0.0",
  creator: {
    name: "RyoS Team",
    url: "https://github.com/ryokun6/ryos",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/xlists.png",
};

export const helpItems = [
  {
    icon: "🔗",
    title: "Enter List URL",
    description: "Paste any X List URL (like https://x.com/i/lists/123456789) into the input field to open it directly.",
  },
  {
    icon: "🌐",
    title: "Open in Browser",
    description: "Click 'Open in Browser' to launch the X List in a new browser window with your saved credentials.",
  },
  {
    icon: "📋",
    title: "Quick Links",
    description: "Use the 'My Lists' button to go to your X Lists page, or try the example list to see how it works.",
  },
  {
    icon: "🔐",
    title: "Authentication",
    description: "Click Account > Sign In to X to open the X login page in a separate window and sign in with your credentials.",
  },
];

export const XListsApp: BaseApp = {
  id: "xlists",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/xlists.png" },
  component: XListsAppComponent,
  helpItems,
  metadata: appMetadata,
};
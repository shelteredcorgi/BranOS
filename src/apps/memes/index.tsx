import { BaseApp } from "../base/types";
import { MemesAppComponent } from "./components/MemesAppComponent";

export const appMetadata = {
  name: "Memes",
  description: "Smart folder and viewer for images",
  version: "1.0.0",
  creator: {
    name: "RyoS Team",
    url: "https://github.com/ryokun6/ryos",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/memes.png",
};

export const helpItems = [
  {
    icon: "📁",
    title: "Adding Images",
    description: "Drag and drop images directly into the app window, or click File > Upload Images to select files from your computer. You can also use Local Mode to browse folders on your computer.",
  },
  {
    icon: "💾",
    title: "Local Mode",
    description: "Switch to Local Mode to browse folders directly from your computer using the File System Access API. Select a folder and the app will scan for all image files.",
  },
  {
    icon: "🎲",
    title: "Random Meme",
    description: "Click the Random button or use View > Random Meme (⌘R) to jump to a completely random meme in your collection. Perfect for discovering forgotten gems!",
  },
  {
    icon: "🗂️",
    title: "Organizing Folders",
    description: "Create new folders with File > New Folder, then drag images between folders or use the folder selector in the toolbar.",
  },
  {
    icon: "🏷️",
    title: "Tagging Images",
    description: "Click the tag icon that appears when hovering over an image in grid view. Use the tag filter bar to search for specific tags or add new ones quickly.",
  },
  {
    icon: "👁️",
    title: "Viewing Modes",
    description: "Grid view shows thumbnails, lightbox view displays full-size images with navigation, and slideshow mode automatically cycles through images.",
  },
  {
    icon: "🔀",
    title: "Shuffle Mode",
    description: "Enable shuffle mode to randomly select the next image instead of going in order. Great for discovering forgotten images in large collections.",
  },
  {
    icon: "🔍",
    title: "Search & Filter",
    description: "Use the search bar to find images by name or tags. Click on tag badges to filter by specific tags, or type in the tag filter box for suggestions.",
  },
  {
    icon: "💾",
    title: "Exporting Images",
    description: "Select images by Shift+clicking them, then use File > Export Selected to download them. Individual images can also be saved from lightbox view.",
  },
];

export const MemesApp: BaseApp = {
  id: "memes",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/memes.png" },
  component: MemesAppComponent,
  helpItems,
  metadata: appMetadata,
};
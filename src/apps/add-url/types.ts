export interface UrlShortcut {
  id: string;
  name: string;
  url: string;
  icon: string; // path to icon or base64 data
  theme: string; // theme it was created for
  createdAt: number;
  updatedAt: number;
}

export interface AddUrlInitialData {
  editingShortcut?: UrlShortcut;
}
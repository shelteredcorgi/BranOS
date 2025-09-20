import { BaseApp } from "../base/types";
import { TodoAppComponent } from "./components/TodoAppComponent";

export const appMetadata = {
  name: "To-Do",
  description: "Lightweight task widget",
  version: "1.0.0",
  creator: {
    name: "RyoS Team",
    url: "https://github.com/ryokun6/ryos",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/todo-new.svg",
};

export const helpItems = [
  {
    icon: "➕",
    title: "Adding Tasks",
    description: "Type your task in the input field and press Enter or click Add. You can use natural language like 'buy milk tomorrow 3pm' or 'urgent: finish report'.",
  },
  {
    icon: "🗓️",
    title: "Natural Language",
    description: "Specify dates (today, tomorrow, Monday, etc.), times (3pm, 15:30), and priorities (urgent, high priority, low priority) directly in your task text.",
  },
  {
    icon: "🎯",
    title: "Priority Organization",
    description: "Tasks are automatically assigned priority based on keywords like 'urgent', 'important', 'low priority'. You can also filter and sort by priority using the controls.",
  },
  {
    icon: "📋",
    title: "Task Sections",
    description: "Tasks are automatically organized into Today (due today or overdue), Upcoming (future due dates), and Completed sections.",
  },
  {
    icon: "✏️",
    title: "Editing Tasks",
    description: "Click the edit icon next to any task to modify its text. You can also delete tasks using the trash icon.",
  },
  {
    icon: "✅",
    title: "Completing Tasks",
    description: "Click the checkbox next to any task to mark it complete. Completed tasks can be uncompleted using the undo button.",
  },
  {
    icon: "🔄",
    title: "Sorting & Filtering",
    description: "Sort by date, priority, or alphabetically. Filter by priority level (all, high, medium, low). Toggle visibility of completed tasks.",
  },
];

export const TodoApp: BaseApp = {
  id: "todo",
  name: appMetadata.name,
  description: appMetadata.description,
  icon: { type: "image", src: "/icons/default/todo-new.svg" },
  component: TodoAppComponent,
  helpItems,
  metadata: appMetadata,
};
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: number;
  priority: "low" | "medium" | "high";
  createdAt: number;
  completedAt?: number;
  section: "today" | "upcoming" | "completed";
}

interface TodoState {
  // Data
  todos: TodoItem[];
  
  // UI State
  newTodoText: string;
  showCompleted: boolean;
  sortBy: "date" | "priority" | "alphabetical";
  filterPriority: "all" | "low" | "medium" | "high";
  
  // Actions
  addTodo: (text: string, dueDate?: number, priority?: "low" | "medium" | "high") => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<TodoItem, "id" | "createdAt">>) => void;
  reorderTodos: (startIndex: number, endIndex: number, section: string) => void;
  
  // UI Actions
  setNewTodoText: (text: string) => void;
  toggleShowCompleted: () => void;
  setSortBy: (sortBy: "date" | "priority" | "alphabetical") => void;
  setFilterPriority: (priority: "all" | "low" | "medium" | "high") => void;
  
  // Computed getters
  getTodayTodos: () => TodoItem[];
  getUpcomingTodos: () => TodoItem[];
  getCompletedTodos: () => TodoItem[];
  getFilteredTodos: (section: "today" | "upcoming" | "completed") => TodoItem[];
}

const createTodoId = () => `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Natural language date parsing
const parseDateFromText = (text: string): { cleanText: string; dueDate?: number; priority?: "low" | "medium" | "high" } => {
  let cleanText = text;
  let dueDate: number | undefined;
  let priority: "low" | "medium" | "high" | undefined;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  // Priority keywords
  const priorityPatterns = [
    { pattern: /\b(urgent|high priority|important|asap)\b/i, priority: "high" as const },
    { pattern: /\b(medium priority|normal)\b/i, priority: "medium" as const },
    { pattern: /\b(low priority|later|someday)\b/i, priority: "low" as const },
  ];
  
  for (const { pattern, priority: p } of priorityPatterns) {
    if (pattern.test(cleanText)) {
      priority = p;
      cleanText = cleanText.replace(pattern, "").trim();
      break;
    }
  }
  
  // Date patterns
  const datePatterns = [
    // "today" and "tomorrow"
    { pattern: /\btoday\b/i, date: today },
    { pattern: /\btomorrow\b/i, date: tomorrow },
    
    // Days of the week
    { pattern: /\bmonday\b/i, date: getNextWeekday(now, 1) },
    { pattern: /\btuesday\b/i, date: getNextWeekday(now, 2) },
    { pattern: /\bwednesday\b/i, date: getNextWeekday(now, 3) },
    { pattern: /\bthursday\b/i, date: getNextWeekday(now, 4) },
    { pattern: /\bfriday\b/i, date: getNextWeekday(now, 5) },
    { pattern: /\bsaturday\b/i, date: getNextWeekday(now, 6) },
    { pattern: /\bsunday\b/i, date: getNextWeekday(now, 0) },
  ];
  
  for (const { pattern, date } of datePatterns) {
    if (pattern.test(cleanText)) {
      dueDate = date.getTime();
      cleanText = cleanText.replace(pattern, "").trim();
      break;
    }
  }
  
  // Time patterns (e.g., "3pm", "15:30")
  const timePattern = /\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i;
  const timeMatch = cleanText.match(timePattern);
  if (timeMatch && dueDate) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    
    const dateWithTime = new Date(dueDate);
    dateWithTime.setHours(hours, minutes, 0, 0);
    dueDate = dateWithTime.getTime();
    
    cleanText = cleanText.replace(timePattern, "").trim();
  }
  
  // Clean up extra whitespace
  cleanText = cleanText.replace(/\s+/g, " ").trim();
  
  return { cleanText, dueDate, priority };
};

function getNextWeekday(date: Date, targetDay: number): Date {
  const currentDay = date.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;
  const targetDate = new Date(date);
  
  if (daysUntilTarget === 0) {
    // If it's the same day, schedule for next week
    targetDate.setDate(date.getDate() + 7);
  } else {
    targetDate.setDate(date.getDate() + daysUntilTarget);
  }
  
  targetDate.setHours(9, 0, 0, 0); // Default to 9 AM
  return targetDate;
}

const sortTodos = (todos: TodoItem[], sortBy: "date" | "priority" | "alphabetical"): TodoItem[] => {
  const sorted = [...todos];
  
  switch (sortBy) {
    case "date":
      return sorted.sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.createdAt - b.createdAt;
      });
    
    case "priority": {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return sorted.sort((a, b) => {
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        if (aPriority !== bPriority) return bPriority - aPriority;
        return a.createdAt - b.createdAt;
      });
    }
    
    case "alphabetical":
      return sorted.sort((a, b) => a.text.localeCompare(b.text));
    
    default:
      return sorted;
  }
};

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      // Initial state
      todos: [],
      newTodoText: "",
      showCompleted: true,
      sortBy: "date",
      filterPriority: "all",

      // Actions
      addTodo: (text: string, manualDueDate?: number, manualPriority?: "low" | "medium" | "high") => {
        const { cleanText, dueDate, priority } = parseDateFromText(text);
        
        const todo: TodoItem = {
          id: createTodoId(),
          text: cleanText,
          completed: false,
          dueDate: manualDueDate || dueDate,
          priority: manualPriority || priority || "medium",
          createdAt: Date.now(),
          section: "today", // Will be recalculated
        };
        
        set((state) => ({
          todos: [...state.todos, todo],
          newTodoText: "",
        }));
      },

      toggleTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.map(todo =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed ? Date.now() : undefined,
                }
              : todo
          ),
        }));
      },

      deleteTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.filter(todo => todo.id !== id),
        }));
      },

      updateTodo: (id: string, updates: Partial<Omit<TodoItem, "id" | "createdAt">>) => {
        set((state) => ({
          todos: state.todos.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        }));
      },

      reorderTodos: (startIndex: number, endIndex: number, section: string) => {
        set((state) => {
          const sectionTodos = state.getFilteredTodos(section as 'today' | 'upcoming' | 'completed');
          const reorderedTodos = [...sectionTodos];
          const [movedTodo] = reorderedTodos.splice(startIndex, 1);
          reorderedTodos.splice(endIndex, 0, movedTodo);
          
          // Update the main todos array
          const otherTodos = state.todos.filter(todo => {
            const todoSection = todo.completed ? "completed" : 
              (todo.dueDate && todo.dueDate <= Date.now() + 24 * 60 * 60 * 1000) ? "today" : "upcoming";
            return todoSection !== section;
          });
          
          return {
            todos: [...otherTodos, ...reorderedTodos],
          };
        });
      },

      // UI Actions
      setNewTodoText: (text: string) => set({ newTodoText: text }),
      toggleShowCompleted: () => set((state) => ({ showCompleted: !state.showCompleted })),
      setSortBy: (sortBy) => set({ sortBy }),
      setFilterPriority: (filterPriority) => set({ filterPriority }),

      // Computed getters
      getTodayTodos: () => {
        const state = get();
        const today = Date.now();
        const endOfDay = today + 24 * 60 * 60 * 1000;
        
        return state.todos.filter(todo => 
          !todo.completed && 
          (!todo.dueDate || todo.dueDate <= endOfDay)
        );
      },

      getUpcomingTodos: () => {
        const state = get();
        const endOfDay = Date.now() + 24 * 60 * 60 * 1000;
        
        return state.todos.filter(todo => 
          !todo.completed && 
          todo.dueDate && 
          todo.dueDate > endOfDay
        );
      },

      getCompletedTodos: () => {
        const state = get();
        return state.todos.filter(todo => todo.completed);
      },

      getFilteredTodos: (section: "today" | "upcoming" | "completed") => {
        const state = get();
        let todos: TodoItem[];
        
        switch (section) {
          case "today":
            todos = state.getTodayTodos();
            break;
          case "upcoming":
            todos = state.getUpcomingTodos();
            break;
          case "completed":
            todos = state.getCompletedTodos();
            break;
          default:
            todos = [];
        }
        
        // Apply priority filter
        if (state.filterPriority !== "all") {
          todos = todos.filter(todo => todo.priority === state.filterPriority);
        }
        
        // Apply sorting
        return sortTodos(todos, state.sortBy);
      },
    }),
    {
      name: "todo-storage",
      partialize: (state) => ({
        todos: state.todos,
        showCompleted: state.showCompleted,
        sortBy: state.sortBy,
        filterPriority: state.filterPriority,
      }),
    }
  )
);
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { TodoMenuBar } from "./TodoMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { appMetadata, helpItems } from "..";
import { useSound } from "@/hooks/useSound";
import { useTodoStore } from "@/stores/useTodoStore";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { 
  Plus, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Calendar,
  ArrowDown,
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoAppComponentProps extends AppProps {}

export function TodoAppComponent({
  onClose,
  isForeground = true,
  skipInitialSound,
  instanceId,
}: TodoAppComponentProps) {
  // Note: These props are used by WindowFrame and other components
  const playSound = useSound("/sounds/Click.mp3");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const {
    todos,
    newTodoText,
    showCompleted,
    sortBy,
    filterPriority,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    setNewTodoText,
    toggleShowCompleted,
    setSortBy,
    setFilterPriority,
  } = useTodoStore(
    useShallow((s) => ({
      todos: s.todos,
      newTodoText: s.newTodoText,
      showCompleted: s.showCompleted,
      sortBy: s.sortBy,
      filterPriority: s.filterPriority,
      addTodo: s.addTodo,
      toggleTodo: s.toggleTodo,
      deleteTodo: s.deleteTodo,
      updateTodo: s.updateTodo,
      setNewTodoText: s.setNewTodoText,
      toggleShowCompleted: s.toggleShowCompleted,
      setSortBy: s.setSortBy,
      setFilterPriority: s.setFilterPriority,
    }))
  );

  // Compute filtered todos reactively in the component
  const getFilteredTodos = (section: "today" | "upcoming" | "completed") => {
    let filteredTodos: any[];
    
    switch (section) {
      case "today": {
        const today = Date.now();
        const endOfDay = today + 24 * 60 * 60 * 1000;
        filteredTodos = todos.filter(todo => 
          !todo.completed && 
          (!todo.dueDate || todo.dueDate <= endOfDay)
        );
        break;
      }
      case "upcoming": {
        const endOfDay = Date.now() + 24 * 60 * 60 * 1000;
        filteredTodos = todos.filter(todo => 
          !todo.completed && 
          todo.dueDate && 
          todo.dueDate > endOfDay
        );
        break;
      }
      case "completed":
        filteredTodos = todos.filter(todo => todo.completed);
        break;
      default:
        filteredTodos = [];
    }
    
    // Apply priority filter
    if (filterPriority !== "all") {
      filteredTodos = filteredTodos.filter(todo => todo.priority === filterPriority);
    }
    
    // Apply sorting
    const sorted = [...filteredTodos];
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => {
          if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return a.createdAt - b.createdAt;
        });
      
      case "priority": {
        const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
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

  const todayTodos = getFilteredTodos("today");
  const upcomingTodos = getFilteredTodos("upcoming");
  const completedTodos = getFilteredTodos("completed");

  const handleAddTodo = useCallback(() => {
    if (!newTodoText.trim()) return;
    
    addTodo(newTodoText);
    playSound.play();
    toast.success("Todo added");
    
    // Focus input for quick adding
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [newTodoText, addTodo, playSound]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  }, [handleAddTodo]);

  const handleToggleTodo = useCallback((id: string) => {
    toggleTodo(id);
    playSound.play();
  }, [toggleTodo, playSound]);

  const handleDeleteTodo = useCallback((id: string) => {
    deleteTodo(id);
    playSound.play();
    toast.success("Todo deleted");
  }, [deleteTodo, playSound]);

  const startEditing = useCallback((todo: any) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingTodo(null);
    setEditText("");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingTodo || !editText.trim()) return;
    
    updateTodo(editingTodo, { text: editText.trim() });
    setEditingTodo(null);
    setEditText("");
    playSound.play();
    toast.success("Todo updated");
  }, [editingTodo, editText, updateTodo, playSound]);

  const formatDueDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = timestamp - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertTriangle className="w-3 h-3" />;
      case "medium": return <Clock className="w-3 h-3" />;
      case "low": return <ArrowDown className="w-3 h-3" />;
      default: return null;
    }
  };

  const renderTodoItem = (todo: any) => (
    <div
      key={todo.id}
      className={cn(
        "flex items-center gap-3 p-3 border rounded-lg",
        "hover:bg-gray-50 transition-colors",
        todo.completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => handleToggleTodo(todo.id)}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {editingTodo === todo.id ? (
          <div className="flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEditing();
              }}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={saveEdit}>
              <Check className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEditing}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className={cn(
              "text-sm",
              todo.completed && "line-through text-gray-500"
            )}>
              {todo.text}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(todo.priority))}
              >
                {getPriorityIcon(todo.priority)}
                {todo.priority}
              </Badge>
              
              {todo.dueDate && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDueDate(todo.dueDate)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!todo.completed && editingTodo !== todo.id && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startEditing(todo)}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteTodo(todo.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {todo.completed && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleToggleTodo(todo.id)}
          title="Undo completion"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );

  const renderSection = (title: string, todos: any[], icon: React.ReactNode) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {title}
        <Badge variant="secondary" className="text-xs">
          {todos.length}
        </Badge>
      </div>
      
      {todos.length === 0 ? (
        <p className="text-sm text-gray-500 italic pl-6">
          No tasks {title.toLowerCase()}
        </p>
      ) : (
        <div className="space-y-2 group">
          {todos.map(renderTodoItem)}
        </div>
      )}
    </div>
  );

  return (
    <>
      <WindowFrame
        appId="todo"
        title="To-Do"
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
      >
        <TodoMenuBar
          onToggleCompleted={toggleShowCompleted}
          onSortBy={setSortBy}
          onFilterPriority={setFilterPriority}
          onHelp={() => setShowHelp(true)}
          onAbout={() => setShowAbout(true)}
          showCompleted={showCompleted}
          sortBy={sortBy}
          filterPriority={filterPriority}
        />

        <div className="flex-1 flex flex-col">
          {/* Quick add */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                placeholder="Add a new task... (try 'buy milk tomorrow 3pm' or 'urgent: finish report')"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleAddTodo}
                disabled={!newTodoText.trim()}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Natural language supported: "tomorrow 3pm", "urgent", "low priority", etc.
            </p>
          </div>

          {/* Filters and controls */}
          <div className="p-4 border-b bg-gray-50 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowCompleted}
              className="flex items-center gap-1"
            >
              {showCompleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showCompleted ? "Hide" : "Show"} Completed
            </Button>
          </div>

          {/* Todo sections */}
          <div className="flex-1 p-4 space-y-6 overflow-auto">
            {renderSection(
              "Today",
              todayTodos,
              <Calendar className="w-4 h-4 text-blue-500" />
            )}
            
            {renderSection(
              "Upcoming", 
              upcomingTodos,
              <Clock className="w-4 h-4 text-orange-500" />
            )}
            
            {showCompleted && renderSection(
              "Completed",
              completedTodos,
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>
      </WindowFrame>

      {showHelp && (
        <HelpDialog
          isOpen={showHelp}
          onOpenChange={setShowHelp}
          appName="To-Do"
          helpItems={helpItems || []}
        />
      )}

      {showAbout && (
        <AboutDialog
          appName={appMetadata.name}
          description={appMetadata.description}
          version={appMetadata.version}
          onClose={() => setShowAbout(false)}
        />
      )}
    </>
  );
}
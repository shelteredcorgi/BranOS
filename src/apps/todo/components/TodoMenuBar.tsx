import { MenuBar } from "@/components/layout/MenuBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface TodoMenuBarProps {
  onToggleCompleted: () => void;
  onSortBy: (sortBy: "date" | "priority" | "alphabetical") => void;
  onFilterPriority: (priority: "all" | "low" | "medium" | "high") => void;
  onHelp: () => void;
  onAbout: () => void;
  showCompleted: boolean;
  sortBy: "date" | "priority" | "alphabetical";
  filterPriority: "all" | "low" | "medium" | "high";
  inWindowFrame?: boolean;
}

export function TodoMenuBar({
  onToggleCompleted,
  onSortBy,
  onFilterPriority,
  onHelp,
  onAbout,
  showCompleted,
  sortBy,
  filterPriority,
  inWindowFrame = true,
}: TodoMenuBarProps) {
  return (
    <MenuBar inWindowFrame={inWindowFrame}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={showCompleted}
            onCheckedChange={onToggleCompleted}
          >
            Show Completed ⌘⇧C
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortBy === "date"}
            onCheckedChange={() => onSortBy("date")}
          >
            Sort by Date
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === "priority"}
            onCheckedChange={() => onSortBy("priority")}
          >
            Sort by Priority
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={sortBy === "alphabetical"}
            onCheckedChange={() => onSortBy("alphabetical")}
          >
            Sort Alphabetically
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filterPriority === "all"}
            onCheckedChange={() => onFilterPriority("all")}
          >
            All Priorities
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filterPriority === "high"}
            onCheckedChange={() => onFilterPriority("high")}
          >
            High Priority Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filterPriority === "medium"}
            onCheckedChange={() => onFilterPriority("medium")}
          >
            Medium Priority Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filterPriority === "low"}
            onCheckedChange={() => onFilterPriority("low")}
          >
            Low Priority Only
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Help</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onHelp}>
            To-Do Help
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAbout}>
            About To-Do
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}
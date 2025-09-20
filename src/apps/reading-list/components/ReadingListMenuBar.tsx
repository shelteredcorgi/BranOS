import { MenuBar } from "@/components/layout/MenuBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReadingListMenuBarProps {
  onRefresh: () => void;
  onHelp: () => void;
  onAbout: () => void;
}

export function ReadingListMenuBar({
  onRefresh,
  onHelp,
  onAbout,
}: ReadingListMenuBarProps) {
  return (
    <MenuBar inWindowFrame={true}>
      {/* View Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="h-6 text-md px-2 py-1 border-none hover:bg-gray-200 active:bg-gray-900 active:text-white focus-visible:ring-0"
          >
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem
            onClick={onRefresh}
            disabled={false}
            className="text-md h-6 px-3 active:bg-gray-900 active:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh ⌘R
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="h-6 text-md px-2 py-1 border-none hover:bg-gray-200 active:bg-gray-900 active:text-white focus-visible:ring-0"
          >
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem
            onClick={onHelp}
            className="text-md h-6 px-3 active:bg-gray-900 active:text-white"
          >
            Reading List Help
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onAbout}
            className="text-md h-6 px-3 active:bg-gray-900 active:text-white"
          >
            About Reading List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}
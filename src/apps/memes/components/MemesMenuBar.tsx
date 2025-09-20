import { MenuBar } from "@/components/layout/MenuBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MemesMenuBarProps {
  onUpload: () => void;
  onNewFolder: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
  onToggleShuffle: () => void;
  onGridView: () => void;
  onListView: () => void;
  onSlideshow: () => void;
  onRandomMeme: () => void;
  onHelp: () => void;
  onAbout: () => void;
  hasSelection: boolean;
  isShuffleMode: boolean;
}

export function MemesMenuBar({
  onUpload,
  onNewFolder,
  onExportSelected,
  onClearSelection,
  onToggleShuffle,
  onGridView,
  onListView,
  onSlideshow,
  onRandomMeme,
  onHelp,
  onAbout,
  hasSelection,
  isShuffleMode,
}: MemesMenuBarProps) {
  return (
    <MenuBar inWindowFrame={true}>
      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="h-6 text-md px-2 py-1 border-none hover:bg-gray-200 active:bg-gray-900 active:text-white focus-visible:ring-0"
          >
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={onUpload}>
            Select Folder...
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onNewFolder} disabled>
            New Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportSelected} disabled={!hasSelection}>
            Export Selected...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={onGridView}>
            Grid View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onListView}>
            List View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSlideshow} disabled>
            Slideshow
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRandomMeme}>
            Random Meme
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onToggleShuffle}>
            {isShuffleMode ? "Turn Off Shuffle" : "Shuffle Mode"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selection Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="h-6 text-md px-2 py-1 border-none hover:bg-gray-200 active:bg-gray-900 active:text-white focus-visible:ring-0"
          >
            Selection
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={onClearSelection} disabled={!hasSelection}>
            Clear Selection
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Select All
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            Select None
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
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={onHelp}>
            Memes Help
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onAbout}>
            About Memes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}
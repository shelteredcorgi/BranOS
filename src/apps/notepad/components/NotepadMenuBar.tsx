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

interface NotepadMenuBarProps {
  onNewDocument: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onToggleFocusMode: () => void;
  onToggleTypewriterMode: () => void;
  onToggleWordCount: () => void;
  onSetGoal: () => void;
  onHelp: () => void;
  onAbout: () => void;
  focusMode: boolean;
  typewriterMode: boolean;
  showWordCount: boolean;
  inWindowFrame?: boolean;
}

export function NotepadMenuBar({
  onNewDocument,
  onSaveAs,
  onExport,
  onCopyToClipboard,
  onToggleFocusMode,
  onToggleTypewriterMode,
  onToggleWordCount,
  onSetGoal,
  onHelp,
  onAbout,
  focusMode,
  typewriterMode,
  showWordCount,
  inWindowFrame = true,
}: NotepadMenuBarProps) {
  return (
    <MenuBar inWindowFrame={inWindowFrame}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">File</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onNewDocument}>
            New Document... ⌘N
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSaveAs}>
            Save As... ⌘S
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExport}>
            Export... ⌘E
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyToClipboard}>
            Copy to Clipboard ⌘C
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">View</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={focusMode}
            onCheckedChange={onToggleFocusMode}
          >
            Focus Mode ⌘⇧F
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={typewriterMode}
            onCheckedChange={onToggleTypewriterMode}
          >
            Typewriter Mode ⌘⇧T
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showWordCount}
            onCheckedChange={onToggleWordCount}
          >
            Show Word Count ⌘⇧W
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem onClick={onSetGoal}>
            Set Daily Goal... ⌘⇧G
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Help</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onHelp}>
            Notepad Help
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAbout}>
            About Notepad
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  ListOrdered,
} from "lucide-react";
import { useSound, Sounds } from "@/hooks/useSound";

interface EditorToolbarProps {
  editor: Editor | null;
  currentTheme: string;
}

export function EditorToolbar({
  editor,
  currentTheme,
}: EditorToolbarProps) {
  const { play: playButtonClick } = useSound(Sounds.BUTTON_CLICK);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
  const isLegacyToolbarTheme = isXpTheme || currentTheme === "system7";
  const isMacOSTheme = currentTheme === "macosx";

  const getCurrentHeading = () => {
    if (editor?.isActive("heading", { level: 1 })) return "h1";
    if (editor?.isActive("heading", { level: 2 })) return "h2";
    if (editor?.isActive("heading", { level: 3 })) return "h3";
    return "text";
  };

  const handleHeadingChange = (value: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === "text") {
      chain.setParagraph().run();
      return;
    }
    const level = value === "h1" ? 1 : value === "h2" ? 2 : 3;
    if (!editor.isActive("heading", { level })) {
      chain.toggleHeading({ level }).run();
    }
  };

  if (isLegacyToolbarTheme) {
    return (
      <div className="flex bg-[#c0c0c0] border-b border-black w-full flex-shrink-0">
        <div className="flex px-1 py-1 gap-x-1">
          {/* Text style group */}
          <div className="flex">
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().toggleBold().run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/bold-${
                  editor?.isActive("bold") ? "depressed" : "off"
                }.png`}
                alt="Bold"
                className="w-[26px] h-[22px]"
              />
            </button>
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().toggleItalic().run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/italic-${
                  editor?.isActive("italic") ? "depressed" : "off"
                }.png`}
                alt="Italic"
                className="w-[26px] h-[22px]"
              />
            </button>
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().toggleUnderline().run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/underline-${
                  editor?.isActive("underline") ? "depressed" : "off"
                }.png`}
                alt="Underline"
                className="w-[26px] h-[22px]"
              />
            </button>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-[22px] bg-[#808080] shadow-[1px_0_0_#ffffff]" />

          {/* Heading selector */}
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-[80px] h-[22px] flex items-center justify-between px-2 bg-white border border-[#808080] text-sm">
                  {getCurrentHeading() === "h1"
                    ? "H1"
                    : getCurrentHeading() === "h2"
                    ? "H2"
                    : getCurrentHeading() === "h3"
                    ? "H3"
                    : "Text"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[80px]">
                <DropdownMenuItem
                  onClick={() => handleHeadingChange("text")}
                  className="text-sm h-6 px-2"
                >
                  Text
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleHeadingChange("h1")}
                  className="text-sm h-6 px-2"
                >
                  H1
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleHeadingChange("h2")}
                  className="text-sm h-6 px-2"
                >
                  H2
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleHeadingChange("h3")}
                  className="text-sm h-6 px-2"
                >
                  H3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-[22px] bg-[#808080] shadow-[1px_0_0_#ffffff]" />

          {/* Alignment group */}
          <div className="flex">
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().setTextAlign("left").run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/align-left-${
                  editor?.isActive({ textAlign: "left" })
                    ? "depressed"
                    : "off"
                }.png`}
                alt="Align Left"
                className="w-[26px] h-[22px]"
              />
            </button>
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().setTextAlign("center").run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/align-center-${
                  editor?.isActive({ textAlign: "center" })
                    ? "depressed"
                    : "off"
                }.png`}
                alt="Align Center"
                className="w-[26px] h-[22px]"
              />
            </button>
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().setTextAlign("right").run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/align-right-${
                  editor?.isActive({ textAlign: "right" })
                    ? "depressed"
                    : "off"
                }.png`}
                alt="Align Right"
                className="w-[26px] h-[22px]"
              />
            </button>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-[22px] bg-[#808080] shadow-[1px_0_0_#ffffff]" />

          {/* List group */}
          <div className="flex">
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().toggleBulletList().run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/unordered-list-${
                  editor?.isActive("bulletList") ? "depressed" : "off"
                }.png`}
                alt="Bullet List"
                className="w-[26px] h-[22px]"
              />
            </button>
            <button
              onClick={() => {
                playButtonClick();
                editor?.chain().focus().toggleOrderedList().run();
              }}
              className="w-[26px] h-[22px] flex items-center justify-center"
            >
              <img
                src={`/icons/default/text-editor/ordered-list-${
                  editor?.isActive("orderedList") ? "depressed" : "off"
                }.png`}
                alt="Ordered List"
                className="w-[26px] h-[22px]"
              />
            </button>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-[22px] bg-[#808080] shadow-[1px_0_0_#ffffff]" />

        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 p-1 ${
        isXpTheme
          ? "border-b border-[#919b9c]"
          : isMacOSTheme
          ? "bg-transparent"
          : currentTheme === "system7"
          ? "bg-gray-100 border-b border-black"
          : "bg-gray-100 border-b border-gray-300"
      }`}
      style={{
        borderBottom:
          isMacOSTheme
            ? "var(--os-metrics-titlebar-border-width, 1px) solid var(--os-color-titlebar-border-inactive, rgba(0, 0, 0, 0.2))"
            : undefined,
      }}
    >
      {/* Text style group */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <BoldIcon
            className={`h-4 w-4 ${
              editor?.isActive("bold")
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <ItalicIcon
            className={`h-4 w-4 ${
              editor?.isActive("italic")
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().toggleUnderline().run()
          }
          aria-label="Underline"
        >
          <UnderlineIcon
            className={`h-4 w-4 ${
              editor?.isActive("underline")
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
      </div>

      {/* Heading selector */}
      <div className="flex items-center mx-1">
        {isMacOSTheme ? (
          <Select
            value={getCurrentHeading()}
            onValueChange={handleHeadingChange}
          >
            <SelectTrigger className="h-7 px-2 !min-w-[92px] !text-[12px]">
              <SelectValue placeholder="Text" />
            </SelectTrigger>
            <SelectContent align="start" className="px-0">
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-7 px-2 min-w-[120px] justify-between"
              >
                {getCurrentHeading() === "h1"
                  ? "H1"
                  : getCurrentHeading() === "h2"
                  ? "H2"
                  : getCurrentHeading() === "h3"
                  ? "H3"
                  : "Text"}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[120px]">
              <DropdownMenuItem onClick={() => handleHeadingChange("text")}>
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeadingChange("h1")}>
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeadingChange("h2")}>
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleHeadingChange("h3")}>
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Alignment group */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().setTextAlign("left").run()
          }
          aria-label="Align Left"
        >
          <AlignLeft
            className={`h-4 w-4 ${
              editor?.isActive({ textAlign: "left" })
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().setTextAlign("center").run()
          }
          aria-label="Align Center"
        >
          <AlignCenter
            className={`h-4 w-4 ${
              editor?.isActive({ textAlign: "center" })
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().setTextAlign("right").run()
          }
          aria-label="Align Right"
        >
          <AlignRight
            className={`h-4 w-4 ${
              editor?.isActive({ textAlign: "right" })
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
          aria-label="Bullet List"
        >
          <ListIcon
            className={`h-4 w-4 ${
              editor?.isActive("bulletList")
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
          aria-label="Ordered List"
        >
          <ListOrdered
            className={`h-4 w-4 ${
              editor?.isActive("orderedList")
                ? "text-black"
                : "text-neutral-500"
            }`}
          />
        </Button>
      </div>

    </div>
  );
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useThemeStore } from "@/stores/useThemeStore";
import { cn } from "@/lib/utils";

interface EmojiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
  // Popular & Audio Related
  "🎵",
  "🎶",
  "🎤",
  "🎧",
  "🎼",
  "🔊",
  "🔉",
  "🔈",
  "🎙",
  "📢",
  "🎸",
  "🎹",
  "🎺",
  "🎷",
  "🥁",
  "🎚",
  "🎛",
  "🔔",
  "📣",
  "🔕",

  // Common Symbols & Actions
  "✅",
  "❌",
  "⭐",
  "💫",
  "✨",
  "🔥",
  "💥",
  "💢",
  "💡",
  "💭",
  "❤️",
  "💀",
  "☠️",
  "⚡",
  "💪",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👋",
  "💩",
  "🎉",
  "🎊",
  "🌸",
  "🌺",
  "🌷",

  // Arrows & Movement
  "⬆️",
  "⬇️",
  "⬅️",
  "➡️",
  "↗️",
  "↘️",
  "↙️",
  "↖️",
  "↕️",
  "↔️",
  "🏃",
  "🏃‍♀️",
  "💃",
  "🕺",
  "🚶",
  "🚶‍♀️",

  // Common Faces
  "😀",
  "😄",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😮",
  "😱",
  "😭",
  "🥺",
  "😤",
  "😠",
  "😡",
  "🤬",
  "🤯",
  "🥴",
  "😴",
  "😵",

  // Animals
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",

  // Objects & Tools
  "⚙️",
  "🔧",
  "🔨",
  "💻",
  "⌨️",
  "🖥️",
  "📱",
  "🔋",
  "🔌",
  "💾",
  "💿",
  "📀",
  "🎮",
  "🕹️",
  "🎲",
  "🎯",
  "🎨",
  "✂️",
  "📎",
  "📌",

  // Weather & Nature
  "☀️",
  "🌙",
  "⭐",
  "☁️",
  "🌈",
  "🌧️",
  "⛈️",
  "❄️",
  "🌪️",
  "🔥",

  // Additional Faces & Gestures
  "🤔",
  "🤨",
  "🧐",
  "🤓",
  "😤",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "✌️",
  "🤘",
  "🤙",
  "👆",
  "👇",
  "👈",
  "👉",
  "👊",
  "🤛",
  "🤜",

  // Misc Symbols
  "♠️",
  "♣️",
  "♥️",
  "♦️",
  "🔄",
  "⏩",
  "⏪",
  "⏫",
  "⏬",
  "🔼",
  "🔽",
  "⏯️",
  "⏹️",
  "⏺️",
  "⏏️",
  "🎦",
  "🔅",
  "🔆",
  "📶",
  "📳",
  "📴",
  "♾️",
  "♻️",
  "⚜️",
  "🔱",
  "📛",
  "🔰",
  "⭕",
  "✅",
  "☑️",
  "✔️",
  "❌",
  "❎",
  "〽️",
  "✳️",
  "✴️",
  "❇️",
  "©️",
  "®️",
  "™️",
];

export function EmojiDialog({
  isOpen,
  onOpenChange,
  onEmojiSelect,
}: EmojiDialogProps) {
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";

  const dialogContent = (
    <div className={isXpTheme ? "p-2 px-4 pt-0" : "p-4 py-6"}>
      <p
        id="dialog-description"
        className={cn(
          "mb-2 text-gray-500",
          isXpTheme
            ? "font-['Pixelated_MS_Sans_Serif',Arial] text-[11px]"
            : "font-geneva-12 text-[12px]"
        )}
      >
        Choose an emoji
      </p>
      <div className="grid grid-cols-10 gap-1 max-h-[300px] overflow-y-auto">
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            className="p-1 !text-2xl hover:scale-120 transition-all duration-200 rounded cursor-pointer font-['SerenityOS-Emoji']"
            onClick={() => {
              onEmojiSelect(emoji);
              onOpenChange(false);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-[500px]", isXpTheme && "p-0 overflow-hidden")}
        style={isXpTheme ? { fontSize: "11px" } : undefined}
      >
        {isXpTheme ? (
          <>
            <DialogHeader>Set Emoji</DialogHeader>
            <div className="window-body">{dialogContent}</div>
          </>
        ) : currentTheme === "macosx" ? (
          <>
            <DialogHeader>Set Emoji</DialogHeader>
            {dialogContent}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-normal text-[16px]">
                Set Emoji
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose an emoji for this sound slot
              </DialogDescription>
            </DialogHeader>
            {dialogContent}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

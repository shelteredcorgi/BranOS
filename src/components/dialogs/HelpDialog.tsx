import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useThemeStore } from "@/stores/useThemeStore";
import { cn } from "@/lib/utils";

interface HelpCardProps {
  icon: string;
  title: string;
  description: string;
}

function HelpCard({ icon, title, description }: HelpCardProps) {
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
  const isMacTheme = currentTheme === "macosx";

  return (
    <div className="p-4 bg-black/5 rounded-os transition-colors">
      <div className="!text-[18px]">{icon}</div>
      <h3
        className={cn(
          "font-medium",
          isXpTheme && "font-['Pixelated_MS_Sans_Serif',Arial] text-[11px]",
          isMacTheme && "font-bold"
        )}
        style={{
          fontFamily: isXpTheme
            ? '"Pixelated MS Sans Serif", Arial'
            : undefined,
          fontSize: isXpTheme ? "11px" : undefined,
        }}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-gray-700",
          isXpTheme
            ? "font-['Pixelated_MS_Sans_Serif',Arial] text-[10px]"
            : "font-geneva-12 text-[10px]"
        )}
        style={{
          fontFamily: isXpTheme
            ? '"Pixelated MS Sans Serif", Arial'
            : undefined,
          fontSize: isXpTheme ? "10px" : undefined,
        }}
      >
        {description}
      </p>
    </div>
  );
}

interface HelpDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void; // Backward compatibility
  helpItems?: HelpCardProps[];
  appName?: string;
  // Alternative format for backward compatibility
  title?: string;
  items?: Array<{ question: string; answer: string; }>;
}

export function HelpDialog({
  isOpen,
  onOpenChange,
  onClose,
  helpItems = [],
  appName,
  title,
  items = [],
}: HelpDialogProps) {
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
  
  // Use title/items format if provided, otherwise use appName/helpItems
  const displayTitle = title || `${appName} Help`;
  const displayItems = items.length > 0 
    ? items.map(item => ({ icon: "❓", title: item.question, description: item.answer }))
    : helpItems;

  const dialogContent = (
    <div className={isXpTheme ? "p-2 px-4" : "p-6 pt-4"}>
      <p
        className={cn(
          "text-2xl mb-4",
          isXpTheme
            ? "font-['Pixelated_MS_Sans_Serif',Arial]"
            : "font-apple-garamond"
        )}
        style={{
          fontFamily: isXpTheme
            ? '"Pixelated MS Sans Serif", Arial'
            : undefined,
          fontSize: isXpTheme ? "18px" : undefined,
        }}
      >
        {displayTitle}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayItems.map((item) => (
          <HelpCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else if (onClose && !open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen || false} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-w-[600px]", isXpTheme && "p-0 overflow-hidden")}
        style={isXpTheme ? { fontSize: "11px" } : undefined}
      >
        {isXpTheme ? (
          <>
            <DialogHeader>Help</DialogHeader>
            <div className="window-body">{dialogContent}</div>
          </>
        ) : currentTheme === "macosx" ? (
          <>
            <DialogHeader>Help</DialogHeader>
            {dialogContent}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-normal text-[16px]">
                Help
              </DialogTitle>
              <DialogDescription className="sr-only">
                Help and documentation for {appName}
              </DialogDescription>
            </DialogHeader>
            {dialogContent}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

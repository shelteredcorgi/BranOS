import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useThemeStore } from "@/stores/useThemeStore";
import { cn } from "@/lib/utils";
import { ThemedIcon } from "@/components/shared/ThemedIcon";

interface AboutDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void; // Backward compatibility
  metadata?: {
    name: string;
    version: string;
    creator: {
      name: string;
      url: string;
    };
    github: string;
    icon: string;
  };
  // Alternative format for backward compatibility
  appName?: string;
  description?: string;
  version?: string;
}

export function AboutDialog({
  isOpen,
  onOpenChange,
  onClose,
  metadata,
  appName,
  description: _description,
  version,
}: AboutDialogProps) {
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";

  // Use props if metadata is not provided
  const displayName = metadata?.name || appName || "Application";
  const displayVersion = metadata?.version || version || "1.0.0";
  // const displayDescription = description || "No description available";
  const displayIcon = metadata?.icon || "/icons/default/app.png";

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else if (onClose && !open) {
      onClose();
    }
  };

  const dialogContent = (
    <div className="flex flex-col items-center justify-center space-y-2 py-8">
      <div>
        <ThemedIcon
          name={displayIcon}
          alt="App Icon"
          className="w-12 h-12 mx-auto [image-rendering:pixelated]"
        />
      </div>
      <div
        className={cn(
          "space-y-0 text-center",
          isXpTheme
            ? "font-['Pixelated_MS_Sans_Serif',Arial] text-[11px]"
            : "font-geneva-12 text-[10px]"
        )}
      >
        <div
          className={cn(
            "!text-3xl font-medium",
            isXpTheme
              ? "font-['Trebuchet MS'] !text-[17px]"
              : "font-apple-garamond"
          )}
        >
          {displayName}
        </div>
        <p className="text-gray-500 mb-2">Version {displayVersion}</p>
        <p>
          Made by{" "}
          <a
            href={metadata?.creator?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {metadata?.creator?.name}
          </a>
        </p>
        <p>
          <a
            href={metadata?.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Open in GitHub
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen || false} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-w-[280px]", isXpTheme && "p-0 overflow-hidden")}
        style={isXpTheme ? { fontSize: "11px" } : undefined}
      >
        {isXpTheme ? (
          <>
            <DialogHeader>About</DialogHeader>
            <div className={`window-body ${isXpTheme ? "p-2 px-4" : "p-4"}`}>
              {dialogContent}
            </div>
          </>
        ) : currentTheme === "macosx" ? (
          <>
            <DialogHeader>About</DialogHeader>
            {dialogContent}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-normal text-[16px]">
                About
              </DialogTitle>
              <DialogDescription className="sr-only">
                Information about the application
              </DialogDescription>
            </DialogHeader>
            {dialogContent}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { ReadingListMenuBar } from "./ReadingListMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "..";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/button";

interface ReadingListAppComponentProps extends AppProps {}

export function ReadingListAppComponent({
  onClose,
  isForeground = true,
  skipInitialSound,
  instanceId,
}: ReadingListAppComponentProps) {
  const playSound = useSound("/sounds/Click.mp3");
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  const notionUrl = "https://www.notion.so/67fffff68851445d9e3bf307c8849dc5?v=dc33676851674c53824ba82fb5c71f29&source=copy_link";

  useEffect(() => {
    if (!skipInitialSound) {
      playSound.play();
    }
  }, []);

  const openInBrowserWindow = () => {
    playSound.play();
    window.open(notionUrl, '_blank');
  };

  return (
    <>
      <WindowFrame
        appId="reading-list"
        title="Reading List"
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
      >
        <ReadingListMenuBar
          onRefresh={() => {}}
          onHelp={() => setShowHelp(true)}
          onAbout={() => setShowAbout(true)}
        />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="text-8xl mb-4">📖</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Reading List
          </h2>
          <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
            Access your Notion reading list in a new browser tab for the best experience.
          </p>
          
          <Button 
            onClick={openInBrowserWindow}
            className="px-8 py-4 text-lg font-medium bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            📖 Open Reading List
          </Button>
        </div>
      </WindowFrame>

      {showHelp && (
        <HelpDialog
          isOpen={showHelp}
          onOpenChange={setShowHelp}
          appName="Reading List"
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
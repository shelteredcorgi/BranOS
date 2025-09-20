import { useState } from "react";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { XListsMenuBar } from "./XListsMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "..";
import { useSound } from "@/hooks/useSound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface XListsAppComponentProps extends AppProps {}

export function XListsAppComponent({
  onClose,
  isForeground = true,
  skipInitialSound,
  instanceId,
}: XListsAppComponentProps) {
  // Note: These props are used by WindowFrame and other components
  const playSound = useSound("/sounds/Click.mp3");
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);



  const openXListInBrowser = (url: string) => {
    window.open(url, "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");
    playSound.play();
  };

  const renderMainView = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">X Lists Browser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Open X Lists directly in a browser window
          </p>
          
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openXListInBrowser("https://x.com/i/lists/1786809359374385614")}
              className="w-full text-xs"
            >
              List A
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openXListInBrowser("https://x.com/home")}
              className="w-full text-xs"
            >
              Following Feed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );



  return (
    <>
      <WindowFrame
        appId="xlists"
        title="X Lists"
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
      >
        <XListsMenuBar
          onRefresh={() => {}}
          onSettings={() => {}}
          onHelp={() => setShowHelp(true)}
          onAbout={() => setShowAbout(true)}
        />

        {renderMainView()}
      </WindowFrame>


      {showHelp && (
        <HelpDialog
          isOpen={showHelp}
          onOpenChange={setShowHelp}
          appName="X Lists"
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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { AboutFinderDialog } from "@/components/dialogs/AboutFinderDialog";
import { AnyApp } from "@/apps/base/types";
import { AppId } from "@/config/appRegistry";
import { useLaunchApp } from "@/hooks/useLaunchApp";
import { useThemeStore } from "@/stores/useThemeStore";
import { cn } from "@/lib/utils";
import { ThemedIcon } from "@/components/shared/ThemedIcon";
import { OsThemeId } from "@/themes/types";

interface AppleMenuProps {
  apps: AnyApp[];
}

export function AppleMenu({ apps }: AppleMenuProps) {
  const [aboutFinderOpen, setAboutFinderOpen] = useState(false);
  const launchApp = useLaunchApp();
  const currentTheme = useThemeStore((state) => state.current);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isMacOsxTheme = currentTheme === "macosx";

  const handleAppClick = (appId: string) => {
    // Simply launch the app - the instance system will handle focus if already open
    launchApp(appId as AppId);
  };

  const handleThemeChange = (themeId: OsThemeId) => {
    setTheme(themeId);
  };

  const themeOptions = [
    { id: "system7" as OsThemeId, name: "System 7" },
    { id: "macosx" as OsThemeId, name: "Mac OS X" },
    { id: "xp" as OsThemeId, name: "Windows XP" },
    { id: "win98" as OsThemeId, name: "Windows 98" },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className={cn(
              "h-6 px-3 py-1 border-none hover:bg-black/10 active:bg-black/20 focus-visible:ring-0",
              isMacOsxTheme ? "text-xl px-1" : "text-md"
            )}
            style={{ color: "inherit" }}
          >
            {isMacOsxTheme ? (
              <ThemedIcon
                name="apple.png"
                alt="Apple Menu"
                style={{ width: 30, height: 30 }}
              />
            ) : (
              "\uf8ff" // 
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={1} className="px-0">
          <DropdownMenuItem
            onClick={() => setAboutFinderOpen(true)}
            className="text-md h-6 px-3 active:bg-gray-900 active:text-white"
          >
            About This Computer
          </DropdownMenuItem>

          {/* Theme Switcher */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-md h-6 px-3 active:bg-gray-900 active:text-white flex items-center gap-2">
              <ThemedIcon
                name="appearance.png"
                alt="Themes"
                className="w-4 h-4 [image-rendering:pixelated]"
              />
              Change Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="px-0">
              {themeOptions.map((theme) => (
                <DropdownMenuItem
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className="text-md h-6 px-3 active:bg-gray-900 active:text-white flex items-center gap-2"
                >
                  <span className="w-4 flex justify-center">
                    {currentTheme === theme.id ? "●" : "○"}
                  </span>
                  {theme.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="h-[2px] bg-black my-1" />
          {apps.map((app) => (
            <DropdownMenuItem
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="text-md h-6 px-3 active:bg-gray-900 active:text-white flex items-center gap-2"
            >
              {typeof app.icon === "string" ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  {app.icon}
                </div>
              ) : (
                <ThemedIcon
                  name={app.icon.src}
                  alt={app.name}
                  className="w-4 h-4 [image-rendering:pixelated]"
                />
              )}
              {app.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AboutFinderDialog
        isOpen={aboutFinderOpen}
        onOpenChange={setAboutFinderOpen}
      />
    </>
  );
}

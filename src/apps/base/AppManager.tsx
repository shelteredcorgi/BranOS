import { useEffect, useState, useMemo, memo } from "react";
import { AnyApp, AppState } from "./types";
import { AppContext } from "@/contexts/AppContext";
import { MenuBar } from "@/components/layout/MenuBar";
import { useThemeStore } from "@/stores/useThemeStore";
import { Desktop } from "@/components/layout/Desktop";
import { AppId, getAppComponent, appRegistry } from "@/config/appRegistry";
import { useAppStoreShallow } from "@/stores/helpers";
// Removed extractCodeFromPath import
import { toast } from "sonner";

interface AppManagerProps {
  apps: AnyApp[];
}

const BASE_Z_INDEX = 1;

export const AppManager = memo(function AppManager({ apps }: AppManagerProps) {
  // Instance-based state
  const {
    instances,
    instanceOrder,
    launchApp,
    closeAppInstance,
    bringInstanceToForeground,
    navigateToNextInstance,
    navigateToPreviousInstance,
    getForegroundInstance,
  } = useAppStoreShallow((state) => ({
    instances: state.instances,
    instanceOrder: state.instanceOrder,
    launchApp: state.launchApp,
    closeAppInstance: state.closeAppInstance,
    bringInstanceToForeground: state.bringInstanceToForeground,
    navigateToNextInstance: state.navigateToNextInstance,
    navigateToPreviousInstance: state.navigateToPreviousInstance,
    getForegroundInstance: state.getForegroundInstance,
  }));

  const [isInitialMount, setIsInitialMount] = useState(true);

  // Create legacy-compatible appStates from instances for AppContext
  // NOTE: There can be multiple open instances for the same appId. We need to
  // aggregate their state so that legacy consumers (e.g. AboutFinderDialog)
  // still receive correct information. In particular, `isOpen` should be true
  // if ANY instance is open, and `isForeground` should reflect the foreground
  // instance. We also prefer the foreground instance for position/size data.

  const legacyAppStates = useMemo(() => Object.values(instances).reduce((acc, instance) => {
    const existing = acc[instance.appId];

    // Determine whether this instance should be the source of foreground /
    // positional data. We always keep foreground instance data if available.
    const shouldReplace =
      !existing || // first encounter
      (instance.isForeground && !existing.isForeground); // take foreground

    acc[instance.appId] = {
      // isOpen is true if any instance is open
      isOpen: (existing?.isOpen ?? false) || instance.isOpen,
      // isForeground true if this particular instance is foreground, or an
      // earlier one already marked foreground
      isForeground: (existing?.isForeground ?? false) || instance.isForeground,
      // For position / size / initialData, prefer the chosen instance
      position: shouldReplace ? instance.position : existing?.position,
      size: shouldReplace ? instance.size : existing?.size,
      initialData: shouldReplace ? instance.initialData : existing?.initialData,
    };

    return acc;
  }, {} as { [appId: string]: AppState }), [instances]);

  const getZIndexForInstance = (instanceId: string) => {
    const index = instanceOrder.indexOf(instanceId);
    if (index === -1) return BASE_Z_INDEX;
    return BASE_Z_INDEX + index + 1;
  };

  // Wrapper: legacy appId -> instance focus using instanceOrder (end = foreground).
  const bringAppToForeground = (appId: AppId) => {
    // Find the most recently focused/open instance for the given appId.
    for (let i = instanceOrder.length - 1; i >= 0; i--) {
      const id = instanceOrder[i];
      const instance = instances[id];
      if (instance && instance.appId === appId && instance.isOpen) {
        bringInstanceToForeground(id);
        return;
      }
    }

    // Fallback: If no open instance found, do nothing but log (helps debug)
    console.warn(
      `[AppManager] bringAppToForeground: No open instance found for ${appId}`
    );
  };

  // Set isInitialMount to false after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialMount(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Process shared URLs and direct app launch paths
  useEffect(() => {
    const handleUrlNavigation = async () => {
      const path = window.location.pathname;
      console.log("[AppManager] Checking path:", path); // Keep this log for debugging
      // Removed IE share code functionality

      if (path.startsWith("/ipod/")) {
        const videoId = path.substring("/ipod/".length);
        if (videoId) {
          console.log("[AppManager] Detected iPod videoId:", videoId);
          toast.info("Opening shared iPod track...");
          setTimeout(() => {
            const event = new CustomEvent("launchApp", {
              detail: {
                appId: "ipod",
                initialData: { videoId },
              },
            });
            window.dispatchEvent(event);
            console.log(
              "[AppManager] Dispatched launchApp event for iPod videoId."
            );
          }, 0);
          window.history.replaceState({}, "", "/"); // Clean URL
        }
      } else if (path.startsWith("/videos/")) {
        const videoId = path.substring("/videos/".length);
        if (videoId) {
          console.log("[AppManager] Detected Videos videoId:", videoId);
          toast.info("Opening shared video...");
          setTimeout(() => {
            const event = new CustomEvent("launchApp", {
              detail: {
                appId: "videos",
                initialData: { videoId },
              },
            });
            window.dispatchEvent(event);
            console.log(
              "[AppManager] Dispatched launchApp event for Videos videoId."
            );
          }, 0);
          window.history.replaceState({}, "", "/"); // Clean URL
        }
      } else if (path.startsWith("/") && path.length > 1) {
        // Handle direct app launch path (e.g., /soundboard)
        const potentialAppId = path.substring(1) as AppId;

        // Check if it's a valid app ID from the registry
        if (potentialAppId in appRegistry) {
          const appName = appRegistry[potentialAppId]?.name || potentialAppId;
          toast.info(`Launching ${appName}...`);

          // Use a slight delay to ensure the app launch event is caught
          setTimeout(() => {
            const event = new CustomEvent("launchApp", {
              detail: { appId: potentialAppId },
            });
            window.dispatchEvent(event);
            window.history.replaceState({}, "", "/"); // Clean URL
          }, 100); // Small delay might help robustness
        } else {
          // Optional: Handle invalid app paths if necessary, or just ignore
          // console.log(`Path ${path} does not correspond to a known app.`);
          // Maybe redirect to root or show a 404 within the app context
          // For now, just clean the URL if it wasn't a valid app path or IE code
          // Update condition: Only clean if it's not an ipod path
          if (
            !path.startsWith("/ipod/")
          ) {
            window.history.replaceState({}, "", "/");
          }
        }
      }
    };

    // Process URL on initial load
    handleUrlNavigation();
  }, []); // Run only once on mount

  // Listen for app launch events (e.g., from Finder, URL handling)
  useEffect(() => {
    const handleAppLaunch = (
      event: CustomEvent<{
        appId: AppId;
        initialPath?: string;
        initialData?: unknown;
      }>
    ) => {
      const { appId, initialPath, initialData } = event.detail;

      console.log(
        `[AppManager] Launch event received for ${appId}`,
        event.detail
      );

      // Check if there's an existing instance before launching
      const existingInstance = Object.values(instances).find(
        (instance) => instance.appId === appId && instance.isOpen
      );

      // Use instance system
      const instanceId = launchApp(appId, initialData);
      console.log(
        `[AppManager] Launched instance ${instanceId} for app ${appId}`
      );

      // Store initialPath if provided
      if (initialPath) {
        localStorage.setItem(`app_${appId}_initialPath`, initialPath);
      }

      // If there was an existing instance and we have initialData, dispatch updateApp event
      if (existingInstance && initialData) {
        console.log(
          `[AppManager] Dispatching updateApp event for existing ${appId} instance with initialData:`,
          initialData
        );
        const updateEvent = new CustomEvent("updateApp", {
          detail: { appId, initialData },
        });
        window.dispatchEvent(updateEvent);
      }
    };

    window.addEventListener("launchApp", handleAppLaunch as EventListener);
    return () => {
      window.removeEventListener("launchApp", handleAppLaunch as EventListener);
    };
  }, [instances, launchApp]);

  return (
    <AppContext.Provider
      value={{
        appStates: legacyAppStates,
        toggleApp: launchApp,
        bringToForeground: bringAppToForeground,
        apps,
        navigateToNextApp: navigateToNextInstance,
        navigateToPreviousApp: navigateToPreviousInstance,
      }}
    >
      {(() => {
        const currentTheme = useThemeStore.getState().current;
        const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
        const hasForeground = Boolean(getForegroundInstance());
        // XP/Win98: always render global MenuBar (taskbar)
        // Mac/System7: render placeholder MenuBar only when no app is foreground
        return isXpTheme || !hasForeground ? <MenuBar /> : null;
      })()}
      {/* App Instances */}
      {Object.values(instances).map((instance) => {
        if (!instance.isOpen) return null;

        const appId = instance.appId as AppId;
        const zIndex = getZIndexForInstance(instance.instanceId);
        const AppComponent = getAppComponent(appId);

        // Debug logging for memes app specifically
        if (appId === 'memes') {
          console.log('🎯 AppManager rendering memes app:', {
            instanceId: instance.instanceId,
            appId,
            isOpen: instance.isOpen,
            AppComponent: !!AppComponent,
            componentName: AppComponent?.name || 'undefined'
          });
        }

        // Skip rendering if component is not found
        if (!AppComponent) {
          console.warn(`Skipping render for instance ${instance.instanceId} - app component not found for appId: ${appId}`);
          return null;
        }

        return (
          <div
            key={instance.instanceId}
            style={{ zIndex }}
            className="absolute inset-x-0 md:inset-x-auto w-full md:w-auto"
            onMouseDown={() => {
              if (!instance.isForeground) {
                bringInstanceToForeground(instance.instanceId);
              }
            }}
            onTouchStart={() => {
              if (!instance.isForeground) {
                bringInstanceToForeground(instance.instanceId);
              }
            }}
          >
            <AppComponent
              isWindowOpen={instance.isOpen}
              isForeground={instance.isForeground}
              onClose={() => closeAppInstance(instance.instanceId)}
              className="pointer-events-auto"
              helpItems={apps.find((app) => app.id === appId)?.helpItems}
              skipInitialSound={isInitialMount}
              // @ts-expect-error - Dynamic component system with different initialData types per app
              initialData={instance.initialData}
              instanceId={instance.instanceId}
              title={instance.title}
              onNavigateNext={() => navigateToNextInstance(instance.instanceId)}
              onNavigatePrevious={() =>
                navigateToPreviousInstance(instance.instanceId)
              }
            />
          </div>
        );
      })}

      <Desktop
        apps={apps}
        toggleApp={(appId, initialData) => {
          launchApp(appId, initialData);
        }}
        appStates={{ windowOrder: instanceOrder, apps: legacyAppStates }}
      />
    </AppContext.Provider>
  );
});

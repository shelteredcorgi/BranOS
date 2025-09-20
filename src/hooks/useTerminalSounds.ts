import { useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useSound } from "@/hooks/useSound";

// Terminal-specific sound paths
export const TerminalSounds = {
  KEYSTROKE: "/sounds/Keystroke.mp3",
  BEEP: "/sounds/Beep.mp3",
  BELL: "/sounds/Bell.mp3",
  SUCCESS: "/sounds/Success.mp3",
  ERROR: "/sounds/Error.mp3",
  STARTUP: "/sounds/TerminalStartup.mp3",
  TAB_COMPLETE: "/sounds/TabComplete.mp3",
  ENTER: "/sounds/Enter.mp3",
} as const;

export function useTerminalSounds() {
  const terminalSoundsEnabled = useAppStore((state) => state.terminalSoundsEnabled);
  
  // Initialize sounds
  const keystrokeSound = useSound(TerminalSounds.KEYSTROKE, 0.2);
  const beepSound = useSound(TerminalSounds.BEEP, 0.3);
  const bellSound = useSound(TerminalSounds.BELL, 0.4);
  const successSound = useSound(TerminalSounds.SUCCESS, 0.3);
  const errorSound = useSound(TerminalSounds.ERROR, 0.4);
  const startupSound = useSound(TerminalSounds.STARTUP, 0.5);
  const tabCompleteSound = useSound(TerminalSounds.TAB_COMPLETE, 0.2);
  const enterSound = useSound(TerminalSounds.ENTER, 0.3);

  // Wrapper function to check if terminal sounds are enabled
  const playIfEnabled = useCallback((soundFunction: () => void) => {
    if (terminalSoundsEnabled) {
      soundFunction();
    }
  }, [terminalSoundsEnabled]);

  const playKeystroke = useCallback(() => {
    playIfEnabled(keystrokeSound.play);
  }, [playIfEnabled, keystrokeSound.play]);

  const playBeep = useCallback(() => {
    playIfEnabled(beepSound.play);
  }, [playIfEnabled, beepSound.play]);

  const playBell = useCallback(() => {
    playIfEnabled(bellSound.play);
  }, [playIfEnabled, bellSound.play]);

  const playSuccess = useCallback(() => {
    playIfEnabled(successSound.play);
  }, [playIfEnabled, successSound.play]);

  const playError = useCallback(() => {
    playIfEnabled(errorSound.play);
  }, [playIfEnabled, errorSound.play]);

  const playStartup = useCallback(() => {
    playIfEnabled(startupSound.play);
  }, [playIfEnabled, startupSound.play]);

  const playTabComplete = useCallback(() => {
    playIfEnabled(tabCompleteSound.play);
  }, [playIfEnabled, tabCompleteSound.play]);

  const playEnter = useCallback(() => {
    playIfEnabled(enterSound.play);
  }, [playIfEnabled, enterSound.play]);

  return {
    playKeystroke,
    playBeep,
    playBell,
    playSuccess,
    playError,
    playStartup,
    playTabComplete,
    playEnter,
    terminalSoundsEnabled,
  };
}
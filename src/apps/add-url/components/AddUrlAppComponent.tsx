import React, { useState, useCallback, useEffect } from "react";
import { AppProps, AddUrlInitialData } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { AddUrlMenuBar } from "./AddUrlMenuBar";
import { UrlIconManager } from "./UrlIconManager";
import { useSound } from "@/hooks/useSound";
import { useUrlShortcutsStore } from "@/stores/useUrlShortcutsStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { ExternalLink, Plus, AlertCircle } from "lucide-react";

interface AddUrlAppComponentProps extends AppProps<AddUrlInitialData> {}

export const AddUrlAppComponent = React.memo(function AddUrlAppComponent({
  onClose,
  isWindowOpen,
  isForeground = true,
  skipInitialSound,
  instanceId,
  initialData,
}: AddUrlAppComponentProps) {
  // Theme context
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";

  // Sounds
  const playSound = useSound("/sounds/Click.mp3");

  // Store actions
  const { createShortcut, updateShortcut } = useUrlShortcutsStore();

  // Form state
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  // Check if editing existing shortcut
  const editingShortcut = initialData?.editingShortcut;
  const isEditing = !!editingShortcut;

  // Initialize form for editing
  useEffect(() => {
    if (editingShortcut) {
      setName(editingShortcut.name);
      setUrl(editingShortcut.url);
      setSelectedIcon(editingShortcut.icon);
    }
  }, [editingShortcut]);

  // Initialize with random icon if not editing
  useEffect(() => {
    if (!isEditing && !selectedIcon) {
      // Auto-generate a random icon when the component mounts
      const iconPools = {
        win98: [
          "/icons/win98/internet.png", "/icons/win98/sites.png", "/icons/win98/applications.png",
          "/icons/win98/games.png", "/icons/win98/terminal.png", "/icons/win98/paint.png"
        ],
        xp: [
          "/icons/xp/ie.png", "/icons/xp/sites.png", "/icons/xp/applications.png",
          "/icons/xp/games.png", "/icons/xp/terminal.png", "/icons/xp/paint.png"
        ],
        macosx: [
          "/icons/macosx/ie.png", "/icons/macosx/sites.png", "/icons/macosx/applications.png",
          "/icons/macosx/terminal.png", "/icons/macosx/paint.png", "/icons/macosx/apple.png"
        ],
        system7: [
          "/icons/win98/internet.png", "/icons/win98/sites.png", "/icons/win98/applications.png",
          "/icons/win98/terminal.png", "/icons/win98/paint.png"
        ],
        default: [
          "/icons/default/internet.png", "/icons/default/sites.png", "/icons/default/applications.png",
          "/icons/default/games.png", "/icons/default/terminal.png", "/icons/default/paint.png"
        ],
      };

      const iconPool = iconPools[currentTheme as keyof typeof iconPools] || iconPools.default;
      const randomIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
      setSelectedIcon(randomIcon);
    }
  }, [currentTheme, isEditing, selectedIcon]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { name?: string; url?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Shortcut name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        const urlObj = new URL(url.trim());
        if (!urlObj.protocol.startsWith('http')) {
          newErrors.url = "URL must start with http:// or https://";
        }
      } catch {
        newErrors.url = "Please enter a valid URL (e.g., https://example.com)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, url]);

  // Handle form submission
  const handleCreateShortcut = useCallback(async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    playSound.play();

    try {
      const shortcutData = {
        name: name.trim(),
        url: url.trim(),
        icon: selectedIcon,
        theme: currentTheme,
      };

      if (isEditing && editingShortcut) {
        updateShortcut(editingShortcut.id, shortcutData);
        console.log(`✏️ Updated shortcut: ${shortcutData.name}`, shortcutData);
      } else {
        const shortcutId = createShortcut(shortcutData);
        console.log(`✅ Created shortcut: ${shortcutData.name} (${shortcutId})`, shortcutData);
      }

      // Show success and close after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to create shortcut:', error);
      alert('Failed to create shortcut. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [validateForm, name, url, selectedIcon, currentTheme, isEditing, editingShortcut, createShortcut, updateShortcut, playSound, onClose]);

  // Clear form
  const handleClear = useCallback(() => {
    setName("");
    setUrl("");
    setSelectedIcon("");
    setErrors({});
    playSound.play();
  }, [playSound]);

  // Handle new shortcut
  const handleNew = useCallback(() => {
    handleClear();
  }, [handleClear]);

  // Computed properties
  const canSave = Boolean(name.trim() && url.trim() && selectedIcon && !isCreating);
  const hasContent = Boolean(name.trim() || url.trim());

  // Early return if window not open
  if (!isWindowOpen) {
    return null;
  }

  // Menu bar component
  const menuBar = (
    <AddUrlMenuBar
      onNew={handleNew}
      onSave={handleCreateShortcut}
      onClear={handleClear}
      onHelp={() => {}}
      onAbout={() => {}}
      canSave={canSave}
      hasContent={hasContent}
    />
  );

  return (
    <>
      {/* Menu bar for modern themes */}
      {!isXpTheme && isForeground && menuBar}

      <WindowFrame
        appId="add-url"
        title={isEditing ? "Edit URL Shortcut" : "Add URL"}
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
        menuBar={isXpTheme ? menuBar : undefined}
      >
        <div className="flex flex-col h-full w-full p-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit URL Shortcut" : "Create URL Shortcut"}
              </h1>
              <p className="text-sm text-gray-600">
                Add a new website shortcut to your desktop
              </p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {/* Shortcut Name */}
            <div className="space-y-2">
              <label htmlFor="shortcut-name" className="text-sm font-medium text-gray-700">
                Shortcut Name
              </label>
              <input
                id="shortcut-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Google, Facebook, GitHub"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isCreating}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label htmlFor="shortcut-url" className="text-sm font-medium text-gray-700">
                URL
              </label>
              <div className="relative">
                <input
                  id="shortcut-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isCreating}
                />
                <ExternalLink className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.url && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {errors.url}
                </div>
              )}
            </div>

            {/* Icon Selection */}
            <UrlIconManager
              selectedIcon={selectedIcon}
              onIconChange={setSelectedIcon}
              disabled={isCreating}
            />

            {/* Preview */}
            {name && url && selectedIcon && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedIcon}
                    alt="Shortcut icon"
                    className="w-8 h-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/icons/default/info.png";
                    }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[300px]">{url}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateShortcut}
              disabled={!canSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {isEditing ? "Update Shortcut" : "Create Shortcut"}
                </>
              )}
            </button>
          </div>
        </div>
      </WindowFrame>
    </>
  );
});
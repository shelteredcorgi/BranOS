import React, { useState, useRef, useCallback } from "react";
import { Upload, RefreshCw, Image } from "lucide-react";
import { useThemeStore } from "@/stores/useThemeStore";

interface UrlIconManagerProps {
  selectedIcon: string;
  onIconChange: (iconPath: string) => void;
  disabled?: boolean;
}

// Theme-based icon pools for random selection - Modern tech-focused collection
const THEME_ICON_POOLS = {
  win98: [
    "/icons/win98/internet.png",      // Web browser
    "/icons/win98/sites.png",         // Website collection
    "/icons/win98/applications.png",  // Apps/Software
    "/icons/win98/documents.png",     // Documentation/Docs
    "/icons/win98/file.png",          // General file
    "/icons/win98/games.png",         // Gaming/Entertainment
    "/icons/win98/info.png",          // Information/Help
    "/icons/win98/terminal.png",      // Developer tools
    "/icons/win98/sound.png",         // Audio/Music streaming
    "/icons/win98/movies.png",        // Video/Media
    "/icons/win98/images.png",        // Image galleries/Photos
    "/icons/win98/paint.png",         // Design/Creative tools
    "/icons/win98/ie.png",            // Web browser alternative
    "/icons/win98/cdrom.png",         // Software/Downloads
    "/icons/win98/disk.png",          // Storage/Cloud services
    "/icons/win98/apple.png",         // Apple services
    "/icons/win98/pc.png",            // System/Tech utilities
    "/icons/win98/synth.png",         // Music production
    "/icons/win98/video-tape.png",    // Retro media
    "/icons/win98/photo-booth.png",   // Social/Camera apps
  ],
  xp: [
    "/icons/xp/ie.png",               // Web browser (no internet.png in XP)
    "/icons/xp/sites.png",            // Website collection
    "/icons/xp/applications.png",     // Apps/Software
    "/icons/xp/documents.png",        // Documentation/Docs
    "/icons/xp/file.png",             // General file
    "/icons/xp/games.png",            // Gaming/Entertainment
    "/icons/xp/info.png",             // Information/Help
    "/icons/xp/terminal.png",         // Developer tools
    "/icons/xp/sound.png",            // Audio/Music streaming
    "/icons/xp/movies.png",           // Video/Media
    "/icons/xp/images.png",           // Image galleries/Photos
    "/icons/xp/paint.png",            // Design/Creative tools
    "/icons/xp/ie-site.png",          // Web shortcut
    "/icons/xp/cdrom.png",            // Software/Downloads
    "/icons/xp/disk.png",             // Storage/Cloud services
    "/icons/xp/apple.png",            // Apple services
    "/icons/xp/pc.png",               // System/Tech utilities
    "/icons/xp/synth.png",            // Music production
    "/icons/xp/video-tape.png",       // Retro media
    "/icons/xp/photo-booth.png",      // Social/Camera apps
    "/icons/xp/ipod.png",             // Media device
  ],
  macosx: [
    "/icons/macosx/ie.png",           // Web browser (no internet.png in macOS)
    "/icons/macosx/sites.png",        // Website collection
    "/icons/macosx/applications.png", // Apps/Software
    "/icons/macosx/documents.png",    // Documentation/Docs
    "/icons/macosx/file.png",         // General file
    "/icons/macosx/terminal.png",     // Developer tools (no games.png)
    "/icons/macosx/sound.png",        // Audio/Music streaming
    "/icons/macosx/movies.png",       // Video/Media
    "/icons/macosx/images.png",       // Image galleries/Photos
    "/icons/macosx/paint.png",        // Design/Creative tools
    "/icons/macosx/ie-site.png",      // Web shortcut
    "/icons/macosx/cdrom.png",        // Software/Downloads
    "/icons/macosx/disk.png",         // Storage/Cloud services
    "/icons/macosx/apple.png",        // Apple services
    "/icons/macosx/pc.png",           // System/Tech utilities
    "/icons/macosx/synth.png",        // Music production
    "/icons/macosx/video-tape.png",   // Retro media
    "/icons/macosx/photo-booth.png",  // Social/Camera apps
    "/icons/macosx/ipod.png",         // Media device
    "/icons/macosx/mac.png",          // Mac-specific
    "/icons/macosx/mac-classic.png",  // Retro Mac
  ],
  system7: [
    "/icons/win98/internet.png",      // Fallback to win98 for system7
    "/icons/win98/sites.png",
    "/icons/win98/applications.png",
    "/icons/win98/documents.png",
    "/icons/win98/terminal.png",
    "/icons/win98/sound.png",
    "/icons/win98/movies.png",
    "/icons/win98/images.png",
    "/icons/win98/paint.png",
    "/icons/win98/games.png",
    "/icons/win98/apple.png",
    "/icons/win98/cdrom.png",
    "/icons/win98/disk.png",
    "/icons/win98/pc.png",
  ],
  default: [
    "/icons/default/internet.png",
    "/icons/default/sites.png",
    "/icons/default/folder.png",
    "/icons/default/applications.png",
    "/icons/default/documents.png",
    "/icons/default/info.png",
    "/icons/default/terminal.png",
    "/icons/default/sound.png",
    "/icons/default/movies.png",
    "/icons/default/images.png",
    "/icons/default/paint.png",
    "/icons/default/games.png",
    "/icons/default/apple.png",
    "/icons/default/cdrom.png",
    "/icons/default/disk.png",
    "/icons/default/pc.png",
    "/icons/default/ipod.png",
    "/icons/default/music.png",
    "/icons/default/tv.png",
    "/icons/default/piano.png",
    "/icons/default/gameboy.png",
    "/icons/default/cola.png",
    "/icons/default/floppy.png",
  ],
};

export function UrlIconManager({ selectedIcon, onIconChange, disabled }: UrlIconManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentTheme = useThemeStore((state) => state.current);

  // Generate random vintage icon based on current theme
  const generateRandomIcon = useCallback(() => {
    const iconPool = THEME_ICON_POOLS[currentTheme as keyof typeof THEME_ICON_POOLS] || THEME_ICON_POOLS.default;
    const randomIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
    onIconChange(randomIcon);
    console.log(`🎲 Generated random ${currentTheme} icon: ${randomIcon}`);
  }, [currentTheme, onIconChange]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file must be smaller than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create canvas to resize image to standard icon size
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const img = new (window as any).Image();
      img.onload = () => {
        // Set standard icon size (48x48 for compatibility)
        const iconSize = 48;
        canvas.width = iconSize;
        canvas.height = iconSize;

        // Fill with transparent background
        ctx.clearRect(0, 0, iconSize, iconSize);

        // Calculate dimensions to maintain aspect ratio
        const scale = Math.min(iconSize / img.width, iconSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (iconSize - scaledWidth) / 2;
        const offsetY = (iconSize - scaledHeight) / 2;

        // Draw image centered and scaled
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        // Convert to base64
        const base64Icon = canvas.toDataURL('image/png');
        onIconChange(base64Icon);
        console.log('📷 Uploaded custom icon successfully');
        setIsUploading(false);
      };

      img.onerror = () => {
        alert('Failed to load image. Please try a different file.');
        setIsUploading(false);
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Icon upload error:', error);
      alert('Failed to process image. Please try again.');
      setIsUploading(false);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onIconChange]);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">Icon</div>

      {/* Icon Preview */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border-2 border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
          {selectedIcon ? (
            <img
              src={selectedIcon}
              alt="Selected icon"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.warn('Icon failed to load:', selectedIcon);
                // Fallback to a default icon
                (e.target as HTMLImageElement).src = "/icons/default/info.png";
              }}
            />
          ) : (
            <Image className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500">
            {selectedIcon.startsWith('data:') ? 'Custom uploaded icon' : `Theme: ${currentTheme}`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateRandomIcon}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Random Vintage
            </button>
            <button
              onClick={triggerFileUpload}
              disabled={disabled || isUploading}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="text-xs text-gray-400">
        Upload your own icon (PNG, JPG, GIF) or use a random vintage icon matching the current theme.
      </div>
    </div>
  );
}
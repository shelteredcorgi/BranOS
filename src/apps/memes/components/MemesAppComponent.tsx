import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { MemesMenuBar } from "./MemesMenuBar";
import { useSound } from "@/hooks/useSound";
import { useLocalMemesStore } from "@/stores/useLocalMemesStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useImageTagsStore } from "@/stores/useImageTagsStore";
import { ImageTagManager } from "./ImageTagManager";
import {
  SkipBack,
  SkipForward,
  X,
  ImageIcon,
  RefreshCw,
  Dices,
  FolderOpen,
  Grid3x3,
  Play,
  List,
  Search,
  ChevronDown,
  Folder,
  Hash,
} from "lucide-react";

interface MemesAppComponentProps extends AppProps {}

export const MemesAppComponent = React.memo(function MemesAppComponent({
  onClose,
  isWindowOpen,
  isForeground = true,
  skipInitialSound,
  instanceId,
}: MemesAppComponentProps) {
  // Theme context
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
  const isLegacyTheme = isXpTheme || currentTheme === "system7";

  // Throttle debug logging to prevent console spam
  const debugLogRef = useRef<Record<string, number>>({});
  const throttledLog = useCallback((key: string, message: string, interval = 1000) => {
    const now = Date.now();
    if (!debugLogRef.current[key] || now - debugLogRef.current[key] > interval) {
      console.log(message);
      debugLogRef.current[key] = now;
    }
  }, []);

  throttledLog('constructor', `🔵 MemesAppComponent CONSTRUCTOR - instanceId: ${instanceId}, isWindowOpen: ${isWindowOpen}`);
  console.log('🟢 MemesAppComponent loaded with debug logging enabled - ' + Date.now());

  const playSound = useSound("/sounds/Click.mp3");

  // Local state for debugging
  const [debugInfo, setDebugInfo] = useState({
    mountTime: Date.now(),
    renderCount: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "lightbox">("grid");
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Tag dropdown state
  const [showTagDropdown, setShowTagDropdown] = useState(false);


  const IMAGES_PER_PAGE = 20;

  // Component lifecycle logging
  useEffect(() => {
    console.log(`🟢 MemesAppComponent MOUNTED - instanceId: ${instanceId}`);
    setDebugInfo(prev => ({ ...prev, renderCount: prev.renderCount + 1 }));

    return () => {
      console.log(`🔴 MemesAppComponent UNMOUNTING - instanceId: ${instanceId}`);
    };
  }, [instanceId]);

  // Local file system store
  const {
    isLocalMode,
    directoryHandle,
    localImages,
    localFolders,
    currentFolder,
    isScanning,
    scanProgress,
    checkFileSystemSupport,
    selectDirectory,
    setCurrentFolder,
    getFilteredLocalImages,
    markImageVisible,
  } = useLocalMemesStore();

  // Image tagging store
  const {
    getAllTags,
    getImageTags,
    selectedTagFilter,
    isImageMatchingFilter,
    setTagFilter,
    clearTagFilter,
  } = useImageTagsStore();

  // Memoize expensive calculations - stable dependencies only
  const filteredImages = useMemo(() => {
    console.log('🔄 filteredImages useMemo executing:', { isLocalMode, localImagesLength: localImages.length, searchQuery, selectedTagFilter, currentFolder });
    if (!isLocalMode) return [];

    let images = getFilteredLocalImages();

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      images = images.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.path.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTagFilter.length > 0) {
      console.log('🔍 Applying tag filter with tags:', selectedTagFilter);
      images = images.filter(img => {
        const imageTags = getImageTags(img.path).map(tag => tag.id);
        const matches = selectedTagFilter.every(filterTagId => imageTags.includes(filterTagId));
        console.log(`🏷️ Image ${img.name}: tags=[${imageTags.join(',')}], matches=${matches}`);
        return matches;
      });
      console.log('🔍 Filtered images count:', images.length);
    }

    return images;
  }, [isLocalMode, localImages.length, searchQuery, selectedTagFilter, currentFolder, getFilteredLocalImages, getImageTags]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
    const startIndex = currentPage * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const currentPageImages = filteredImages.slice(startIndex, endIndex);

    return { totalPages, startIndex, endIndex, currentPageImages };
  }, [filteredImages.length, currentPage, IMAGES_PER_PAGE]);

  const { totalPages, startIndex, endIndex, currentPageImages } = paginationData;

  // Random/shuffle function
  const goToRandomImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredImages.length);
    const randomPage = Math.floor(randomIndex / IMAGES_PER_PAGE);
    setCurrentPage(randomPage);
    setLightboxIndex(randomIndex);
    setViewMode("lightbox");
    playSound.play();
  }, [filteredImages.length, playSound]);

  // Reveal in Finder functionality
  const revealInFinder = useCallback(async () => {
    if (lightboxIndex >= filteredImages.length) return;

    const image = filteredImages[lightboxIndex];
    if (!image?.fileHandle) return;

    try {
      // Try to copy the file path to clipboard and show a helpful message
      const pathInfo = `File: ${image.name}\nPath: ${image.path}\nSize: ${image.size ? Math.round(image.size / 1024) + ' KB' : 'Unknown'}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(image.path);
        alert(`File path copied to clipboard!\n\n${pathInfo}\n\nNote: Due to browser security restrictions, files cannot be directly revealed in Finder from web apps.`);
      } else {
        alert(`File Information:\n\n${pathInfo}\n\nNote: Due to browser security restrictions, files cannot be directly revealed in Finder from web apps.`);
      }

      playSound.play();
    } catch (error) {
      console.warn('Could not copy file path:', error);
      alert(`File: ${image.name}\nPath: ${image.path}\n\n(Could not copy to clipboard)`);
    }
  }, [lightboxIndex, filteredImages, playSound]);

  // Memoize lightbox navigation functions
  const nextImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    const nextIndex = (lightboxIndex + 1) % filteredImages.length;
    setLightboxIndex(nextIndex);
    const newPage = Math.floor(nextIndex / IMAGES_PER_PAGE);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [lightboxIndex, filteredImages.length, currentPage]);

  const previousImage = useCallback(() => {
    if (filteredImages.length === 0) return;
    const prevIndex = lightboxIndex === 0 ? filteredImages.length - 1 : lightboxIndex - 1;
    setLightboxIndex(prevIndex);
    const newPage = Math.floor(prevIndex / IMAGES_PER_PAGE);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [lightboxIndex, filteredImages.length, currentPage]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "lightbox") {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            previousImage();
            break;
          case "ArrowRight":
            e.preventDefault();
            nextImage();
            break;
          case "Escape":
            e.preventDefault();
            setViewMode("grid");
            break;
          case " ": // Spacebar
            e.preventDefault();
            goToRandomImage();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, lightboxIndex, goToRandomImage, nextImage, previousImage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showTagDropdown && !target.closest('.tag-dropdown')) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTagDropdown]);

  // Throttled render logging to prevent spam
  throttledLog('render', `🎨 MemesAppComponent RENDER - instanceId: ${instanceId}, isWindowOpen: ${isWindowOpen}, viewMode: ${viewMode}, filteredImages: ${filteredImages.length}`, 500);


  // Early return logging
  if (!isWindowOpen) {
    throttledLog('early-return', `❌ MemesAppComponent EARLY RETURN - isWindowOpen is false (instanceId: ${instanceId})`);
    return null;
  }

  // Lightbox render
  const renderLightbox = () => {
    if (viewMode !== "lightbox" || filteredImages.length === 0) return null;

    const image = filteredImages[lightboxIndex];
    if (!image) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <button
              onClick={goToRandomImage}
              className="px-3 py-1 bg-black bg-opacity-50 text-white border border-gray-600 rounded hover:bg-opacity-70 text-sm font-medium flex items-center gap-1"
            >
              <Dices className="w-3 h-3" />
              Random
            </button>

            {/* Tag manager in top-left */}
            <div className="max-w-[300px]">
              <ImageTagManager imagePath={image.path} className="text-xs" />
            </div>
          </div>

          <div className="text-white text-sm">
            {lightboxIndex + 1} of {filteredImages.length}
          </div>

          <button
            onClick={() => setViewMode("grid")}
            className="px-3 py-1 bg-black bg-opacity-50 text-white border border-gray-600 rounded hover:bg-opacity-70 text-sm font-medium"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main image */}
        <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
          <img
            src={image.src}
            alt={image.name}
            className="max-w-full max-h-full object-contain"
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={previousImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white border border-gray-600 rounded hover:bg-opacity-70"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white border border-gray-600 rounded hover:bg-opacity-70"
        >
          <SkipForward className="w-6 h-6" />
        </button>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="text-white text-sm bg-black bg-opacity-50 rounded px-3 py-1 inline-block">
            {image.name}
          </div>


          <div className="text-gray-300 text-xs mt-1 space-x-2">
            <span>Press ESC to close</span>
            <span>•</span>
            <span>Use ← → arrow keys or click Random</span>
            <span>•</span>
            <button
              onClick={revealInFinder}
              className="text-blue-400 hover:text-blue-300 underline cursor-pointer bg-transparent border-none text-xs"
            >
              Reveal in Finder
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render toolbar with theme-aware styling
  const renderToolbar = () => {
    if (isLegacyTheme) {
      return (
        <div className="flex bg-[#c0c0c0] border-b border-black w-full flex-shrink-0">
          <div className="flex px-1 py-1 gap-x-1">
            {/* File operations group */}
            <div className="flex">
              <button
                onClick={() => {
                  console.log("🔵 Select Folder clicked!");
                  console.log("🔧 Function availability check:");
                  console.log("- selectDirectory:", typeof selectDirectory);
                  console.log("- playSound:", typeof playSound);
                  console.log("- playSound.play:", typeof playSound.play);
                  console.log("🔧 Calling playSound.play()...");
                  playSound.play();
                  console.log("🔧 Calling selectDirectory()...");
                  selectDirectory();
                }}
                className="w-[26px] h-[22px] flex items-center justify-center"
                title="Select Folder"
              >
                <img
                  src="/icons/default/folder.png"
                  alt="Select Folder"
                  className="w-[18px] h-[18px]"
                />
              </button>
              <button
                onClick={() => {
                  playSound.play();
                  goToRandomImage();
                }}
                disabled={filteredImages.length === 0}
                className="w-[26px] h-[22px] flex items-center justify-center disabled:opacity-50"
                title="Random Meme"
              >
                <img
                  src="/icons/default/dice.png"
                  alt="Random"
                  className="w-[18px] h-[18px]"
                />
              </button>
              <button
                onClick={() => {
                  playSound.play();
                  setViewMode("grid");
                }}
                className={`w-[26px] h-[22px] flex items-center justify-center ${viewMode === "grid" ? "bg-[#a0a0a0]" : ""}`}
                title="Grid View"
              >
                <img
                  src="/icons/default/grid.png"
                  alt="Grid View"
                  className="w-[18px] h-[18px]"
                />
              </button>
              <button
                onClick={() => {
                  playSound.play();
                  setViewMode("list");
                }}
                className={`w-[26px] h-[22px] flex items-center justify-center ${viewMode === "list" ? "bg-[#a0a0a0]" : ""}`}
                title="List View"
              >
                <img
                  src="/icons/default/list.png"
                  alt="List View"
                  className="w-[18px] h-[18px]"
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Modern theme toolbar
    return (
      <div className="flex bg-gray-100 border-b border-gray-300 w-full flex-shrink-0 p-2 gap-2 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log("🔵 Modern Select Folder clicked!");
              console.log("🔧 Function availability check:");
              console.log("- selectDirectory:", typeof selectDirectory);
              console.log("🔧 Calling selectDirectory()...");
              selectDirectory();
            }}
            className="px-3 py-1 bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-sm font-medium flex items-center gap-1"
          >
            <FolderOpen className="w-4 h-4" />
            Select Folder
          </button>
          <button
            onClick={goToRandomImage}
            disabled={filteredImages.length === 0}
            className="px-3 py-1 bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
          >
            <Dices className="w-4 h-4" />
            Random
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => {
              console.log("🔵 Grid View clicked!");
              setViewMode("grid");
            }}
            className={`px-3 py-1 border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-sm font-medium flex items-center gap-1 ${
              viewMode === "grid" ? "bg-blue-100 border-blue-400" : "bg-white"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-sm font-medium flex items-center gap-1 ${
              viewMode === "list" ? "bg-blue-100 border-blue-400" : "bg-white"
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>

          {/* Tag filter dropdown */}
          <div className="relative tag-dropdown">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className={`px-3 py-1 border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-sm font-medium flex items-center gap-1 ${
                selectedTagFilter.length > 0 ? "bg-blue-100 border-blue-400" : "bg-white"
              }`}
            >
              <Hash className="w-4 h-4" />
              {selectedTagFilter.length > 0 ? `${selectedTagFilter.length} tag${selectedTagFilter.length === 1 ? '' : 's'}` : 'Filter by Tags'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTagDropdown && (
              <div className="absolute top-[32px] left-0 bg-white border border-gray-400 rounded shadow-lg z-50 min-w-[250px] max-h-[300px] overflow-y-auto">
                {/* All photos option */}
                <div
                  onClick={() => {
                    clearTagFilter();
                    setShowTagDropdown(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-200 ${
                    selectedTagFilter.length === 0 ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">All photos</span>
                    {selectedTagFilter.length === 0 && <span className="ml-auto text-blue-600">✓</span>}
                  </div>
                </div>

                {/* Available tags */}
                {getAllTags().length > 0 ? (
                  getAllTags().map((tag) => {
                    const isSelected = selectedTagFilter.includes(tag.id);
                    return (
                      <div
                        key={tag.id}
                        onClick={() => {
                          const newFilter = isSelected
                            ? selectedTagFilter.filter(id => id !== tag.id)
                            : [...selectedTagFilter, tag.id];
                          console.log('🏷️ Tag clicked:', tag.name, 'newFilter:', newFilter);
                          setTagFilter(newFilter);
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm border-b border-gray-200 last:border-b-0 ${
                          isSelected ? "bg-blue-50 text-blue-700" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: tag.color || "#3B82F6" }}
                          />
                          <span className="font-medium">{tag.name}</span>
                          {isSelected && <span className="ml-auto text-blue-600">✓</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 italic">
                    No tags available. Create tags by tagging images in slideshow mode.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0); // Reset to first page when searching
              }}
              className="pl-8 pr-3 py-1 text-sm border border-gray-400 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(0);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Menu bar component
  const menuBar = (
    <MemesMenuBar
      onUpload={selectDirectory}
      onNewFolder={() => {}}
      onExportSelected={() => {}}
      onClearSelection={() => {}}
      onToggleShuffle={() => {}}
      onGridView={() => setViewMode("grid")}
      onListView={() => setViewMode("list")}
      onSlideshow={() => {}}
      onRandomMeme={goToRandomImage}
      onHelp={() => {}}
      onAbout={() => {}}
      hasSelection={false}
      isShuffleMode={false}
    />
  );

  return (
    <>
      {/* Menu bar for modern themes */}
      {!isXpTheme && isForeground && menuBar}

      <WindowFrame
        appId="memes"
        title="Memes"
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
        menuBar={isXpTheme ? menuBar : undefined}
      >
        <div className="flex flex-col h-full w-full">

          <div className="flex-1 flex flex-col relative min-h-0">
            {/* Toolbar */}
            {renderToolbar()}

            {/* Main content area */}
            <div className="flex-1 overflow-auto bg-white">
              {/* Status info */}
              {(isScanning || totalPages > 1) && (
                <div className="p-2 bg-gray-50 border-b border-gray-200 text-sm">
                  {isScanning && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning... {scanProgress}%</span>
                    </div>
                  )}

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="px-2 py-1 bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-xs disabled:opacity-50"
                      >
                        <SkipBack className="w-3 h-3" />
                      </button>

                      <span className="text-xs text-gray-700">
                        Page {currentPage + 1} of {totalPages} • {filteredImages.length} images
                        {searchQuery && ` matching "${searchQuery}"`}
                      </span>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="px-2 py-1 bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-50 text-xs disabled:opacity-50"
                      >
                        <SkipForward className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {filteredImages.length === 0 && !isScanning && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <ImageIcon className="w-16 h-16 mb-4 text-gray-400" />
                  {searchQuery ? (
                    <>
                      <p className="text-lg mb-2 font-medium">
                        No images found matching "{searchQuery}"
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        Try a different search term or clear the search
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(0);
                        }}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear Search
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2 font-medium">
                        No memes found
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        Click "Select Folder" to choose your memes folder
                      </p>
                      <button
                        onClick={selectDirectory}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Select Folder
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Scanning state */}
              {isScanning && (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <RefreshCw className="w-8 h-8 mb-4 animate-spin text-gray-500" />
                  <p className="font-medium">Scanning directory...</p>
                  <p className="text-sm text-gray-600">
                    {scanProgress}% complete
                  </p>
                </div>
              )}

              {/* Image grid */}
              {currentPageImages.length > 0 && viewMode === "grid" && (
                <div className="p-4">
                  <div
                    key={`grid-${currentPage}-${viewMode}`}
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      width: '100%',
                      justifyItems: 'center'
                    }}
                  >
                    {currentPageImages.map((image, index) => {
                      const globalIndex = startIndex + index;
                      return (
                        <div
                          key={`${image.id}-${globalIndex}`}
                          className="bg-gray-50 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 hover:shadow-md transition-all p-3 flex flex-col w-full max-w-[250px]"
                          onClick={() => {
                            setLightboxIndex(globalIndex);
                            setViewMode("lightbox");
                            playSound.play();
                          }}
                        >
                          <div
                            className="bg-white border border-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden"
                            style={{
                              aspectRatio: '1',
                              height: '180px',
                              width: '100%'
                            }}
                          >
                            <img
                              src={(image as any).thumbnailSrc || image.src}
                              alt={image.name}
                              className="max-w-full max-h-full object-contain"
                              onLoad={() => markImageVisible(image.id)}
                              loading="lazy"
                            />
                          </div>
                          <p
                            className="text-xs text-gray-700 truncate text-center leading-tight"
                            style={{
                              fontSize: '11px'
                            }}
                            title={image.name}
                          >
                            {image.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Image list */}
              {currentPageImages.length > 0 && viewMode === "list" && (
                <div className="p-4">
                  <div className="space-y-2">
                    {currentPageImages.map((image, index) => {
                      const globalIndex = startIndex + index;
                      return (
                        <div
                          key={`${image.id}-${globalIndex}-list`}
                          className="flex items-center gap-4 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 hover:shadow-sm transition-all p-3 cursor-pointer"
                          onClick={() => {
                            setLightboxIndex(globalIndex);
                            setViewMode("lightbox");
                            playSound.play();
                          }}
                        >
                          {/* Thumbnail */}
                          <div
                            className="bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{
                              width: '60px',
                              height: '60px'
                            }}
                          >
                            <img
                              src={(image as any).thumbnailSrc || image.src}
                              alt={image.name}
                              className="max-w-full max-h-full object-cover"
                              onLoad={() => markImageVisible(image.id)}
                              loading="lazy"
                            />
                          </div>

                          {/* File info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {image.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {image.path}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {image.size ? `${Math.round(image.size / 1024)} KB` : 'Unknown size'}
                              {image.dimensions && ` • ${image.dimensions.width}×${image.dimensions.height}`}
                            </div>

                            {/* Tags display */}
                            {(() => {
                              const imageTags = getImageTags(image.path);
                              return imageTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {imageTags.map((tag) => (
                                    <span
                                      key={tag.id}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                                      style={{
                                        backgroundColor: tag.color || "#3B82F6"
                                      }}
                                    >
                                      {tag.name}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Index */}
                          <div className="text-xs text-gray-400 flex-shrink-0">
                            #{globalIndex + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </WindowFrame>

      {/* Lightbox overlay */}
      {renderLightbox()}
    </>
  );
});
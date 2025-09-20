import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocalMemesImage {
  id: string;
  name: string;
  path: string; // Full path relative to root folder
  src: string; // Object URL for full image
  thumbnailSrc?: string; // Object URL for thumbnail
  tags: string[];
  folder: string; // Folder path
  createdAt: number;
  updatedAt: number;
  size?: number;
  dimensions?: { width: number; height: number };
  fileHandle: FileSystemFileHandle; // Reference to actual file
  loadError?: boolean; // Track if this image failed to load
  retryCount?: number; // Track retry attempts
  thumbnailLoaded?: boolean; // Track if thumbnail has been created
  isVisible?: boolean; // Track if image is currently visible
}

export interface LocalMemesFolder {
  id: string;
  name: string;
  path: string;
  images: string[]; // Array of image IDs
  parentId?: string;
  createdAt: number;
}

interface LocalMemesState {
  // Core state
  isLocalMode: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  
  // Data
  localImages: LocalMemesImage[];
  localFolders: LocalMemesFolder[];
  localTags: string[];
  
  // UI State (same as regular memes store)
  viewMode: "grid" | "lightbox" | "slideshow";
  currentFolder: string | null;
  currentImageIndex: number;
  selectedImages: string[];
  searchQuery: string;
  filterTags: string[];
  isShuffleMode: boolean;
  slideshowInterval: number;
  isPlaying: boolean;
  
  // Shuffle state
  shuffleHistory: number[]; // Indices of images in shuffle order
  shuffleHistoryIndex: number; // Current position in shuffle history
  
  // Status
  isScanning: boolean;
  scanProgress: number;
  lastScanTime: number | null;
  lastError: string | null;
  cleanupInterval: NodeJS.Timeout | null;
  
  // Actions
  setLocalMode: (isLocal: boolean) => void;
  selectDirectory: () => Promise<boolean>;
  scanDirectory: () => Promise<void>;
  refreshDirectory: () => Promise<void>;
  
  // Image management
  addLocalImage: (fileHandle: FileSystemFileHandle, folderPath: string) => Promise<void>;
  removeLocalImage: (id: string) => void;
  updateLocalImageTags: (id: string, tags: string[]) => void;
  retryImageLoad: (id: string) => Promise<void>;
  renameLocalImage: (id: string, newName: string) => Promise<boolean>;
  loadImageLazily: (id: string) => Promise<void>;
  markImageVisible: (id: string) => void;
  cleanupInvisibleImages: () => void;
  
  // Shuffle management
  generateShuffleSequence: () => void;
  resetShuffleHistory: () => void;
  
  // Tag management
  addLocalTag: (tag: string) => void;
  removeLocalTag: (tag: string) => void;
  
  // Folder management
  createLocalFolder: (path: string, name: string, parentId?: string) => string;
  
  // UI actions (same as regular store)
  setViewMode: (mode: "grid" | "lightbox" | "slideshow") => void;
  setCurrentFolder: (folderId: string | null) => void;
  setCurrentImageIndex: (index: number) => void;
  toggleImageSelection: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  toggleFilterTag: (tag: string) => void;
  clearFilters: () => void;
  toggleShuffle: () => void;
  setSlideshowInterval: (interval: number) => void;
  
  // Slideshow actions
  startSlideshow: () => void;
  stopSlideshow: () => void;
  nextImage: () => void;
  previousImage: () => void;
  
  // Computed getters
  getFilteredLocalImages: () => LocalMemesImage[];
  getCurrentLocalImage: () => LocalMemesImage | null;
  
  // Utility
  checkFileSystemSupport: () => boolean;
}

// Helper functions
const createLocalImageId = () => `local_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const createLocalFolderId = () => `local_folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};


const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      console.warn(`Failed to get dimensions for: ${src}`);
      resolve({ width: 0, height: 0 });
    };
    img.src = src;
  });
};

// Helper to create thumbnail from file
const createThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`Not an image file: ${file.type}`));
      return;
    }

    // Check file size constraints
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      reject(new Error(`File too large for thumbnail: ${(file.size / 1024 / 1024).toFixed(1)}MB`));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
      willReadFrequently: false,
      alpha: false // Improve performance for opaque images
    });

    if (!ctx) {
      reject(new Error('Canvas context unavailable - hardware acceleration may be disabled'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent CORS issues

    // Shorter timeout for better user feedback
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(img.src);
      reject(new Error(`Thumbnail creation timeout (3s) for: ${file.name}`));
    }, 3000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        // Validate image dimensions
        if (img.width === 0 || img.height === 0) {
          throw new Error(`Invalid image dimensions: ${img.width}x${img.height}`);
        }

        // Set thumbnail size with better aspect ratio handling
        const thumbSize = 200;
        canvas.width = thumbSize;
        canvas.height = thumbSize;

        // Calculate scaling to fill the square thumbnail (cropping excess)
        const sourceAspect = img.width / img.height;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let sourceX = 0;
        let sourceY = 0;

        if (sourceAspect > 1) {
          // Landscape: crop width
          sourceWidth = img.height;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (sourceAspect < 1) {
          // Portrait: crop height
          sourceHeight = img.width;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // Fill with light background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, thumbSize, thumbSize);

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw cropped and scaled image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
          0, 0, thumbSize, thumbSize                     // Destination rectangle
        );

        // Convert to blob with format-specific optimization
        const outputFormat = file.type === 'image/png' || file.type === 'image/gif'
          ? 'image/png'   // Preserve transparency for PNG/GIF
          : 'image/jpeg'; // Use JPEG for others (better compression)

        const quality = outputFormat === 'image/jpeg' ? 0.85 : undefined;

        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            const thumbnailUrl = URL.createObjectURL(blob);
            resolve(thumbnailUrl);
          } else {
            reject(new Error('Canvas.toBlob() produced empty result'));
          }
        }, outputFormat, quality);

        // Clean up source immediately
        URL.revokeObjectURL(img.src);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(new Error(`Canvas drawing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    img.onerror = (event) => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(img.src);
      const errorMsg = event instanceof ErrorEvent ? event.message : 'Image load failed';
      reject(new Error(`Image load error for ${file.name}: ${errorMsg}`));
    };

    // Create object URL and start loading
    try {
      img.src = URL.createObjectURL(file);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to create object URL: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

// Create folder structure from scanned files
const createFolderStructure = (filePaths: string[]): { folders: LocalMemesFolder[], folderMap: Map<string, string> } => {
  const folders: LocalMemesFolder[] = [];
  const folderMap = new Map<string, string>(); // path -> folderId
  const folderSet = new Set<string>();
  
  // Add root folder
  const rootFolder: LocalMemesFolder = {
    id: "local_all",
    name: "All Images",
    path: "",
    images: [],
    createdAt: Date.now(),
  };
  folders.push(rootFolder);
  folderMap.set("", "local_all");
  
  // Extract all unique folder paths
  filePaths.forEach(filePath => {
    const pathParts = filePath.split('/');
    pathParts.pop(); // Remove filename
    
    if (pathParts.length > 0) {
      let currentPath = '';
      for (let i = 0; i < pathParts.length; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
        folderSet.add(currentPath);
      }
    }
  });
  
  // Create folder objects for each unique path
  const sortedPaths = Array.from(folderSet).sort();
  sortedPaths.forEach(path => {
    const pathParts = path.split('/');
    const name = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join('/');
    const parentId = folderMap.get(parentPath);
    
    const folder: LocalMemesFolder = {
      id: createLocalFolderId(),
      name,
      path,
      images: [],
      parentId,
      createdAt: Date.now(),
    };
    
    folders.push(folder);
    folderMap.set(path, folder.id);
  });
  
  return { folders, folderMap };
};

export const useLocalMemesStore = create<LocalMemesState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLocalMode: false,
      directoryHandle: null,
      localImages: [],
      localFolders: [
        {
          id: "local_all",
          name: "All Images",
          path: "",
          images: [],
          createdAt: Date.now(),
        },
      ],
      localTags: [],
      viewMode: "grid",
      currentFolder: "local_all",
      currentImageIndex: 0,
      selectedImages: [],
      searchQuery: "",
      filterTags: [],
      isShuffleMode: false,
      slideshowInterval: 3000,
      isPlaying: false,
      shuffleHistory: [],
      shuffleHistoryIndex: 0,
      isScanning: false,
      scanProgress: 0,
      lastScanTime: null,
      lastError: null,

      // Cleanup timer for memory management
      cleanupInterval: null as NodeJS.Timeout | null,

      // Core actions
      setLocalMode: (isLocal) => {
        const state = get();

        if (isLocal && !state.cleanupInterval) {
          // Start memory cleanup interval when entering local mode
          const interval = setInterval(() => {
            get().cleanupInvisibleImages();
          }, 30000); // Cleanup every 30 seconds

          set({
            isLocalMode: isLocal,
            currentFolder: "local_all",
            currentImageIndex: 0,
            cleanupInterval: interval
          });
        } else if (!isLocal && state.cleanupInterval) {
          // Clear cleanup interval when leaving local mode
          clearInterval(state.cleanupInterval);
          set({
            isLocalMode: isLocal,
            cleanupInterval: null
          });
        } else {
          set({ isLocalMode: isLocal });
          if (isLocal) {
            set({ currentFolder: "local_all", currentImageIndex: 0 });
          }
        }
      },

      checkFileSystemSupport: () => {
        return 'showDirectoryPicker' in window;
      },

      selectDirectory: async () => {
        try {
          if (!get().checkFileSystemSupport()) {
            throw new Error('File System Access API not supported in this browser');
          }

          const directoryHandle = await window.showDirectoryPicker({
            mode: 'read'
          });

          set({ directoryHandle });
          
          // Start scanning the directory
          await get().scanDirectory();
          
          return true;
        } catch (error: unknown) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Failed to select directory:', error);
          }
          return false;
        }
      },

      scanDirectory: async () => {
        const { directoryHandle } = get();
        if (!directoryHandle) {
          set({ lastError: 'No directory handle available' });
          return;
        }

        set({ isScanning: true, scanProgress: 0, lastError: null });
        console.log('🔍 Starting directory scan...');

        try {
          const allFiles: { path: string; handle: FileSystemFileHandle }[] = [];
          
          // Recursive function to scan directory
          async function scanDir(dirHandle: FileSystemDirectoryHandle, currentPath = '') {
            try {
              for await (const [name, handle] of dirHandle.entries()) {
                if (handle.kind === 'file') {
                  const fileHandle = handle as FileSystemFileHandle;
                  const fileName = fileHandle.name;
                  if (isImageFile(fileName)) {
                    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
                    allFiles.push({ path: fullPath, handle: fileHandle });
                  }
                } else if (handle.kind === 'directory') {
                  const dirHandle = handle as FileSystemDirectoryHandle;
                  const subPath = currentPath ? `${currentPath}/${name}` : name;
                  await scanDir(dirHandle, subPath);
                }
              }
            } catch (error) {
              console.warn(`Failed to scan directory ${currentPath}:`, error);
              set({ lastError: `Failed to scan directory: ${currentPath}` });
            }
          }

          await scanDir(directoryHandle);
          console.log(`📁 Found ${allFiles.length} image files`);
          
          if (allFiles.length === 0) {
            set({ 
              localImages: [],
              localFolders: [
                {
                  id: "local_all",
                  name: "All Images",
                  path: "",
                  images: [],
                  createdAt: Date.now(),
                },
              ],
              isScanning: false,
              scanProgress: 100,
              lastScanTime: Date.now(),
              lastError: 'No image files found in the selected directory'
            });
            return;
          }
          
          // Create folder structure
          const filePaths = allFiles.map(f => f.path);
          const { folders, folderMap } = createFolderStructure(filePaths);
          
                  // Process images in larger batches for better performance with large collections
          const batchSize = 50; // Larger batches for 5000+ images
          const images: LocalMemesImage[] = [];

          console.log(`🚀 Processing ${allFiles.length} images in batches of ${batchSize}...`);

          let imageCount = 0; // Track total images processed

          for (let i = 0; i < allFiles.length; i += batchSize) {
            const batch = allFiles.slice(i, i + batchSize);

            // Process batch in parallel for speed
            await Promise.allSettled(
              batch.map(async ({ path, handle }, batchIndex) => {
                try {
                  // Create object URL and try to create thumbnail immediately for first 50 images
                  const file = await Promise.race([
                    handle.getFile(),
                    new Promise((_, reject) =>
                      setTimeout(() => reject(new Error('File access timeout')), 3000)
                    )
                  ]) as File;

                  const src = URL.createObjectURL(file);
                  let thumbnailSrc: string | undefined;
                  let thumbnailLoaded = false;

                  const globalIndex = imageCount + batchIndex;

                  // Create thumbnails immediately for first 50 images to show something quickly
                  if (globalIndex < 50 && file.size < 5 * 1024 * 1024) { // First 50 images under 5MB
                    try {
                      thumbnailSrc = await Promise.race([
                        createThumbnail(file),
                        new Promise<string>((_, reject) =>
                          setTimeout(() => reject(new Error('Thumbnail creation timeout')), 4000)
                        )
                      ]);
                      thumbnailLoaded = true;
                      console.log(`✅ Thumbnail ${globalIndex + 1}/50: ${file.name}`);
                    } catch (error) {
                      console.warn(`⚠️ Thumbnail failed for ${file.name}, using original:`, error instanceof Error ? error.message : error);
                      thumbnailSrc = src; // Fall back to original image
                      thumbnailLoaded = true;
                    }
                  }

                  const pathParts = path.split('/');
                  pathParts.pop(); // Remove filename
                  const folderPath = pathParts.join('/');
                  const folderId = folderMap.get(folderPath) || 'local_all';

                  const image: LocalMemesImage = {
                    id: createLocalImageId(),
                    name: handle.name,
                    path,
                    src, // Object URL created immediately
                    thumbnailSrc, // May be undefined for lazy loading
                    tags: [],
                    folder: folderId,
                    createdAt: file.lastModified || Date.now(),
                    updatedAt: Date.now(),
                    size: file.size,
                    fileHandle: handle,
                    loadError: false,
                    retryCount: 0,
                    thumbnailLoaded,
                    isVisible: false,
                  };

                  images.push(image);

                  // Update folder with this image
                  const folderIndex = folders.findIndex(f => f.id === folderId);
                  if (folderIndex !== -1) {
                    folders[folderIndex].images.push(image.id);
                  }

                  // Also add to "All Images" folder
                  if (folderId !== 'local_all') {
                    const allImagesFolder = folders.find(f => f.id === 'local_all');
                    if (allImagesFolder) {
                      allImagesFolder.images.push(image.id);
                    }
                  }

                } catch (error) {
                  console.warn(`❌ Failed to process file ${path}:`, error);
                  // Create a placeholder for failed images
                  const pathParts = path.split('/');
                  pathParts.pop();
                  const folderPath = pathParts.join('/');
                  const folderId = folderMap.get(folderPath) || 'local_all';

                  const failedImage: LocalMemesImage = {
                    id: createLocalImageId(),
                    name: handle.name,
                    path,
                    src: '', // No URL for failed images
                    tags: [],
                    folder: folderId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    size: 0,
                    fileHandle: handle,
                    loadError: true,
                    retryCount: 0,
                    thumbnailLoaded: false,
                    isVisible: false,
                  };

                  images.push(failedImage);
                }
              })
            );

            // Update image count for next batch
            imageCount += batch.length;

            // Update progress
            const progress = Math.round(((i + batchSize) / allFiles.length) * 100);
            set({ scanProgress: Math.min(progress, 100) });

            // Quick UI update for large collections
            await new Promise(resolve => setTimeout(resolve, 10));
          }
          
          console.log(`🎉 Scan complete: ${images.length} images processed`);
          
          set({ 
            localImages: images,
            localFolders: folders,
            isScanning: false,
            scanProgress: 100,
            lastScanTime: Date.now(),
            lastError: null
          });
          
        } catch (error) {
          console.error('❌ Failed to scan directory:', error);
          set({ 
            isScanning: false, 
            scanProgress: 0,
            lastError: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      },

      refreshDirectory: async () => {
        await get().scanDirectory();
      },

      addLocalImage: async (fileHandle, folderPath) => {
        try {
          const file = await fileHandle.getFile();
          const src = URL.createObjectURL(file);
          const dimensions = await getImageDimensions(src);
          
          const image: LocalMemesImage = {
            id: createLocalImageId(),
            name: fileHandle.name,
            path: folderPath ? `${folderPath}/${fileHandle.name}` : fileHandle.name,
            src,
            tags: [],
            folder: folderPath || 'local_all',
            createdAt: file.lastModified || Date.now(),
            updatedAt: Date.now(),
            size: file.size,
            dimensions,
            fileHandle,
          };
          
          set((state) => ({
            localImages: [...state.localImages, image]
          }));
        } catch (error) {
          console.error('Failed to add local image:', error);
        }
      },

      removeLocalImage: (id) => {
        set((state) => {
          const imageToRemove = state.localImages.find(img => img.id === id);
          if (imageToRemove) {
            // Revoke object URL to free memory
            URL.revokeObjectURL(imageToRemove.src);
          }
          
          return {
            localImages: state.localImages.filter(img => img.id !== id),
            selectedImages: state.selectedImages.filter(imgId => imgId !== id),
            localFolders: state.localFolders.map(folder => ({
              ...folder,
              images: folder.images.filter(imgId => imgId !== id),
            }))
          };
        });
      },

      updateLocalImageTags: (id, tags) => {
        set((state) => {
          const updatedImages = state.localImages.map(img =>
            img.id === id ? { ...img, tags, updatedAt: Date.now() } : img
          );
          
          // Update global tags list
          const allTags = new Set(state.localTags);
          tags.forEach(tag => allTags.add(tag));
          
          return {
            localImages: updatedImages,
            localTags: Array.from(allTags),
          };
        });
      },

      retryImageLoad: async (id) => {
        const state = get();
        const image = state.localImages.find(img => img.id === id);
        if (!image || !image.loadError) return;

        const retryCount = (image.retryCount || 0) + 1;
        if (retryCount > 3) {
          console.warn(`🚫 Max retries reached for image: ${image.path}`);
          return;
        }

        console.log(`🔄 Retrying image load (attempt ${retryCount}): ${image.path}`);

        try {
          const file = await image.fileHandle.getFile();
          const newSrc = URL.createObjectURL(file);
          const dimensions = await getImageDimensions(newSrc);

          // Clean up old object URL if it exists
          if (image.src) {
            URL.revokeObjectURL(image.src);
          }

          set((state) => ({
            localImages: state.localImages.map(img =>
              img.id === id
                ? {
                    ...img,
                    src: newSrc,
                    dimensions,
                    loadError: false,
                    retryCount,
                    updatedAt: Date.now(),
                  }
                : img
            ),
          }));

          console.log(`✅ Successfully retried: ${image.path}`);
        } catch (error) {
          console.warn(`❌ Retry failed for ${image.path}:`, error);
          set((state) => ({
            localImages: state.localImages.map(img =>
              img.id === id ? { ...img, retryCount } : img
            ),
          }));
        }
      },

      renameLocalImage: async (id, newName) => {
        const state = get();
        const image = state.localImages.find(img => img.id === id);
        if (!image) {
          console.warn(`Image not found for rename: ${id}`);
          return false;
        }

        try {
          // Note: File System Access API doesn't support renaming files directly
          // This is a limitation of the browser API - files are read-only
          console.warn('File renaming not supported by File System Access API');

          // We can only update the display name in our local store
          set((state) => ({
            localImages: state.localImages.map(img =>
              img.id === id
                ? { ...img, name: newName, updatedAt: Date.now() }
                : img
            ),
          }));

          return true;
        } catch (error) {
          console.error('Failed to rename image:', error);
          return false;
        }
      },

      // Lazy loading for performance with large collections
      loadImageLazily: async (id) => {
        const state = get();
        const image = state.localImages.find(img => img.id === id);
        if (!image || image.thumbnailLoaded || image.loadError) {
          return; // Already processed or failed
        }

        try {
          const file = await image.fileHandle.getFile();

          // Get dimensions using existing src
          const dimensions = await getImageDimensions(image.src);

          // Create thumbnail for better performance (only for visible images)
          let thumbnailSrc: string | undefined;
          try {
            if (file.size < 15 * 1024 * 1024) { // 15MB limit for thumbnails
              thumbnailSrc = await Promise.race([
                createThumbnail(file),
                new Promise<string>((_, reject) =>
                  setTimeout(() => reject(new Error('Lazy thumbnail timeout')), 5000)
                )
              ]);
              console.log(`✅ Lazy thumbnail created: ${image.name}`);
            } else {
              console.log(`⚠️ File too large for thumbnail (${(file.size / 1024 / 1024).toFixed(1)}MB): ${image.name}`);
              thumbnailSrc = image.src; // Use original for very large images
            }
          } catch (error) {
            console.warn(`⚠️ Lazy thumbnail failed for ${image.name}:`, error instanceof Error ? error.message : error);
            thumbnailSrc = image.src; // Fall back to original
          }

          // Update the image with loaded data
          set((state) => ({
            localImages: state.localImages.map(img =>
              img.id === id
                ? {
                    ...img,
                    thumbnailSrc,
                    dimensions,
                    thumbnailLoaded: true,
                    updatedAt: Date.now(),
                  }
                : img
            ),
          }));

          console.log(`✅ Lazily loaded: ${image.path}`);
        } catch (error) {
          console.warn(`❌ Failed to lazy load ${image.path}:`, error);
          set((state) => ({
            localImages: state.localImages.map(img =>
              img.id === id
                ? { ...img, loadError: true, retryCount: (img.retryCount || 0) + 1 }
                : img
            ),
          }));
        }
      },

      markImageVisible: (id) => {
        set((state) => ({
          localImages: state.localImages.map(img =>
            img.id === id ? { ...img, isVisible: true } : img
          ),
        }));

        // Load the thumbnail if it hasn't been created yet
        const image = get().localImages.find(img => img.id === id);
        if (image && !image.thumbnailLoaded && !image.loadError) {
          get().loadImageLazily(id);
        }
      },

      cleanupInvisibleImages: () => {
        set((state) => {
          const updatedImages = state.localImages.map(img => {
            if (!img.isVisible && img.src) {
              // Revoke object URLs for invisible images to free memory
              URL.revokeObjectURL(img.src);
              if (img.thumbnailSrc && img.thumbnailSrc !== img.src) {
                URL.revokeObjectURL(img.thumbnailSrc);
              }
              return {
                ...img,
                src: '',
                thumbnailSrc: undefined,
                thumbnailLoaded: false,
              };
            }
            return { ...img, isVisible: false }; // Reset visibility for next cycle
          });

          return { localImages: updatedImages };
        });
      },

      addLocalTag: (tag) => {
        set((state) => ({
          localTags: state.localTags.includes(tag) ? state.localTags : [...state.localTags, tag],
        }));
      },

      removeLocalTag: (tag) => {
        set((state) => ({
          localTags: state.localTags.filter(t => t !== tag),
          filterTags: state.filterTags.filter(t => t !== tag),
          localImages: state.localImages.map(img => ({
            ...img,
            tags: img.tags.filter(t => t !== tag),
          })),
        }));
      },

      createLocalFolder: (path, name, parentId) => {
        const folder: LocalMemesFolder = {
          id: createLocalFolderId(),
          name,
          path,
          images: [],
          parentId,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          localFolders: [...state.localFolders, folder],
        }));
        
        return folder.id;
      },

      // Shuffle management
      generateShuffleSequence: () => {
        const state = get();
        const filteredImages = state.getFilteredLocalImages();
        
        if (filteredImages.length === 0) {
          set({ shuffleHistory: [], shuffleHistoryIndex: 0 });
          return;
        }

        // Create array of indices and shuffle it
        const indices = Array.from({ length: filteredImages.length }, (_, i) => i);
        
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        console.log(`🔀 Generated shuffle sequence for ${indices.length} images`);
        
        set({
          shuffleHistory: indices,
          shuffleHistoryIndex: 0,
          currentImageIndex: indices[0] || 0,
        });
      },

      resetShuffleHistory: () => {
        set({
          shuffleHistory: [],
          shuffleHistoryIndex: 0,
        });
      },

      // UI actions (same as regular store)
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setCurrentFolder: (folderId) => set({ 
        currentFolder: folderId,
        currentImageIndex: 0,
      }),
      
      setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
      
      toggleImageSelection: (id) => {
        set((state) => ({
          selectedImages: state.selectedImages.includes(id)
            ? state.selectedImages.filter(imgId => imgId !== id)
            : [...state.selectedImages, id],
        }));
      },
      
      clearSelection: () => set({ selectedImages: [] }),
      
      setSearchQuery: (query) => set({ 
        searchQuery: query,
        currentImageIndex: 0,
      }),
      
      toggleFilterTag: (tag) => {
        set((state) => ({
          filterTags: state.filterTags.includes(tag)
            ? state.filterTags.filter(t => t !== tag)
            : [...state.filterTags, tag],
          currentImageIndex: 0,
        }));
      },
      
      clearFilters: () => set({ 
        searchQuery: "",
        filterTags: [],
        currentImageIndex: 0,
      }),
      
      toggleShuffle: () => {
        const state = get();
        const newShuffleMode = !state.isShuffleMode;
        
        if (newShuffleMode) {
          // Generate new shuffle sequence when enabling shuffle
          set({ isShuffleMode: newShuffleMode });
          get().generateShuffleSequence();
        } else {
          // Reset to regular mode
          set({ 
            isShuffleMode: newShuffleMode,
            currentImageIndex: 0,
            shuffleHistory: [],
            shuffleHistoryIndex: 0,
          });
        }
        
        console.log(`🔀 Shuffle mode ${newShuffleMode ? 'enabled' : 'disabled'}`);
      },
      
      setSlideshowInterval: (interval) => set({ slideshowInterval: interval }),

      // Slideshow actions
      startSlideshow: () => set({ isPlaying: true }),
      stopSlideshow: () => set({ isPlaying: false }),
      
      nextImage: () => {
        const state = get();
        const filteredImages = state.getFilteredLocalImages();
        if (filteredImages.length === 0) return;
        
        if (state.isShuffleMode) {
          // In shuffle mode, advance through the shuffle history
          if (state.shuffleHistory.length === 0) {
            get().generateShuffleSequence();
            return;
          }
          
          const nextHistoryIndex = (state.shuffleHistoryIndex + 1) % state.shuffleHistory.length;
          const nextImageIndex = state.shuffleHistory[nextHistoryIndex];
          
          console.log(`➡️ Shuffle next: ${nextHistoryIndex}/${state.shuffleHistory.length}`);
          
          set({
            shuffleHistoryIndex: nextHistoryIndex,
            currentImageIndex: nextImageIndex,
          });
        } else {
          // Sequential mode
          const nextIndex = (state.currentImageIndex + 1) % filteredImages.length;
          console.log(`➡️ Sequential next: ${nextIndex}/${filteredImages.length}`);
          set({ currentImageIndex: nextIndex });
        }
      },
      
      previousImage: () => {
        const state = get();
        const filteredImages = state.getFilteredLocalImages();
        if (filteredImages.length === 0) return;
        
        if (state.isShuffleMode) {
          // In shuffle mode, go back through the shuffle history
          if (state.shuffleHistory.length === 0) {
            get().generateShuffleSequence();
            return;
          }
          
          const prevHistoryIndex = state.shuffleHistoryIndex === 0 
            ? state.shuffleHistory.length - 1 
            : state.shuffleHistoryIndex - 1;
          const prevImageIndex = state.shuffleHistory[prevHistoryIndex];
          
          console.log(`⬅️ Shuffle previous: ${prevHistoryIndex}/${state.shuffleHistory.length}`);
          
          set({
            shuffleHistoryIndex: prevHistoryIndex,
            currentImageIndex: prevImageIndex,
          });
        } else {
          // Sequential mode
          const prevIndex = state.currentImageIndex === 0 
            ? filteredImages.length - 1 
            : state.currentImageIndex - 1;
          console.log(`⬅️ Sequential previous: ${prevIndex}/${filteredImages.length}`);
          set({ currentImageIndex: prevIndex });
        }
      },

      // Computed getters
      getFilteredLocalImages: () => {
        const state = get();
        let filtered = state.localImages;
        
        // Filter by current folder
        if (state.currentFolder && state.currentFolder !== "local_all") {
          const folder = state.localFolders.find(f => f.id === state.currentFolder);
          if (folder) {
            filtered = filtered.filter(img => folder.images.includes(img.id));
          }
        }
        
        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(img =>
            img.name.toLowerCase().includes(query) ||
            img.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        // Filter by tags
        if (state.filterTags.length > 0) {
          filtered = filtered.filter(img =>
            state.filterTags.every(tag => img.tags.includes(tag))
          );
        }
        
        return filtered;
      },
      
      getCurrentLocalImage: () => {
        const state = get();
        const filteredImages = state.getFilteredLocalImages();
        return filteredImages[state.currentImageIndex] || null;
      },
    }),
    {
      name: "local-memes-storage",
      partialize: (state) => ({
        localTags: state.localTags,
        isLocalMode: state.isLocalMode,
        viewMode: state.viewMode,
        currentFolder: state.currentFolder,
        isShuffleMode: state.isShuffleMode,
        slideshowInterval: state.slideshowInterval,
        lastScanTime: state.lastScanTime,
        // Note: We don't persist images, folders, or directoryHandle
        // These need to be rescanned each session for security reasons
      }),
    }
  )
);

// Add window type augmentation for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
      startIn?: FileSystemHandle | string;
    }): Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
}
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemesImage {
  id: string;
  name: string;
  src: string;
  tags: string[];
  folder: string;
  createdAt: number;
  updatedAt: number;
  size?: number;
  dimensions?: { width: number; height: number };
}

export interface MemesFolder {
  id: string;
  name: string;
  path: string; // Full path for nested folders (e.g., "vacation/2023/summer")
  images: string[]; // Array of image IDs
  parentId?: string; // Parent folder ID for hierarchy
  createdAt: number;
}

interface MemesState {
  // Data
  images: MemesImage[];
  folders: MemesFolder[];
  tags: string[];
  
  // UI State
  viewMode: "grid" | "lightbox" | "slideshow";
  currentFolder: string | null;
  currentImageIndex: number;
  selectedImages: string[];
  searchQuery: string;
  filterTags: string[];
  isShuffleMode: boolean;
  slideshowInterval: number;
  
  // Slideshow state
  isPlaying: boolean;
  
  // Shuffle state
  shuffleHistory: number[]; // Indices of images in shuffle order
  shuffleHistoryIndex: number; // Current position in shuffle history
  
  // Actions
  addImage: (file: File, folder?: string, filePath?: string) => Promise<void>;
  addImages: (files: FileList, folder?: string) => Promise<void>;
  addImagesWithFolders: (files: FileList) => Promise<void>;
  removeImage: (id: string) => void;
  updateImageTags: (id: string, tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  
  // Folder actions
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  moveImageToFolder: (imageId: string, folderId: string) => void;
  
  // UI actions
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
  
  // Shuffle management
  generateShuffleSequence: () => void;
  resetShuffleHistory: () => void;
  
  // Slideshow actions
  startSlideshow: () => void;
  stopSlideshow: () => void;
  nextImage: () => void;
  previousImage: () => void;
  
  // Export actions
  exportSelectedAsZip: () => Promise<void>;
  
  // Computed getters
  getFilteredImages: () => MemesImage[];
  getCurrentImage: () => MemesImage | null;
}

const createImageId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const createFolderId = () => `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to get or create folder from path
const getOrCreateFolderFromPath = (
  folders: MemesFolder[], 
  folderPath: string
): { folders: MemesFolder[]; folderId: string } => {
  if (!folderPath || folderPath === '/') {
    return { folders, folderId: 'all' };
  }

  // Normalize the path (remove leading/trailing slashes)
  const normalizedPath = folderPath.replace(/^\/+|\/+$/g, '');
  
  // Check if folder already exists
  const existingFolder = folders.find(f => f.path === normalizedPath);
  if (existingFolder) {
    return { folders, folderId: existingFolder.id };
  }

  // Create nested folder structure
  const pathParts = normalizedPath.split('/');
  let currentPath = '';
  let parentId: string | undefined = undefined;
  const updatedFolders = [...folders];

  for (const part of pathParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    let folder = updatedFolders.find(f => f.path === currentPath);
    if (!folder) {
      folder = {
        id: createFolderId(),
        name: part,
        path: currentPath,
        images: [],
        parentId,
        createdAt: Date.now(),
      };
      updatedFolders.push(folder);
    }
    parentId = folder.id;
  }

  const targetFolder = updatedFolders.find(f => f.path === normalizedPath);
  return { 
    folders: updatedFolders, 
    folderId: targetFolder?.id || 'all' 
  };
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
};

export const useMemesStore = create<MemesState>()(
  persist(
    (set, get) => ({
      // Initial state
      images: [],
      folders: [
        {
          id: "all",
          name: "All Images",
          path: "",
          images: [],
          createdAt: Date.now(),
        },
      ],
      tags: [],
      viewMode: "grid",
      currentFolder: "all",
      currentImageIndex: 0,
      selectedImages: [],
      searchQuery: "",
      filterTags: [],
      isShuffleMode: false,
      slideshowInterval: 3000,
      isPlaying: false,
      shuffleHistory: [],
      shuffleHistoryIndex: 0,

      // Actions
      addImage: async (file: File, folder = "all", filePath?: string) => {
        try {
          const src = await readFileAsDataURL(file);
          const dimensions = await getImageDimensions(src);
          
          const image: MemesImage = {
            id: createImageId(),
            name: file.name,
            src,
            tags: [],
            folder,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            size: file.size,
            dimensions,
          };
          
          set((state) => {
            // If filePath is provided, create folder structure from it
            let updatedFolders = state.folders;
            let targetFolderId = folder;
            
            if (filePath) {
              // Extract folder path from file path
              const pathParts = filePath.split('/');
              pathParts.pop(); // Remove filename
              const folderPath = pathParts.join('/');
              
              if (folderPath) {
                const result = getOrCreateFolderFromPath(updatedFolders, folderPath);
                updatedFolders = result.folders;
                targetFolderId = result.folderId;
                image.folder = targetFolderId;
              }
            }
            
            const newImages = [...state.images, image];
            const finalFolders = updatedFolders.map(f => 
              f.id === targetFolderId 
                ? { ...f, images: [...f.images, image.id] }
                : f.id === "all"
                ? { ...f, images: [...f.images, image.id] }
                : f
            );
            
            return {
              images: newImages,
              folders: finalFolders,
            };
          });
        } catch (error) {
          console.error("Failed to add image:", error);
        }
      },

      addImages: async (files: FileList, folder = "all") => {
        const { addImage } = get();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith("image/")) {
            await addImage(file, folder);
          }
        }
      },

      addImagesWithFolders: async (files: FileList) => {
        const { addImage } = get();
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i] as File & { webkitRelativePath?: string };
          
          if (file.type.startsWith("image/")) {
            const filePath = file.webkitRelativePath || file.name;
            await addImage(file, "all", filePath);
          }
        }
      },

      removeImage: (id: string) => {
        set((state) => {
          const newImages = state.images.filter(img => img.id !== id);
          const updatedFolders = state.folders.map(folder => ({
            ...folder,
            images: folder.images.filter(imgId => imgId !== id),
          }));
          
          return {
            images: newImages,
            folders: updatedFolders,
            selectedImages: state.selectedImages.filter(imgId => imgId !== id),
          };
        });
      },

      updateImageTags: (id: string, tags: string[]) => {
        set((state) => {
          const updatedImages = state.images.map(img =>
            img.id === id ? { ...img, tags, updatedAt: Date.now() } : img
          );
          
          // Update global tags list
          const allTags = new Set(state.tags);
          tags.forEach(tag => allTags.add(tag));
          
          return {
            images: updatedImages,
            tags: Array.from(allTags),
          };
        });
      },

      addTag: (tag: string) => {
        set((state) => ({
          tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        }));
      },

      removeTag: (tag: string) => {
        set((state) => ({
          tags: state.tags.filter(t => t !== tag),
          filterTags: state.filterTags.filter(t => t !== tag),
          images: state.images.map(img => ({
            ...img,
            tags: img.tags.filter(t => t !== tag),
          })),
        }));
      },

      // Folder actions
      createFolder: (name: string) => {
        const folder: MemesFolder = {
          id: createFolderId(),
          name,
          path: name,
          images: [],
          createdAt: Date.now(),
        };
        
        set((state) => ({
          folders: [...state.folders, folder],
        }));
      },

      deleteFolder: (id: string) => {
        if (id === "all") return; // Can't delete "All Images" folder
        
        set((state) => ({
          folders: state.folders.filter(f => f.id !== id),
          currentFolder: state.currentFolder === id ? "all" : state.currentFolder,
        }));
      },

      moveImageToFolder: (imageId: string, folderId: string) => {
        set((state) => {
          const updatedFolders = state.folders.map(folder => {
            if (folder.id === folderId && !folder.images.includes(imageId)) {
              return { ...folder, images: [...folder.images, imageId] };
            }
            return folder;
          });
          
          return { folders: updatedFolders };
        });
      },

      // UI actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setCurrentFolder: (folderId) => set({ 
        currentFolder: folderId,
        currentImageIndex: 0,
      }),
      
      setCurrentImageIndex: (index) => set({ currentImageIndex: index }),
      
      toggleImageSelection: (id: string) => {
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
      
      toggleFilterTag: (tag: string) => {
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

      // Shuffle management
      generateShuffleSequence: () => {
        const state = get();
        const filteredImages = state.getFilteredImages();
        
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

      // Slideshow actions
      startSlideshow: () => set({ isPlaying: true }),
      stopSlideshow: () => set({ isPlaying: false }),
      
      nextImage: () => {
        const state = get();
        const filteredImages = state.getFilteredImages();
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
        const filteredImages = state.getFilteredImages();
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

      // Export actions
      exportSelectedAsZip: async () => {
        const state = get();
        if (state.selectedImages.length === 0) return;
        
        // This would require a zip library like JSZip
        // For now, just download each image individually
        const selectedImages = state.images.filter(img => 
          state.selectedImages.includes(img.id)
        );
        
        selectedImages.forEach((img, index) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = img.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, index * 100);
        });
      },

      // Computed getters
      getFilteredImages: () => {
        const state = get();
        let filtered = state.images;
        
        // Filter by current folder
        if (state.currentFolder && state.currentFolder !== "all") {
          const folder = state.folders.find(f => f.id === state.currentFolder);
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
      
      getCurrentImage: () => {
        const state = get();
        const filteredImages = state.getFilteredImages();
        return filteredImages[state.currentImageIndex] || null;
      },
    }),
    {
      name: "memes-storage",
      partialize: (state) => ({
        images: state.images,
        folders: state.folders,
        tags: state.tags,
        viewMode: state.viewMode,
        currentFolder: state.currentFolder,
        isShuffleMode: state.isShuffleMode,
        slideshowInterval: state.slideshowInterval,
      }),
    }
  )
);
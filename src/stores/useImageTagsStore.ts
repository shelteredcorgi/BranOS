import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ImageTag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface TaggedImage {
  imagePath: string; // Full path to uniquely identify the image
  imageHash?: string; // Optional hash for better identification
  tags: string[]; // Array of tag IDs
  taggedAt: number;
  updatedAt: number;
}

interface ImageTagsState {
  // Data
  tags: ImageTag[];
  taggedImages: TaggedImage[];

  // UI State
  selectedTagFilter: string[]; // Array of tag IDs to filter by
  showTagInput: boolean;
  newTagName: string;

  // Tag Actions
  createTag: (name: string, color?: string) => string;
  deleteTag: (tagId: string) => void;
  updateTag: (tagId: string, updates: Partial<Omit<ImageTag, "id" | "createdAt">>) => void;
  getAllTags: () => ImageTag[];
  getTag: (tagId: string) => ImageTag | undefined;

  // Image Tagging Actions
  addTagToImage: (imagePath: string, tagId: string) => void;
  removeTagFromImage: (imagePath: string, tagId: string) => void;
  setImageTags: (imagePath: string, tagIds: string[]) => void;
  getImageTags: (imagePath: string) => ImageTag[];
  getImagesWithTags: (tagIds: string[]) => string[];
  getTaggedImage: (imagePath: string) => TaggedImage | undefined;

  // Filter Actions
  setTagFilter: (tagIds: string[]) => void;
  addTagToFilter: (tagId: string) => void;
  removeTagFromFilter: (tagId: string) => void;
  clearTagFilter: () => void;
  isImageMatchingFilter: (imagePath: string) => boolean;

  // UI Actions
  setShowTagInput: (show: boolean) => void;
  setNewTagName: (name: string) => void;

  // Computed getters
  getFilteredImagePaths: () => string[];
  getTagCounts: () => Record<string, number>;
}

const createTagId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_TAG_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export const useImageTagsStore = create<ImageTagsState>()(
  persist(
    (set, get) => ({
      // Initial state
      tags: [],
      taggedImages: [],
      selectedTagFilter: [],
      showTagInput: false,
      newTagName: "",

      // Tag Actions
      createTag: (name: string, color?: string) => {
        const state = get();
        const tagId = createTagId();
        const assignedColor = color || DEFAULT_TAG_COLORS[state.tags.length % DEFAULT_TAG_COLORS.length];

        const newTag: ImageTag = {
          id: tagId,
          name: name.trim(),
          color: assignedColor,
          createdAt: Date.now(),
        };

        set((state) => ({
          tags: [...state.tags, newTag],
        }));

        console.log(`🏷️ Created tag: ${newTag.name} (${tagId})`);
        return tagId;
      },

      deleteTag: (tagId: string) => {
        set((state) => ({
          tags: state.tags.filter(tag => tag.id !== tagId),
          taggedImages: state.taggedImages.map(taggedImage => ({
            ...taggedImage,
            tags: taggedImage.tags.filter(id => id !== tagId),
            updatedAt: Date.now(),
          })),
          selectedTagFilter: state.selectedTagFilter.filter(id => id !== tagId),
        }));
        console.log(`🗑️ Deleted tag: ${tagId}`);
      },

      updateTag: (tagId: string, updates: Partial<Omit<ImageTag, "id" | "createdAt">>) => {
        set((state) => ({
          tags: state.tags.map(tag =>
            tag.id === tagId ? { ...tag, ...updates } : tag
          ),
        }));
        console.log(`✏️ Updated tag: ${tagId}`, updates);
      },

      getAllTags: () => {
        return get().tags;
      },

      getTag: (tagId: string) => {
        return get().tags.find(tag => tag.id === tagId);
      },

      // Image Tagging Actions
      addTagToImage: (imagePath: string, tagId: string) => {
        const state = get();
        const existingTaggedImage = state.taggedImages.find(ti => ti.imagePath === imagePath);

        if (existingTaggedImage) {
          if (!existingTaggedImage.tags.includes(tagId)) {
            set((state) => ({
              taggedImages: state.taggedImages.map(ti =>
                ti.imagePath === imagePath
                  ? { ...ti, tags: [...ti.tags, tagId], updatedAt: Date.now() }
                  : ti
              ),
            }));
          }
        } else {
          const newTaggedImage: TaggedImage = {
            imagePath,
            tags: [tagId],
            taggedAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            taggedImages: [...state.taggedImages, newTaggedImage],
          }));
        }

        const tag = state.getTag(tagId);
        console.log(`🏷️ Added tag "${tag?.name}" to image: ${imagePath}`);
      },

      removeTagFromImage: (imagePath: string, tagId: string) => {
        set((state) => ({
          taggedImages: state.taggedImages.map(ti =>
            ti.imagePath === imagePath
              ? { ...ti, tags: ti.tags.filter(id => id !== tagId), updatedAt: Date.now() }
              : ti
          ).filter(ti => ti.tags.length > 0), // Remove taggedImage entries with no tags
        }));

        const state = get();
        const tag = state.getTag(tagId);
        console.log(`🏷️ Removed tag "${tag?.name}" from image: ${imagePath}`);
      },

      setImageTags: (imagePath: string, tagIds: string[]) => {
        const state = get();
        const existingTaggedImage = state.taggedImages.find(ti => ti.imagePath === imagePath);

        if (tagIds.length === 0) {
          // Remove the image from tagged images if no tags
          set((state) => ({
            taggedImages: state.taggedImages.filter(ti => ti.imagePath !== imagePath),
          }));
        } else if (existingTaggedImage) {
          set((state) => ({
            taggedImages: state.taggedImages.map(ti =>
              ti.imagePath === imagePath
                ? { ...ti, tags: tagIds, updatedAt: Date.now() }
                : ti
            ),
          }));
        } else {
          const newTaggedImage: TaggedImage = {
            imagePath,
            tags: tagIds,
            taggedAt: Date.now(),
            updatedAt: Date.now(),
          };
          set((state) => ({
            taggedImages: [...state.taggedImages, newTaggedImage],
          }));
        }

        console.log(`🏷️ Set tags for image ${imagePath}:`, tagIds);
      },

      getImageTags: (imagePath: string) => {
        const state = get();
        const taggedImage = state.taggedImages.find(ti => ti.imagePath === imagePath);
        if (!taggedImage) return [];

        return taggedImage.tags
          .map(tagId => state.getTag(tagId))
          .filter((tag): tag is ImageTag => tag !== undefined);
      },

      getImagesWithTags: (tagIds: string[]) => {
        const state = get();
        if (tagIds.length === 0) return [];

        return state.taggedImages
          .filter(ti => tagIds.every(tagId => ti.tags.includes(tagId)))
          .map(ti => ti.imagePath);
      },

      getTaggedImage: (imagePath: string) => {
        return get().taggedImages.find(ti => ti.imagePath === imagePath);
      },

      // Filter Actions
      setTagFilter: (tagIds: string[]) => {
        set({ selectedTagFilter: tagIds });
        console.log(`🔍 Set tag filter:`, tagIds);
      },

      addTagToFilter: (tagId: string) => {
        set((state) => {
          if (!state.selectedTagFilter.includes(tagId)) {
            return { selectedTagFilter: [...state.selectedTagFilter, tagId] };
          }
          return state;
        });
      },

      removeTagFromFilter: (tagId: string) => {
        set((state) => ({
          selectedTagFilter: state.selectedTagFilter.filter(id => id !== tagId),
        }));
      },

      clearTagFilter: () => {
        set({ selectedTagFilter: [] });
        console.log(`🔍 Cleared tag filter`);
      },

      isImageMatchingFilter: (imagePath: string) => {
        const state = get();
        if (state.selectedTagFilter.length === 0) return true; // No filter = show all

        const imageTags = state.getImageTags(imagePath).map(tag => tag.id);
        const matches = state.selectedTagFilter.every(filterTagId => imageTags.includes(filterTagId));

        // Debug logging
        if (state.selectedTagFilter.length > 0) {
          console.log(`🏷️ Filter check for ${imagePath.split('/').pop()}:`, {
            selectedFilter: state.selectedTagFilter,
            imageTags: imageTags,
            matches: matches
          });
        }

        return matches;
      },

      // UI Actions
      setShowTagInput: (show: boolean) => set({ showTagInput: show }),
      setNewTagName: (name: string) => set({ newTagName: name }),

      // Computed getters
      getFilteredImagePaths: () => {
        const state = get();
        if (state.selectedTagFilter.length === 0) return [];

        return state.getImagesWithTags(state.selectedTagFilter);
      },

      getTagCounts: () => {
        const state = get();
        const counts: Record<string, number> = {};

        state.tags.forEach(tag => {
          counts[tag.id] = state.taggedImages.filter(ti => ti.tags.includes(tag.id)).length;
        });

        return counts;
      },
    }),
    {
      name: "image-tags-storage",
      partialize: (state) => ({
        tags: state.tags,
        taggedImages: state.taggedImages,
        selectedTagFilter: state.selectedTagFilter,
      }),
    }
  )
);
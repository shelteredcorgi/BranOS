import React, { useState, useRef, useEffect } from "react";
import { useImageTagsStore } from "@/stores/useImageTagsStore";
import { Tag, Plus, X, Hash } from "lucide-react";

interface ImageTagManagerProps {
  imagePath: string;
  className?: string;
}

export function ImageTagManager({ imagePath, className = "" }: ImageTagManagerProps) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    getImageTags,
    getAllTags,
    createTag,
    addTagToImage,
    removeTagFromImage,
  } = useImageTagsStore();

  const imageTags = getImageTags(imagePath);
  const allTags = getAllTags();
  const availableTags = allTags.filter(tag =>
    !imageTags.some(imageTag => imageTag.id === tag.id)
  );

  // Focus input when adding tag
  useEffect(() => {
    if (isAddingTag && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTag]);

  const handleCreateAndAddTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    // Check if tag already exists
    const existingTag = allTags.find(tag =>
      tag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingTag) {
      // Add existing tag to image
      addTagToImage(imagePath, existingTag.id);
    } else {
      // Create new tag and add to image
      const newTagId = createTag(trimmedName);
      addTagToImage(imagePath, newTagId);
    }

    setNewTagName("");
    setIsAddingTag(false);
    setShowAllTags(false);
  };

  const handleAddExistingTag = (tagId: string) => {
    addTagToImage(imagePath, tagId);
    setShowAllTags(false);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagFromImage(imagePath, tagId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateAndAddTag();
    } else if (e.key === "Escape") {
      setIsAddingTag(false);
      setNewTagName("");
      setShowAllTags(false);
    }
  };

  return (
    <div className={`image-tag-manager ${className}`}>
      {/* Current tags display */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-white text-sm">
          <Hash className="w-3 h-3" />
          <span>Tags:</span>
        </div>

        {imageTags.length === 0 && !isAddingTag && (
          <span className="text-gray-300 text-xs italic">No tags</span>
        )}

        {imageTags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white border"
            style={{
              backgroundColor: tag.color || "#3B82F6",
              borderColor: tag.color || "#3B82F6"
            }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-black hover:bg-opacity-20 rounded p-0.5"
              title={`Remove tag: ${tag.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add tag button */}
        {!isAddingTag && (
          <button
            onClick={() => setIsAddingTag(true)}
            className="flex items-center gap-1 px-2 py-1 bg-black bg-opacity-50 text-white border border-gray-600 rounded hover:bg-opacity-70 text-xs"
            title="Add tag"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Tag input/selection */}
      {isAddingTag && (
        <div className="bg-black bg-opacity-70 rounded p-3 border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter tag name..."
              className="flex-1 px-2 py-1 text-sm bg-white text-black rounded border"
            />
            <button
              onClick={handleCreateAndAddTag}
              disabled={!newTagName.trim()}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingTag(false);
                setNewTagName("");
                setShowAllTags(false);
              }}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>

          {/* Quick add existing tags */}
          {availableTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs">Or select existing:</span>
                {availableTags.length > 5 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="text-blue-300 text-xs hover:text-blue-200"
                  >
                    {showAllTags ? "Show less" : `Show all (${availableTags.length})`}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {(showAllTags ? availableTags : availableTags.slice(0, 5)).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddExistingTag(tag.id)}
                    className="px-2 py-1 rounded text-xs border hover:bg-opacity-80"
                    style={{
                      backgroundColor: tag.color || "#3B82F6",
                      borderColor: tag.color || "#3B82F6",
                      color: "white"
                    }}
                    title={`Add tag: ${tag.name}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
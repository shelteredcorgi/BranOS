import { useState, useEffect, useRef, useCallback } from "react";
import { AppProps } from "@/apps/base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { TextEditMenuBar } from "./TextEditMenuBar";
import { EditorProvider, useEditorContext } from "./EditorProvider";
import { EditorToolbar } from "./EditorToolbar";
import { TextEditor } from "./TextEditor";
import { DialogManager, DialogControls } from "./DialogManager";
import { useTextEditState } from "../hooks/useTextEditState";
import { useFileOperations } from "../hooks/useFileOperations";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import {
  removeFileExtension,
  TextEditInitialData,
} from "../utils/textEditUtils";
import { useAppStore } from "@/stores/useAppStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useLaunchApp } from "@/hooks/useLaunchApp";
import { markdownToHtml } from "@/utils/markdown";

// Inner component that has access to editor context
function TextEditContent({
  isWindowOpen,
  onClose,
  isForeground,
  skipInitialSound,
  initialData,
  instanceId,
  title: customTitle,
  onNavigateNext,
  onNavigatePrevious,
}: AppProps) {
  const editor = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const launchApp = useLaunchApp();
  const clearInitialData = useAppStore((state) => state.clearInitialData);
  const clearInstanceInitialData = useAppStore(
    (state) => state.clearInstanceInitialData
  );
  const launchAppInstance = useAppStore((state) => state.launchApp);
  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";
  // Local UI-only state for Save dialog filename
  const [saveFileName, setSaveFileName] = useState("");
  const [closeSaveFileName, setCloseSaveFileName] = useState("");
  const [dialogControls, setDialogControls] = useState<DialogControls | null>(
    null
  );

  // Use our custom hooks
  const {
    currentFilePath,
    contentJson,
    hasUnsavedChanges,
    setCurrentFilePath,
    setContentJson,
    setHasUnsavedChanges,
    legacyFilePath,
    legacyContentJson,
    legacyHasUnsavedChanges,
  } = useTextEditState({ instanceId });

  const {
    handleSave,
    handleSaveAs,
    handleImportFile,
    handleExportFile,
    handleLoadFromPath,
    handleLoadFromDatabase,
    generateSuggestedFileName,
  } = useFileOperations({
    editor,
    currentFilePath,
    customTitle,
    onSaveSuccess: useCallback(
      (filePath: string) => {
        setCurrentFilePath(filePath);
        setContentJson(editor?.getJSON() || null);
        setHasUnsavedChanges(false);
      },
      [editor, setCurrentFilePath, setContentJson, setHasUnsavedChanges]
    ),
    onLoadSuccess: useCallback(
      (filePath: string) => {
        setCurrentFilePath(filePath);
        setHasUnsavedChanges(false);
        setContentJson(editor?.getJSON() || null);
      },
      [editor, setCurrentFilePath, setHasUnsavedChanges, setContentJson]
    ),
  });

  const { isDraggingOver, dragHandlers } = useDragAndDrop({
    hasUnsavedChanges,
    onFileDropped: async (file) => {
      try {
        await handleImportFile(file);
      } catch (error) {
        console.error("Failed to handle dropped file:", error);
      }
    },
    onConfirmOverwrite: () => {
      dialogControls?.openConfirmNewDialog();
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Only mark changes and store latest content/JSON in onUpdate
      const currentJson = editor.getJSON();
      setContentJson(currentJson); // Update store JSON for recovery
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
        console.log(
          "[TextEdit] Content changed, marked as unsaved. Instance ID:",
          instanceId,
          "Has path:",
          !!currentFilePath
        );
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [
    editor,
    hasUnsavedChanges,
    setContentJson,
    setHasUnsavedChanges,
    instanceId,
    currentFilePath,
  ]);

  // Initial load - Restore last session or use initialData
  useEffect(() => {
    if (!editor) return;

    const loadContent = async () => {
      // Prioritize initialData passed from launch event
      const typedInitialData = initialData as TextEditInitialData;
      if (typedInitialData?.path && typedInitialData?.content !== undefined) {
        console.log(
          "[TextEdit] Loading content from initialData:",
          typedInitialData.path
        );
        await handleLoadFromPath(
          typedInitialData.path,
          typedInitialData.content
        );

        // Clear the initialData from the store now that we've consumed it
        if (instanceId) {
          clearInstanceInitialData(instanceId);
        } else {
          clearInitialData("textedit");
        }
        return;
      } else if (
        typedInitialData?.path &&
        typedInitialData?.content === undefined
      ) {
        // If a path was provided but no inline content, try loading from DB
        console.log(
          "[TextEdit] Loading content from database via initialData path:",
          typedInitialData.path
        );
        await handleLoadFromDatabase(typedInitialData.path);
        if (instanceId) {
          clearInstanceInitialData(instanceId);
        } else {
          clearInitialData("textedit");
        }
        return;
      }

      // For instance mode, skip legacy store, but we'll handle instance restore below
      if (instanceId) {
        return;
      }

      // For legacy mode, try to restore from persisted state
      let loadedContent = false;

      // 1) Prefer any unsaved in-memory edits that were never written to disk.
      if (legacyHasUnsavedChanges && legacyContentJson) {
        try {
          editor.commands.setContent(legacyContentJson, false);
          loadedContent = true;
          console.log("Restored unsaved TextEdit content from store");
        } catch (err) {
          console.warn("Failed to restore unsaved TextEdit content:", err);
        }
      }

      // 2) If nothing unsaved, attempt to load from database
      if (!loadedContent && legacyFilePath) {
        const success = await handleLoadFromDatabase(legacyFilePath);
        if (success) {
          loadedContent = true;
        }
      }

      // 3) Finally, fall back to any stored JSON
      if (!loadedContent && legacyContentJson) {
        try {
          editor.commands.setContent(legacyContentJson, false);
          setHasUnsavedChanges(false);
          console.log("Loaded content from store JSON (fallback)");
        } catch (err) {
          console.warn("Failed to restore stored TextEdit content:", err);
        }
      }
    };

    loadContent();
  }, [
    editor,
    initialData,
    instanceId,
    legacyFilePath,
    legacyContentJson,
    legacyHasUnsavedChanges,
    handleLoadFromPath,
    handleLoadFromDatabase,
    clearInitialData,
    clearInstanceInitialData,
    setHasUnsavedChanges,
  ]);

  // Instance restore: if we have a file path but no content yet after reload, load from DB
  useEffect(() => {
    if (!editor || !instanceId) return;
    if (!contentJson && currentFilePath) {
      console.log(
        "[TextEdit] Restoring instance content from DB for path:",
        currentFilePath
      );
      handleLoadFromDatabase(currentFilePath);
    }
  }, [
    editor,
    instanceId,
    contentJson,
    currentFilePath,
    handleLoadFromDatabase,
  ]);

  // Add listeners for external document updates
  useEffect(() => {
    const handleUpdateEditorContent = (e: CustomEvent) => {
      if (editor && e.detail?.path === currentFilePath && e.detail?.content) {
        try {
          const jsonContent = JSON.parse(e.detail.content);
          const { from, to } = editor.state.selection;

          editor.commands.setContent(jsonContent);

          if (from && to && from === to) {
            try {
              editor.commands.setTextSelection(
                Math.min(from, editor.state.doc.content.size)
              );
            } catch (e) {
              console.log("Could not restore cursor position", e);
            }
          }

          setHasUnsavedChanges(false);
          console.log("Editor content updated from external source");
        } catch (error) {
          console.error("Failed to update editor content:", error);
        }
      }
    };

    const handleDocumentUpdated = (e: CustomEvent) => {
      if (editor && e.detail?.path === currentFilePath && e.detail?.content) {
        try {
          const jsonContent = JSON.parse(e.detail.content);
          editor.commands.setContent(jsonContent);
          setHasUnsavedChanges(false);
          console.log("Editor content updated after document updated event");
        } catch (error) {
          console.error(
            "Failed to update editor with document updated event:",
            error
          );
        }
      }
    };

    window.addEventListener(
      "updateEditorContent",
      handleUpdateEditorContent as EventListener
    );
    window.addEventListener(
      "documentUpdated",
      handleDocumentUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "updateEditorContent",
        handleUpdateEditorContent as EventListener
      );
      window.removeEventListener(
        "documentUpdated",
        handleDocumentUpdated as EventListener
      );
    };
  }, [editor, currentFilePath, setHasUnsavedChanges]);

  // Sync editor when contentJson is externally updated
  useEffect(() => {
    if (!editor || !contentJson) return;

    const currentJson = editor.getJSON();
    if (JSON.stringify(currentJson) === JSON.stringify(contentJson)) return;

    try {
      editor.commands.setContent(contentJson, false);
      setHasUnsavedChanges(false);
      console.log("[TextEdit] Editor content synced from store change");
    } catch (err) {
      console.error("[TextEdit] Failed to sync editor content:", err);
    }
  }, [contentJson, editor, setHasUnsavedChanges]);


  const handleNewFile = () => {
    const newInstanceId = launchAppInstance("textedit", null, "Untitled", true);
    console.log(`Created new TextEdit file in instance: ${newInstanceId}`);
  };

  const createNewFile = () => {
    if (editor) {
      editor.commands.clearContent();
      setContentJson(null);
      setCurrentFilePath(null);
      setHasUnsavedChanges(false);

      const pendingFileOpen = localStorage.getItem("pending_file_open");
      if (pendingFileOpen) {
        try {
          const { path, content } = JSON.parse(pendingFileOpen);
          if (path.startsWith("/Documents/")) {
            const processedContent = path.endsWith(".md")
              ? markdownToHtml(content)
              : content;
            editor.commands.setContent(processedContent);
            setCurrentFilePath(path);
            setHasUnsavedChanges(false);
            setContentJson(editor.getJSON());
          }
        } catch (e) {
          console.error("Failed to parse pending file open data:", e);
        } finally {
          localStorage.removeItem("pending_file_open");
        }
      }
    }
  };

  const handleSaveClick = async () => {
    if (!currentFilePath) {
      const suggestedName = generateSuggestedFileName();
      setSaveFileName(`${suggestedName}.md`);
      dialogControls?.openSaveDialog();
    } else {
      try {
        await handleSave();
      } catch (error) {
        console.error("Save failed:", error);
      }
    }
  };

  const handleSaveSubmit = async (fileName: string) => {
    try {
      await handleSaveAs(fileName);
      dialogControls?.closeSaveDialog();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await handleImportFile(file);
      } catch (error) {
        console.error("Import failed:", error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportFileClick = () => {
    launchApp("finder", { initialPath: "/Documents" });
  };

  const handleClose = () => {
    const isUntitled = !currentFilePath;
    const hasContent =
      editor &&
      (!editor.isEmpty ||
        editor.getText().trim().length > 0 ||
        editor.getHTML() !== "<p></p>");

    if (hasUnsavedChanges || (isUntitled && hasContent)) {
      if (isUntitled && editor) {
        const suggestedName = generateSuggestedFileName();
        setCloseSaveFileName(`${suggestedName}.md`);
      } else {
        setCloseSaveFileName(
          currentFilePath?.split("/").pop() || "Untitled.md"
        );
      }

      dialogControls?.openCloseSaveDialog();
    } else {
      window.dispatchEvent(
        new CustomEvent(`closeWindow-${instanceId || "textedit"}`, {
          detail: { onComplete: onClose },
        })
      );
    }
  };

  const handleCloseDelete = () => {
    dialogControls?.closeCloseSaveDialog();
    window.dispatchEvent(
      new CustomEvent(`closeWindow-${instanceId || "textedit"}`, {
        detail: { onComplete: onClose },
      })
    );
  };

  const handleCloseSave = async (fileName: string) => {
    try {
      if (currentFilePath) {
        await handleSave();
      } else {
        await handleSaveAs(fileName);
      }
      dialogControls?.closeCloseSaveDialog();
      window.dispatchEvent(
        new CustomEvent(`closeWindow-${instanceId || "textedit"}`, {
          detail: { onComplete: onClose },
        })
      );
    } catch (error) {
      console.error("Save before close failed:", error);
    }
  };

  const showUnsavedIndicator =
    hasUnsavedChanges ||
    (!currentFilePath &&
      editor &&
      (!editor.isEmpty ||
        editor.getText().trim().length > 0 ||
        editor.getHTML() !== "<p></p>"));

  const menuBar = (
    <TextEditMenuBar
      editor={editor}
      onClose={handleClose}
      isWindowOpen={isWindowOpen}
      onShowHelp={() => dialogControls?.openHelpDialog()}
      onShowAbout={() => dialogControls?.openAboutDialog()}
      onNewFile={handleNewFile}
      onImportFile={handleImportFileClick}
      onExportFile={handleExportFile}
      onSave={handleSaveClick}
      hasUnsavedChanges={hasUnsavedChanges}
      currentFilePath={currentFilePath}
      handleFileSelect={handleFileSelect}
    />
  );

  if (!isWindowOpen) return null;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.html,.md,.rtf,.doc,.docx"
        className="hidden"
      />
      {!isXpTheme && isForeground && menuBar}

      <WindowFrame
        title={
          customTitle ||
          (currentFilePath
            ? `${removeFileExtension(currentFilePath.split("/").pop() || "")}${
                hasUnsavedChanges ? " •" : ""
              }`
            : `Untitled${showUnsavedIndicator ? " •" : ""}`)
        }
        onClose={handleClose}
        isForeground={isForeground}
        appId="textedit"
        skipInitialSound={skipInitialSound}
        instanceId={instanceId}
        interceptClose={true}
        onNavigateNext={onNavigateNext}
        onNavigatePrevious={onNavigatePrevious}
        menuBar={isXpTheme ? menuBar : undefined}
      >
        <div className="flex flex-col h-full w-full">
          <div
            className={`flex-1 flex flex-col relative min-h-0 ${
              isDraggingOver
                ? "after:absolute after:inset-0 after:bg-black/20"
                : ""
            }`}
            {...dragHandlers}
          >
            <EditorToolbar
              editor={editor}
              currentTheme={currentTheme}
            />
            {/* Editor content container with correct positioning */}
            <TextEditor className="flex-1 overflow-y-auto w-full min-h-0 bg-white" />
          </div>

          <DialogManager
            saveFileName={saveFileName}
            setSaveFileName={setSaveFileName}
            closeSaveFileName={closeSaveFileName}
            setCloseSaveFileName={setCloseSaveFileName}
            onSaveSubmit={handleSaveSubmit}
            onCloseSave={handleCloseSave}
            onCloseDelete={handleCloseDelete}
            onConfirmNew={createNewFile}
            onControlsReady={setDialogControls}
            isUntitledForClose={!currentFilePath}
          />
        </div>
      </WindowFrame>
    </>
  );
}

// Main component wrapper
export function TextEditAppComponent(props: AppProps) {
  return (
    <EditorProvider>
      <TextEditContent {...props} />
    </EditorProvider>
  );
}

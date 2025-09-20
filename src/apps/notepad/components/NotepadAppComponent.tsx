import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AppProps } from "../../base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { NotepadMenuBar } from "./NotepadMenuBar";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { InputDialog } from "@/components/dialogs/InputDialog";
import { helpItems, appMetadata } from "..";
import { useSound } from "@/hooks/useSound";
import { useNotepadStore } from "@/stores/useNotepadStore";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { FileText, Target, Calendar, Save, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotepadAppComponentProps extends AppProps {}

export function NotepadAppComponent({
  onClose,
  isWindowOpen,
  isForeground = true,
  skipInitialSound,
  instanceId,
}: NotepadAppComponentProps) {
  const playSound = useSound("/sounds/Click.mp3");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);

  const {
    focusMode,
    typewriterMode,
    showWordCount,
    dailyGoal,
    template,
    content,
    title,
    wordCount,
    charCount,
    progress,
    setContent,
    setTitle,
    toggleFocusMode,
    toggleTypewriterMode,
    toggleWordCount,
    setDailyGoal,
    setTemplate,
    newDocument,
    saveDocument,
    exportDocument,
    copyToClipboard,
  } = useNotepadStore(
    useShallow((s) => ({
      currentDocument: s.currentDocument,
      focusMode: s.focusMode,
      typewriterMode: s.typewriterMode,
      showWordCount: s.showWordCount,
      dailyGoal: s.dailyGoal,
      template: s.template,
      content: s.content,
      title: s.title,
      wordCount: s.wordCount,
      charCount: s.charCount,
      progress: s.progress,
      setContent: s.setContent,
      setTitle: s.setTitle,
      toggleFocusMode: s.toggleFocusMode,
      toggleTypewriterMode: s.toggleTypewriterMode,
      toggleWordCount: s.toggleWordCount,
      setDailyGoal: s.setDailyGoal,
      setTemplate: s.setTemplate,
      newDocument: s.newDocument,
      saveDocument: s.saveDocument,
      exportDocument: s.exportDocument,
      copyToClipboard: s.copyToClipboard,
    }))
  );

  // Auto-save functionality
  useEffect(() => {
    if (!content.trim() && !title.trim()) return;
    
    const timer = setTimeout(() => {
      saveDocument();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content, title, saveDocument]);

  // Typewriter scrolling effect
  useEffect(() => {
    if (!typewriterMode || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const lineHeight = 24; // Approximate line height
    const visibleLines = Math.floor(textarea.clientHeight / lineHeight);
    const totalLines = textarea.value.split('\n').length;
    
    if (totalLines > visibleLines) {
      textarea.scrollTop = (totalLines - visibleLines + 2) * lineHeight;
    }
  }, [content, typewriterMode]);

  const handleNewDocument = useCallback((templateType: string) => {
    setTemplate(templateType);
    newDocument(templateType);
    setShowNewDocumentDialog(false);
    playSound.play();
    toast.success("New document created");
  }, [newDocument, setTemplate, playSound]);

  const handleSaveAs = useCallback((filename: string) => {
    if (!filename.trim()) {
      toast.error("Filename cannot be empty");
      return;
    }
    
    setTitle(filename);
    saveDocument();
    setShowSaveAsDialog(false);
    playSound.play();
    toast.success(`Document saved as "${filename}"`);
  }, [setTitle, saveDocument, playSound]);

  const handleExport = useCallback((format: string) => {
    exportDocument(format);
    setShowExportDialog(false);
    playSound.play();
    toast.success(`Document exported as ${format.toUpperCase()}`);
  }, [exportDocument, playSound]);

  const handleSetGoal = useCallback((goal: string) => {
    const goalNum = parseInt(goal);
    if (isNaN(goalNum) || goalNum < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    
    setDailyGoal(goalNum);
    setShowGoalDialog(false);
    playSound.play();
    toast.success(`Daily goal set to ${goalNum} words`);
  }, [setDailyGoal, playSound]);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard();
    playSound.play();
    toast.success("Content copied to clipboard");
  }, [copyToClipboard, playSound]);

  const getProgressColor = () => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const templates = [
    { id: "blank", name: "Blank Document", icon: FileText },
    { id: "journal", name: "Journal Entry", icon: Calendar },
    { id: "story", name: "Story Outline", icon: Target },
  ];

  if (!isWindowOpen) return null;

  return (
    <>
      <WindowFrame
        appId="notepad"
        title={title || "Untitled Document"}
        onClose={onClose}
        isForeground={isForeground}
        instanceId={instanceId}
        skipInitialSound={skipInitialSound}
      >
        <NotepadMenuBar
          onNewDocument={() => setShowNewDocumentDialog(true)}
          onSaveAs={() => setShowSaveAsDialog(true)}
          onExport={() => setShowExportDialog(true)}
          onCopyToClipboard={handleCopyToClipboard}
          onToggleFocusMode={toggleFocusMode}
          onToggleTypewriterMode={toggleTypewriterMode}
          onToggleWordCount={toggleWordCount}
          onSetGoal={() => setShowGoalDialog(true)}
          onHelp={() => setShowHelp(true)}
          onAbout={() => setShowAbout(true)}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          showWordCount={showWordCount}
        />

        <div className={cn(
          "flex-1 flex flex-col",
          focusMode && "p-8"
        )}>
          {/* Toolbar */}
          {!focusMode && (
            <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewDocumentDialog(true)}
                className="flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                New
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveAsDialog(true)}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save As
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              
              <div className="flex-1" />
              
              {showWordCount && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {wordCount} words, {charCount} chars
                  </Badge>
                  {dailyGoal > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <div className="flex items-center gap-1">
                        <div className={cn("w-2 h-2 rounded-full", getProgressColor())} />
                        {Math.round(progress)}% of {dailyGoal}
                      </div>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className={cn(
                "w-full h-full resize-none border-none outline-none p-4",
                "font-mono text-sm leading-relaxed",
                focusMode && "text-lg leading-loose p-8",
                "focus:ring-0 focus:border-none"
              )}
              style={{
                fontFamily: focusMode ? 'Georgia, serif' : 'ui-monospace, monospace',
              }}
            />
          </div>

          {/* Status bar */}
          {showWordCount && !focusMode && (
            <div className="border-t p-2 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
              <div>
                Template: {template || 'Blank'}
              </div>
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
                {dailyGoal > 0 && (
                  <span className={cn(
                    "font-medium",
                    progress >= 100 ? "text-green-600" : "text-gray-600"
                  )}>
                    Goal: {Math.round(progress)}% ({dailyGoal} words)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </WindowFrame>

      {/* Dialogs */}
      {showNewDocumentDialog && (
        <InputDialog
          title="New Document"
          description="Choose a template for your new document:"
          placeholder="Select template"
          onConfirm={handleNewDocument}
          onCancel={() => setShowNewDocumentDialog(false)}
          isSelect
          selectOptions={templates.map(t => ({ value: t.id, label: t.name }))}
        />
      )}

      {showSaveAsDialog && (
        <InputDialog
          title="Save As"
          description="Enter a filename for your document:"
          placeholder="Document name"
          defaultValue={title}
          onConfirm={handleSaveAs}
          onCancel={() => setShowSaveAsDialog(false)}
        />
      )}

      {showExportDialog && (
        <InputDialog
          title="Export Document"
          description="Choose export format:"
          placeholder="Select format"
          onConfirm={handleExport}
          onCancel={() => setShowExportDialog(false)}
          isSelect
          selectOptions={[
            { value: "txt", label: "Plain Text (.txt)" },
            { value: "md", label: "Markdown (.md)" },
          ]}
        />
      )}

      {showGoalDialog && (
        <InputDialog
          title="Set Daily Goal"
          description="Enter your daily word count goal:"
          placeholder="Word count (e.g., 500)"
          defaultValue={dailyGoal > 0 ? dailyGoal.toString() : ""}
          onConfirm={handleSetGoal}
          onCancel={() => setShowGoalDialog(false)}
        />
      )}

      {showHelp && (
        <HelpDialog
          isOpen={showHelp}
          onOpenChange={setShowHelp}
          appName="Notepad"
          helpItems={helpItems || []}
        />
      )}

      {showAbout && (
        <AboutDialog
          appName={appMetadata.name}
          description={appMetadata.description}
          version={appMetadata.version}
          onClose={() => setShowAbout(false)}
        />
      )}
    </>
  );
}
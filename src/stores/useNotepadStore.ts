import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotepadDocument {
  id: string;
  title: string;
  content: string;
  template: string;
  createdAt: number;
  updatedAt: number;
}

interface NotepadState {
  // Document state
  currentDocument: NotepadDocument | null;
  documents: NotepadDocument[];
  
  // UI state
  focusMode: boolean;
  typewriterMode: boolean;
  showWordCount: boolean;
  dailyGoal: number;
  template: string;
  
  // Current document properties
  content: string;
  title: string;
  wordCount: number;
  charCount: number;
  progress: number;
  
  // Actions
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  toggleFocusMode: () => void;
  toggleTypewriterMode: () => void;
  toggleWordCount: () => void;
  setDailyGoal: (goal: number) => void;
  setTemplate: (template: string) => void;
  newDocument: (template?: string) => void;
  saveDocument: () => void;
  loadDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  exportDocument: (format: string) => void;
  copyToClipboard: () => void;
}

const templates = {
  blank: "",
  journal: `# Journal Entry - ${new Date().toLocaleDateString()}

## Today's Thoughts

## What I'm Grateful For
- 
- 
- 

## Tomorrow's Goals
- 
- 
- `,
  story: `# Story Outline

## Title
[Story Title]

## Characters
- **Protagonist**: 
- **Antagonist**: 
- **Supporting Characters**: 

## Plot Structure

### Act I - Setup
- **Inciting Incident**: 
- **Plot Point 1**: 

### Act II - Confrontation
- **Midpoint**: 
- **Plot Point 2**: 

### Act III - Resolution
- **Climax**: 
- **Resolution**: 

## Themes
- 
- 

## Notes
`,
};

const countWords = (text: string): number => {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

const countChars = (text: string): number => {
  return text.length;
};

export const useNotepadStore = create<NotepadState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentDocument: null,
      documents: [],
      focusMode: false,
      typewriterMode: false,
      showWordCount: true,
      dailyGoal: 0,
      template: "blank",
      content: "",
      title: "",
      wordCount: 0,
      charCount: 0,
      progress: 0,

      // Actions
      setContent: (content: string) => {
        const wordCount = countWords(content);
        const charCount = countChars(content);
        const { dailyGoal } = get();
        const progress = dailyGoal > 0 ? (wordCount / dailyGoal) * 100 : 0;
        
        set({
          content,
          wordCount,
          charCount,
          progress: Math.min(progress, 100),
        });
      },

      setTitle: (title: string) => set({ title }),

      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),

      toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),

      toggleWordCount: () => set((state) => ({ showWordCount: !state.showWordCount })),

      setDailyGoal: (goal: number) => {
        const { wordCount } = get();
        const progress = goal > 0 ? (wordCount / goal) * 100 : 0;
        set({ 
          dailyGoal: goal,
          progress: Math.min(progress, 100),
        });
      },

      setTemplate: (template: string) => set({ template }),

      newDocument: (template = "blank") => {
        const templateContent = templates[template as keyof typeof templates] || "";
        const wordCount = countWords(templateContent);
        const charCount = countChars(templateContent);
        const { dailyGoal } = get();
        const progress = dailyGoal > 0 ? (wordCount / dailyGoal) * 100 : 0;
        
        set({
          currentDocument: null,
          content: templateContent,
          title: "",
          template,
          wordCount,
          charCount,
          progress: Math.min(progress, 100),
        });
      },

      saveDocument: () => {
        const state = get();
        const { content, title, template, currentDocument, documents } = state;
        
        if (!content.trim() && !title.trim()) return;
        
        const now = Date.now();
        
        if (currentDocument) {
          // Update existing document
          const updatedDocument = {
            ...currentDocument,
            title: title || "Untitled Document",
            content,
            template,
            updatedAt: now,
          };
          
          const updatedDocuments = documents.map(doc =>
            doc.id === currentDocument.id ? updatedDocument : doc
          );
          
          set({
            currentDocument: updatedDocument,
            documents: updatedDocuments,
          });
        } else {
          // Create new document
          const newDoc: NotepadDocument = {
            id: `doc_${now}`,
            title: title || "Untitled Document",
            content,
            template,
            createdAt: now,
            updatedAt: now,
          };
          
          set({
            currentDocument: newDoc,
            documents: [...documents, newDoc],
          });
        }
      },

      loadDocument: (id: string) => {
        const { documents } = get();
        const doc = documents.find(d => d.id === id);
        
        if (doc) {
          const wordCount = countWords(doc.content);
          const charCount = countChars(doc.content);
          const { dailyGoal } = get();
          const progress = dailyGoal > 0 ? (wordCount / dailyGoal) * 100 : 0;
          
          set({
            currentDocument: doc,
            content: doc.content,
            title: doc.title,
            template: doc.template,
            wordCount,
            charCount,
            progress: Math.min(progress, 100),
          });
        }
      },

      deleteDocument: (id: string) => {
        const { documents, currentDocument } = get();
        const updatedDocuments = documents.filter(d => d.id !== id);
        
        set({
          documents: updatedDocuments,
          currentDocument: currentDocument?.id === id ? null : currentDocument,
        });
      },

      exportDocument: (format: string) => {
        const { content, title } = get();
        const filename = `${title || "document"}.${format}`;
        
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      copyToClipboard: () => {
        const { content } = get();
        navigator.clipboard.writeText(content).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = content;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        });
      },
    }),
    {
      name: "notepad-storage",
      partialize: (state) => ({
        documents: state.documents,
        focusMode: state.focusMode,
        typewriterMode: state.typewriterMode,
        showWordCount: state.showWordCount,
        dailyGoal: state.dailyGoal,
        template: state.template,
      }),
    }
  )
);
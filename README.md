# BranOS — A web-based Personal OS, made with Cursor

A modern web-based desktop environment inspired by classic macOS, built with a cutting-edge web stack and AI. Features multiple built-in applications, a familiar desktop interface, and a system context-aware AI agent. Works on all devices—including mobile, tablet, and desktop.

## Features

### Desktop Environment

- Authentic macOS and Windows-style desktop interactions
- Multi-instance window manager with support for multiple windows per app
- Cross-device window resizers
- Menubar with app-specific menus (or taskbar + Start menu on Windows themes)
- Icon and list views
- Customizable wallpapers (photos, patterns, or videos)
- Virtual file system with local storage persistence and one-click Backup / Restore

### Themes

- **Four switchable themes:** System 7, Aqua (Mac OS X), Windows XP, Windows 98
  - **Menu & chrome:** mac themes use a top menubar with traffic-light controls; Windows themes use a bottom taskbar with a Start menu and classic window buttons
  - **Fonts & icons:** theme-specific system fonts and ThemedIcon assets for authentic look
  - **Wallpapers:** theme-specific default photo/tile/video wallpapers
  - **Controls:** select, dropdowns, buttons, and resizers are styled per theme, including mobile-safe resizers for XP/98

### Built-in Applications

- **Finder**: File manager with Quick Access & Storage Info
- **TextEdit**: Rich text editing with markdown support and task lists
  - Multi-window support - open multiple documents simultaneously
  - Each window maintains independent document state
  - Automatic instance management and document tracking
  - Smart file opening with existing window detection
- **Videos**: Retro-style YouTube playlist player
  - VCR-style interface with LCD display
  - Add and manage YouTube videos
  - Playlist management with shuffle and repeat modes
  - Scrolling titles and classic CD player controls
  - Local storage persistence
- **Control Panels**: System preferences & power tools
  - Appearance & shader selection (CRT, Galaxy, Aurora)
  - UI / typing / Terminal sound toggles
  - One-click full Backup / Restore
  - Format or reset the virtual file system
- **Minesweeper**: Classic game implementation
- **Terminal**: Unix-like CLI with built-in AI
  - Familiar commands (ls, cd, cat, touch, vim, edit, …)
  - ↑ / ↓ history & auto-completion
  - AI assistant integration for help and commands
  - Open documents in TextEdit or Vim straight from prompt
  - Toggle distinctive Terminal sounds in View ▸ Sounds
- **iPod**: 1st-generation iPod-style music player
  - Import any YouTube URL to build your music library
  - Classic click-wheel navigation and back-light toggle
  - Shuffle and loop playback modes
  - Create playlists and organize tracks
- **Notepad**: Distraction-free creative writing
  - Minimal UI with focus mode and typewriter scrolling
  - Markdown for headings, bold/italic, and inline checklists
  - Word and character counts with optional daily goals
  - Autosave to the virtual file system with version history
  - Templates for journal, story outline, and notes
  - Export as .txt or .md and copy to clipboard
- **Memes**: Smart folder and viewer for images
  - Shuffle and slideshow modes that surface a random item from any folder
  - Tag images with autocomplete and batch editing
  - AI-suggested tags and OCR text search (optional)
  - Grid and lightbox views with keyboard navigation
  - Drag and drop import from desktop or Finder
  - Save selections to ZIP and persist tags locally
- **To-Do**: Lightweight task widget
  - One-line quick add with natural language dates like "tomorrow 3pm"
  - Sections for Today, Upcoming, and Completed
  - Drag to reorder, tap or click to complete, undo to restore
  - Menubar glance and optional system notifications
  - Keyboard shortcuts for add, complete, and delete
  - Local persistence with Backup and Restore support
- **Converter**: Handy media file conversions
  - Video containers like MOV to MP4, WebM, and MKV
  - Audio conversions like WAV to MP3, AAC, and OGG
  - Image conversions like PNG to JPG or WebP with batch resize
  - Drag and drop files with preset profiles
  - Lossless or size-optimized modes with estimated output size
  - Writes new copies while keeping originals intact
- **X Lists**: Embedded view of your X Lists
  - Sign in, pick a List, and pin it as a resizable window
  - Clean timeline with inline media lightbox
  - Open posts in an external browser
  - Quick actions to copy link or save to Reading List
  - Adjustable auto-refresh and offline snapshot caching
  - UI chrome adapts to selected theme
- **Reading List**: Notion-powered reading queue
  - Connect a Notion database and map Title, URL, Tags, and Status
  - Two-pane layout with list on the left and embedded reader on the right
  - One-click save from X Lists
  - Filter by tag or status and search full text of saved pages
  - Offline snapshots with Read and Archive states
  - Sync changes back to Notion while respecting permissions

## Project Structure

```
project/
├── public/           # Static assets
│   ├── assets/       # Videos, sounds, and other media
│   ├── fonts/        # Font files
│   ├── icons/        # UI icons organized by category
│   ├── patterns/     # Pattern files
│   └── wallpapers/   # Wallpaper images (photos and tiles)
├── src/
│   ├── apps/         # Individual application modules
│   │   └── [app-name]/ # Each app has its own directory
│   │       ├── components/ # App-specific components
│   │       ├── hooks/      # Custom hooks specific to the app
│   │       └── utils/      # Utility functions for the app
│   ├── components/   # Shared React components
│   │   ├── dialogs/    # Dialog components
│   │   ├── layout/     # Layout components
│   │   ├── shared/     # Shared components across applications
│   │   └── ui/         # UI components (shadcn components)
│   ├── config/       # Configuration files
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Libraries and utilities
│   ├── stores/       # State management (e.g., Zustand stores)
│   ├── styles/       # CSS and styling utilities
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── api/              # API endpoints
└── ...config files   # e.g., vite.config.ts, tsconfig.json, package.json
```

## Development

The project uses:

- TypeScript for type safety
- ESLint for code quality
- Tailwind for utility-first CSS
- shadcn/ui components built on Radix UI primitives
- Lucide icons
- Vercel for deployment

## Scripts

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

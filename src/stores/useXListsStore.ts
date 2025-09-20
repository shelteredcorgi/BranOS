import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface XPost {
  id: string;
  text: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  timestamp: number;
  likes?: number;
  retweets?: number;
  replies?: number;
  media?: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  isRetweet?: boolean;
  originalAuthor?: {
    username: string;
    displayName: string;
  };
}

export interface XList {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  isPrivate?: boolean;
  owner: {
    username: string;
    displayName: string;
  };
}

interface XListsState {
  // Authentication
  isAuthenticated: boolean;
  currentUser: {
    username: string;
    displayName: string;
    avatar?: string;
  } | null;
  
  // Data
  availableLists: XList[];
  currentList: XList | null;
  posts: XPost[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  lastRefresh: number;
  selectedPost: XPost | null;
  showMediaLightbox: boolean;
  currentMediaIndex: number;
  
  // Settings
  showRetweets: boolean;
  showReplies: boolean;
  postsPerLoad: number;
  
  // Actions
  authenticate: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchLists: () => Promise<void>;
  selectList: (listId: string) => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  
  // Post interactions
  likePost: (postId: string) => Promise<void>;
  retweetPost: (postId: string) => Promise<void>;
  copyPostLink: (postId: string) => void;
  saveToReadingList: (postId: string) => void;
  openInBrowser: (postId: string) => void;
  
  // Media actions
  openMediaLightbox: (post: XPost, mediaIndex?: number) => void;
  closeMediaLightbox: () => void;
  nextMedia: () => void;
  previousMedia: () => void;
  
  // Settings
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (minutes: number) => void;
  toggleShowRetweets: () => void;
  toggleShowReplies: () => void;
  setPostsPerLoad: (count: number) => void;
}

// Mock data for demonstration
const mockLists: XList[] = [
  {
    id: "tech-news",
    name: "Tech News",
    description: "Latest technology and startup news",
    memberCount: 156,
    isPrivate: false,
    owner: { username: "techcurator", displayName: "Tech Curator" },
  },
  {
    id: "design-inspiration",
    name: "Design Inspiration", 
    description: "UI/UX design inspiration and resources",
    memberCount: 89,
    isPrivate: false,
    owner: { username: "designlover", displayName: "Design Lover" },
  },
  {
    id: "dev-tools",
    name: "Developer Tools",
    description: "Tools and resources for developers",
    memberCount: 234,
    isPrivate: false,
    owner: { username: "devtools", displayName: "Dev Tools" },
  },
];

const generateMockPosts = (listId: string): XPost[] => {
  const posts: XPost[] = [];
  const topics = {
    "tech-news": ["AI breakthrough", "New framework released", "Startup funding", "Tech conference"],
    "design-inspiration": ["Beautiful UI design", "Color palette inspiration", "Typography tips", "Design system"],
    "dev-tools": ["VS Code extension", "CLI tool", "Developer productivity", "Code snippet"],
  };
  
  const currentTopics = topics[listId as keyof typeof topics] || topics["tech-news"];
  
  for (let i = 0; i < 20; i++) {
    const topic = currentTopics[Math.floor(Math.random() * currentTopics.length)];
    posts.push({
      id: `post_${listId}_${i}`,
      text: `Interesting post about ${topic}. This is a mock post for demonstration purposes. #${listId.replace("-", "")} #demo`,
      author: {
        username: `user${i + 1}`,
        displayName: `User ${i + 1}`,
        avatar: `https://ui-avatars.com/api/?name=User+${i + 1}&background=random`,
      },
      timestamp: Date.now() - (i * 60 * 60 * 1000), // Hours ago
      likes: Math.floor(Math.random() * 100),
      retweets: Math.floor(Math.random() * 50),
      replies: Math.floor(Math.random() * 25),
      media: Math.random() > 0.7 ? [{
        type: "image" as const,
        url: `https://picsum.photos/800/600?random=${i}`,
        thumbnail: `https://picsum.photos/200/150?random=${i}`,
      }] : undefined,
    });
  }
  
  return posts;
};

export const useXListsStore = create<XListsState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      currentUser: null,
      availableLists: [],
      currentList: null,
      posts: [],
      isLoading: false,
      error: null,
      autoRefresh: true,
      refreshInterval: 5, // 5 minutes
      lastRefresh: 0,
      selectedPost: null,
      showMediaLightbox: false,
      currentMediaIndex: 0,
      showRetweets: true,
      showReplies: true,
      postsPerLoad: 20,

      // Actions
      authenticate: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock authentication
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (credentials.username === "demo" && credentials.password === "demo") {
            set({
              isAuthenticated: true,
              currentUser: {
                username: "demo",
                displayName: "Demo User",
                avatar: "https://ui-avatars.com/api/?name=Demo+User&background=007acc&color=fff",
              },
              availableLists: mockLists,
              isLoading: false,
            });
          } else {
            throw new Error("Invalid credentials. Use 'demo' / 'demo' for testing.");
          }
        } catch {
          set({
            error: "Authentication failed",
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          availableLists: [],
          currentList: null,
          posts: [],
          error: null,
        });
      },

      fetchLists: async () => {
        if (!get().isAuthenticated) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ 
            availableLists: mockLists,
            isLoading: false,
          });
        } catch {
          set({ 
            error: "Failed to fetch lists",
            isLoading: false,
          });
        }
      },

      selectList: async (listId) => {
        const state = get();
        const list = state.availableLists.find(l => l.id === listId);
        if (!list) return;
        
        set({ 
          currentList: list,
          isLoading: true,
          error: null,
          posts: [],
        });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockPosts = generateMockPosts(listId);
          
          set({
            posts: mockPosts,
            isLoading: false,
            lastRefresh: Date.now(),
          });
        } catch {
          set({ 
            error: "Failed to load posts",
            isLoading: false,
          });
        }
      },

      refreshPosts: async () => {
        const state = get();
        if (!state.currentList) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          const mockPosts = generateMockPosts(state.currentList.id);
          
          set({
            posts: mockPosts,
            isLoading: false,
            lastRefresh: Date.now(),
          });
        } catch {
          set({ 
            error: "Failed to refresh posts",
            isLoading: false,
          });
        }
      },

      loadMorePosts: async () => {
        const state = get();
        if (!state.currentList || state.isLoading) return;
        
        set({ isLoading: true });
        
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          const newMockPosts = generateMockPosts(state.currentList.id).slice(0, 10);
          
          set({
            posts: [...state.posts, ...newMockPosts],
            isLoading: false,
          });
        } catch {
          set({ 
            error: "Failed to load more posts",
            isLoading: false,
          });
        }
      },

      // Post interactions
      likePost: async (postId) => {
        set((state) => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, likes: (post.likes || 0) + 1 }
              : post
          ),
        }));
      },

      retweetPost: async (postId) => {
        set((state) => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, retweets: (post.retweets || 0) + 1 }
              : post
          ),
        }));
      },

      copyPostLink: (postId) => {
        const mockUrl = `https://x.com/user/status/${postId}`;
        navigator.clipboard.writeText(mockUrl);
      },

      saveToReadingList: (postId) => {
        // This would integrate with the Reading List app
        console.log("Save to reading list:", postId);
      },

      openInBrowser: (postId) => {
        const mockUrl = `https://x.com/user/status/${postId}`;
        window.open(mockUrl, "_blank");
      },

      // Media actions
      openMediaLightbox: (post, mediaIndex = 0) => {
        set({
          selectedPost: post,
          showMediaLightbox: true,
          currentMediaIndex: mediaIndex,
        });
      },

      closeMediaLightbox: () => {
        set({
          selectedPost: null,
          showMediaLightbox: false,
          currentMediaIndex: 0,
        });
      },

      nextMedia: () => {
        const state = get();
        if (!state.selectedPost?.media) return;
        
        const nextIndex = (state.currentMediaIndex + 1) % state.selectedPost.media.length;
        set({ currentMediaIndex: nextIndex });
      },

      previousMedia: () => {
        const state = get();
        if (!state.selectedPost?.media) return;
        
        const prevIndex = state.currentMediaIndex === 0 
          ? state.selectedPost.media.length - 1 
          : state.currentMediaIndex - 1;
        set({ currentMediaIndex: prevIndex });
      },

      // Settings
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      setRefreshInterval: (minutes) => set({ refreshInterval: minutes }),
      toggleShowRetweets: () => set((state) => ({ showRetweets: !state.showRetweets })),
      toggleShowReplies: () => set((state) => ({ showReplies: !state.showReplies })),
      setPostsPerLoad: (count) => set({ postsPerLoad: count }),
    }),
    {
      name: "xlists-storage",
      partialize: (state) => ({
        autoRefresh: state.autoRefresh,
        refreshInterval: state.refreshInterval,
        showRetweets: state.showRetweets,
        showReplies: state.showReplies,
        postsPerLoad: state.postsPerLoad,
      }),
    }
  )
);
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // User state
  user: null,
  isOnboardingComplete: false,
  
  setUser: (user) => set({ user }),
  setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),
  
  // Pages state
  pages: [],
  currentPageId: null,
  
  setPages: (pages) => set({ pages }),
  setCurrentPageId: (id) => set({ currentPageId: id }),
  
  addPage: (page) => set((state) => ({
    pages: [...state.pages, page]
  })),
  
  updatePage: (id, updates) => set((state) => ({
    pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  removePage: (id) => set((state) => ({
    pages: state.pages.filter(p => p.id !== id),
    currentPageId: state.currentPageId === id ? null : state.currentPageId
  })),
  
  // Blocks state
  blocks: [],
  
  setBlocks: (blocks) => set({ blocks }),
  
  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block]
  })),
  
  updateBlock: (id, updates) => set((state) => ({
    blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
  })),
  
  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter(b => b.id !== id)
  })),
  
  // UI state
  isSidebarOpen: true,
  isSearchOpen: false,
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  
  // Theme
  theme: 'light',
  setTheme: (theme) => set({ theme })
}));

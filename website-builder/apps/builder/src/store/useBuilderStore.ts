import { create } from 'zustand';

export type BuilderNode = {
  id: string;
  type: string;
  props: any;
  ref_id?: string;
};

export type PageMeta = {
  id: string;
  title: string;
  slug: string;
};

export type ComponentMeta = {
  id: string;
  name: string;
};

interface BuilderState {
  nodes: BuilderNode[];
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  selectedId: string | null;
  pages: PageMeta[];
  globalComponents: ComponentMeta[];
  
  // Actions
  setNodes: (nodes: BuilderNode[]) => void;
  setPageInfo: (id: string, title: string, slug: string) => void;
  setPages: (pages: PageMeta[]) => void;
  setGlobalComponents: (components: ComponentMeta[]) => void;
  addNode: (node: Omit<BuilderNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<BuilderNode>) => void;
  deleteNode: (id: string) => void;
  moveNode: (activeId: string, overId: string) => void;
  selectNode: (id: string | null) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  nodes: [],
  pageId: 'home',
  pageTitle: 'Home',
  pageSlug: '/',
  selectedId: null,
  pages: [],
  globalComponents: [],
  
  setNodes: (nodes) => set({ nodes }),
  setPageInfo: (id, title, slug) => set({ pageId: id, pageTitle: title, pageSlug: slug }),
  setPages: (pages) => set({ pages }),
  setGlobalComponents: (globalComponents) => set({ globalComponents }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: crypto.randomUUID() }]
  })),
  
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),
  
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),
  
  moveNode: (activeId, overId) => set((state) => {
    const oldIndex = state.nodes.findIndex(n => n.id === activeId);
    const newIndex = state.nodes.findIndex(n => n.id === overId);
    if (oldIndex === -1 || newIndex === -1) return state;
    const newNodes = [...state.nodes];
    const [moved] = newNodes.splice(oldIndex, 1);
    newNodes.splice(newIndex, 0, moved);
    return { nodes: newNodes };
  }),
  
  selectNode: (id) => set({ selectedId: id })
}));

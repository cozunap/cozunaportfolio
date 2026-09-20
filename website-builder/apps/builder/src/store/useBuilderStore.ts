import { create } from 'zustand';

export type BuilderNode = {
  id: string;
  type: string;
  props: Record<string, any>;
};

interface BuilderState {
  pageId: string;
  nodes: BuilderNode[];
  selectedId: string | null;
  addNode: (node: Omit<BuilderNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<BuilderNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  moveNode: (activeId: string, overId: string) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  pageId: 'home',
  nodes: [],
  selectedId: null,
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: `${node.type}_${Date.now()}` }]
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),

  selectNode: (id) => set({ selectedId: id }),

  moveNode: (activeId, overId) => set((state) => {
    const oldIndex = state.nodes.findIndex(n => n.id === activeId);
    const newIndex = state.nodes.findIndex(n => n.id === overId);
    if (oldIndex === -1 || newIndex === -1) return state;
    
    const newNodes = [...state.nodes];
    const [movedNode] = newNodes.splice(oldIndex, 1);
    newNodes.splice(newIndex, 0, movedNode);
    return { nodes: newNodes };
  }),
}));

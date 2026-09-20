import { create } from 'zustand';

export type BuilderNode = {
  id: string;
  type: string;
  props: Record<string, any>;
  ref_id?: string;
  parentId?: string | null;
};

export type PageMeta = { id: string; title: string; slug: string; };
export type ComponentMeta = { id: string; name: string; };

interface BuilderState {
  nodes: BuilderNode[];
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  selectedId: string | null;
  pages: PageMeta[];
  globalComponents: ComponentMeta[];
  
  setNodes: (nodes: BuilderNode[]) => void;
  setPageInfo: (id: string, title: string, slug: string) => void;
  setPages: (pages: PageMeta[]) => void;
  setGlobalComponents: (components: ComponentMeta[]) => void;
  
  addNode: (node: Omit<BuilderNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<BuilderNode>) => void;
  updateNodeProp: (id: string, key: string, value: any) => void;
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
  
  addNode: (node) => set((state) => {
    // Default props based on type
    const defaultProps: Record<string, any> = {};
    if (node.type === 'heading') defaultProps.text = 'New Heading';
    if (node.type === 'text') defaultProps.text = 'New Text Block';
    if (node.type === 'button') defaultProps.text = 'Click Me';
    if (node.type === 'spacer') defaultProps.height = 50;
    if (node.type === 'divider') { defaultProps.color = '#e5e7eb'; defaultProps.thickness = 1; }
    if (node.type === 'video') defaultProps.url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (node.type === 'map') defaultProps.address = 'New York, NY';
    if (node.type === 'icon') { defaultProps.icon = 'Star'; defaultProps.color = '#0d1f3c'; defaultProps.size = 24; }
    if (node.type === 'image_box') { defaultProps.title = 'Title'; defaultProps.description = 'Description'; }
    if (node.type === 'container') { defaultProps.padding = 20; defaultProps.bgColor = '#ffffff'; }
    if (node.type === 'grid') { defaultProps.columns = 2; defaultProps.gap = 16; }
    
    return {
      nodes: [...state.nodes, { ...node, props: { ...defaultProps, ...node.props }, id: crypto.randomUUID() }]
    };
  }),
  
  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n)
  })),

  updateNodeProp: (id, key, value) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, props: { ...n.props, [key]: value } } : n)
  })),
  
  deleteNode: (id) => set((state) => {
    // recursively delete children if we supported nesting
    const nodesToDelete = new Set([id]);
    let currentSize = 0;
    while(nodesToDelete.size > currentSize) {
      currentSize = nodesToDelete.size;
      state.nodes.forEach(n => {
        if (n.parentId && nodesToDelete.has(n.parentId)) nodesToDelete.add(n.id);
      });
    }
    return {
      nodes: state.nodes.filter(n => !nodesToDelete.has(n.id)),
      selectedId: state.selectedId === id ? null : state.selectedId
    };
  }),
  
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

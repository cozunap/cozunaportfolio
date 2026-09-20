// @ts-nocheck
import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layout, MousePointer2, Type, Image as ImageIcon, Box, Layers, Settings, Trash2 } from 'lucide-react';
import { useBuilderStore } from './store/useBuilderStore';
import { usePublish } from './usePublish';

// Sidebar Draggable Element
function SidebarItem({ id, type, icon: Icon, label }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${type}`,
    data: { isSidebarElement: true, type }
  });

  return (
    <button 
      ref={setNodeRef} {...listeners} {...attributes}
      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors z-10 cursor-grab"
    >
      <Icon size={20} className="mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );
}

// Canvas Sortable Node
function CanvasNode({ node }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const { selectNode, selectedId, deleteNode } = useBuilderStore();
  const isSelected = selectedId === node.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
      className={`relative p-4 mb-2 bg-white border-2 rounded group cursor-pointer ${isSelected ? 'border-gold shadow-md' : 'border-transparent hover:border-gray-300 shadow-sm'}`}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 cursor-pointer hover:bg-red-600 z-20" onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}>
          <Trash2 size={14} />
        </div>
      )}
      {node.type === 'heading' && <h1 className="text-3xl font-bold font-serif">{node.props.text || 'Heading'}</h1>}
      {node.type === 'text' && <p className="text-gray-600">{node.props.text || 'Text block'}</p>}
      {node.type === 'button' && <button className="bg-navy text-white px-6 py-2 rounded font-medium">{node.props.text || 'Button'}</button>}
      {node.type === 'image' && <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-500 rounded"><ImageIcon size={32} /></div>}
    </div>
  );
}

// Main Canvas Area
function Canvas() {
  const { nodes, selectNode } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div 
      ref={setNodeRef} 
      onClick={() => selectNode(null)}
      className={`w-full max-w-4xl min-h-[600px] bg-gray-50 p-8 shadow-sm ring-1 ${isOver ? 'ring-gold bg-blue-50/50' : 'ring-gray-200'} transition-colors`}
    >
      {nodes.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <p className="mb-2">Drag elements here to start building.</p>
        </div>
      ) : (
        <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
          {nodes.map(node => <CanvasNode key={node.id} node={node} />)}
        </SortableContext>
      )}
    </div>
  );
}

function App() {
  const { addNode, moveNode, selectedId, nodes } = useBuilderStore();
  const { publish, isPublishing, message } = usePublish();
  const [activeDragId, setActiveDragId] = useState(null);

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    if (active.data.current?.isSidebarElement && over.id === 'canvas') {
      addNode({ type: active.data.current.type, props: {} });
    } else if (!active.data.current?.isSidebarElement && active.id !== over.id) {
      moveNode(active.id, over.id);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen bg-gray-100 text-gray-900 overflow-hidden font-sans">
        
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-4 border-b border-gray-200">
            <h1 className="font-bold text-navy flex items-center gap-2">
              <Layout size={20} className="text-gold" />
              Visual Builder
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Elements</h2>
            <div className="grid grid-cols-2 gap-2">
              <SidebarItem type="heading" icon={Type} label="Heading" />
              <SidebarItem type="text" icon={Layers} label="Text" />
              <SidebarItem type="image" icon={ImageIcon} label="Image" />
              <SidebarItem type="button" icon={Box} label="Button" />
            </div>
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col">
          <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
            <div className="flex gap-2">
              <button className="p-2 bg-gray-100 text-navy rounded"><MousePointer2 size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              {message && <span className="text-sm font-medium text-gold">{message}</span>}
              <span className="text-sm text-gray-500">Draft saved</span>
              <button onClick={publish} disabled={isPublishing} className="bg-navy text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50">
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center pt-8 pb-32">
            <Canvas />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Settings size={16} />
              Inspector
            </h2>
          </div>
          <div className="p-4">
            {selectedNode ? (
              <div>
                <h3 className="font-medium text-navy mb-4 capitalize">{selectedNode.type} Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Text Content</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-200 rounded p-2 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                      placeholder="Enter text..."
                      value={selectedNode.props.text || ''}
                      onChange={(e) => useBuilderStore.getState().updateNode(selectedId, { props: { ...selectedNode.props, text: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center mt-10">
                Select an element to edit.
              </div>
            )}
          </div>
        </div>

        {/* DRAG OVERLAY */}
        <DragOverlay>
          {activeDragId ? (
             <div className="p-3 bg-white border border-gold rounded shadow-lg flex items-center gap-2 text-navy opacity-80">
               <MousePointer2 size={16} /> Dragging element...
             </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}

export default App;

// @ts-nocheck
import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layout, MousePointer2, Type, Image as ImageIcon, Box, Layers, Settings, Trash2, FileText, Component as CompIcon, Plus, Save } from 'lucide-react';
import { useBuilderStore } from './store/useBuilderStore';
import { usePublish } from './usePublish';
import { useApi } from './useApi';

// Sidebar Draggable Element
function SidebarItem({ id, type, icon: Icon, label, ref_id = undefined }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${id || type}`,
    data: { isSidebarElement: true, type, ref_id }
  });

  return (
    <button 
      ref={setNodeRef} {...listeners} {...attributes}
      className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors z-10 cursor-grab"
    >
      <Icon size={20} className="mb-1" />
      <span className="text-xs text-center">{label}</span>
    </button>
  );
}

// Canvas Sortable Node
function CanvasNode({ node }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const { selectNode, selectedId, deleteNode } = useBuilderStore();
  const isSelected = selectedId === node.id;

  const style = { transform: CSS.Transform.toString(transform), transition };

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
      {node.type === 'global_component' && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center text-blue-800 flex flex-col items-center justify-center">
          <CompIcon size={24} className="mb-2 text-blue-500" />
          <span className="font-medium">Global Component Ref: {node.ref_id}</span>
          <span className="text-xs text-blue-400 mt-1">Edit in Components Tab to see changes everywhere</span>
        </div>
      )}
      {node.type === 'heading' && <h1 className="text-3xl font-bold font-serif">{node.props.text || 'Heading'}</h1>}
      {node.type === 'text' && <p className="text-gray-600">{node.props.text || 'Text block'}</p>}
      {node.type === 'button' && <button className="bg-navy text-white px-6 py-2 rounded font-medium">{node.props.text || 'Button'}</button>}
      {node.type === 'image' && <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-500 rounded"><ImageIcon size={32} /></div>}
    </div>
  );
}

function Canvas() {
  const { nodes, selectNode } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div 
      ref={setNodeRef} onClick={() => selectNode(null)}
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
  const { addNode, moveNode, selectedId, nodes, pages, globalComponents, pageId, pageTitle } = useBuilderStore();
  const { publish, isPublishing, message } = usePublish();
  const { loadPage, createPage, saveComponent } = useApi();
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeTab, setActiveTab] = useState('elements'); // elements, pages, components

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    if (active.data.current?.isSidebarElement && over.id === 'canvas') {
      addNode({ 
        type: active.data.current.type, 
        props: {}, 
        ref_id: active.data.current.ref_id 
      });
    } else if (!active.data.current?.isSidebarElement && active.id !== over.id) {
      moveNode(active.id, over.id);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <DndContext onDragStart={(e) => setActiveDragId(e.active.id)} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen bg-gray-100 text-gray-900 overflow-hidden font-sans">
        
        {/* LEFT SIDEBAR */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="font-bold text-navy flex items-center gap-2">
              <Layout size={20} className="text-gold" />
              Visual Builder
            </h1>
          </div>
          
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('elements')} className={`flex-1 py-2 text-xs font-medium ${activeTab==='elements'?'border-b-2 border-gold text-navy':'text-gray-500'}`}>Elements</button>
            <button onClick={() => setActiveTab('pages')} className={`flex-1 py-2 text-xs font-medium ${activeTab==='pages'?'border-b-2 border-gold text-navy':'text-gray-500'}`}>Pages</button>
            <button onClick={() => setActiveTab('components')} className={`flex-1 py-2 text-xs font-medium ${activeTab==='components'?'border-b-2 border-gold text-navy':'text-gray-500'}`}>Globals</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'elements' && (
              <div className="grid grid-cols-2 gap-2">
                <SidebarItem type="heading" icon={Type} label="Heading" />
                <SidebarItem type="text" icon={Layers} label="Text" />
                <SidebarItem type="image" icon={ImageIcon} label="Image" />
                <SidebarItem type="button" icon={Box} label="Button" />
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const title = prompt("Page Title?");
                    const slug = prompt("URL Slug? (e.g. /about)");
                    if (title && slug) createPage(title, slug);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-navy text-white rounded text-sm mb-4"
                ><Plus size={16}/> New Page</button>
                {pages.map(p => (
                  <div key={p.id} onClick={() => loadPage(p.id)} className={`p-3 rounded border cursor-pointer flex items-center gap-2 ${pageId === p.id ? 'border-gold bg-yellow-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'components' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-4">Drag global components onto the canvas. Editing them updates all pages.</p>
                {globalComponents.map(c => (
                  <SidebarItem key={c.id} id={c.id} type="global_component" ref_id={c.id} icon={CompIcon} label={c.name} />
                ))}
                {globalComponents.length === 0 && <div className="text-sm text-gray-400 text-center mt-4">No global components saved yet.</div>}
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col">
          <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">Editing: {pageTitle}</span>
            </div>
            <div className="flex items-center gap-4">
              {message && <span className="text-sm font-medium text-gold">{message}</span>}
              <button onClick={publish} disabled={isPublishing} className="bg-navy text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50">
                {isPublishing ? "Publishing..." : "Publish Page"}
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
                {selectedNode.type !== 'global_component' && (
                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Text Content</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-200 rounded p-2 text-sm focus:border-gold focus:ring-1 outline-none"
                        value={selectedNode.props.text || ''}
                        onChange={(e) => useBuilderStore.getState().updateNode(selectedId, { props: { ...selectedNode.props, text: e.target.value } })}
                      />
                    </div>
                  </div>
                )}
                
                {selectedNode.type !== 'global_component' && (
                  <button 
                    onClick={() => {
                      const name = prompt("Name this global component? (e.g. Main Header)");
                      if (name) saveComponent(name, [selectedNode]);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition"
                  >
                    <Save size={16}/> Save as Global Component
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-400 text-center mt-10">Select an element to edit.</div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeDragId ? (
             <div className="p-3 bg-white border border-gold rounded shadow-lg flex items-center gap-2 text-navy opacity-80">
               <MousePointer2 size={16} /> Dragging...
             </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}

export default App;

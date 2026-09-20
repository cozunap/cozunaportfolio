// @ts-nocheck
import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Layout, MousePointer2, Type, Image as ImageIcon, Box, Layers, 
  Settings, Trash2, FileText, Component as CompIcon, Plus, Save,
  Square, Columns, Minus, ArrowDownUp, Video, MapPin, Star, AlignLeft,
  ChevronDown, ChevronRight
} from 'lucide-react';
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
      className="flex flex-col items-center justify-center p-3 bg-white rounded border border-gray-100 shadow-sm hover:border-gold hover:text-gold transition-colors z-10 cursor-grab"
    >
      <Icon size={20} className="mb-2 text-gray-500 group-hover:text-gold" />
      <span className="text-[10px] font-medium text-center uppercase tracking-wider text-gray-600">{label}</span>
    </button>
  );
}

// Sidebar Category Accordion
function SidebarCategory({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 bg-gray-50 border-y border-gray-100 text-xs font-bold uppercase tracking-wider text-navy"
      >
        {title}
        {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
      </button>
      {isOpen && <div className="p-3 grid grid-cols-2 gap-2 bg-white">{children}</div>}
    </div>
  );
}

// Canvas Sortable Node
function CanvasNode({ node }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const { selectNode, selectedId, deleteNode } = useBuilderStore();
  const isSelected = selectedId === node.id;

  const style = { transform: CSS.Transform.toString(transform), transition };

  const renderContent = () => {
    switch (node.type) {
      case 'heading': return <h1 className="text-4xl font-bold font-serif text-navy">{node.props.text}</h1>;
      case 'text': return <p className="text-gray-600">{node.props.text}</p>;
      case 'button': return <button className="bg-navy text-white px-6 py-2 rounded font-medium shadow-md">{node.props.text}</button>;
      case 'image': return <div className="bg-gray-100 border-2 border-dashed border-gray-300 h-48 w-full flex items-center justify-center text-gray-400 rounded-lg"><ImageIcon size={48} className="opacity-50"/></div>;
      case 'spacer': return <div style={{ height: `${node.props.height}px` }} className="w-full bg-blue-50/30 border border-blue-100 border-dashed flex items-center justify-center text-xs text-blue-300">Spacer ({node.props.height}px)</div>;
      case 'divider': return <hr style={{ borderColor: node.props.color, borderWidth: `${node.props.thickness}px` }} className="w-full my-4" />;
      case 'video': return <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center"><Video size={48} className="text-white opacity-50"/></div>;
      case 'map': return <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center flex-col text-gray-500"><MapPin size={32} className="mb-2"/>Map: {node.props.address}</div>;
      case 'icon': return <div className="flex items-center justify-center p-4"><Star size={node.props.size} color={node.props.color} /></div>;
      case 'image_box': return (
        <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm bg-white">
          <div className="w-full h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400"><ImageIcon/></div>
          <h3 className="font-serif font-bold text-xl text-navy mb-2">{node.props.title}</h3>
          <p className="text-gray-500 text-sm">{node.props.description}</p>
        </div>
      );
      case 'container': return <div style={{ padding: `${node.props.padding}px`, backgroundColor: node.props.bgColor }} className="w-full min-h-[100px] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">Empty Container</div>;
      case 'grid': return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns}, 1fr)`, gap: `${node.props.gap}px` }} className="w-full">
          {Array.from({length: node.props.columns}).map((_, i) => (
            <div key={i} className="bg-gray-50 border border-dashed border-gray-300 min-h-[100px] rounded flex items-center justify-center text-xs text-gray-400">Col {i+1}</div>
          ))}
        </div>
      );
      case 'global_component': return (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center text-blue-800 flex flex-col items-center justify-center">
          <CompIcon size={24} className="mb-2 text-blue-500" />
          <span className="font-medium">Global Component Ref: {node.ref_id}</span>
        </div>
      );
      default: return <div className="p-4 bg-red-50 text-red-500 border border-red-200">Unknown Element</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
      className={`relative mb-4 group cursor-pointer border-2 ${isSelected ? 'border-gold ring-4 ring-gold/20' : 'border-transparent hover:border-gray-200'} transition-all duration-200`}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-red-600 hover:scale-110 transition-transform z-20" onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}>
          <Trash2 size={14} />
        </div>
      )}
      <div className={isSelected ? 'pointer-events-none' : ''}>
        {renderContent()}
      </div>
    </div>
  );
}

function Canvas() {
  const { nodes, selectNode } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <div 
      ref={setNodeRef} onClick={() => selectNode(null)}
      className={`w-full max-w-5xl min-h-[800px] bg-white mx-auto shadow-xl ring-1 ${isOver ? 'ring-gold bg-blue-50/10' : 'ring-gray-200'} transition-colors`}
    >
      {nodes.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center">
            <Plus size={32} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Drag elements here</p>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
            {nodes.map(node => <CanvasNode key={node.id} node={node} />)}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// Main App
function App() {
  const { addNode, moveNode, selectedId, nodes, pages, globalComponents, pageId, pageTitle, updateNodeProp } = useBuilderStore();
  const { publish, isPublishing, message } = usePublish();
  const { loadPage, createPage, saveComponent } = useApi();
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeTab, setActiveTab] = useState('elements'); 

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    if (active.data.current?.isSidebarElement && over.id === 'canvas') {
      addNode({ type: active.data.current.type, props: {}, ref_id: active.data.current.ref_id });
    } else if (!active.data.current?.isSidebarElement && active.id !== over.id) {
      moveNode(active.id, over.id);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <DndContext onDragStart={(e) => setActiveDragId(e.active.id)} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen bg-[#f3f4f6] text-gray-900 overflow-hidden font-sans">
        
        {/* LEFT SIDEBAR */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-navy text-white">
            <h1 className="font-bold flex items-center gap-2">
              <Layout size={20} className="text-gold" />
              Visual Builder
            </h1>
          </div>
          
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('elements')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab==='elements'?'border-b-2 border-gold text-navy':'text-gray-500 hover:bg-gray-50'}`}>Elements</button>
            <button onClick={() => setActiveTab('pages')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab==='pages'?'border-b-2 border-gold text-navy':'text-gray-500 hover:bg-gray-50'}`}>Pages</button>
            <button onClick={() => setActiveTab('components')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab==='components'?'border-b-2 border-gold text-navy':'text-gray-500 hover:bg-gray-50'}`}>Globals</button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {activeTab === 'elements' && (
              <div>
                <SidebarCategory title="Layout" defaultOpen={true}>
                  <SidebarItem type="container" icon={Square} label="Container" />
                  <SidebarItem type="grid" icon={Columns} label="Grid" />
                  <SidebarItem type="spacer" icon={ArrowDownUp} label="Spacer" />
                  <SidebarItem type="divider" icon={Minus} label="Divider" />
                </SidebarCategory>
                
                <SidebarCategory title="Basic" defaultOpen={true}>
                  <SidebarItem type="heading" icon={Type} label="Heading" />
                  <SidebarItem type="text" icon={AlignLeft} label="Text" />
                  <SidebarItem type="image" icon={ImageIcon} label="Image" />
                  <SidebarItem type="button" icon={Box} label="Button" />
                  <SidebarItem type="icon" icon={Star} label="Icon" />
                  <SidebarItem type="image_box" icon={Layers} label="Image Box" />
                </SidebarCategory>

                <SidebarCategory title="Media" defaultOpen={false}>
                  <SidebarItem type="video" icon={Video} label="Video" />
                  <SidebarItem type="map" icon={MapPin} label="Google Maps" />
                </SidebarCategory>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => {
                    const title = prompt("Page Title?");
                    const slug = prompt("URL Slug? (e.g. /about)");
                    if (title && slug) createPage(title, slug);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-navy hover:bg-navy/90 text-white font-medium rounded-lg text-sm mb-4 transition-colors shadow-sm"
                ><Plus size={16}/> Create New Page</button>
                {pages.map(p => (
                  <div key={p.id} onClick={() => loadPage(p.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${pageId === p.id ? 'border-gold bg-yellow-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <FileText size={18} className={pageId === p.id ? "text-gold" : "text-gray-400"} />
                    <div>
                      <div className="text-sm font-bold text-navy">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'components' && (
              <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500 mb-4 leading-relaxed bg-gray-50 p-3 rounded">Drag global components onto the canvas. Editing them updates all pages.</p>
                <div className="grid grid-cols-2 gap-2">
                  {globalComponents.map(c => (
                    <SidebarItem key={c.id} id={c.id} type="global_component" ref_id={c.id} icon={CompIcon} label={c.name} />
                  ))}
                </div>
                {globalComponents.length === 0 && <div className="text-sm text-gray-400 text-center mt-4">No global components saved yet.</div>}
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col relative h-full">
          <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="font-bold text-navy bg-gray-100 px-4 py-1.5 rounded-full text-sm">Editing: {pageTitle}</span>
            </div>
            <div className="flex items-center gap-4">
              {message && <span className="text-sm font-medium text-gold">{message}</span>}
              <button onClick={publish} disabled={isPublishing} className="bg-navy text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gold transition-colors disabled:opacity-50 shadow-md">
                {isPublishing ? "Publishing..." : "Publish Page"}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-32 w-full h-full">
            <Canvas />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-gray-50">
            <h2 className="font-bold text-navy flex items-center gap-2 text-sm uppercase tracking-wider">
              <Settings size={16} />
              Inspector
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {selectedNode ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy uppercase tracking-wider text-sm">{selectedNode.type.replace('_', ' ')}</h3>
                </div>

                {selectedNode.type !== 'global_component' && (
                  <div className="space-y-5 mb-8">
                    {/* Dynamic Property Controls based on type */}
                    {(selectedNode.props.text !== undefined) && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content</label>
                        <textarea 
                          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-gold focus:ring-1 outline-none min-h-[80px]"
                          value={selectedNode.props.text}
                          onChange={(e) => updateNodeProp(selectedId, 'text', e.target.value)}
                        />
                      </div>
                    )}

                    {(selectedNode.props.height !== undefined) && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Height ({selectedNode.props.height}px)</label>
                        <input type="range" min="10" max="200" value={selectedNode.props.height} onChange={(e) => updateNodeProp(selectedId, 'height', parseInt(e.target.value))} className="w-full accent-gold"/>
                      </div>
                    )}

                    {(selectedNode.props.thickness !== undefined) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                          <input type="color" value={selectedNode.props.color} onChange={(e) => updateNodeProp(selectedId, 'color', e.target.value)} className="w-full h-8 cursor-pointer rounded"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thickness</label>
                          <input type="number" min="1" max="10" value={selectedNode.props.thickness} onChange={(e) => updateNodeProp(selectedId, 'thickness', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/>
                        </div>
                      </div>
                    )}

                    {(selectedNode.props.columns !== undefined) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Columns</label>
                          <input type="number" min="1" max="6" value={selectedNode.props.columns} onChange={(e) => updateNodeProp(selectedId, 'columns', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gap (px)</label>
                          <input type="number" min="0" max="64" value={selectedNode.props.gap} onChange={(e) => updateNodeProp(selectedId, 'gap', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/>
                        </div>
                      </div>
                    )}

                    {(selectedNode.props.padding !== undefined) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Padding (px)</label>
                          <input type="number" min="0" max="120" value={selectedNode.props.padding} onChange={(e) => updateNodeProp(selectedId, 'padding', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background</label>
                          <input type="color" value={selectedNode.props.bgColor} onChange={(e) => updateNodeProp(selectedId, 'bgColor', e.target.value)} className="w-full h-8 cursor-pointer rounded"/>
                        </div>
                      </div>
                    )}

                    {(selectedNode.type === 'image_box') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                          <input type="text" value={selectedNode.props.title} onChange={(e) => updateNodeProp(selectedId, 'title', e.target.value)} className="w-full border border-gray-200 p-2 text-sm rounded outline-none focus:border-gold"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                          <textarea value={selectedNode.props.description} onChange={(e) => updateNodeProp(selectedId, 'description', e.target.value)} className="w-full border border-gray-200 p-2 text-sm rounded outline-none focus:border-gold min-h-[60px]"/>
                        </div>
                      </>
                    )}

                    {(selectedNode.type === 'video' || selectedNode.type === 'map') && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{selectedNode.type === 'video' ? 'Video URL' : 'Address'}</label>
                        <input type="text" value={selectedNode.props.url || selectedNode.props.address} onChange={(e) => updateNodeProp(selectedId, selectedNode.type === 'video' ? 'url' : 'address', e.target.value)} className="w-full border border-gray-200 p-2 text-sm rounded outline-none focus:border-gold"/>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedNode.type !== 'global_component' && (
                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        const name = prompt("Name this global component? (e.g. Main Header)");
                        if (name) saveComponent(name, [selectedNode]);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gold hover:text-white text-navy font-medium rounded-lg text-sm transition-colors border border-gray-200 hover:border-gold"
                    >
                      <Save size={16}/> Save as Global Component
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <Settings size={32} className="mb-4 text-gray-200" />
                <p className="text-sm font-medium">Select an element on the canvas to view and edit its properties.</p>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeDragId ? (
             <div className="p-3 bg-navy border border-gold rounded-lg shadow-xl flex items-center gap-3 text-white">
               <MousePointer2 size={16} className="text-gold" /> Dragging Element
             </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}

export default App;

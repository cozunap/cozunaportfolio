// @ts-nocheck
import React, { useState } from 'react';
import { 
  DndContext, DragOverlay, useDraggable, useDroppable, pointerWithin,
  useSensor, useSensors, PointerSensor 
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Layout, MousePointer2, Type, Image as ImageIcon, Box, Layers, 
  Settings, Trash2, FileText, Component as CompIcon, Plus, Save,
  Square, Columns, Minus, ArrowDownUp, Video, MapPin, Star, AlignLeft,
  ChevronDown, ChevronRight, X, AlignCenter, AlignRight
} from 'lucide-react';
import { useBuilderStore } from './store/useBuilderStore';
import { usePublish } from './usePublish';
import { useApi } from './useApi';

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

function DropZone({ id, children, className, style = {} }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={style} className={`${className} transition-colors ${isOver ? 'ring-2 ring-gold bg-gold/5' : ''}`}>
      {children}
    </div>
  );
}

function CanvasNode({ node, isNested = false }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
  const { selectNode, selectedId, deleteNode, nodes } = useBuilderStore();
  const isSelected = selectedId === node.id;

  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    textAlign: node.props.textAlign || 'left',
    marginTop: `${node.props.marginTop || 0}px`,
    marginBottom: `${node.props.marginBottom || 0}px`,
    marginLeft: `${node.props.marginLeft || 0}px`,
    marginRight: `${node.props.marginRight || 0}px`,
    paddingTop: `${node.props.paddingTop || 0}px`,
    paddingBottom: `${node.props.paddingBottom || 0}px`,
    paddingLeft: `${node.props.paddingLeft || 0}px`,
    paddingRight: `${node.props.paddingRight || 0}px`,
    backgroundColor: node.props.bgColor || 'transparent',
    width: node.props.width || '100%',
    minHeight: node.props.height || undefined,
  };

  const childrenNodes = nodes.filter(n => n.parentId === node.id);

  const renderContent = () => {
    switch (node.type) {
      case 'heading': return <h1 className="text-4xl font-bold font-serif text-navy">{node.props.text}</h1>;
      case 'text': return <p className="text-gray-600 whitespace-pre-wrap">{node.props.text}</p>;
      case 'button': return <button className="bg-navy text-white px-6 py-2 rounded font-medium shadow-md inline-block">{node.props.text}</button>;
      case 'image': return (
        <div className="w-full flex justify-center">
          {node.props.url ? (
            <img src={node.props.url} alt="User placed" className="max-w-full h-auto rounded-lg shadow-sm" />
          ) : (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 h-48 w-full flex items-center justify-center text-gray-400 rounded-lg"><ImageIcon size={48} className="opacity-50"/></div>
          )}
        </div>
      );
      case 'spacer': return <div style={{ height: `${node.props.height}px` }} className="w-full block"></div>;
      case 'divider': return <hr style={{ borderColor: node.props.color, borderWidth: `${node.props.thickness}px` }} className="w-full" />;
      case 'video': {
        const isMp4 = node.props.url && (node.props.url.endsWith('.mp4') || node.props.url.includes('jsdelivr'));
        return (
          <div className="w-full relative">
             {/* CRITICAL: This invisible overlay prevents the iframe/video player from swallowing clicks! */}
             <div className="absolute inset-0 z-10 cursor-pointer"></div>
             
             {node.props.url ? (
               <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md bg-black">
                 {isMp4 ? (
                   <video src={node.props.url} className="w-full h-full object-cover" controls muted />
                 ) : (
                   <iframe src={node.props.url} className="w-full h-full pointer-events-none" frameBorder="0" allowFullScreen></iframe>
                 )}
               </div>
             ) : (
               <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center"><Video size={48} className="text-white opacity-50"/></div>
             )}
          </div>
        );
      }
      case 'map': return (
        <div className="w-full relative">
          <div className="absolute inset-0 z-10 cursor-pointer"></div>
          {node.props.address ? (
            <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(node.props.address)}&output=embed`} 
                className="w-full h-full pointer-events-none" 
                frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center flex-col text-gray-500">
              <MapPin size={32} className="mb-2"/>Enter Address in Inspector
            </div>
          )}
        </div>
      );
      case 'icon': return <div className="inline-flex items-center justify-center"><Star size={node.props.size} color={node.props.color} /></div>;
      case 'image_box': return (
        <div className="text-center p-4 border border-gray-100 rounded-lg shadow-sm bg-white">
          {node.props.url ? (
            <img src={node.props.url} className="w-full h-auto object-cover rounded mb-4" />
          ) : (
            <div className="w-full h-32 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400"><ImageIcon/></div>
          )}
          <h3 className="font-serif font-bold text-xl text-navy mb-2">{node.props.title}</h3>
          <p className="text-gray-500 text-sm">{node.props.description}</p>
        </div>
      );
      case 'container': return (
        <DropZone id={node.id} className="w-full min-h-[100px] border border-dashed border-gray-300">
          {childrenNodes.length === 0 && <div className="text-gray-400 text-center text-sm p-4 pointer-events-none">Drop elements here</div>}
          {childrenNodes.map(child => <CanvasNode key={child.id} node={child} isNested={true} />)}
        </DropZone>
      );
      case 'grid': return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns}, 1fr)`, gap: `${node.props.gap}px` }} className="w-full">
          {Array.from({length: node.props.columns}).map((_, i) => {
            const colId = `${node.id}-col-${i}`;
            const colNodes = nodes.filter(n => n.parentId === colId);
            return (
              <DropZone key={i} id={colId} className="bg-gray-50 border border-dashed border-gray-300 min-h-[100px] rounded p-2 flex flex-col">
                 {colNodes.length === 0 && <div className="text-xs text-gray-400 text-center my-auto pointer-events-none">Col {i+1}</div>}
                 {colNodes.map(child => <CanvasNode key={child.id} node={child} isNested={true} />)}
              </DropZone>
            );
          })}
        </div>
      );
      case 'global_component': return (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center text-blue-800 flex flex-col items-center justify-center">
          <CompIcon size={24} className="mb-2 text-blue-500" />
          <span className="font-medium">Global Component Ref: {node.ref_id}</span>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...listeners}
      onPointerDown={(e) => { e.stopPropagation(); selectNode(node.id); }}
      className={`relative group cursor-pointer border-2 ${isSelected ? 'border-gold ring-2 ring-gold/20' : 'border-transparent hover:border-blue-200'} transition-all duration-200`}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-red-600 hover:scale-110 transition-transform z-20" onPointerDown={(e) => { e.stopPropagation(); deleteNode(node.id); }}>
          <Trash2 size={14} />
        </div>
      )}
      <div className={isSelected ? 'pointer-events-none w-full' : 'w-full'}>
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  const { addNode, moveNode, updateNode, selectedId, nodes, pages, globalComponents, pageId, pageTitle, updateNodeProp } = useBuilderStore();
  const { publish, isPublishing, message } = usePublish();
  const { loadPage, createPage, saveComponent, uploadMedia, uploading } = useApi();
  
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeTab, setActiveTab] = useState('elements'); 
  const [showPageModal, setShowPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Important: Fixes the dnd-kit click swallowing bug
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const rootNodes = nodes.filter(n => !n.parentId);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const isSidebar = active.data.current?.isSidebarElement;
    let targetParentId = null;
    if (over.id !== 'canvas') {
      const targetNode = nodes.find(n => n.id === over.id);
      if (targetNode && targetNode.type === 'container') targetParentId = targetNode.id;
      else if (String(over.id).includes('-col-')) targetParentId = String(over.id);
      else if (targetNode && targetNode.parentId) targetParentId = targetNode.parentId;
    }

    if (isSidebar) {
      addNode({ type: active.data.current.type, props: {}, ref_id: active.data.current.ref_id, parentId: targetParentId });
    } else {
      if (active.id !== over.id) {
        updateNode(active.id, { parentId: targetParentId });
        moveNode(active.id, over.id);
      }
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={(e) => setActiveDragId(e.active.id)} onDragEnd={handleDragEnd}>
      <div className="flex h-screen w-screen bg-[#f3f4f6] text-gray-900 overflow-hidden font-sans">
        
        {/* LEFT SIDEBAR */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg z-20">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-navy text-white">
            <h1 className="font-bold flex items-center gap-2"><Layout size={20} className="text-gold" /> Visual Builder</h1>
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
                <button onClick={() => setShowPageModal(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-navy hover:bg-navy/90 text-white font-medium rounded-lg text-sm mb-4 transition-colors shadow-sm"><Plus size={16}/> Create New Page</button>
                {pages.map(p => (
                  <div key={p.id} onClick={() => loadPage(p.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${pageId === p.id ? 'border-gold bg-yellow-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <FileText size={18} className={pageId === p.id ? "text-gold" : "text-gray-400"} />
                    <div><div className="text-sm font-bold text-navy">{p.title}</div><div className="text-xs text-gray-500">{p.slug}</div></div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'components' && (
              <div className="p-4 space-y-2">
                <p className="text-xs text-gray-500 mb-4 leading-relaxed bg-gray-50 p-3 rounded">Drag global components onto the canvas. Editing them updates all pages.</p>
                <div className="grid grid-cols-2 gap-2">
                  {globalComponents.map(c => <SidebarItem key={c.id} id={c.id} type="global_component" ref_id={c.id} icon={CompIcon} label={c.name} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex flex-col relative h-full">
          <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
            <div className="flex items-center gap-4"><span className="font-bold text-navy bg-gray-100 px-4 py-1.5 rounded-full text-sm">Editing: {pageTitle}</span></div>
            <div className="flex items-center gap-4">
              {message && <span className="text-sm font-medium text-gold">{message}</span>}
              <button onClick={publish} disabled={isPublishing} className="bg-navy text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gold transition-colors shadow-md">{isPublishing ? "Publishing..." : "Publish Page"}</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-32 w-full h-full" onPointerDown={() => useBuilderStore.getState().selectNode(null)}>
             <DropZone id="canvas" className="w-full max-w-5xl min-h-[800px] bg-white mx-auto shadow-xl ring-1 ring-gray-200 p-8">
                {rootNodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center">
                      <Plus size={32} className="mb-4 text-gray-300" /><p className="text-lg font-medium text-gray-500">Drag elements here</p>
                    </div>
                  </div>
                ) : (
                  <SortableContext items={rootNodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                    {rootNodes.map(node => <CanvasNode key={node.id} node={node} />)}
                  </SortableContext>
                )}
             </DropZone>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20">
          <div className="h-14 border-b border-gray-200 flex items-center px-4 bg-gray-50">
            <h2 className="font-bold text-navy flex items-center gap-2 text-sm uppercase tracking-wider"><Settings size={16} /> Inspector</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {selectedNode ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200 pb-10">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-navy uppercase tracking-wider text-sm">{selectedNode.type.replace('_', ' ')}</h3>
                </div>

                {selectedNode.type !== 'global_component' && (
                  <div className="space-y-6">
                    {/* Content Section */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Content</h4>
                      <div className="space-y-4">
                        {(selectedNode.props.text !== undefined) && (
                          <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-gold outline-none min-h-[80px]" value={selectedNode.props.text} onChange={(e) => updateNodeProp(selectedId, 'text', e.target.value)} />
                        )}
                        {(selectedNode.props.height !== undefined) && (
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Height ({selectedNode.props.height}px)</label>
                            <input type="range" min="10" max="200" value={selectedNode.props.height} onChange={(e) => updateNodeProp(selectedId, 'height', parseInt(e.target.value))} className="w-full accent-gold"/>
                          </div>
                        )}
                        {(selectedNode.props.thickness !== undefined) && (
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Color</label><input type="color" value={selectedNode.props.color} onChange={(e) => updateNodeProp(selectedId, 'color', e.target.value)} className="w-full h-8 cursor-pointer rounded"/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Thickness</label><input type="number" min="1" max="10" value={selectedNode.props.thickness} onChange={(e) => updateNodeProp(selectedId, 'thickness', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/></div>
                          </div>
                        )}
                        {(selectedNode.props.columns !== undefined) && (
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Columns</label><input type="number" min="1" max="6" value={selectedNode.props.columns} onChange={(e) => updateNodeProp(selectedId, 'columns', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Gap (px)</label><input type="number" min="0" max="64" value={selectedNode.props.gap} onChange={(e) => updateNodeProp(selectedId, 'gap', parseInt(e.target.value))} className="w-full border border-gray-200 p-2 text-sm rounded"/></div>
                          </div>
                        )}
                        
                        {/* Media URL / Upload fields */}
                        {(selectedNode.type === 'image' || selectedNode.type === 'image_box' || selectedNode.type === 'video' || selectedNode.type === 'map') && (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Media Source</label>
                            
                            {(selectedNode.type === 'image' || selectedNode.type === 'image_box' || selectedNode.type === 'video') && (
                              <div className="mb-3">
                                <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gold/5 hover:border-gold cursor-pointer transition-colors">
                                  <span className="text-sm font-medium text-navy">{uploading ? 'Uploading to GitHub...' : (selectedNode.type === 'video' ? 'Upload MP4 Video' : 'Upload Image')}</span>
                                  <input 
                                    type="file" 
                                    accept={selectedNode.type === 'video' ? "video/mp4,video/webm" : "image/*"} 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const url = await uploadMedia(file);
                                        if (url) updateNodeProp(selectedId, 'url', url);
                                      }
                                    }} 
                                    disabled={uploading}
                                  />
                                </label>
                              </div>
                            )}

                            <input type="text" value={selectedNode.props.url || selectedNode.props.address || ''} onChange={(e) => updateNodeProp(selectedId, selectedNode.type === 'map' ? 'address' : 'url', e.target.value)} placeholder="Or paste YouTube / Image Link..." className="w-full border border-gray-200 p-2 text-sm rounded outline-none focus:border-gold"/>
                            <span className="text-[10px] text-gray-400 mt-1 block">Paste an image link or YouTube embed link</span>
                          </div>
                        )}

                        {(selectedNode.type === 'image_box') && (
                          <>
                            <input type="text" value={selectedNode.props.title} onChange={(e) => updateNodeProp(selectedId, 'title', e.target.value)} className="w-full border border-gray-200 p-2 text-sm rounded outline-none" placeholder="Title"/>
                            <textarea value={selectedNode.props.description} onChange={(e) => updateNodeProp(selectedId, 'description', e.target.value)} className="w-full border border-gray-200 p-2 text-sm rounded outline-none min-h-[60px]" placeholder="Description"/>
                          </>
                        )}
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Advanced Styling Section */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Advanced Style</h4>
                      <div className="space-y-4">
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">Sizing</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[10px] text-gray-400 mb-1">WIDTH (e.g. 100%, 500px)</span>
                              <input type="text" value={selectedNode.props.width || ''} onChange={(e) => updateNodeProp(selectedId, 'width', e.target.value)} placeholder="100%" className="w-full border p-1.5 text-xs rounded outline-none focus:border-gold"/>
                            </div>
                            <div>
                              <span className="block text-[10px] text-gray-400 mb-1">MIN HEIGHT (e.g. 100vh, 300px)</span>
                              <input type="text" value={selectedNode.props.height || ''} onChange={(e) => updateNodeProp(selectedId, 'height', e.target.value)} placeholder="auto" className="w-full border p-1.5 text-xs rounded outline-none focus:border-gold"/>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">Alignment</label>
                          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateNodeProp(selectedId, 'textAlign', 'left')} className={`flex-1 py-1.5 flex justify-center ${selectedNode.props.textAlign === 'left' ? 'bg-navy text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><AlignLeft size={16}/></button>
                            <button onClick={() => updateNodeProp(selectedId, 'textAlign', 'center')} className={`flex-1 py-1.5 flex justify-center border-l border-r border-gray-200 ${selectedNode.props.textAlign === 'center' ? 'bg-navy text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><AlignCenter size={16}/></button>
                            <button onClick={() => updateNodeProp(selectedId, 'textAlign', 'right')} className={`flex-1 py-1.5 flex justify-center ${selectedNode.props.textAlign === 'right' ? 'bg-navy text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}><AlignRight size={16}/></button>
                          </div>
                        </div>

                        {selectedNode.props.bgColor !== undefined && (
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Background Color</label>
                            <div className="flex items-center gap-2">
                               <input type="color" value={selectedNode.props.bgColor} onChange={(e) => updateNodeProp(selectedId, 'bgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer"/>
                               <span className="text-xs text-gray-500 uppercase">{selectedNode.props.bgColor}</span>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">Margin (px)</label>
                          <div className="grid grid-cols-4 gap-2">
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">TOP</span><input type="number" value={selectedNode.props.marginTop || 0} onChange={(e) => updateNodeProp(selectedId, 'marginTop', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">RIGHT</span><input type="number" value={selectedNode.props.marginRight || 0} onChange={(e) => updateNodeProp(selectedId, 'marginRight', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">BTM</span><input type="number" value={selectedNode.props.marginBottom || 0} onChange={(e) => updateNodeProp(selectedId, 'marginBottom', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">LEFT</span><input type="number" value={selectedNode.props.marginLeft || 0} onChange={(e) => updateNodeProp(selectedId, 'marginLeft', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2">Padding (px)</label>
                          <div className="grid grid-cols-4 gap-2">
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">TOP</span><input type="number" value={selectedNode.props.paddingTop || 0} onChange={(e) => updateNodeProp(selectedId, 'paddingTop', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">RIGHT</span><input type="number" value={selectedNode.props.paddingRight || 0} onChange={(e) => updateNodeProp(selectedId, 'paddingRight', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">BTM</span><input type="number" value={selectedNode.props.paddingBottom || 0} onChange={(e) => updateNodeProp(selectedId, 'paddingBottom', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                            <div><span className="block text-[10px] text-gray-400 text-center mb-1">LEFT</span><input type="number" value={selectedNode.props.paddingLeft || 0} onChange={(e) => updateNodeProp(selectedId, 'paddingLeft', parseInt(e.target.value))} className="w-full border p-1.5 text-xs text-center rounded"/></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedNode.type !== 'global_component' && (
                  <div className="pt-6 border-t border-gray-100">
                    <button onClick={() => { const name = prompt("Name this global component? (e.g. Main Header)"); if (name) saveComponent(name, [selectedNode]); }} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gold hover:text-white text-navy font-medium rounded-lg text-sm transition-colors border border-gray-200 hover:border-gold">
                      <Save size={16}/> Save as Global Component
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <Settings size={32} className="mb-4 text-gray-200" />
                <p className="text-sm font-medium">Select an element on the canvas to edit its properties.</p>
              </div>
            )}
          </div>
        </div>

        {/* Page Modal */}
        {showPageModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-navy text-lg">Create New Page</h3>
                <button onClick={() => setShowPageModal(false)}><X size={20} className="text-gray-400"/></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Page Title</label><input type="text" value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-gold" placeholder="e.g. About Us" /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL Slug</label><input type="text" value={newPageSlug} onChange={e => setNewPageSlug(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-gold" placeholder="e.g. /about" /></div>
                <button onClick={async () => { if (newPageTitle && newPageSlug) { await createPage(newPageTitle, newPageSlug); setShowPageModal(false); setNewPageTitle(''); setNewPageSlug(''); } }} className="w-full bg-navy text-white p-3 rounded font-bold hover:bg-gold transition-colors mt-4">Create Page</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}

export default App;

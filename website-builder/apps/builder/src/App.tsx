import React from 'react';
import { Layout, MousePointer2, Type, Image as ImageIcon, Box, Layers, Settings } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 overflow-hidden">
      
      {/* LEFT SIDEBAR - Elements & Navigator */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-navy flex items-center gap-2">
            <Layout size={20} className="text-gold" />
            Visual Builder
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Elements</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors">
              <Type size={20} className="mb-1" />
              <span className="text-xs">Heading</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors">
              <ImageIcon size={20} className="mb-1" />
              <span className="text-xs">Image</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors">
              <Box size={20} className="mb-1" />
              <span className="text-xs">Button</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-gold hover:text-gold transition-colors">
              <Layers size={20} className="mb-1" />
              <span className="text-xs">Section</span>
            </button>
          </div>
        </div>
      </div>

      {/* CENTER - Live Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600"><MousePointer2 size={18} /></button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Draft saved</span>
            <button className="bg-navy text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-opacity-90 transition">
              Publish
            </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center">
          <div className="w-full max-w-4xl min-h-[600px] bg-white shadow-sm ring-1 ring-gray-200 flex flex-col items-center justify-center text-gray-400">
            <p className="mb-2">Drag elements here to start building.</p>
            <p className="text-sm">Canvas uses Page JSON architecture.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - Inspector & Styles */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Settings size={16} />
            Inspector
          </h2>
        </div>
        <div className="p-4 text-sm text-gray-500 text-center mt-10">
          Select an element on the canvas to edit its properties.
        </div>
      </div>

    </div>
  );
}

export default App;

import { Hono } from 'hono';
import type { FC } from 'hono/jsx';

type Bindings = { DB: D1Database; };
const app = new Hono<{ Bindings: Bindings }>();

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title || 'Premium Website'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{__html: `tailwind.config = { theme: { extend: { colors: { navy: '#0d1f3c', gold: '#b89a5a' }, fontFamily: { serif: ['"Playfair Display"', 'serif'], sans: ['Inter', 'sans-serif'] } } } }`}} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Inter', sans-serif; }`}} />
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const renderNode = (node: any, allNodes: any[], componentsMap: Record<string, any[]>) => {
  if (node.type === 'global_component') {
    const compNodes = componentsMap[node.ref_id] || [];
    return <div class="w-full">{compNodes.map((n: any) => renderNode(n, compNodes, componentsMap))}</div>;
  }
  
  const children = allNodes.filter(n => n.parentId === node.id);

  const styleObj = {
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

  const renderContent = () => {
    switch (node.type) {
      case 'heading': return <h1 style={styleObj} class="text-5xl font-bold font-serif text-navy">{node.props.text || 'Heading'}</h1>;
      case 'text': return <p style={styleObj} class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{node.props.text || 'Text block'}</p>;
      case 'button': return <div style={styleObj}><button class="bg-navy hover:bg-gold transition-colors text-white px-8 py-3 rounded font-medium shadow-md">{node.props.text || 'Button'}</button></div>;
      case 'image': return (
        <div style={styleObj} class="w-full flex justify-center">
          {node.props.url ? (
            <img src={node.props.url} alt="User placed" class="max-w-full h-auto rounded-lg shadow-sm" />
          ) : (
            <div class="bg-gray-200 h-64 w-full rounded flex items-center justify-center text-gray-500 shadow-inner">Image Placeholder</div>
          )}
        </div>
      );
      case 'spacer': return <div style={{...styleObj, height: `${node.props.height || 50}px`}} class="w-full block"></div>;
      case 'divider': return <div style={styleObj}><hr style={{ borderColor: node.props.color || '#e5e7eb', borderWidth: `${node.props.thickness || 1}px` }} class="w-full block" /></div>;
      case 'video': {
        const isMp4 = node.props.url && (node.props.url.endsWith('.mp4') || node.props.url.includes('jsdelivr'));
        return (
          <div style={styleObj} class="w-full">
             {node.props.url ? (
               <div class="w-full aspect-video rounded-lg overflow-hidden shadow-md bg-black">
                 {isMp4 ? (
                   <video src={node.props.url} class="w-full h-full object-cover" controls playsinline></video>
                 ) : (
                   <iframe src={node.props.url} class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                 )}
               </div>
             ) : (
               <div class="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white opacity-50">Video Placeholder</div>
             )}
          </div>
        );
      }
      case 'map': return (
        <div style={styleObj} class="w-full">
          {node.props.address ? (
            <div class="w-full h-96 rounded-lg overflow-hidden shadow-md">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(node.props.address)}&output=embed`} 
                class="w-full h-full" 
                frameborder="0" 
                allowfullscreen
              ></iframe>
            </div>
          ) : (
            <div class="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center flex-col text-gray-400 shadow-inner">
              Map Placeholder
            </div>
          )}
        </div>
      );
      case 'icon': return (
        <div style={styleObj} class="inline-flex items-center justify-center">
          <span style={{color: node.props.color || '#0d1f3c', fontSize: `${node.props.size || 24}px`}}>★</span>
        </div>
      );
      case 'image_box': return (
        <div style={styleObj} class="text-center border border-gray-100 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow p-8">
          {node.props.url ? (
            <img src={node.props.url} class="w-full h-auto object-cover rounded mb-4" />
          ) : (
            <div class="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center text-gray-400">Image Box Placeholder</div>
          )}
          <h3 class="font-serif font-bold text-2xl text-navy mb-3">{node.props.title || 'Title'}</h3>
          <p class="text-gray-600 text-base">{node.props.description || 'Description'}</p>
        </div>
      );
      case 'container': return (
        <div style={styleObj} class="w-full rounded-lg shadow-sm border border-gray-100">
          {children.map(child => renderNode(child, allNodes, componentsMap))}
        </div>
      );
      case 'grid': return (
        <div style={{ ...styleObj, display: 'grid', gridTemplateColumns: `repeat(${node.props.columns || 2}, 1fr)`, gap: `${node.props.gap || 16}px` }} class="w-full">
          {Array.from({length: node.props.columns || 2}).map((_, i) => {
             const colId = `${node.id}-col-${i}`;
             const colChildren = allNodes.filter(n => n.parentId === colId);
             return (
               <div class="flex flex-col">
                 {colChildren.map(child => renderNode(child, allNodes, componentsMap))}
               </div>
             );
          })}
        </div>
      );
      default: return null;
    }
  }

  return renderContent();
};

app.get('/*', async (c) => {
  let slug = c.req.path;
  if (!slug.startsWith('/')) slug = '/' + slug;

  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM pages WHERE site_id = ? AND slug = ?').bind('default-site', slug).all();
    if (!results || results.length === 0) {
      c.status(404);
      return c.html(
        <Layout title="404 Not Found">
          <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 class="text-4xl font-serif text-navy mb-4">404 - Page Not Found</h1>
            <p class="text-gray-500">There is no page published at {slug}</p>
          </div>
        </Layout>
      );
    }

    const page = results[0] as any;
    const nodes = JSON.parse(page.page_json || '[]');
    const rootNodes = nodes.filter((n: any) => !n.parentId);

    const { results: compResults } = await c.env.DB.prepare('SELECT * FROM components WHERE site_id = ?').bind('default-site').all();
    const componentsMap: Record<string, any[]> = {};
    for (const comp of (compResults || [])) {
      componentsMap[(comp as any).id] = JSON.parse((comp as any).component_json || '[]');
    }

    return c.html(
      <Layout title={page.title}>
        <div class="max-w-5xl mx-auto py-20 px-8 bg-white min-h-screen shadow-lg border-x border-gray-100">
          {rootNodes.map((node: any) => renderNode(node, nodes, componentsMap))}
        </div>
      </Layout>
    );
  } catch (err: any) {
    return c.text(`Error: ${err.message}`, 500);
  }
});

export default app;

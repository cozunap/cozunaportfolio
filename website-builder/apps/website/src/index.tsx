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
  
  // Find nested children
  const children = allNodes.filter(n => n.parentId === node.id);

  switch (node.type) {
    case 'heading': return <h1 class="text-5xl font-bold font-serif text-navy mb-6">{node.props.text || 'Heading'}</h1>;
    case 'text': return <p class="text-lg text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{node.props.text || 'Text block'}</p>;
    case 'button': return <button class="bg-navy hover:bg-gold transition-colors text-white px-8 py-3 rounded font-medium shadow-md mt-4">{node.props.text || 'Button'}</button>;
    case 'image': return <div class="bg-gray-200 h-64 w-full rounded my-6 flex items-center justify-center text-gray-500 shadow-inner">Image Placeholder</div>;
    case 'spacer': return <div style={{ height: `${node.props.height || 50}px` }} class="w-full block"></div>;
    case 'divider': return <hr style={{ borderColor: node.props.color || '#e5e7eb', borderWidth: `${node.props.thickness || 1}px` }} class="w-full my-8 block" />;
    case 'video': return (
      <div class="w-full aspect-video rounded-lg overflow-hidden my-6 shadow-lg">
        <iframe src={node.props.url} class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    );
    case 'map': return (
      <div class="w-full h-96 rounded-lg overflow-hidden my-6 shadow-md bg-gray-100 flex items-center justify-center text-gray-400">
        Google Maps API Integration Placeholder (Address: {node.props.address})
      </div>
    );
    case 'icon': return (
      <div class="inline-flex items-center justify-center p-4">
        <span style={{color: node.props.color || '#0d1f3c', fontSize: `${node.props.size || 24}px`}}>★</span>
      </div>
    );
    case 'image_box': return (
      <div class="text-center p-8 border border-gray-100 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow">
        <div class="w-full h-48 bg-gray-100 rounded-lg mb-6"></div>
        <h3 class="font-serif font-bold text-2xl text-navy mb-3">{node.props.title || 'Title'}</h3>
        <p class="text-gray-600 text-base">{node.props.description || 'Description'}</p>
      </div>
    );
    case 'container': return (
      <div style={{ padding: `${node.props.padding || 20}px`, backgroundColor: node.props.bgColor || '#ffffff' }} class="w-full rounded-lg shadow-sm border border-gray-100 mb-6">
        {children.map(child => renderNode(child, allNodes, componentsMap))}
      </div>
    );
    case 'grid': return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns || 2}, 1fr)`, gap: `${node.props.gap || 16}px` }} class="w-full my-6">
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

import { Hono } from 'hono'
import type { FC } from 'hono/jsx'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// The Layout Shell
const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title || 'Premium Website'}</title>
        {/* Load Tailwind CSS from CDN for the renderer */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: { navy: '#0d1f3c', gold: '#b89a5a' },
                fontFamily: { serif: ['"Playfair Display"', 'serif'], sans: ['Inter', 'sans-serif'] }
              }
            }
          }
        `}} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `body { margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Inter', sans-serif; }`}} />
      </head>
      <body>{props.children}</body>
    </html>
  )
}

// Convert JSON nodes to HTML
const renderNode = (node: any) => {
  switch (node.type) {
    case 'heading':
      return <h1 class="text-5xl font-bold font-serif text-navy mb-6">{node.props.text || 'Heading'}</h1>
    case 'text':
      return <p class="text-lg text-gray-700 leading-relaxed mb-4">{node.props.text || 'Text block'}</p>
    case 'button':
      return <button class="bg-navy hover:bg-gold transition-colors text-white px-8 py-3 rounded font-medium shadow-md mt-4">{node.props.text || 'Button'}</button>
    case 'image':
      return <div class="bg-gray-200 h-64 w-full rounded my-6 flex items-center justify-center text-gray-500 shadow-inner">Image Placeholder</div>
    default:
      return null
  }
}

app.get('/', async (c) => {
  // We query the "home" page
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind('home').all();
    
    if (!results || results.length === 0) {
      return c.html(
        <Layout title="Welcome">
          <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 class="text-4xl font-serif text-navy mb-4">Nothing Published Yet</h1>
            <p class="text-gray-500">Go to the Visual Builder and click Publish!</p>
          </div>
        </Layout>
      )
    }

    const page = results[0] as any;
    const nodes = JSON.parse(page.page_json || '[]');

    return c.html(
      <Layout title={page.title}>
        <div class="max-w-4xl mx-auto py-20 px-8 bg-white min-h-screen shadow-sm border-x border-gray-100">
          {nodes.map((node: any) => renderNode(node))}
        </div>
      </Layout>
    )
  } catch (err: any) {
    return c.text(`Error: ${err.message}`, 500)
  }
})

export default app

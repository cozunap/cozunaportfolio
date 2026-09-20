import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for the Visual Builder UI
app.use('/*', cors());

app.get('/api/status', (c) => {
  return c.json({
    status: "online",
    service: "Premium Cloudflare Visual Website Builder API (Hono)",
    version: "1.1.0"
  });
});

// GET a page by ID
app.get('/api/pages/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pages WHERE id = ?'
    ).bind(id).all();
    
    if (!results || results.length === 0) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    return c.json({ page: results[0] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST save a page
app.post('/api/pages', async (c) => {
  try {
    const body = await c.req.json();
    const { id, site_id, title, slug, page_json } = body;
    
    // Upsert logic (Insert or Replace)
    await c.env.DB.prepare(
      `INSERT INTO pages (id, site_id, title, slug, page_json, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET 
       title = excluded.title, 
       slug = excluded.slug, 
       page_json = excluded.page_json, 
       updated_at = CURRENT_TIMESTAMP,
       version = version + 1`
    ).bind(id, site_id, title, slug, JSON.stringify(page_json)).run();

    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = { DB: D1Database; };
const app = new Hono<{ Bindings: Bindings }>();
app.use('/*', cors());

app.get('/', (c) => c.redirect('https://visual-builder-ui.cmozunap.workers.dev/'));

app.get('/api/status', (c) => c.json({ status: "online", version: "1.2.0" }));

// PAGES
app.get('/api/pages', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT id, title, slug, updated_at FROM pages WHERE site_id = ? ORDER BY created_at DESC').bind('default-site').all();
    return c.json({ pages: results || [] });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.get('/api/pages/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).all();
    if (!results || results.length === 0) return c.json({ error: 'Page not found' }, 404);
    return c.json({ page: results[0] });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.get('/api/pages/slug/:slug', async (c) => {
  let slug = c.req.param('slug');
  if (!slug.startsWith('/')) slug = '/' + slug;
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM pages WHERE site_id = ? AND slug = ?').bind('default-site', slug).all();
    if (!results || results.length === 0) return c.json({ error: 'Page not found' }, 404);
    return c.json({ page: results[0] });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.post('/api/pages', async (c) => {
  try {
    const body = await c.req.json();
    const { id, site_id, title, slug, page_json } = body;
    await c.env.DB.prepare(
      `INSERT INTO pages (id, site_id, title, slug, page_json, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET title = excluded.title, slug = excluded.slug, page_json = excluded.page_json, updated_at = CURRENT_TIMESTAMP, version = version + 1`
    ).bind(id, site_id || 'default-site', title || 'Untitled', slug || '/new', typeof page_json === 'string' ? page_json : JSON.stringify(page_json)).run();
    return c.json({ success: true, id });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

// COMPONENTS
app.get('/api/components', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT id, name, created_at FROM components WHERE site_id = ? ORDER BY created_at DESC').bind('default-site').all();
    return c.json({ components: results || [] });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.get('/api/components/full', async (c) => {
  // Fetch components with their JSON payload for renderer injection
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM components WHERE site_id = ?').bind('default-site').all();
    return c.json({ components: results || [] });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.post('/api/components', async (c) => {
  try {
    const body = await c.req.json();
    const { id, site_id, name, component_json } = body;
    // ensure we have updated_at column or remove it. Wait, components schema doesn't have updated_at?
    // Let me check schema. Schema only has: id, site_id, name, component_json, created_at.
    await c.env.DB.prepare(
      `INSERT INTO components (id, site_id, name, component_json) 
       VALUES (?, ?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET name = excluded.name, component_json = excluded.component_json`
    ).bind(id, site_id || 'default-site', name, typeof component_json === 'string' ? component_json : JSON.stringify(component_json)).run();
    return c.json({ success: true, id });
  } catch (error: any) { return c.json({ error: error.message }, 500); }
});

app.notFound((c) => c.json({ error: "Endpoint not found" }, 404));

export default app;

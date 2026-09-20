import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  GITHUB_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}));

// Redirect root
app.get('/', (c) => {
  return c.redirect('https://visual-builder-ui.cmozunap.workers.dev');
});

// Create/Update Page
app.post('/api/pages', async (c) => {
  const { id, site_id, title, slug, page_json } = await c.req.json();
  try {
    const existing = await c.env.DB.prepare('SELECT id FROM pages WHERE id = ?').bind(id).first();
    if (existing) {
      await c.env.DB.prepare(
        'UPDATE pages SET title = ?, slug = ?, page_json = ? WHERE id = ?'
      ).bind(title, slug, JSON.stringify(page_json), id).run();
    } else {
      await c.env.DB.prepare(
        'INSERT INTO pages (id, site_id, title, slug, page_json) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, site_id || 'default-site', title, slug, JSON.stringify(page_json)).run();
    }
    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List Pages
app.get('/api/pages', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, title, slug FROM pages WHERE site_id = ?'
    ).bind('default-site').all();
    return c.json({ pages: results || [] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get Single Page
app.get('/api/pages/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const page = await c.env.DB.prepare('SELECT * FROM pages WHERE id = ?').bind(id).first();
    if (!page) return c.json({ error: 'Not found' }, 404);
    return c.json({ page });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create Global Component
app.post('/api/components', async (c) => {
  const { id, site_id, name, component_json } = await c.req.json();
  try {
    const existing = await c.env.DB.prepare('SELECT id FROM components WHERE id = ?').bind(id).first();
    if (existing) {
      await c.env.DB.prepare(
        'UPDATE components SET name = ?, component_json = ? WHERE id = ?'
      ).bind(name, JSON.stringify(component_json), id).run();
    } else {
      await c.env.DB.prepare(
        'INSERT INTO components (id, site_id, name, component_json) VALUES (?, ?, ?, ?)'
      ).bind(id, site_id || 'default-site', name, JSON.stringify(component_json)).run();
    }
    return c.json({ success: true, id });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// List Global Components
app.get('/api/components', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name FROM components WHERE site_id = ? ORDER BY created_at DESC'
    ).bind('default-site').all();
    return c.json({ components: results || [] });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Upload Media to GitHub
app.post('/api/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const arrayBuffer = await file.arrayBuffer();
    // Convert to base64
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Content = btoa(binary);

    const ext = file.name.split('.').pop();
    const filename = `img_${Date.now()}.${ext}`;
    const repoPath = `apps/website/public/media/${filename}`;
    const apiUrl = `https://api.github.com/repos/cozunap/cozunaportfolio/contents/${repoPath}`;

    const ghRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${c.env.GITHUB_TOKEN}`,
        'User-Agent': 'Cloudflare-Worker-Builder',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Upload media: ${filename}`,
        content: base64Content,
        branch: 'main'
      })
    });

    if (!ghRes.ok) {
      const ghErr = await ghRes.text();
      throw new Error(`GitHub API Error: ${ghErr}`);
    }

    // Return the ultra-fast jsDelivr CDN URL
    const publicUrl = `https://cdn.jsdelivr.net/gh/cozunap/cozunaportfolio@main/${repoPath}`;

    return c.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;

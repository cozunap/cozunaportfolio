import { useState, useEffect } from 'react';
import { useBuilderStore } from './store/useBuilderStore';

const API_BASE = "https://visual-builder-api.cmozunap.workers.dev/api";

export function useApi() {
  const { setPages, setGlobalComponents, setNodes, setPageInfo, pageId } = useBuilderStore();
  const [loading, setLoading] = useState(false);

  const fetchLists = async () => {
    try {
      const [pagesRes, compRes] = await Promise.all([
        fetch(`${API_BASE}/pages`),
        fetch(`${API_BASE}/components`)
      ]);
      if (pagesRes.ok) {
        const data = await pagesRes.json();
        setPages(data.pages || []);
      }
      if (compRes.ok) {
        const data = await compRes.json();
        setGlobalComponents(data.components || []);
      }
    } catch (e) {
      console.error("Failed to fetch lists", e);
    }
  };

  const loadPage = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPageInfo(data.page.id, data.page.title, data.page.slug);
        setNodes(JSON.parse(data.page.page_json || '[]'));
      } else {
        // If not found, reset
        setNodes([]);
      }
    } catch (e) {
      console.error("Failed to load page", e);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (title: string, slug: string) => {
    const id = slug.replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '') || 'new-page';
    try {
      const res = await fetch(`${API_BASE}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, slug, page_json: [] })
      });
      if (res.ok) {
        await fetchLists();
        await loadPage(id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveComponent = async (name: string, nodesToSave: any[]) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      const res = await fetch(`${API_BASE}/components`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, component_json: nodesToSave })
      });
      if (res.ok) {
        await fetchLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLists();
    loadPage(pageId);
  }, []);

  return { fetchLists, loadPage, createPage, saveComponent, loading };
}

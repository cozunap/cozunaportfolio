import { useState } from 'react';
import { useBuilderStore } from './store/useBuilderStore';

const API_URL = "https://visual-builder-api.cmozunap.workers.dev/api/pages";

export function usePublish() {
  const { nodes, pageId } = useBuilderStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publish = async () => {
    setIsPublishing(true);
    setMessage("Publishing...");
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pageId,
          site_id: "default-site",
          title: "Home",
          slug: "/",
          page_json: nodes
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Published successfully!");
      } else {
        setMessage(`Error: ${data.error || "Failed to publish"}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setIsPublishing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return { publish, isPublishing, message };
}

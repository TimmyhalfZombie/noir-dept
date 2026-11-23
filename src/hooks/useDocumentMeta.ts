import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description: string;
}

export function useDocumentMeta({ title, description }: DocumentMetaOptions) {
  useEffect(() => {
    document.title = title;

    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          element.setAttribute('property', attribute);
        } else {
          element.setAttribute('name', attribute);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    updateMeta('meta[name="description"]', 'description', description);
    updateMeta('meta[property="og:title"]', 'og:title', title);
    updateMeta('meta[property="og:description"]', 'og:description', description);
  }, [title, description]);
}

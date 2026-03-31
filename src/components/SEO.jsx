import * as React from 'react';

const DEFAULT_ORIGIN = 'https://assistantai.com.au';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

export default function SEO({ title, description, canonicalPath = '/', structuredData = [] }) {
  React.useEffect(() => {
    const origin = window.location.origin || DEFAULT_ORIGIN;
    const canonicalUrl = new URL(canonicalPath, origin).toString();

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    const existingStructuredData = document.head.querySelectorAll('script[data-seo-ld="true"]');
    existingStructuredData.forEach((node) => node.remove());

    structuredData.forEach((item, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-ld', 'true');
      script.id = `seo-ld-${index}`;
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });

    return () => {
      document.head.querySelectorAll('script[data-seo-ld="true"]').forEach((node) => node.remove());
    };
  }, [title, description, canonicalPath, structuredData]);

  return null;
}
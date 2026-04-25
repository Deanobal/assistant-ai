import * as React from 'react';

const { useEffect } = React;

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

export default function SEO({ title, description, canonicalPath = '/', structuredData = [], image, imageAlt }) {
  useEffect(() => {
    const origin = window.location.origin || DEFAULT_ORIGIN;
    const canonicalUrl = new URL(canonicalPath, origin).toString();

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    if (image) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
      if (imageAlt) {
        upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
      }
    }
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    if (image) {
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
      if (imageAlt) {
        upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });
      }
    }
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
  }, [title, description, canonicalPath, structuredData, image, imageAlt]);

  return null;
}
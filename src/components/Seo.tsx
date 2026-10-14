import { useEffect } from 'react';
import { absoluteUrl, canonicalUrl, DEFAULT_DESCRIPTION, formatTitle, SITE_NAME, truncateDescription } from '../lib/seo';

export interface SeoProps {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  /** With `noindex`, keeps links followable (`noindex,follow`). */
  follow?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string; author?: string };
  jsonLd?: object | object[];
}

type Restore = () => void;

function setTag(tagName: 'meta' | 'link', key: string, keyValue: string, valueAttr: string, value: string): Restore {
  const selector = `${tagName}[${key}="${keyValue}"]`;
  let el = document.head.querySelector<HTMLElement>(selector);
  const created = !el;
  if (!el) {
    el = document.createElement(tagName);
    el.setAttribute(key, keyValue);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute(valueAttr);
  el.setAttribute(valueAttr, value);
  return () => {
    if (created) el!.remove();
    else if (previous === null) el!.removeAttribute(valueAttr);
    else el!.setAttribute(valueAttr, previous);
  };
}

export function Seo({ title, description, path, image, type = 'website', noindex = false, follow = false, article, jsonLd }: SeoProps) {
  const jsonLdText = jsonLd === undefined ? '' : JSON.stringify(jsonLd);
  const articlePublished = article?.publishedTime;
  const articleModified = article?.modifiedTime;
  const articleAuthor = article?.author;

  useEffect(() => {
    const fullTitle = formatTitle(title);
    const desc = truncateDescription(description ?? DEFAULT_DESCRIPTION);
    const url = canonicalUrl(path);
    const restores: Restore[] = [];

    const previousTitle = document.title;
    document.title = fullTitle;
    restores.push(() => {
      document.title = previousTitle;
    });

    const meta = (key: 'name' | 'property', name: string, value: string) =>
      restores.push(setTag('meta', key, name, 'content', value));

    meta('name', 'description', desc);
    restores.push(setTag('link', 'rel', 'canonical', 'href', url));
    meta('name', 'robots', noindex ? (follow ? 'noindex,follow' : 'noindex,nofollow') : 'index,follow');
    meta('property', 'og:title', fullTitle);
    meta('property', 'og:description', desc);
    meta('property', 'og:type', type);
    meta('property', 'og:url', url);
    meta('property', 'og:site_name', SITE_NAME);
    meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    meta('name', 'twitter:title', fullTitle);
    meta('name', 'twitter:description', desc);
    if (type === 'article' && article) {
      if (article.publishedTime) meta('property', 'article:published_time', article.publishedTime);
      if (article.modifiedTime) meta('property', 'article:modified_time', article.modifiedTime);
      if (article.author) meta('property', 'article:author', article.author);
    }
    if (image) {
      const abs = absoluteUrl(image);
      meta('property', 'og:image', abs);
      meta('name', 'twitter:image', abs);
    }

    if (jsonLdText) {
      let script = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-seo]');
      const created = !script;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', '');
        document.head.appendChild(script);
      }
      const previous = script.textContent;
      script.textContent = jsonLdText;
      restores.push(() => {
        if (created) script!.remove();
        else script!.textContent = previous;
      });
    }

    return () => {
      for (const restore of restores.reverse()) restore();
    };
  }, [title, description, path, image, type, noindex, follow, articlePublished, articleModified, articleAuthor, jsonLdText]);

  return null;
}

export default Seo;

import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  twitterCard?: "summary" | "summary_large_image";
  noindex?: boolean;
  structuredData?: object | object[];
}

const SITE_NAME = "GlintShades";
const BASE_URL = "https://glintshades.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setStructuredData(data: object | object[]) {
  const existing = document.querySelectorAll('script[data-seo="true"]');
  existing.forEach((el) => el.remove());

  const items = Array.isArray(data) ? data : [data];
  items.forEach((item) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo", "true");
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noindex = false,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title
      ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
      : `${SITE_NAME} - Handcrafted Crochet Flowers`;
    document.title = fullTitle;

    if (description) setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : window.location.href;
    setLink("canonical", canonicalUrl);

    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:title", ogTitle || fullTitle, true);
    setMeta("og:description", ogDescription || description || "", true);
    setMeta("og:image", ogImage || DEFAULT_IMAGE, true);
    setMeta("og:url", canonicalUrl, true);

    setMeta("twitter:card", twitterCard);
    setMeta("twitter:title", ogTitle || fullTitle);
    setMeta("twitter:description", ogDescription || description || "");
    setMeta("twitter:image", ogImage || DEFAULT_IMAGE);

    if (structuredData) {
      setStructuredData(structuredData);
    }

    return () => {
      document.querySelectorAll('script[data-seo="true"]').forEach((el) => el.remove());
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogType, twitterCard, noindex, structuredData]);
}

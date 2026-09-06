import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface ProductStructuredData {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  category?: string;
  image?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface SEOProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  productData?: ProductStructuredData;
  breadcrumbs?: BreadcrumbItem[];
}

const SITE_NAME = 'TechNest';
const DEFAULT_DESCRIPTION = 'TechNest — Premium electronics, laptops, smartphones, audio gear, and next-generation tech gadgets.';
const DEFAULT_IMAGE = '/favicon.svg';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  productData,
  breadcrumbs,
}) => {
  useEffect(() => {
    // 1. Document Title
    const formattedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = formattedTitle;

    // Helper to set or create a meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);

    // 3. OpenGraph Tags
    const fullUrl = canonicalUrl || window.location.href;
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    if (ogImage) {
      const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`;
      setMetaTag('property', 'og:image', fullImageUrl);
    }

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`;
      setMetaTag('name', 'twitter:image', fullImageUrl);
    }

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    } else if (canonicalLink) {
      canonicalLink.setAttribute('href', window.location.origin + window.location.pathname);
    }

    // 6. JSON-LD Structured Data
    const jsonLdScripts: HTMLScriptElement[] = [];

    // Product Schema
    if (productData) {
      const productSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        description: productData.description || description,
        offers: {
          '@type': 'Offer',
          price: productData.price,
          priceCurrency: productData.currency || 'LKR',
          availability:
            productData.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: fullUrl,
        },
      };

      if (productData.image) {
        productSchema.image = productData.image.startsWith('http')
          ? productData.image
          : `${window.location.origin}${productData.image}`;
      }

      if (productData.category) {
        productSchema.category = productData.category;
      }

      if (productData.averageRating && productData.averageRating > 0 && productData.reviewCount && productData.reviewCount > 0) {
        productSchema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: productData.averageRating,
          reviewCount: productData.reviewCount,
          bestRating: 5,
          worstRating: 1,
        };
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'jsonld-product';
      script.text = JSON.stringify(productSchema);
      document.head.appendChild(script);
      jsonLdScripts.push(script);
    }

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbsSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.item.startsWith('http') ? b.item : `${window.location.origin}${b.item}`,
        })),
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'jsonld-breadcrumbs';
      script.text = JSON.stringify(breadcrumbsSchema);
      document.head.appendChild(script);
      jsonLdScripts.push(script);
    }

    return () => {
      // Cleanup dynamically appended JSON-LD scripts on unmount
      jsonLdScripts.forEach((s) => s.parentNode?.removeChild(s));
    };
  }, [title, description, canonicalUrl, ogImage, ogType, productData, breadcrumbs]);

  return null;
};

export default SEO;

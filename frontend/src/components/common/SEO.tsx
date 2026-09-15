import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  const formattedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = ogImage 
    ? (ogImage.startsWith('http') ? ogImage : `${typeof window !== 'undefined' ? window.location.origin : ''}${ogImage}`)
    : '';

  const jsonLdScripts = [];

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
        availability: productData.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: fullUrl,
      },
    };

    if (productData.image) {
      productSchema.image = productData.image.startsWith('http')
        ? productData.image
        : `${typeof window !== 'undefined' ? window.location.origin : ''}${productData.image}`;
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

    jsonLdScripts.push(productSchema);
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
        item: b.item.startsWith('http') ? b.item : `${typeof window !== 'undefined' ? window.location.origin : ''}${b.item}`,
      })),
    };
    jsonLdScripts.push(breadcrumbsSchema);
  }

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content={fullImageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}
      
      {/* Canonical */}
      {fullUrl && <link rel="canonical" href={fullUrl} />}

      {/* JSON-LD */}
      {jsonLdScripts.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

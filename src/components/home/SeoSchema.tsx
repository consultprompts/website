import React from 'react';

export default function SeoSchema() {
  return (
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebAgency',
        name: 'ConsultPrompts',
        description: 'High-performance web design for local businesses. $299 flat fee, 72-hour delivery.',
        url: window.location.origin,
        image: `${window.location.origin}/favicon.png`,
        priceRange: '$299',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'Global',
        },
        offers: {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Local Business Web Design',
            description: 'High-performance, mobile-optimized website for local businesses.',
          },
        },
      })}
    </script>
  );
}

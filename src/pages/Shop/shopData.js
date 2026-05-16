// UI-only marketing data for the shop page. Categories, brands, sizes, and
// products themselves now come from the API (categoriesApi.list / productsApi.list).
// Filter constants live in src/constants/shopFilters.js.

// Fallback list shown only if /brands/featured fails. TopBrands renders the
// brand name as text when no logo URL is present, so this stays readable
// without depending on any third-party placeholder service.
export const topBrands = [
  { name: 'Bredl' },
  { name: 'Nike SB' },
  { name: 'adidas' },
  { name: 'Vans' },
  { name: 'Palace' },
  { name: 'Spitfire' },
  { name: 'Independent' },
  { name: 'Bones' },
];

export const featuredCollections = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Fresh drops every week',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=500&fit=crop',
    to: '/shop',
  },
  {
    id: 2,
    title: 'Skate Essentials',
    subtitle: 'Everything for your setup',
    image: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&h=500&fit=crop',
    to: '/shop/skate',
  },
  {
    id: 3,
    title: 'Bredl Collection',
    subtitle: 'In-house gear, head to toe',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=500&fit=crop',
    to: '/shop?brand=Bredl',
  },
];

export const formatPrice = (price) => `${Number(price || 0).toFixed(2).replace('.', ',')} TND`;

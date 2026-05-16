export const PRICE_RANGES = [
  { id: 'all', name: 'All Prices', min: null, max: null },
  { id: '0-50', name: 'Under 50 TND', min: 0, max: 50 },
  { id: '50-100', name: '50 - 100 TND', min: 50, max: 100 },
  { id: '100-200', name: '100 - 200 TND', min: 100, max: 200 },
  { id: '200+', name: 'Over 200 TND', min: 200, max: null },
];

export const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'sale', name: 'On Sale' },
];

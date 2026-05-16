// Server-side mirror of /src/constants/subcategorySpecs.js.
// Keep these two files in sync when adding spec fields or subcategories.

const SUBCATEGORY_SPECS = {
  // Skate
  complete: ['deckWidth', 'concave', 'material', 'truckSize', 'axleWidth', 'wheelSize', 'durometer', 'wheelShape'],
  decks: ['deckWidth', 'concave', 'material'],
  trucks: ['truckSize', 'axleWidth'],
  wheels: ['wheelSize', 'durometer', 'wheelShape'],
  bearings: [],
  griptape: [],
  // Surf
  surfboards: ['boardLength', 'boardVolume', 'finSetup'],
  fins: ['finSetup'],
};

const KNOWN_SPEC_FIELDS = new Set([
  'deckWidth', 'concave', 'material',
  'truckSize', 'axleWidth',
  'wheelSize', 'durometer', 'wheelShape',
  'boardLength', 'boardVolume', 'finSetup',
  'flex',
]);

// Online gateways are not yet integrated; every method here is settled manually
// by the team. Keep in sync with PAYMENT_METHODS in src/pages/Checkout/Checkout.js.
const ALLOWED_PAYMENTS = ['cod', 'flouci', 'bank'];

module.exports = { SUBCATEGORY_SPECS, KNOWN_SPEC_FIELDS, ALLOWED_PAYMENTS };

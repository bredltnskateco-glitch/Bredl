// Client-side mirror of /server/config/subcategorySpecs.js.
// Keep these two files in sync when adding spec fields or subcategories.

export const SPEC_FIELDS_BY_SUBCAT = {
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

export const SPEC_OPTIONS = {
  deckWidth: ['7.5"', '7.75"', '8.0"', '8.125"', '8.25"', '8.375"', '8.5"', '8.625"', '8.75"', '9.0"', '9.5"', '10.0"'],
  concave: ['Low', 'Medium', 'High', 'Mellow', 'Steep'],
  material: ['7-Ply Maple', 'Canadian Maple', 'Bamboo', 'Carbon Fiber Reinforced', 'Epoxy Resin', 'Fibreglass Reinforced'],
  truckSize: ['129', '139', '149', '159', '169'],
  axleWidth: ['7.5"', '8.0"', '8.25"', '8.5"', '8.75"', '9.0"'],
  wheelSize: ['52mm', '53mm', '54mm', '55mm', '56mm', '58mm', '60mm'],
  durometer: ['78a', '83a', '95a', '99a', '101a'],
  wheelShape: ['Conical', 'Classic', 'Radial', 'Round Lip', 'Square Lip'],
  finSetup: ['Thruster (3 fins)', 'Quad (4 fins)', 'Twin Fin', 'Single Fin', '5 Fin (Convertible)'],
};

export const SPEC_LABELS = {
  deckWidth: 'Width',
  concave: 'Concave',
  material: 'Material',
  truckSize: 'Truck Size',
  axleWidth: 'Axle Width',
  wheelSize: 'Wheel Size',
  durometer: 'Durometer',
  wheelShape: 'Wheel Shape',
  boardLength: 'Length',
  boardVolume: 'Volume',
  finSetup: 'Fin Setup',
  flex: 'Flex',
};

export const getSpecsForSubcategory = (slug) => SPEC_FIELDS_BY_SUBCAT[slug] || [];

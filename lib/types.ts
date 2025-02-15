export interface Medicine {
  name: string,
  item: string,
  link: string,
  imgLink: string,
  price: number,
  deliveryCharge: number,
  offer: string,
  finalCharge: string,
  lson: string,
  deliveryTime: string,
  medicineAvailability: Boolean,
  minQty: number,
  saltName: string[],
  qtyItContainsDesc: number
}

export interface MedSearchSuggestion {
  medicineName: string,
  packSize: string,
  manufacturer: string,
  prescriptionNeeded: string,
  saltName: string[]
}

export interface LabAvailableAt {
  labId: number,
  labName: string,
}

export interface LabPriceByLab {
  labId: number,
  labName: string,
  final_rate: number,
  mrp: number,
  savings: string,
}

export interface LabPriceByPin {
  algoliaSearchString: string,
  labId: number,
  labName: string,
  mrp: number,
  minPrice: number,
  savings: string,
}

export interface HighlightResultField {
  value: string,
  matchLevel: string,
  fullyHighlighted?: boolean,
  matchedWords: string[],
}

export interface LabResultHighlight {
  itemName: HighlightResultField,
  type: HighlightResultField,
  Keyword: HighlightResultField,
  availableAt: { labName: HighlightResultField }[],
  healthCategory: HighlightResultField,
  popularPackageSection: HighlightResultField,
}

export interface LabResult {
  id: string,
  itemName: string,
  type: string,
  Keyword: string,
  order: number,
  testCount: number,
  includedTests: any[],
  url: string,
  minPrice: number,
  labName: string,
  fasting: string,
  availableAt: LabAvailableAt[],
  popular: boolean,
  category: string,
  healthCategory: string,
  popularPackageSection: string,
  report: string,
  mrp: number,
  savings: string,
  typeId: number,
  priceByLab: { [key: string]: LabPriceByLab },
  priceByPin: LabPriceByPin[],
  byLab: string,
  objectID: string,
  _highlightResult: LabResultHighlight,
}
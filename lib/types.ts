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
  medicineName: string
  packSize: string
  manufacturer: string
  prescriptionNeeded: string
  saltName: string[]
}


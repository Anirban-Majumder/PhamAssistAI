export interface Medicine {
  id: string
  name: string
  price: number
  deliveryPrice: number
  totalPrice: number
  pharmacy: string
  deliveryTime: string
  pincode: string
  image: string
}

export interface MedSearchSuggestion {
  medicineName: string
  packSize: string
  manufacturer: string
  prescriptionNeeded: string
  saltName: string[]
}


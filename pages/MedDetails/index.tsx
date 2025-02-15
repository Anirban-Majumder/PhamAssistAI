"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react"
import { ContrastIcon as CompareIcon } from "lucide-react"

interface MedicineVariant {
  id: number;
  primary_category_id: number;
  sku: string;
  name: string;
  brand_name: string;
  manufacturer_name: string;
  product_type: string;
  product_description: string;
  max_orderable_quantity: number;
  properties: {
    vendor_sku: { display_name: string; value: string };
    unit_of_sale: { display_name: string; value: string };
    inner_package_quantity: { display_name: string; value: string };
    outer_package_quantity: { display_name: string; value: string };
    max_order_quantity: { display_name: string; value: string };
    recommended_browse_nodes1: { display_name: string; value: string };
    generic_keywords1: { display_name: string; value: string };
    generic_keywords2: { display_name: string; value: string };
    generic_keywords3: { display_name: string; value: string };
    generic_keywords4: { display_name: string; value: string };
    generic_keywords5: { display_name: string; value: string };
    why_prescribe: { display_name: string; value: string };
    route_of_administration: { display_name: string; value: string };
    recommended_dosage: { display_name: string; value: string };
    safety_warning: { display_name: string; value: string };
    size_name: { display_name: string; value: string };
    strength: { display_name: string; value: string };
    item_form: { display_name: string; value: string };
    directions_usage: { display_name: string; value: string };
    active_ingredient1: { display_name: string; value: string };
    active_ingredient2: { display_name: string; value: string };
    indications: { display_name: string; value: string };
    contra_indications: { display_name: string; value: string };
    is_adult_product: { display_name: string; value: string };
    when_is_it_not_to_be_taken: { display_name: string; value: string };
    warnings_and_precaution: { display_name: string; value: string };
    side_effects: { display_name: string; value: string };
    other_precautions: { display_name: string; value: string };
    schedule: { display_name: string; value: string };
    prescription_required: { display_name: string; value: string };
    storage_condition: { display_name: string; value: string };
    disease_profile: { display_name: string; value: string };
    acute_chronic: { display_name: string; value: string };
  };
  mrp: string;
  sales_price: string;
  promotional_price: string;
  discount_percent: string;
  inventory_label: string;
  available: boolean;
  notify_me: boolean;
  variation_theme: string[];
  cash_back: boolean;
  cash_back_desc: string;
  images: string[];
  other_variants: any[];
}

interface Props {
  variant: MedicineVariant
}

export default function MedicineDetails({ variant }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [medicineVariant, setMedicineVariant] = useState<MedicineVariant | null>(null)

  useEffect(() => {
    const data = {
      variant: {
        id: 30035,
        primary_category_id: 810,
        sku: "FR-30035",
        name: "Pan D Capsule 15'S",
        brand_name: "Pan",
        manufacturer_name: "Alkem Laboratories Ltd",
        product_type: "pharmacy_medicines_misc",
        product_description: "This is a gastrointestinal medication. It is used to treat much acid in the stomach, duodenal and gastric ulcers, erosive esophagitis or heartburn, gastroesophageal reflux disease (GERD). It is also used to treat upper abdominal pain and bloating, nausea, vomiting.",
        max_orderable_quantity: 20,
        properties: {
          vendor_sku: { display_name: "Ecogreen", value: "P34515" },
          unit_of_sale: { display_name: "unit_of_sale", value: "Strip" },
          inner_package_quantity: { display_name: "Size", value: "15 Capsules" },
          outer_package_quantity: { display_name: "outer_package_quantity", value: "1 Strip" },
          max_order_quantity: { display_name: "max_order_quantity", value: "20" },
          recommended_browse_nodes1: { display_name: "recommended_browse_nodes1", value: "MC1" },
          generic_keywords1: { display_name: "generic_keywords1", value: "Enteric Coated Pantoprazole Sodium Domperidone Sustained Release  Gastro Intestinal Antacids Antireflux Agents  Antiulcerants" },
          generic_keywords2: { display_name: "generic_keywords2", value: "Gas" },
          generic_keywords3: { display_name: "generic_keywords3", value: "Acidity" },
          generic_keywords4: { display_name: "generic_keywords4", value: "Ulcer" },
          generic_keywords5: { display_name: "generic_keywords5", value: "Antacid" },
          why_prescribe: { display_name: "why_prescribe", value: "Prescribed for gastro-oesophageal reflux disease and dyspepsia." },
          route_of_administration: { display_name: "route_of_administration", value: "ORAL" },
          recommended_dosage: { display_name: "recommended_dosage", value: "As recommended by physician." },
          safety_warning: { display_name: "safety_warning", value: "Caution should be exercised in condition like atrophic gastritisn and bacterial overgrowth in the GI tract." },
          size_name: { display_name: "size", value: "15 Capsules" },
          strength: { display_name: "strength", value: "NA" },
          item_form: { display_name: "item_form", value: "Capsule" },
          directions_usage: { display_name: "directions_usage", value: "Should be taken approximately 30 minutes prior to meals." },
          active_ingredient1: { display_name: "active_ingredient1", value: "Enteric Coated Pantoprazole Sodium 40 mg" },
          active_ingredient2: { display_name: "active_ingredient2", value: "Domperidone Sustained Release 30 mg" },
          indications: { display_name: "indications", value: "Prescribed for gastro-oesophageal reflux disease and dyspepsia." },
          contra_indications: { display_name: "contra_indications", value: "Inadvisable for the patient with hepatic impairment, hypersensitivity, gastric haemorrhage, obstruction and perforation." },
          is_adult_product: { display_name: "is_adult_product", value: "TRUE" },
          when_is_it_not_to_be_taken: { display_name: "when_is_it_not_to_be_taken", value: "Inadvisable for the patient with hepatic impairment, hypersensitivity, gastric haemorrhage, obstruction and perforation." },
          warnings_and_precaution: { display_name: "warnings_and_precaution", value: "Caution should be exercised in condition like atrophic gastritisn and bacterial overgrowth in the GI tract." },
          side_effects: { display_name: "side_effects", value: "Can cause increased risk of clostridium difficile-associated diarrhoea (CDAD). headache, dizziness, nausea, vomiting, abdominal pain, flatulence, diarrhoea, constipation, dyspepsia, arthralgia, insomnia, rhinitis and injection site reaction." },
          other_precautions: { display_name: "other_precautions", value: "This medication should be taken under strict doctor's guidance during pregnancy; not recommended in children <18 year." },
          schedule: { display_name: "schedule", value: "Schedule H" },
          prescription_required: { display_name: "prescription_required", value: "TRUE" },
          storage_condition: { display_name: "storage_condition", value: "Store at room temperature." },
          disease_profile: { display_name: "disease_profile", value: "Gastro Intestinal Disorder" },
          acute_chronic: { display_name: "acute_chronic", value: "Acute" },
        },
        mrp: "231.00",
        sales_price: "231.00",
        promotional_price: "207.90",
        discount_percent: "10.0",
        inventory_label: "Available",
        available: true,
        notify_me: false,
        variation_theme: ["size_name"],
        cash_back: false,
        cash_back_desc: "0.0% cashback",
        images: [
          "https://emami-production-2.s3.amazonaws.com/variant_images/files/000/023/542/normal_webp/DSC_3079.webp?1650028640",
          "https://emami-production-2.s3.amazonaws.com/variant_images/files/000/033/039/normal_webp/FR-30035%281%29.webp?1679304915",
          "https://emami-production-2.s3.amazonaws.com/variant_images/files/000/033/040/normal_webp/FR-30035%282%29.webp?1679304923"
        ],
        other_variants: []
      }
    }
    setMedicineVariant(data.variant)
    setSelectedImage(data.variant.images[0] || null)
  }, [])

  if (!medicineVariant) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 dark:bg-gray-900">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <Card className="w-full aspect-square">
            <CardBody className="p-0">
              <Image
                src={selectedImage || "/placeholder.jpg"}
                alt={medicineVariant.name}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
            </CardBody>
          </Card>
          <div className="flex gap-2 overflow-x-auto">
            {medicineVariant.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`min-w-[80px] h-[80px] border-2 rounded-lg overflow-hidden
                  ${selectedImage === img ? "border-primary" : "border-gray-200 dark:border-gray-700"}`}
              >
                <Image
                  src={img || "/placeholder.jpg"}
                  alt={`${medicineVariant.name} thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 dark:text-white">{medicineVariant.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">by {medicineVariant.manufacturer_name}</p>
            <div className="mt-2">
              <Chip color="danger" variant="flat">
                Prescription Required
              </Chip>
            </div>
          </div>

          <div className="flex gap-4">
            <Button color="secondary" className="flex-1">
              Add to Cart
            </Button>
            <Button variant="bordered" className="flex-1">
              <CompareIcon className="w-4 h-4 mr-2" />
              Compare
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Product Description</h2>
            <p className="text-gray-600 dark:text-gray-300">{medicineVariant.product_description}</p>
          </div>

          <Table aria-label="Medicine specifications" className="mt-8">
            <TableHeader>
              <TableColumn>SPECIFICATION</TableColumn>
              <TableColumn>DETAILS</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Active Ingredients</TableCell>
                <TableCell>
                  {medicineVariant.properties.active_ingredient1.value}
                  {medicineVariant.properties.active_ingredient2.value && <>, {medicineVariant.properties.active_ingredient2.value}</>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dosage</TableCell>
                <TableCell>{medicineVariant.properties.recommended_dosage.value}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Usage Directions</TableCell>
                <TableCell>{medicineVariant.properties.directions_usage.value}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Storage</TableCell>
                <TableCell>{medicineVariant.properties.storage_condition.value}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Side Effects</TableCell>
                <TableCell>{medicineVariant.properties.side_effects.value}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Warnings</TableCell>
                <TableCell>{medicineVariant.properties.warnings_and_precaution.value}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
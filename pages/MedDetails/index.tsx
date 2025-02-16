"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { ContrastIcon as CompareIcon } from "lucide-react"
import { Layout } from "@/components/layout"

export default function MedicineDetails() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [medicineVariant, setMedicineVariant] = useState<any | null>(null)
  const searchParams = useSearchParams()
  const id = useMemo(() => searchParams.get("id"), [searchParams])

  useEffect(() => {
    if (id && !medicineVariant) {
      fetch(`/api/getMedDetailsbyId?id=${id}`)
        .then((res) => res.json())
        .then((data: any) => {
          setMedicineVariant(data.variant)
          setSelectedImage(data.variant.images[0] || null)
        })
        .catch((err) => console.error("Error fetching medicine details:", err))
    }
  }, [id, medicineVariant])

  if (!medicineVariant) {
    return <div>Loading.....</div>
  }

  return (
    <Layout>
      <div className="container grid md:grid-cols-2 gap-8 overflow-y-auto max-h-screen scrollbar-hide">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <Card className="w-full aspect-square">
            <CardContent className="p-0">
              <img
                src={selectedImage || "/placeholder.jpg"}
                alt={medicineVariant.name}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
            </CardContent>
          </Card>
          <div className="flex gap-2 overflow-x-auto">
            {medicineVariant.images.map((img: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`min-w-[80px] h-[80px] border-2 rounded-lg overflow-hidden ${
                  selectedImage === img ? "border-primary" : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <img
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
            <div className="mt-2">Prescription Required</div>
          </div>

          <div className="flex gap-4">
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Product Description</h2>
            <p className="text-gray-600 dark:text-gray-300">{medicineVariant.product_description}</p>
          </div>

          <Table aria-label="Medicine specifications" className="mt-8">
            <TableHeader>SPECIFICATION</TableHeader>
            <TableHeader>DETAILS</TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Active Ingredients</TableCell>
                <TableCell>
                  {medicineVariant.properties.active_ingredient1.value}
                  {medicineVariant.properties.active_ingredient2.value && (
                    <>, {medicineVariant.properties.active_ingredient2.value}</>
                  )}
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
    </Layout>
  )
}
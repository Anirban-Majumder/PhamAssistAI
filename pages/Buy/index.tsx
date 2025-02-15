"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import Button from "@/components/ui/button2"
import { MapPin } from "lucide-react"
import { Layout } from "@/components/layout"
import Link from "next/link";

interface MedicineData {
    name: string
    item: string
    imgLink: string
    price: number
    deliveryCharge: number
    finalCharge: string
    deliveryTime: string
    lson: string
    medicineAvailability: boolean
    saltName: string[]
    qtyItContainsDesc: number
    link: string
}

export default function BuyPage() {
    const searchParams = useSearchParams()
    const name = searchParams.get("name")
    const pin = searchParams.get("pin")
    const [medicines, setMedicines] = useState<MedicineData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log("name", name)
        console.log("pin", pin)
        if (!name || !pin) {
            //this fucking up something in the code + useEffect runs twice in dev mode 
            //setError("Name and pin are required")
            //setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                const apiUrl = `/api/getMedicine?name=${encodeURIComponent(name)}&pin=${pin}`
                const response = await fetch(apiUrl)
                if (!response.body) throw new Error("Failed to get response stream")

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n")
                    buffer = lines.pop() || ""

                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            try {
                                const data = JSON.parse(line.slice(5))
                                setMedicines((prev) => [...prev, data])
                            } catch (e) {
                                console.error("Failed to parse streamed data:", e)
                            }
                        }
                    }
                }
            } catch (err) {
                setError("Failed to fetch medicine data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [name, pin])

    return (
        <Layout>
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Searching for medicines...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-12">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {medicines.map((medicine, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className="p-6">
                            <div className="aspect-square relative mb-4">
                                <img
                                    src={medicine.imgLink || "/placeholder.svg"}
                                    alt={medicine.item}
                                    className="object-contain w-full h-full"
                                    loading="lazy"
                                />
                            </div>

                            <h2 className="text-xl font-bold mb-4">{medicine.item}</h2>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Medicine Price</span>
                                    <span>₹{medicine.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Price</span>
                                    <span>₹{medicine.deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Cart Total</span>
                                    <span>₹{medicine.finalCharge}</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Pharmacy:</span>
                                    <span>{medicine.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Del Time:</span>
                                    <span>{medicine.deliveryTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <MapPin className="h-4 w-4" />
                                    <span>{medicine.lson}</span>
                                </div>
                            </div>

                            <Button className="w-full" disabled={!medicine.medicineAvailability}>
                                {medicine.medicineAvailability ? (
                                    <Link href={medicine.link} target="_blank" rel="noopener noreferrer">
                                        Buy
                                    </Link>
                                ) : (
                                    "Out of Stock"
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </Layout>
    )
}

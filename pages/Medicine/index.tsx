"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { MapPin, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Medicine, MedSearchSuggestion } from "@/lib/types"
import { SearchSkeleton } from "@/components/search-skeleton"
import { Layout } from "@/components/layout"

export default function MedicineSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<MedSearchSuggestion[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [inStock, setInStock] = useState(true)
  const [pin, setPin] = useState("700001") // Default pin code
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const skipFetchSuggestions = useRef(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (search: string) => {
    if (!search) {
      setSuggestions([])
      return
    }
    
    try {
      const response = await fetch(`/api/medSearch?name=${encodeURIComponent(search)}`)
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    if (skipFetchSuggestions.current) {
        skipFetchSuggestions.current = false
        return
      }

    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, fetchSuggestions])

  const fetchMedicineDetails = useCallback(
    async (name: string, pack:string) => {
      setLoading(true)
      setMedicines([])

      try {
        const apiUrl = `/api/medDetails?name=${encodeURIComponent(name)}&pack=${encodeURIComponent(pack)}&pin=${pin}`
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
      } catch (error) {
        console.error("Failed to fetch medicine details:", error)
      } finally {
        setLoading(false)
      }
    },
    [pin],
  )


  const filteredMedicines = medicines.filter(
    (med) => 
        parseFloat(med.finalCharge) >= priceRange[0] &&
        parseFloat(med.finalCharge) <= priceRange[1]
  )

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6 h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-4">
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search medicines..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="h-12 pl-10"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                <div className="p-1">
                  {suggestions.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No results found
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.medicineName }
                        className="px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer"
                        onClick={() => {
                          skipFetchSuggestions.current = true
                          setQuery(suggestion.medicineName)
                          setShowSuggestions(false)
                          fetchMedicineDetails(suggestion.medicineName, suggestion.packSize)
                        }}
                      >
                        <div className="text-sm font-medium">{suggestion.medicineName }</div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.packSize}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
            <MapPin className="h-4 w-4" />
            <Input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-20 bg-transparent border-none p-0 focus-visible:ring-0"
              placeholder="PIN code"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    step={100}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>In Stock Only</Label>
                  <Switch
                    checked={inStock}
                    onCheckedChange={setInStock}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {loading ? (
          <SearchSkeleton />
        ) : (
          medicines.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Cheapest", "Fastest"].map((type, index) => {
                  const med = medicines[index]
                  if (!med) return null
                  return (
                    <Card key={type} className={cn("relative overflow-hidden", type === "Best" && "border-primary")}>
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs">
                        {type}
                        </div>
                      <CardHeader>
                        <CardTitle className="flex justify-between">
                          <span>₹{med.finalCharge}</span>
                          <span className="text-sm text-muted-foreground">{med.deliveryTime}</span>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>

              <div className="space-y-4">
                {filteredMedicines.map((medicine) => (
                  <Card key={medicine.link}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={medicine.imgLink.includes("https") ? medicine.imgLink : "/placeholder.jpg"}
                            alt={medicine.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>
                            <h3 className="text-lg font-semibold">{medicine.item}</h3>
                            <p className="text-sm text-muted-foreground">Pharmacy: {medicine.name}</p>
                            </span>
                            <span>{medicine.deliveryTime}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Medicine Price</span>
                              <span>₹{medicine.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Price</span>
                              <span>₹{medicine.deliveryCharge}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Cart Total</span>
                              <span>₹{medicine.finalCharge}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{medicine.lson}</span>
                        </div>
                        <Button onClick={() => window.open(medicine.link, '_blank')}>Buy Now</Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </Layout>
  )
}
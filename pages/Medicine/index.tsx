"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  const [pin, setPin] = useState("110001") // Default pin code

  const fetchSuggestions = useCallback(async (search: string) => {
    console.log("Fetching suggestions for:", search)
    if (!search) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/medSearch?name=${encodeURIComponent(search)}`)
      const data = await response.json()
      console.log("Suggestions:", data)
      setSuggestions(data)
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      setSuggestions([])
    }
  }, [])

  useEffect(() => {
    console.log("Query changed:", query)
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

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
    (med) => med.totalPrice >= priceRange[0] && med.totalPrice <= priceRange[1],
  )

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Command className="relative rounded-lg border shadow-md">
              <CommandInput placeholder="Search medicines..." value={query} onValueChange={setQuery} className="h-12" />
              {/*suggestions.length > 0 && (
                <CommandList className="absolute w-full bg-popover">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.medicineName}
                        onSelect={() => {
                          setQuery(suggestion.medicineName)
                          fetchMedicineDetails(suggestion.medicineName, suggestion.packSize)
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{suggestion.medicineName}</span>
                          <span className="text-sm text-muted-foreground">{suggestion.packSize}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              )*/}
            </Command>
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
                  <Slider value={priceRange} onValueChange={setPriceRange} max={5000} step={100} className="py-4" />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>In Stock Only</Label>
                  <Switch checked={inStock} onCheckedChange={setInStock} />
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
                {["Best", "Cheapest", "Fastest"].map((type, index) => {
                  const med = medicines[index]
                  if (!med) return null
                  return (
                    <Card key={type} className={cn("relative overflow-hidden", type === "Best" && "border-primary")}>
                      {type === "Best" && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs">
                          Best Choice
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="flex justify-between">
                          <span>₹{med.totalPrice}</span>
                          <span className="text-sm text-muted-foreground">{med.deliveryTime}</span>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>

              <div className="space-y-4">
                {filteredMedicines.map((medicine) => (
                  <Card key={medicine.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={medicine.image || "/placeholder.svg"}
                            alt={medicine.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">{medicine.name}</h3>
                            <p className="text-sm text-muted-foreground">{medicine.pharmacy}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Medicine Price</span>
                              <span>₹{medicine.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Price</span>
                              <span>₹{medicine.deliveryPrice}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Cart Total</span>
                              <span>₹{medicine.totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Pincode: {medicine.pincode}</span>
                        </div>
                        <Button>Buy Now</Button>
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
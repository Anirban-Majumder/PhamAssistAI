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
import type { LabResult } from "@/lib/types"
import { SearchSkeleton } from "@/components/search-skeleton"
import { Layout } from "@/components/layout"

export default function Labsearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LabResult[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [inStock, setInStock] = useState(true)
  const [pin, setPin] = useState("700001") // Default pin code
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const skipFetchSuggestions = useRef(false)

  // Close suggestions when clicking outside
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
      const response = await fetch(`/api/labSearch?name=${encodeURIComponent(search)}`)
      const data = await response.json()
      //have to check for none
      setSuggestions(data.results[0].hits)
      setShowSuggestions(true)
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      setSuggestions([])
    }
  }, [])

  const displayLabTests = useCallback(
    async (search: string) => {
    setLoading(true)
    try {
        const response = await fetch(`/api/labSearch?name=${encodeURIComponent(search)}`)
        const data = await response.json()
        setTests(data.results[0].hits)
    } catch (error) {
        console.error("Failed to fetch lab tests:", error)
        setTests([])
    }
    setLoading(false)
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


  const filteredTests = tests.filter(
    (med) => parseFloat(med.finalCharge) >= priceRange[0] && parseFloat(med.finalCharge) <= priceRange[1]
  )

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6 h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-4">
          <div className="relative flex-1" ref={searchRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Labs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="h-12 pl-10"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg bg-neutral-200 dark:bg-neutral-800">
                <div className="p-1">
                  {suggestions.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      No results found
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.itemName }
                        className="px-2 py-1.5 hover:bg-muted rounded-sm cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          skipFetchSuggestions.current = true
                          setQuery(suggestion.itemName)
                          setShowSuggestions(false)
                          displayLabTests(suggestion.itemName)
                        }}
                      >
                        <div className="text-sm font-medium">{suggestion.itemName}</div>
                        <div className="text-xs text-muted-foreground">
                        Contains {suggestion.testCount ? suggestion.testCount : 1} tests 
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
          tests.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Cheapest", "Fastest"].map((type, index) => {
                  const med = tests[index]
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
                {filteredTests.map((labTest) => (
                  <Card key={labTest.link}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden">
                          <img
                            src={labTest.imgLink || "/placeholder.svg"}
                            alt={labTest.name }
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>
                            <h3 className="text-lg font-semibold">{labTest.item }</h3>
                            <p className="text-sm text-muted-foreground">Pharmacy: {labTest.name}</p>
                            </span>
                            <span>{labTest.deliveryTime}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>labTest Price</span>
                              <span>₹{labTest.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Price</span>
                              <span>₹{labTest.deliveryCharge}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Cart Total</span>
                              <span>₹{labTest.finalCharge}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{labTest.lson}</span>
                        </div>
                        <Button onClick={() => window.open(labTest.link, '_blank')}>Buy Now</Button>
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
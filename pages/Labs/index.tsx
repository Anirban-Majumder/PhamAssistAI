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
import { DiagnosticData } from "@/lib/types"
import type { LabResult } from "@/lib/types"
import { SearchSkeleton } from "@/components/search-skeleton"
import { Layout } from "@/components/layout"
import { TestDetails } from "@/components/test-details";


export default function Labsearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LabResult[]>([])
  const [testData, setTestData] = useState<DiagnosticData>()
  const [loading, setLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [inStock, setInStock] = useState(true)
  const [pin, setPin] = useState("700001") // Default pin code
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const skipFetchSuggestions = useRef(false)

  const fetchPinFromCoords = async (lat: number, lon: number) => {
    console.log(`Latitude: ${lat}, Longitude: ${lon}`);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      if (data.address.postcode) {
        setPin(data.address.postcode);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchPinFromCoords(latitude, longitude);
        setLoading(false);
      },
      () => {
        console.warn("User denied location access. Using default PIN.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

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
        const response = await fetch(`/api/labDetails?name=${encodeURIComponent(search)}&pin=${pin}`)
        const data = await response.json()
        setTestData(data)
    } catch (error) {
        console.error("Failed to fetch lab tests:", error)
        setTestData(undefined)
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



  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6 h-full overflow-y-auto scrollbar-hide">
        <h1 className="text-2xl font-semibold">Search for Labs</h1>
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
                          displayLabTests(suggestion.url)
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
          <TestDetails data={testData} />
        )}
      </div>
    </Layout>
  )
}
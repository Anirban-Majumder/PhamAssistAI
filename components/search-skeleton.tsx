import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
export function SearchSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Top grid skeleton for "Cheapest" & "Fastest" cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            {/* Badge placeholder */}
            <div className="absolute top-0 right-0 px-2 py-1 text-xs">
              <div className="w-10 h-4 bg-muted animate-pulse rounded" />
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <div className="w-16 h-6 bg-muted animate-pulse rounded" />
                <div className="w-12 h-6 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* List skeleton for medicine cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Image placeholder */}
                <div className="w-32 h-32 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-4">
                  {/* Medicine name & pharmacy info */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="w-32 h-6 bg-muted animate-pulse rounded" />
                        <div className="w-24 h-4 bg-muted animate-pulse rounded mt-1" />
                      </div>
                      <div className="w-16 h-6 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  {/* Price details */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-28 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted animate-pulse rounded-full" />
                  <div className="w-20 h-4 bg-muted animate-pulse rounded" />
                </div>
                <div className="w-20 h-8 bg-muted animate-pulse rounded" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

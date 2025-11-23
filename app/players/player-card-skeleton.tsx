import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlayerCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-md" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Club Info */}
        <div className="px-6 pb-6 pt-2 border-t border-border/50">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PlayerListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => i).map((index) => (
        <PlayerCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}


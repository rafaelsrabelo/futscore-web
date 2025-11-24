import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CompactCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export function CompactCard({ 
  title, 
  icon, 
  children, 
  className,
  headerClassName 
}: CompactCardProps) {
  return (
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <CardHeader className={cn("pb-3 pt-4 px-4", headerClassName)}>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 flex-1 flex flex-col">
        {children}
      </CardContent>
    </Card>
  );
}


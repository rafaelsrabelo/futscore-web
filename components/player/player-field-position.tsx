import { CompactCard } from "@/components/ui/compact-card";
import type { Position } from "@/lib/types";
import { MapPin } from "lucide-react";

interface PlayerFieldPositionProps {
  position: Position;
  compact?: boolean;
}

export function PlayerFieldPosition({ position, compact = true }: PlayerFieldPositionProps) {
  const getPositionPercentage = () => {
    switch (position) {
      case "GOALKEEPER": return "12%";
      case "DEFENDER": return "30%";
      case "MIDFIELDER": return "50%";
      case "FORWARD": return "78%";
      default: return "50%";
    }
  };

  const getPositionLabel = () => {
    switch (position) {
      case "GOALKEEPER": return "GOL";
      case "DEFENDER": return "DEF";
      case "MIDFIELDER": return "MEI";
      case "FORWARD": return "ATA";
      default: return "?";
    }
  };

  return (
    <CompactCard 
      title="Posição em Campo" 
      icon={<MapPin className="w-4 h-4 text-primary" />}
    >
      <div className="flex items-center justify-center h-full">
        {/* Campo horizontal mini - 100px */}
        <div className="relative w-full h-[100px] bg-linear-to-r from-green-900/20 via-green-900/20 to-green-950/20 rounded border border-green-500/20 overflow-hidden">
        {/* Field Lines */}
        <div className="absolute inset-0">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-500/30" />
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-green-500/30" />
          {/* Penalty Areas */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-6 border-r border-y border-green-500/30" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-6 border-l border-y border-green-500/30" />
        </div>
        
        {/* Player Marker */}
        <div 
          className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
          style={{
            top: "50%",
            left: getPositionPercentage()
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30" />
            <div className="relative w-full h-full bg-primary rounded-full border-2 border-primary-foreground flex items-center justify-center shadow-lg shadow-primary/50">
              <span className="text-[8px] font-bold text-primary-foreground">
                {getPositionLabel()}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </CompactCard>
  );
}


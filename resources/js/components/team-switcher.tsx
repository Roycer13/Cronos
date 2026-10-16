import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Area } from "@/data/areas-data"

interface TeamSwitcherProps {
  areas: Area[]
  selectedArea: Area
  onChange: (area: Area) => void
}

export function TeamSwitcher({ areas, selectedArea, onChange }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (area: Area) => {
    onChange(area)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <selectedArea.logo className="h-5 w-5" />
            <span>{selectedArea.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0">
        <div className="flex flex-col">
          {areas.map((area) => (
            <button
              key={area.name}
              onClick={() => handleSelect(area)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm hover:bg-muted",
                selectedArea.name === area.name && "bg-muted font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <area.logo className="h-5 w-5" />
                <span>{area.name}</span>
              </div>
              {selectedArea.name === area.name && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

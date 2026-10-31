import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const priceRanges = [
  { id: "under-100", label: "Under ₹100" },
  { id: "100-250", label: "₹100 - ₹250" },
  { id: "250-500", label: "₹250 - ₹500" },
  { id: "above-500", label: "Above ₹500" },
];

const nutritionFilters = [
  { id: "high-protein", label: "High Protein" },
  { id: "low-sugar", label: "Low Sugar" },
  { id: "multigrain", label: "Multigrain" },
  { id: "high-fiber", label: "High Fiber" },
];

const dietFilters = [
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "keto", label: "Keto Friendly" },
  { id: "diabetic", label: "Diabetic Friendly" },
];

const ratingFilters = [
  { id: "4-plus", label: "4★ & above" },
  { id: "3-plus", label: "3★ & above" },
  { id: "2-plus", label: "2★ & above" },
];

const packFilters = [
  { id: "single", label: "Single Pack" },
  { id: "bulk", label: "Bulk / Family Pack" },
];

const ProductFilters = ({ isOpen, onClose }: ProductFiltersProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 overflow-y-auto bg-card">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-xl text-foreground">
            Filters
          </SheetTitle>
          <SheetDescription className="font-body text-sm text-muted-foreground">
            Refine your product search
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold text-foreground">
              Price Range
            </h4>
            <div className="px-2">
              <Slider
                defaultValue={[0, 500]}
                max={1000}
                step={50}
                className="mb-2"
              />
              <div className="flex justify-between font-body text-xs text-muted-foreground">
                <span>₹0</span>
                <span>₹1000+</span>
              </div>
            </div>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <div key={range.id} className="flex items-center space-x-2">
                  <Checkbox id={range.id} />
                  <Label
                    htmlFor={range.id}
                    className="font-body text-sm text-foreground cursor-pointer"
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold text-foreground">
              Nutrition
            </h4>
            <div className="space-y-2">
              {nutritionFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox id={filter.id} />
                  <Label
                    htmlFor={filter.id}
                    className="font-body text-sm text-foreground cursor-pointer"
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Diet Type */}
          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold text-foreground">
              Diet Type
            </h4>
            <div className="space-y-2">
              {dietFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox id={filter.id} />
                  <Label
                    htmlFor={filter.id}
                    className="font-body text-sm text-foreground cursor-pointer"
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold text-foreground">
              Customer Rating
            </h4>
            <div className="space-y-2">
              {ratingFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox id={filter.id} />
                  <Label
                    htmlFor={filter.id}
                    className="font-body text-sm text-foreground cursor-pointer"
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Pack Type */}
          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold text-foreground">
              Pack Type
            </h4>
            <div className="space-y-2">
              {packFilters.map((filter) => (
                <div key={filter.id} className="flex items-center space-x-2">
                  <Checkbox id={filter.id} />
                  <Label
                    htmlFor={filter.id}
                    className="font-body text-sm text-foreground cursor-pointer"
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1 font-body"
              onClick={onClose}
            >
              Clear All
            </Button>
            <Button
              className="flex-1 bg-primary font-body text-primary-foreground hover:bg-primary/90"
              onClick={onClose}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductFilters;

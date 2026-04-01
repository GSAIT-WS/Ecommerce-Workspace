import { MapPin, Check, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  pincode: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  deliveryAvailable?: boolean;
}

const AddressCard = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  deliveryAvailable = true,
}: AddressCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-background"
        }`}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Address type badge */}
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-full bg-secondary/20 px-3 py-1 font-body text-xs font-semibold uppercase text-secondary-foreground"
        >
          {address.type}
        </Badge>
        {address.isDefault && (
          <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Default
          </Badge>
        )}
      </div>

      {/* Name and phone */}
      <div className="mb-2">
        <p className="font-display font-semibold text-foreground">
          {address.name}
        </p>
        <p className="font-body text-sm text-muted-foreground">
          {address.phone}
        </p>
      </div>

      {/* Address details */}
      <div className="mb-3 flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div>
          <p className="font-body text-sm text-foreground">{address.address}</p>
          {address.landmark && (
            <p className="font-body text-xs text-muted-foreground">
              Landmark: {address.landmark}
            </p>
          )}
          <p className="font-body text-xs text-muted-foreground">
            {address.pincode}
          </p>
        </div>
      </div>

      {/* Delivery availability */}
      {deliveryAvailable ? (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-secondary" />
          <span className="font-body text-xs font-medium text-secondary">
            Delivery available at this location
          </span>
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span className="font-body text-xs font-medium text-destructive">
            Delivery not available
          </span>
        </div>
      )}

      {/* Edit button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="gap-2 font-body text-sm text-primary hover:bg-primary/10"
      >
        <Edit2 className="h-4 w-4" />
        Edit Address
      </Button>
    </div>
  );
};

export default AddressCard;

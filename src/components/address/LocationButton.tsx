import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocationButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const LocationButton = ({
  onClick,
  loading = false,
  disabled = false,
  className,
  children = "Use Current Location",
}: LocationButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-2", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      {children}
    </Button>
  );
};

export default LocationButton;

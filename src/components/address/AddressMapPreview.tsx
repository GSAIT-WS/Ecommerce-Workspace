import { MapPin } from "lucide-react";

interface AddressMapPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
}

/**
 * Static map preview using OpenStreetMap static tile.
 * No API key required.
 */
const AddressMapPreview = ({
  latitude,
  longitude,
  address,
  className = "",
}: AddressMapPreviewProps) => {
  // bbox: minLon,minLat,maxLon,maxLat
  const delta = 0.008;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  const tileUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-muted/30 ${className}`}>
      <div className="relative aspect-[2/1] w-full">
        <iframe
          title="Address map preview"
          src={tileUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/90 px-3 py-2 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
            <p className="truncate text-sm font-medium text-foreground">
              {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressMapPreview;

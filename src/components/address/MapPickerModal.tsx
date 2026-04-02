import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { reverseGeocode, type GeocodedAddress } from "@/services/reverseGeocodeService";
import "leaflet/dist/leaflet.css";

// Fix default marker icon in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946]; // Bangalore

export interface MapPickerResult {
  latitude: number;
  longitude: number;
  address: GeocodedAddress;
}

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (result: MapPickerResult) => void;
  initialCenter?: [number, number];
}

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPositionChange(lat, lng);
    },
  });
  return null;
}

const MapPickerModal = ({
  open,
  onClose,
  onConfirm,
  initialCenter,
}: MapPickerModalProps) => {
  const [position, setPosition] = useState<[number, number]>(
    initialCenter || DEFAULT_CENTER
  );
  const [address, setAddress] = useState<GeocodedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get address");
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      fetchAddress(lat, lng);
    },
    [fetchAddress]
  );

  useEffect(() => {
    if (open && !address && !loading) {
      fetchAddress(position[0], position[1]);
    }
  }, [open, position, address, loading, fetchAddress]);

  const handleConfirm = () => {
    if (address) {
      onConfirm({
        latitude: position[0],
        longitude: position[1],
        address,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Pick location on map</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Click on the map or drag the marker to set your delivery location
          </p>
        </DialogHeader>

        <div className="h-[320px] w-full relative">
          <MapContainer
            {...({
              center: position,
              zoom: 15,
              className: "h-full w-full rounded-b-lg",
              scrollWheelZoom: true,
            } as any)}
          >
            <TileLayer
              {...({
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              } as any)}
            />
            <Marker
              {...({
                position,
                draggable: true,
                eventHandlers: {
                  dragend: (e: any) => {
                    const m = e.target;
                    const { lat, lng } = m.getLatLng();
                    handlePositionChange(lat, lng);
                  },
                },
              } as any)}
            />
            <MapClickHandler onPositionChange={handlePositionChange} />
          </MapContainer>
        </div>

        <div className="p-4 border-t bg-muted/30">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detecting address...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : address ? (
            <p className="text-sm font-medium text-foreground">
              {address.displayAddress}
            </p>
          ) : null}
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!address || loading}>
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapPickerModal;

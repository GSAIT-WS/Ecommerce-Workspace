import { useState } from "react";
import { Map, PenLine, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LocationButton from "./LocationButton";
import MapPickerModal from "./MapPickerModal";
import AddressFormModal from "./AddressFormModal";
import { reverseGeocode, searchPlace } from "@/services/reverseGeocodeService";
import { toast } from "sonner";
import type { GeocodedAddress } from "@/services/reverseGeocodeService";
import type { AddressFormInitialValues } from "./AddressFormModal";
import type { SavedAddressData } from "./AddressFormModal";

interface LocationAddressSelectorProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: SavedAddressData) => void;
  getAuthToken?: () => string | null;
}

const LocationAddressSelector = ({
  open,
  onClose,
  onSuccess,
  getAuthToken,
}: LocationAddressSelectorProps) => {
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<AddressFormInitialValues | undefined>();

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setFormInitialValues({
            recipient_name: "",
            phone: "",
            address_line1: address.line1,
            address_line2: address.line2,
            city: address.city,
            state: address.state,
            postal_code: address.pincode,
            country: address.country,
            latitude,
            longitude,
          });
          setShowAddressForm(true);
          onClose();
        } catch (e) {
          toast.error("Could not get address. Please enter manually.");
          setFormInitialValues(undefined);
          setShowAddressForm(true);
          onClose();
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        if (error.code === 1) {
          toast.error("Location permission denied. Please enter your address manually.");
        } else if (error.code === 2) {
          toast.error("Location unavailable. Please enter your address manually.");
        } else {
          toast.error("Could not get your location. Please enter manually.");
        }
        setFormInitialValues(undefined);
        setShowAddressForm(true);
        onClose();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handlePickOnMap = () => {
    setShowMapPicker(true);
    onClose();
  };

  const handleMapConfirm = (result: {
    latitude: number;
    longitude: number;
    address: GeocodedAddress;
  }) => {
    setShowMapPicker(false);
    setFormInitialValues({
      recipient_name: "",
      phone: "",
      address_line1: result.address.line1,
      address_line2: result.address.line2,
      city: result.address.city,
      state: result.address.state,
      postal_code: result.address.pincode,
      country: result.address.country,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setShowAddressForm(true);
  };

  const handleEnterManually = () => {
    setFormInitialValues(undefined);
    setShowAddressForm(true);
    onClose();
  };

  const handlePlaceSearch = async () => {
    if (!placeSearchQuery.trim()) {
      toast.error("Enter a place to search");
      return;
    }
    setPlaceSearchLoading(true);
    try {
      const result = await searchPlace(placeSearchQuery);
      if (result) {
        setFormInitialValues({
          recipient_name: "",
          phone: "",
          address_line1: result.address.line1,
          address_line2: result.address.line2,
          city: result.address.city,
          state: result.address.state,
          postal_code: result.address.pincode,
          country: result.address.country,
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setShowAddressForm(true);
        setPlaceSearchQuery("");
        onClose();
      } else {
        toast.error("Place not found. Try a different search or enter manually.");
      }
    } catch {
      toast.error("Search failed. Try entering manually.");
    } finally {
      setPlaceSearchLoading(false);
    }
  };

  const handleFormSuccess = (data?: SavedAddressData) => {
    setShowAddressForm(false);
    setFormInitialValues(undefined);
    onSuccess(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delivery Address</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you&apos;d like to add your address
            </p>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <LocationButton
              onClick={handleUseCurrentLocation}
              loading={gpsLoading}
              className="w-full justify-start h-12"
            >
              Use Current Location
            </LocationButton>
            <p className="text-xs text-muted-foreground px-1">
              Allow location access to quickly set your delivery address.
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 h-12"
              onClick={handlePickOnMap}
            >
              <Map className="h-4 w-4" />
              Pick on Map
            </Button>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for a place (e.g. Koramangala, Bangalore)"
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePlaceSearch()}
                  className="h-12"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 shrink-0"
                  onClick={handlePlaceSearch}
                  disabled={placeSearchLoading || !placeSearchQuery.trim()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Search by area, landmark, or address.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 h-12"
              onClick={handleEnterManually}
            >
              <PenLine className="h-4 w-4" />
              Enter Manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MapPickerModal
        open={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={handleMapConfirm}
      />

      <AddressFormModal
        open={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          setFormInitialValues(undefined);
        }}
        onSuccess={handleFormSuccess}
        initialValues={formInitialValues}
        getAuthToken={getAuthToken}
      />
    </>
  );
};

export default LocationAddressSelector;

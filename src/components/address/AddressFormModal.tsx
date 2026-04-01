import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addAddress,
  updateAddress,
  type AddressFormData,
  type ApiAddress,
} from "@/services/addressApi";
import { toast } from "sonner";

const addressSchema = z.object({
  recipient_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Enter a valid 10-digit phone number")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit phone number"),
  address_line1: z.string().min(3, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().default("IN"),
  label: z.enum(["Home", "Work", "Other"]).default("Home"),
  is_default: z.boolean().default(false),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export interface AddressFormInitialValues {
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SavedAddressData {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: SavedAddressData) => void;
  initialValues?: AddressFormInitialValues;
  /** For backward-compat: function that returns the JWT token */
  getAuthToken?: () => string | null;
  /** Direct token — takes priority over getAuthToken */
  token?: string | null;
  /** When set, the modal is in edit mode */
  editAddress?: ApiAddress | null;
}

const AddressFormModal = ({
  open,
  onClose,
  onSuccess,
  initialValues,
  getAuthToken,
  token: directToken,
  editAddress,
}: AddressFormModalProps) => {
  const isEditMode = !!editAddress;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipient_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "IN",
      label: "Home",
      is_default: false,
      latitude: null,
      longitude: null,
    },
  });

  // Populate form when modal opens
  useEffect(() => {
    if (!open) return;
    reset();

    if (editAddress) {
      setValue("recipient_name", editAddress.recipient_name);
      setValue("phone", editAddress.phone);
      setValue("address_line1", editAddress.address_line1);
      setValue("address_line2", editAddress.address_line2 ?? "");
      setValue("city", editAddress.city);
      setValue("state", editAddress.state);
      setValue("postal_code", editAddress.postal_code);
      setValue("label", (editAddress.label as "Home" | "Work" | "Other") ?? "Home");
      setValue("is_default", !!editAddress.is_default);
      if (editAddress.latitude != null) setValue("latitude", editAddress.latitude);
      if (editAddress.longitude != null) setValue("longitude", editAddress.longitude);
    } else if (initialValues) {
      if (initialValues.recipient_name) setValue("recipient_name", initialValues.recipient_name);
      if (initialValues.phone) setValue("phone", initialValues.phone);
      if (initialValues.address_line1) setValue("address_line1", initialValues.address_line1);
      if (initialValues.address_line2 !== undefined) setValue("address_line2", initialValues.address_line2);
      if (initialValues.city) setValue("city", initialValues.city);
      if (initialValues.state) setValue("state", initialValues.state);
      if (initialValues.postal_code) setValue("postal_code", initialValues.postal_code);
      if (initialValues.country) setValue("country", initialValues.country);
      if (initialValues.label) setValue("label", initialValues.label as "Home" | "Work" | "Other");
      if (initialValues.latitude != null) setValue("latitude", initialValues.latitude);
      if (initialValues.longitude != null) setValue("longitude", initialValues.longitude);
    }
  }, [open, editAddress, initialValues, setValue, reset]);

  const onSubmit = async (values: AddressFormValues) => {
    const phone = String(values.phone).replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const token = directToken ?? getAuthToken?.() ?? null;

    console.log(`[CrunchX] AddressFormModal: submit | mode=${isEditMode ? "edit" : "add"} | authenticated=${token ? "yes" : "no"}`);

    // ── Edit mode ────────────────────────────────────────────────────────────
    if (isEditMode && editAddress) {
      if (!token) {
        toast.error("Please log in to edit a saved address.");
        return;
      }
      const data: AddressFormData = {
        ...values,
        phone,
        latitude: values.latitude ?? null,
        longitude: values.longitude ?? null,
      };
      const result = await updateAddress(editAddress.id, data, token);
      if (result.error) {
        // Form is NOT reset — user can correct and retry
        toast.error(result.error);
        return;
      }
      toast.success("Address updated successfully");
      reset();
      onSuccess({
        recipient_name: values.recipient_name,
        phone,
        address_line1: values.address_line1,
        address_line2: values.address_line2,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
      });
      onClose();
      return;
    }

    // ── Add mode ─────────────────────────────────────────────────────────────
    const formData: AddressFormData = {
      ...values,
      phone,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
    };

    // addAddress handles both authenticated (API) and guest (localStorage) cases
    const result = await addAddress(formData, token);

    if (result.error) {
      // Form is NOT reset — user can correct and retry
      toast.error(result.error);
      return;
    }

    if (token) {
      toast.success("Address saved successfully");
    } else {
      toast.success("Address saved locally — log in to save permanently");
    }

    const savedData: SavedAddressData = {
      recipient_name: values.recipient_name,
      phone,
      address_line1: values.address_line1,
      address_line2: values.address_line2,
      city: values.city,
      state: values.state,
      postal_code: values.postal_code,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
    };

    reset();
    onSuccess(savedData);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Address" : "Add Delivery Address"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update your saved address details" : "Enter your delivery address details"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient_name">Full Name</Label>
            <Input
              id="recipient_name"
              {...register("recipient_name")}
              placeholder="John Doe"
              className={errors.recipient_name ? "border-destructive" : ""}
            />
            {errors.recipient_name && (
              <p className="text-xs text-destructive">{errors.recipient_name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="9876543210"
              inputMode="numeric"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              {...register("address_line1")}
              placeholder="House No., Building, Street, Area"
              className={errors.address_line1 ? "border-destructive" : ""}
            />
            {errors.address_line1 && (
              <p className="text-xs text-destructive">{errors.address_line1.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address_line2">
              Address Line 2 <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="address_line2"
              {...register("address_line2")}
              placeholder="Landmark, Floor, Flat No."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Bangalore"
                className={errors.city ? "border-destructive" : ""}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="Karnataka"
                className={errors.state ? "border-destructive" : ""}
              />
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="postal_code">Pincode</Label>
            <Input
              id="postal_code"
              {...register("postal_code")}
              placeholder="560001"
              maxLength={6}
              inputMode="numeric"
              className={errors.postal_code ? "border-destructive" : ""}
            />
            {errors.postal_code && (
              <p className="text-xs text-destructive">{errors.postal_code.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Label</Label>
            <Select
              value={watch("label")}
              onValueChange={(v) => setValue("label", v as "Home" | "Work" | "Other")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEditMode && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_default"
                checked={watch("is_default")}
                onCheckedChange={(checked) => setValue("is_default", !!checked)}
              />
              <Label htmlFor="is_default" className="cursor-pointer font-normal">
                Set as default address
              </Label>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressFormModal;

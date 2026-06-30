"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ImagePlus, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCar, updateCar, uploadCarImage } from "@/lib/actions/cars";
import {
  ADDIS_AREAS,
  CAR_CATEGORIES,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  isAddisArea,
  isCarCategory,
  isFuelOption,
  isTransmissionOption,
  normalizeFuelOption,
} from "@/lib/car-options";
import type { Database } from "@/lib/local-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];
type CarStatus = CarRow["status"];

type CarFormProps = {
  mode: "create" | "edit";
  ownerId: string;
  defaultValues?: CarRow;
  onSuccess?: () => void;
  onSubmit?: (data: CarInsert) => Promise<void>;
};

type FormErrors = Record<string, string>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
  { value: "disabled", label: "Disabled" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
];

const CURRENT_YEAR = new Date().getFullYear();

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(fd: FormData): FormErrors {
  const errors: FormErrors = {};

  const title = fd.get("title") as string;
  if (!title || title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (!(fd.get("make") as string)?.trim()) errors.make = "Make is required.";
  if (!(fd.get("model") as string)?.trim()) errors.model = "Model is required.";

  const year = Number(fd.get("year"));
  if (!year || year < 1980 || year > CURRENT_YEAR + 1) {
    errors.year = `Year must be between 1980 and ${CURRENT_YEAR + 1}.`;
  }

  const rate = Number(fd.get("daily_rate"));
  if (!rate || rate < 1000) {
    errors.daily_rate = "Price per day in Birr must be at least 1000.";
  }

  const category = (fd.get("category") as string)?.trim();
  if (!category || !isCarCategory(category)) {
    errors.category = "Choose a valid category.";
  }

  const location = (fd.get("location") as string)?.trim();
  if (!location || !isAddisArea(location)) {
    errors.location = "Choose a valid Addis area.";
  }

  if (!(fd.get("description") as string)?.trim()) {
    errors.description = "Description is required.";
  }

  const seats = Number(fd.get("seats"));
  if (!seats || seats <= 0) errors.seats = "Seats must be greater than 0.";

  const mileageValue = (fd.get("mileage") as string)?.trim();
  const mileage = Number(mileageValue);
  if (!mileageValue || !Number.isFinite(mileage) || mileage < 0) {
    errors.mileage = "Mileage must be 0 or greater.";
  }

  const transmission = (fd.get("transmission") as string)?.trim();
  if (!transmission || !isTransmissionOption(transmission)) {
    errors.transmission = "Choose a valid transmission.";
  }

  const fuelType = (fd.get("fuel_type") as string)?.trim();
  if (!fuelType || !isFuelOption(fuelType)) {
    errors.fuel_type = "Choose a valid fuel type.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CarForm({ mode, ownerId, defaultValues, onSuccess, onSubmit }: CarFormProps) {
  const router = useRouter();
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [globalError, setGlobalError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    defaultValues?.image_urls?.[0] ?? null,
  );

  // Controlled selects (Radix Select doesn't work as uncontrolled in FormData)
  const [status, setStatus] = React.useState<CarStatus>(
    defaultValues?.status ?? "available",
  );
  const [category, setCategory] = React.useState(defaultValues?.category ?? "");
  const [location, setLocation] = React.useState(defaultValues?.location ?? "");
  const [transmission, setTransmission] = React.useState(
    defaultValues?.transmission ?? "",
  );
  const [fuelType, setFuelType] = React.useState(
    normalizeFuelOption(defaultValues?.fuel_type) ?? "",
  );

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const fieldErrors = validate(fd);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // --- Handle image upload ---
      let imageUrls = defaultValues?.image_urls ?? [];

      const imageFile = fd.get("image_file") as File | null;
      const imageUrl = (fd.get("image_url") as string)?.trim();

      if (imageFile && imageFile.size > 0) {
        const uploadedUrl = await uploadCarImage(imageFile, ownerId);
        imageUrls = [uploadedUrl, ...imageUrls];
      } else if (imageUrl) {
        imageUrls = [imageUrl, ...imageUrls];
      }

      // --- Build payload ---
      const payload = {
        owner_id: ownerId,
        title: (fd.get("title") as string).trim(),
        make: (fd.get("make") as string).trim(),
        model: (fd.get("model") as string).trim(),
        year: Number(fd.get("year")),
        category,
        mileage: Number(fd.get("mileage")),
        daily_rate: Number(fd.get("daily_rate")),
        location,
        description: (fd.get("description") as string)?.trim() || null,
        status,
        image_urls: imageUrls,
        seats: Number(fd.get("seats")),
        transmission: transmission || null,
        fuel_type: fuelType || null,
      };

      // If onSubmit is provided, use it instead
      if (onSubmit) {
        await onSubmit(payload);
      } else if (mode === "create") {
        await createCar(payload);
      } else if (defaultValues) {
        await updateCar(defaultValues.id, payload);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/owner/dashboard/cars");
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full border-sky-100 bg-white shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950">
      <CardHeader>
        <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
          <ImagePlus className="size-6" aria-hidden="true" />
        </div>
        <CardTitle>{mode === "create" ? "Add new car" : "Edit listing"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "List your vehicle for Addis renters with a daily price in Ethiopian Birr."
            : "Update your Addis pickup area, Birr pricing, and listing details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {globalError && (
          <div
            id="form-error"
            className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* ---- Title ---- */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. 2022 Toyota Corolla - Bole City Sedan"
              defaultValue={defaultValues?.title}
              aria-invalid={!!errors.title}
            />
            {errors.title && <FieldError message={errors.title} />}
          </div>

          {/* ---- Make / Model / Year row ---- */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                name="make"
                placeholder="Toyota"
                defaultValue={defaultValues?.make}
                aria-invalid={!!errors.make}
              />
              {errors.make && <FieldError message={errors.make} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                placeholder="Corolla"
                defaultValue={defaultValues?.model}
                aria-invalid={!!errors.model}
              />
              {errors.model && <FieldError message={errors.model} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min={1980}
                max={CURRENT_YEAR + 1}
                placeholder={String(CURRENT_YEAR)}
                defaultValue={defaultValues?.year}
                aria-invalid={!!errors.year}
              />
              {errors.year && <FieldError message={errors.year} />}
            </div>
          </div>

          {/* ---- Category / Seats / Mileage row ---- */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_CATEGORIES.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="category" type="hidden" value={category} />
              {errors.category && <FieldError message={errors.category} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seats">Seats *</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                min={1}
                placeholder="5"
                defaultValue={defaultValues?.seats ?? ""}
                aria-invalid={!!errors.seats}
              />
              {errors.seats && <FieldError message={errors.seats} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mileage">Mileage *</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                min={0}
                step={100}
                placeholder="42000"
                defaultValue={defaultValues?.mileage ?? ""}
                aria-invalid={!!errors.mileage}
              />
              {errors.mileage && <FieldError message={errors.mileage} />}
            </div>
          </div>

          {/* ---- Price / Area row ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="daily_rate">Daily rate in Birr *</Label>
              <Input
                id="daily_rate"
                name="daily_rate"
                type="number"
                step="1"
                min="1000"
                placeholder="2500"
                defaultValue={defaultValues?.daily_rate}
                aria-invalid={!!errors.daily_rate}
              />
              <p className="text-xs text-muted-foreground">
                Use Ethiopian Birr. Minimum daily rate is Br 1,000.
              </p>
              {errors.daily_rate && <FieldError message={errors.daily_rate} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Addis area *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location" aria-invalid={!!errors.location}>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {ADDIS_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="location" type="hidden" value={location} />
              {errors.location && <FieldError message={errors.location} />}
            </div>
          </div>

          {/* ---- Description ---- */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell Addis renters about the car - condition, features, pickup rules..."
              rows={4}
              defaultValue={defaultValues?.description ?? ""}
              aria-invalid={!!errors.description}
            />
            {errors.description && <FieldError message={errors.description} />}
          </div>

          {/* ---- Image upload ---- */}
          <div className="grid gap-3">
            <Label>Image</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* File upload */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/40 px-4 py-8 text-sm text-slate-500 transition-colors hover:border-primary/40 hover:bg-sky-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Upload className="size-6" aria-hidden="true" />
                  <span>Click to upload an image</span>
                </button>
                <input
                  ref={fileInputRef}
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              {/* URL fallback */}
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-muted-foreground">
                  Or paste an image URL
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://example.com/car.jpg"
                  defaultValue=""
                />
              </div>
            </div>

            {/* Preview */}
            {imagePreview && (
              <div className="relative mt-1 w-fit">
                <div className="overflow-hidden rounded-xl border dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Car preview"
                    className="h-32 w-auto object-cover"
                  />
                </div>
                <div className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ImagePlus className="size-3" />
                </div>
              </div>
            )}
          </div>

          {/* ---- Status / Transmission / Fuel row ---- */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CarStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="status" type="hidden" value={status} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transmission">Transmission *</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger id="transmission" aria-invalid={!!errors.transmission}>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="transmission" type="hidden" value={transmission} />
              {errors.transmission && <FieldError message={errors.transmission} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fuel_type">Fuel *</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger id="fuel_type" aria-invalid={!!errors.fuel_type}>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input name="fuel_type" type="hidden" value={fuelType} />
              {errors.fuel_type && <FieldError message={errors.fuel_type} />}
            </div>
          </div>

          {/* ---- Submit ---- */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {mode === "create" ? "Create listing" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/owner/dashboard/cars")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Inline error component
// ---------------------------------------------------------------------------

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-[0.8rem] font-medium text-destructive" role="alert">
      {message}
    </p>
  );
}


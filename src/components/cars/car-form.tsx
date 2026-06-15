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
import type { Database } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];
type CarStatus = CarRow["status"];
type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];

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

const TRANSMISSION_OPTIONS = ["Automatic", "Manual", "CVT"] as const;
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "Electric", "Hybrid"] as const;
const STATUS_OPTIONS: { value: CarStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
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
  if (!rate || rate <= 0) errors.daily_rate = "Price per day must be greater than 0.";

  if (!(fd.get("location") as string)?.trim()) errors.location = "Location is required.";

  if (!(fd.get("description") as string)?.trim()) {
    errors.description = "Description is required.";
  }

  const seats = fd.get("seats") as string;
  if (seats && Number(seats) <= 0) errors.seats = "Seats must be greater than 0.";

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
  const [transmission, setTransmission] = React.useState(
    defaultValues?.transmission ?? "",
  );
  const [fuelType, setFuelType] = React.useState(
    defaultValues?.fuel_type ?? "",
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
        daily_rate: Number(fd.get("daily_rate")),
        location: (fd.get("location") as string).trim(),
        description: (fd.get("description") as string)?.trim() || null,
        status,
        image_urls: imageUrls,
        seats: fd.get("seats") ? Number(fd.get("seats")) : null,
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add new car" : "Edit listing"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details below to list your vehicle on GoRent."
            : "Update the details of your existing listing."}
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
              placeholder="e.g. 2022 Toyota Corolla — City Sedan"
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

          {/* ---- Price / Location row ---- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="daily_rate">Price per day ($) *</Label>
              <Input
                id="daily_rate"
                name="daily_rate"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="48.00"
                defaultValue={defaultValues?.daily_rate}
                aria-invalid={!!errors.daily_rate}
              />
              {errors.daily_rate && <FieldError message={errors.daily_rate} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Nairobi West"
                defaultValue={defaultValues?.location}
                aria-invalid={!!errors.location}
              />
              {errors.location && <FieldError message={errors.location} />}
            </div>
          </div>

          {/* ---- Description ---- */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell renters about the car — condition, features, rules…"
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
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input bg-background px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30"
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
                <div className="overflow-hidden rounded-md border">
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

          {/* ---- Status / Seats row ---- */}
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                min={1}
                placeholder="5"
                defaultValue={defaultValues?.seats ?? ""}
              />
              {errors.seats && <FieldError message={errors.seats} />}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ---- Fuel type ---- */}
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="fuel_type">Fuel type</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger id="fuel_type">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ---- Submit ---- */}
          <div className="flex items-center gap-3 pt-2">
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

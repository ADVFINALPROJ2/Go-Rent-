import { ADDIS_ABABA_AREAS, BIO_MAX_LENGTH } from "@/lib/profile/constants";

const ethiopianPhonePattern = /^(\+251\s?9\d{2}\s?\d{3}\s?\d{3}|09\d{8})$/;

export function isValidEthiopianPhone(value: string) {
  return ethiopianPhonePattern.test(value.trim());
}

export function isValidAvatarUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidAddisArea(value: string) {
  return ADDIS_ABABA_AREAS.includes(value as (typeof ADDIS_ABABA_AREAS)[number]);
}

export function validateProfileUpdate(input: {
  fullName: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
}) {
  if (!input.fullName) {
    return "Full name is required.";
  }

  if (input.phone && !isValidEthiopianPhone(input.phone)) {
    return "Phone format must be +251 9XX XXX XXX or 09XX XXX XXX.";
  }

  if (input.bio && input.bio.length > BIO_MAX_LENGTH) {
    return `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`;
  }

  if (input.avatarUrl && !isValidAvatarUrl(input.avatarUrl)) {
    return "Avatar URL must be a valid http or https link.";
  }

  if (input.location && !isValidAddisArea(input.location)) {
    return "Please choose a valid Addis Ababa area.";
  }

  return null;
}

import { getProfileInitials } from "@/lib/profile/constants";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name: string | null;
  avatarUrl: string | null;
  size?: "md" | "lg";
  className?: string;
};

const sizeStyles = {
  md: "size-20 text-xl",
  lg: "size-24 text-2xl",
};

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: ProfileAvatarProps) {
  const sizeClass = sizeStyles[size];

  if (avatarUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={name ?? "Profile photo"}
        className={cn(
          "rounded-full border-4 border-card bg-card object-cover shadow-md",
          sizeClass,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-sky-400 font-bold text-primary-foreground shadow-md",
        sizeClass,
        className,
      )}
    >
      {getProfileInitials(name)}
    </div>
  );
}

import { cn } from "@/lib/utils";

type PageHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  className,
}: PageHeadingProps) {
  return (
    <div className={cn("max-w-3xl space-y-3", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
    </div>
  );
}

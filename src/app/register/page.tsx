"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CarFront, CheckCircle2, Loader2, ShieldCheck, UserPlus } from "lucide-react";

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
import { registerLocalUser } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/db/schema";

type RegisterRole = Extract<UserRole, "renter" | "owner">;

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 8;

function validateRegister(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors: FormErrors = {};

  if (!fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < minPasswordLength) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegisterRole>("renter");
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();
    const nextErrors = validateRegister(
      normalizedName,
      normalizedEmail,
      password,
      confirmPassword,
    );

    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await registerLocalUser({
      fullName: normalizedName,
      email: normalizedEmail,
      password,
      role,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setMessage({
        type: "error",
        text: result.error ?? "Could not create account.",
      });
      return;
    }

    setMessage({ type: "success", text: "Account created. Redirecting..." });
    router.push(result.redirectTo ?? "/renter/dashboard");
    router.refresh();
  }

  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)] dark:bg-[linear-gradient(180deg,#09090b_0%,#0f172a_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="flex items-center">
          <Card className="w-full border-sky-100 bg-white shadow-2xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950">
            <CardHeader className="space-y-2">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <UserPlus className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Join as a renter or start listing cars as an Addis owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
                {message ? (
                  <div
                    className={
                      message.type === "error"
                        ? "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        : "rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
                    }
                    role="status"
                  >
                    {message.text}
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Dagi Tesfaye"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "full-name-error" : undefined}
                  />
                  {errors.fullName ? (
                    <p className="text-sm text-destructive" id="full-name-error">
                      {errors.fullName}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="dagi@example.com"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email ? (
                    <p className="text-sm text-destructive" id="email-error">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password ? (
                      <p className="text-sm text-destructive" id="password-error">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword ? "confirm-password-error" : undefined
                      }
                    />
                    {errors.confirmPassword ? (
                      <p className="text-sm text-destructive" id="confirm-password-error">
                        {errors.confirmPassword}
                      </p>
                    ) : null}
                  </div>
                </div>

                <fieldset className="grid gap-3">
                  <legend className="text-sm font-medium">I want to</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["renter", "owner"] as const).map((option) => (
                      <button
                        className={cn(
                          "rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
                          role === option && "border-primary bg-sky-50 text-accent-foreground ring-2 ring-sky-100 dark:bg-sky-950/50 dark:ring-sky-900",
                        )}
                        key={option}
                        type="button"
                        onClick={() => setRole(option)}
                        aria-pressed={role === option}
                      >
                        <span className="block font-medium capitalize">{option}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {option === "renter"
                            ? "Browse Addis cars and request bookings."
                            : "List vehicles and manage local requests."}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link className="font-medium text-primary hover:underline" href="/login">
                    Login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col justify-center">
          <div className="max-w-xl lg:ml-auto">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Start with GoRent
            </p>
            <h1 className="text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-6xl">
              Your Addis rental journey starts with the right account.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-zinc-300">
              Register once, then rent cars for everyday trips or list your own vehicle for local
              renters across Addis Ababa.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Verified local owners", "Profiles help renters choose trusted Addis hosts."],
              ["Owner ready", "Save your role for future listing workflows."],
              ["Transparent Birr pricing", "Local prices stay clear for mobile and desktop."],
            ].map(([title, description]) => (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950" key={title}>
                <ShieldCheck className="mb-4 size-6 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_160px]">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Car rental account
                </span>
                <h2 className="text-2xl font-semibold">Built for renters and owners.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The same sign-up flow keeps both sides of the marketplace ready for Day 2 auth.
                </p>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-950 text-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80"
                  alt="Car interior for GoRent account setup"
                  className="size-full object-cover opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
                  <CarFront className="size-16 text-white" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

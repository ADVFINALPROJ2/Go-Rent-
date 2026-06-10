"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, CheckCircle2, Loader2, LogIn } from "lucide-react";

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
import { supabase } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/supabase/types";

type FormErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email: string, password: string) {
  const errors: FormErrors = {};

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLogin(email.trim(), password);
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!supabase) {
      setMessage({
        type: "error",
        text: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setIsSubmitting(false);
      setMessage({ type: "error", text: error.message });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let role: ProfileRole = "renter";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      role = profile?.role === "owner" ? "owner" : "renter";
    }

    setMessage({ type: "success", text: "Login successful. Redirecting..." });
    router.push(role === "owner" ? "/owner/dashboard" : "/renter/dashboard");
    router.refresh();
  }

  return (
    <section className="bg-[linear-gradient(180deg,#fbfaf8_0%,#eef6f3_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              Pick up where your next drive begins.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Access saved rentals, manage requests, and keep your GoRent plans moving from one
              clean dashboard.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="relative min-h-64 bg-[#101820] p-6 text-white">
              <div className="absolute inset-x-6 bottom-0 h-28 rounded-t-full bg-primary/25 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold italic">GoRent</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Secure access</span>
                </div>
                <div>
                  <Car className="mb-4 size-14 text-primary" aria-hidden="true" />
                  <p className="max-w-sm text-2xl font-semibold">
                    A sharper way to rent, list, and stay in control.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-5 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                Rentals
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                Listings
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                Messages
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Card className="w-full border-0 shadow-xl">
            <CardHeader className="space-y-2">
              <div className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <LogIn className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Use your GoRent account to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
                {message ? (
                  <div
                    className={
                      message.type === "error"
                        ? "rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        : "rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
                    }
                    role="status"
                  >
                    {message.text}
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="alex@example.com"
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

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  New to GoRent?{" "}
                  <Link className="font-medium text-primary hover:underline" href="/register">
                    Register
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

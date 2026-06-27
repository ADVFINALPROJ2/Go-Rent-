"use client";

import { FormEvent, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { loginAdminUser } from "@/app/auth/actions";
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

type FormErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateAdminLogin(email: string, password: string) {
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

export function AdminLoginForm() {
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

    const nextErrors = validateAdminLogin(email.trim(), password);
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const result = await loginAdminUser({
      email: email.trim(),
      password,
    });

    if (!result.success) {
      setIsSubmitting(false);
      setMessage({
        type: "error",
        text: result.error ?? "Admin login failed.",
      });
      return;
    }

    setMessage({ type: "success", text: "Admin login successful. Redirecting..." });
    router.push(result.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <Card className="w-full border-sky-100 bg-white shadow-2xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950">
      <CardHeader className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl">Admin portal login</CardTitle>
          <CardDescription>
            Sign in with an active administrator account to manage GoRent.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
          {message ? (
            <div
              className={
                message.type === "error"
                  ? "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  : "rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
              }
              role="status"
            >
              {message.text}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="admin-email">Admin email</Label>
            <Input
              id="admin-email"
              name="email"
              placeholder="admin@gorent.test"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "admin-email-error" : undefined}
            />
            {errors.email ? (
              <p className="text-sm text-destructive" id="admin-email-error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "admin-password-error" : undefined}
            />
            {errors.password ? (
              <p className="text-sm text-destructive" id="admin-password-error">
                {errors.password}
              </p>
            ) : null}
          </div>

          <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? "Checking access..." : "Enter admin portal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

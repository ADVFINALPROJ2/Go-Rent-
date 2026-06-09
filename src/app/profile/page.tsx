import { UserRound } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <PageHeading
        eyebrow="Profile"
        title="Keep account details ready for bookings."
        description="Profile records extend Supabase Auth users with role, phone, avatar, and trust metadata."
      />
      <Card>
        <CardHeader>
          <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" name="full-name" placeholder="Alex Johnson" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+254 700 000 000" />
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

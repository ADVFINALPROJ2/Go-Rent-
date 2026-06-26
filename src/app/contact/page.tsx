"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <main className="bg-white text-slate-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary dark:bg-sky-950">
            Get in touch
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Contact <span className="text-primary">GoRent</span> Support
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-zinc-400">
            Have questions about listing your fleet, vehicle protection, or how booking works?
            Our customer care team in Addis is here to support you.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div>
              <h2 className="text-2xl font-black">Our Head Office</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-400">
                Drop by our office or call us during standard operating hours, Monday to Saturday,
                8:30 AM to 6:00 PM East Africa Time.
              </p>
            </div>

            <div className="grid gap-5">
              {[
                {
                  title: "Office Location",
                  body: "Bole Road, Mega Building, Suite 402, Addis Ababa, Ethiopia",
                  icon: MapPin,
                },
                {
                  title: "Direct Phone Lines",
                  body: "Owner Fleet Hotline: +251 900 123 456. Renter Support: +251 911 987 654.",
                  icon: Phone,
                },
                {
                  title: "Email Addresses",
                  body: "General Inquiry: support@gorentaddis.com. Fleet Partnership: fleet@gorentaddis.com.",
                  icon: Mail,
                },
              ].map((item) => (
                <Card className="bg-white dark:bg-zinc-950" key={item.title}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
                      <item.icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                        {item.body}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative">
                <p className="text-sm font-black">Interactive Addis Ababa Map</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                  Mega Building, Bole Road, near Kazanchis junction
                </p>
              </div>
            </div>
          </div>

          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the secure contact form and we will get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                    Message sent successfully
                  </div>
                  <p className="mt-2 text-sm leading-6">
                    Thank you for reaching out to GoRent Ethiopia. One of our support managers
                    will review your ticket and contact you at the email provided.
                  </p>
                  <Button className="mt-4" type="button" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="contact-name">Full name</Label>
                      <Input id="contact-name" name="name" placeholder="Abel Tesfaye" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact-email">Email address</Label>
                      <Input id="contact-email" name="email" type="email" placeholder="abel@gmail.com" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input id="contact-subject" name="subject" placeholder="Owner fleet registration inquiry" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-message">Your message</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      placeholder="Describe your inquiry in detail..."
                      required
                      rows={5}
                    />
                  </div>
                  <Button className="h-11" type="submit">
                    <Send aria-hidden="true" />
                    Submit inquiry ticket
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Label, Input, Textarea, FieldError } from "./ui/field";
import { useToast } from "./ui/toast";
import { track } from "@/lib/analytics";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  audience: z.string().optional(),
  message: z.string().min(10, "Tell us a little more (10+ characters)"),
});

type FormValues = z.infer<typeof schema>;

export function LeadForm({
  variant = "contact",
  submitLabel = "Send message",
}: {
  variant?: "contact" | "affiliate" | "influencer";
  submitLabel?: string;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Stub: no backend. Simulate a network round-trip.
    await new Promise((r) => setTimeout(r, 700));
    track("signup_start", { variant, email: values.email });
    toast({ title: "Thank you!", description: "We received your details and will be in touch." });
    reset();
  }

  const audienceLabel =
    variant === "influencer" ? "Audience size / platform" : variant === "affiliate" ? "Website or channel" : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      {audienceLabel && (
        <div>
          <Label htmlFor="audience">{audienceLabel}</Label>
          <Input id="audience" {...register("audience")} />
        </div>
      )}

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" aria-invalid={!!errors.message} {...register("message")} />
        <FieldError message={errors.message?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting} withArrow>
        {isSubmitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-gradient text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:shadow-glow-lg",
        secondary: "border border-border bg-surface/60 text-text hover:border-primary/50 hover:bg-surface",
        ghost: "border border-border/60 text-text hover:border-primary/50 hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type CommonProps = VariantProps<typeof buttonVariants> & {
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function Arrow() {
  return (
    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
  );
}

export function Button(props: ButtonProps) {
  const { variant, size, withArrow, className, children } = props;
  const classes = cn(buttonVariants({ variant, size }), className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    const isExternal = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(rest as Omit<ButtonAsLink, keyof CommonProps | "href">)}
      >
        {children}
        {withArrow && <Arrow />}
      </Link>
    );
  }

  const { ...rest } = props as ButtonAsButton;
  return (
    <button className={classes} {...(rest as Omit<ButtonAsButton, keyof CommonProps>)}>
      {children}
      {withArrow && <Arrow />}
    </button>
  );
}

export { buttonVariants };

"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, FileText, Plus, Minus } from "lucide-react";
import { mainNav, type NavItem } from "@/data/nav";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "./ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[90] w-full transition-colors duration-300",
        scrolled ? "glass border-b border-border/60" : "border-b border-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo />

        {/* Desktop center menu */}
        <ul className="hidden items-center gap-1 lg:flex">
          {mainNav.map((item) => (
            <DesktopNavItem key={item.label} item={item} />
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/aiao-presale"
            className="inline-flex items-center gap-1.5 px-3 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            <FileText className="h-4 w-4" /> Whitepaper
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <Button href="/contact" variant="ghost" size="sm" onClick={() => track("nav_click", { to: "signin" })}>
            Sign in
          </Button>
          <Button href="/trading" size="sm" withArrow onClick={() => track("cta_click", { where: "navbar" })}>
            Get Started
          </Button>
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60 text-text"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>();

  if (!item.mega) {
    return (
      <li>
        <Link
          href={item.href ?? "#"}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
          onClick={() => track("nav_click", { to: item.label })}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  const wide = item.mega.length > 6;

  return (
    <li
      className="relative"
      onMouseEnter={() => {
        clearTimeout(closeTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
      }}
    >
      <button
        className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-text"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            role="menu"
            className={cn(
              "glass absolute left-1/2 top-11 -translate-x-1/2 rounded-lg p-2 shadow-card",
              wide ? "grid w-[620px] grid-cols-2 gap-1" : "w-[300px]"
            )}
          >
            {item.mega.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label + link.href}
                  href={link.href}
                  role="menuitem"
                  className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-white/5"
                  onClick={() => track("nav_click", { to: link.label })}
                >
                  {Icon && (
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text">{link.label}</span>
                    {link.description && (
                      <span className="block text-xs text-muted">{link.description}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-0 flex h-full w-[min(92vw,380px)] flex-col bg-bg"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <MobileNavItem key={item.label} item={item} onNavigate={onClose} />
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between">
            <LanguageSwitcher />
            <Link href="/aiao-presale" className="inline-flex items-center gap-1.5 text-sm text-muted" onClick={onClose}>
              <FileText className="h-4 w-4" /> Whitepaper
            </Link>
          </div>
        </div>
        <div className="grid gap-2 border-t border-border p-5">
          <Button href="/trading" withArrow onClick={onClose}>
            Get Started
          </Button>
          <Button href="/contact" variant="ghost" onClick={onClose}>
            Sign in
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = React.useState(false);

  if (!item.mega) {
    return (
      <li>
        <Link
          href={item.href ?? "#"}
          onClick={onNavigate}
          className="block rounded-md px-3 py-3 text-base font-medium hover:bg-white/5"
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-base font-medium hover:bg-white/5"
      >
        {item.label}
        {open ? <Minus className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden pl-3"
          >
            {item.mega.map((link) => (
              <li key={link.label + link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

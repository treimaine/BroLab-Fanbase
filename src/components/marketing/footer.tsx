import { Logo } from "@/components/layout/logo";
import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      // Mirrors the navbar NAV_LINKS — keep both in sync.
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/explore", label: "Explore" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { href: "#", label: "Twitter" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "LinkedIn" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-muted-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand — mirrors the navbar mark */}
          <div className="space-y-4">
            <Logo href="/" className="inline-flex" />
            <p className="max-w-xs text-sm leading-relaxed">
              Empowering artists to own their connections and monetize their
              creativity without limits.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">
                {column.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} BroLab Entertainment. All rights reserved.</p>
          <div className="mt-4 flex gap-6 sm:mt-0">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="transition-colors hover:text-foreground"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

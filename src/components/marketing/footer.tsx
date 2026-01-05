import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Brand */}
          <div className="flex items-center">
            <span className="font-serif text-lg font-semibold text-foreground">
              BroLab Fanbase
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} BroLab Fanbase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

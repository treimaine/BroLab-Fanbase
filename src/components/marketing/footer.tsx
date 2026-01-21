import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-muted-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                BroLab
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Empowering artists to own their connections and monetize their creativity without limits.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/explore" className="hover:text-primary transition-colors">Explore Artists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/status" className="hover:text-primary transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 text-xs sm:flex-row text-muted-foreground">
          <p>© {currentYear} BroLab Entertainment. All rights reserved.</p>
          <div className="mt-4 flex gap-6 sm:mt-0">
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-foreground transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Mountain, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

const quickLinks = [
  { href: "#destinations", label: "Destinations" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#booking-form", label: "Book Now" },
];

const destinations = [
  "Mount Hotham",
  "Falls Creek",
  "Mount Buller",
  "The Alpine Crossing",
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-foreground text-background py-16 lg:py-20"
      data-testid="footer"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          <div>
            <a
              href="#"
              className="flex items-center gap-2 text-xl font-bold mb-4"
              data-testid="link-footer-home"
            >
              <Mountain className="h-7 w-7 text-primary" />
              <span className="font-serif">Alpine Shuttle</span>
            </a>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Professional private shuttle transfers to Victoria's best ski resorts,
              wineries, and airports. Door-to-door service with a personal touch.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Destinations</h4>
            <ul className="space-y-2">
              {destinations.map((dest) => (
                <li key={dest}>
                  <a
                    href="#destinations"
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                    data-testid={`link-footer-dest-${dest.toLowerCase().replace(" ", "-")}`}
                  >
                    {dest}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:+61400000000"
                    className="text-background hover:text-primary text-sm transition-colors"
                    data-testid="link-footer-phone"
                  >
                    0400 000 000
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="mailto:info@alpineshuttle.com.au"
                    className="text-background hover:text-primary text-sm transition-colors"
                    data-testid="link-footer-email"
                  >
                    info@alpineshuttle.com.au
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-background/70 text-sm">
                  Bright, Victoria<br />
                  Australia
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              {currentYear} Alpine Shuttle. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-background/60 hover:text-primary text-sm transition-colors"
                data-testid="link-privacy"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-background/60 hover:text-primary text-sm transition-colors"
                data-testid="link-terms"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Mountain, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "#destinations", label: "Destinations" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Testimonials" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      data-testid="header"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between gap-4 h-16 lg:h-20">
          <a
            href="#"
            className="flex items-center gap-2 text-xl lg:text-2xl font-bold"
            data-testid="link-home"
          >
            <Mountain
              className={`h-7 w-7 lg:h-8 lg:w-8 ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            />
            <span
              className={`font-serif ${
                isScrolled ? "text-foreground" : "text-white"
              }`}
            >
              Alpine Shuttle
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+61400000000"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled ? "text-muted-foreground" : "text-white/80"
              }`}
              data-testid="link-phone"
            >
              <Phone className="h-4 w-4" />
              <span>0400 000 000</span>
            </a>
            <Button onClick={scrollToBooking} data-testid="button-enquire-header">
              Enquire Now
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                size="icon"
                variant={isScrolled ? "outline" : "ghost"}
                className={!isScrolled ? "text-white border-white/30" : ""}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Mountain className="h-7 w-7 text-primary" />
                  <span className="font-serif text-xl font-bold">Alpine Shuttle</span>
                </div>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="border-t pt-6 mt-4">
                  <a
                    href="tel:+61400000000"
                    className="flex items-center gap-2 text-muted-foreground mb-4"
                    data-testid="link-mobile-phone"
                  >
                    <Phone className="h-4 w-4" />
                    <span>0400 000 000</span>
                  </a>
                  <Button
                    onClick={scrollToBooking}
                    className="w-full"
                    data-testid="button-mobile-enquire"
                  >
                    Enquire Now
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}

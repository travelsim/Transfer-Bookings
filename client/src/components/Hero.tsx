import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-shuttle.png";

export function Hero() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToDestinations = () => {
    const destinationsSection = document.getElementById("destinations");
    if (destinationsSection) {
      destinationsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Alpine shuttle van on mountain road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center text-white">
        <h1
          className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight"
          data-testid="text-hero-title"
        >
          From your door to anywhere.{" "}
          <span className="text-primary">Hassle free.</span>
        </h1>
        <p
          className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
          data-testid="text-hero-subtitle"
        >
          Private shuttle transfers to Victoria's best ski resorts, wineries, and airports.
          Professional service with a personal touch.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={scrollToBooking}
            data-testid="button-hero-enquire"
          >
            Enquire Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToDestinations}
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white"
            data-testid="button-hero-explore"
          >
            Explore Destinations
          </Button>
        </div>
      </div>

      <button
        onClick={scrollToDestinations}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll to destinations"
        data-testid="button-scroll-down"
      >
        <ChevronDown className="h-10 w-10" />
      </button>
    </section>
  );
}

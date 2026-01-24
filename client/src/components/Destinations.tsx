import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { destinations } from "@shared/schema";

import mountHothamImage from "@/assets/mount-hotham.png";
import fallsCreekImage from "@/assets/falls-creek.png";
import mountBullerImage from "@/assets/mount-buller.png";
import alpineCrossingImage from "@/assets/alpine-crossing.png";

const imageMap: Record<string, string> = {
  "mount-hotham": mountHothamImage,
  "falls-creek": fallsCreekImage,
  "mount-buller": mountBullerImage,
  "alpine-crossing": alpineCrossingImage,
};

export function Destinations() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="destinations"
      className="py-20 lg:py-28 bg-background"
      data-testid="section-destinations"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            data-testid="text-destinations-title"
          >
            Escape to the mountains.
          </h2>
          <p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            data-testid="text-destinations-subtitle"
          >
            We provide door-to-door shuttle services to Victoria's premier alpine destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden cursor-pointer hover-elevate"
              onClick={scrollToBooking}
              data-testid={`card-destination-${destination.id}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={imageMap[destination.image]}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3
                    className="font-serif text-lg lg:text-xl font-semibold text-white"
                    data-testid={`text-destination-name-${destination.id}`}
                  >
                    {destination.name}
                  </h3>
                </div>
              </div>
              <CardContent className="p-4">
                <p
                  className="text-sm text-muted-foreground mb-3 line-clamp-2"
                  data-testid={`text-destination-desc-${destination.id}`}
                >
                  {destination.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all gap-1">
                  Book now <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

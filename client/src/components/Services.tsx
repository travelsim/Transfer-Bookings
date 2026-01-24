import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain, Wine, Plane } from "lucide-react";
import wineryImage from "@/assets/winery-tours.png";
import airportImage from "@/assets/airport-pickup.png";
import fallsCreekImage from "@/assets/falls-creek.png";

const services = [
  {
    id: "mountain-escape",
    title: "Escape to the mountains",
    description:
      "Forget about chains, icy roads and trying to fit you and your gear into a car. Your luggage is stored safely in our rooftop luggage pod which means there's more room for you to relax in comfort all the way to the top of the mountain, no matter the conditions.",
    extendedDescription:
      "With door-to-door service to Mount Buller, Mount Hotham, and Falls Creek, the lifts are basically turning a few meters from your front door.",
    image: fallsCreekImage,
    icon: Mountain,
    ctaText: "Explore mountain services",
    reverse: false,
  },
  {
    id: "wine-tours",
    title: "Relax in the valleys",
    description:
      "Leave the keys at home and wine and dine your way through the best of Victoria's wine regions. Full and half day tours to your favourite wineries or let us plan the perfect tour for you and your friends.",
    extendedDescription:
      "Visit the King Valley, Alpine Valleys, and Beechworth wine regions with a knowledgeable local guide.",
    image: wineryImage,
    icon: Wine,
    ctaText: "Read about winery tours",
    reverse: true,
  },
  {
    id: "airport-pickup",
    title: "Leave your stress at the airport",
    description:
      "Step out of the terminal into the Alpine Shuttle van and let us worry about the rest. With airport pickups from Melbourne Tullamarine, Melbourne Avalon and Albury airports, you can leave all the stress inside the airport.",
    extendedDescription:
      "Relax all of the way to your destination with our comfortable, on-time airport transfer service.",
    image: airportImage,
    icon: Plane,
    ctaText: "Find out more",
    reverse: false,
  },
];

export function Services() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="services"
      className="py-20 lg:py-28 bg-background"
      data-testid="section-services"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            data-testid="text-services-title"
          >
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From ski trips to wine tours, we've got you covered with comfortable,
            reliable transport throughout Victoria.
          </p>
        </div>

        <div className="space-y-20 lg:space-y-32">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  service.reverse ? "lg:grid-flow-dense" : ""
                }`}
                data-testid={`service-${service.id}`}
              >
                <div
                  className={`relative ${
                    service.reverse ? "lg:col-start-2" : ""
                  }`}
                >
                  <div className="aspect-[16/10] rounded-md overflow-hidden shadow-xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground p-3 rounded-md shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className={service.reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <h3
                    className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
                    data-testid={`text-service-title-${service.id}`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-muted-foreground text-lg mb-4 leading-relaxed"
                    data-testid={`text-service-desc-${service.id}`}
                  >
                    {service.description}
                  </p>
                  <p className="text-foreground mb-6 leading-relaxed">
                    {service.extendedDescription}
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={scrollToBooking}
                    className="group"
                    data-testid={`button-service-${service.id}`}
                  >
                    {service.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

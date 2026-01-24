import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import aboutImage from "@/assets/about-service.png";

const features = [
  "Door-to-door service from anywhere in Victoria",
  "Rooftop luggage storage for all your gear",
  "Customisable seating for maximum comfort",
  "Accredited and experienced local drivers",
  "All-weather capable vehicles",
  "Child seats available on request",
];

export function About() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking-form");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="about"
      className="py-20 lg:py-28 bg-card"
      data-testid="section-about"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[16/10] rounded-md overflow-hidden shadow-xl">
              <img
                src={aboutImage}
                alt="Professional shuttle service"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-md shadow-lg hidden md:block">
              <div className="text-3xl font-bold">10+</div>
              <div className="text-sm opacity-90">Years Experience</div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2
              className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
              data-testid="text-about-title"
            >
              Professional service with a{" "}
              <span className="text-primary">personal touch.</span>
            </h2>
            <p
              className="text-muted-foreground text-lg mb-6 leading-relaxed"
              data-testid="text-about-description"
            >
              Experience the joy of hassle-free transport from your front door to anywhere
              you want to go. Our vans are equipped with rooftop luggage storage and
              customisable seating, and our accredited drivers will make sure you have
              everything you need to make your journey as comfortable as possible.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3"
                  data-testid={`text-about-feature-${index}`}
                >
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              onClick={scrollToBooking}
              data-testid="button-about-meet"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

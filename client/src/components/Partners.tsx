import { partners } from "@shared/schema";
import { Mountain, Snowflake, Bike, ShoppingBag } from "lucide-react";

const iconMap: Record<string, typeof Mountain> = {
  hotham: Mountain,
  "falls-creek": Snowflake,
  snowriders: Bike,
  hoys: ShoppingBag,
};

export function Partners() {
  return (
    <section
      className="py-12 lg:py-16 bg-muted/50"
      data-testid="section-partners"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <p className="text-center text-muted-foreground text-sm uppercase tracking-wider mb-8">
          Trusted by leading alpine partners
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {partners.map((partner) => {
            const Icon = iconMap[partner.id] || Mountain;
            return (
              <div
                key={partner.id}
                className="flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors"
                data-testid={`partner-${partner.id}`}
              >
                <Icon className="h-8 w-8" />
                <span className="font-semibold text-lg">{partner.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

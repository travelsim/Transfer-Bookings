import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Destinations } from "@/components/Destinations";
import { About } from "@/components/About";
import { Partners } from "@/components/Partners";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { BookingForm } from "@/components/BookingForm";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" data-testid="page-home">
      <Header />
      <Hero />
      <Destinations />
      <About />
      <Partners />
      <Services />
      <Testimonials />
      <BookingForm />
      <Footer />
    </div>
  );
}

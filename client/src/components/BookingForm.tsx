import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { locationOptions, bookingEnquiryBaseSchema, parseIsoDateOnly, isValidTimeOnly, type InsertBookingEnquiry } from "@shared/schema";
import { Loader2, CheckCircle2, MapPin, Users, User } from "lucide-react";

// Extends the shared base rather than the refined server schema: the client
// reports a missing return date with its own message and returns early once the
// box is ticked. The server re-validates with insertBookingEnquirySchema, so
// this is a convenience layer, never the enforcement point.
const bookingFormSchema = bookingEnquiryBaseSchema
  .extend({
    whereTo: z.string().min(1, "Please select a destination"),
    whereFrom: z.string().min(1, "Please select a pickup location"),
    pickupDate: z.string().min(1, "Please select a pickup date"),
  })
  .superRefine((value, ctx) => {
    if (value.returnTrip && !value.returnDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDate"],
        message: "Please select a return date",
      });
    }
    // UX parity only: the server re-validates with
    // insertBookingEnquirySchema and is the enforcement point.
    if (value.returnDate) {
      const returnT = parseIsoDateOnly(value.returnDate);
      if (returnT === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["returnDate"],
          message: "Please select a valid return date (YYYY-MM-DD)",
        });
      } else if (value.pickupDate) {
        const pickupT = parseIsoDateOnly(value.pickupDate);
        if (pickupT !== null && returnT < pickupT) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["returnDate"],
            message: "Return date cannot be before the pick up date",
          });
        }
      }
    }
    if (value.returnTime && !isValidTimeOnly(value.returnTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnTime"],
        message: "Please select a valid return time (HH:MM)",
      });
    }
  });

type BookingFormData = z.infer<typeof bookingFormSchema>;

/**
 * Bots fill every visible field; people never see this one. It is hidden from
 * sighted users and from assistive technology, and left out of the tab order.
 * The server treats any value here as a bot submission.
 */
function HoneypotField({ inputRef }: { inputRef: React.RefObject<HTMLInputElement> }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="booking-website">Website</label>
      <input
        ref={inputRef}
        type="text"
        id="booking-website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

export function BookingForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      whereTo: "",
      whereFrom: "",
      pickupDate: "",
      returnTrip: false,
      differentReturnAddress: false,
      returnAddress: "",
      returnDate: "",
      returnTime: "",
      numAdults: 1,
      numChildren: 0,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      additionalInfo: "",
    },
  });

  const watchReturnTrip = form.watch("returnTrip");
  const watchDifferentReturn = form.watch("differentReturnAddress");
  const watchPickupDate = form.watch("pickupDate");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/booking-enquiry", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Enquiry Submitted!",
        description: "We'll get back to you as soon as possible.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    // Send the honeypot value explicitly. Leaving it empty is the signal that
    // a real person submitted the form.
    mutation.mutate({ ...data, website: honeypotRef.current?.value ?? "" });
  };

  if (isSubmitted) {
    return (
      <section
        id="booking-form"
        className="py-20 lg:py-28 bg-card"
        data-testid="section-booking-success"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-6">
              <CheckCircle2 className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Thank you for your enquiry!
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We've received your booking request and will be in touch shortly to confirm
              your transfer details.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
              variant="outline"
              data-testid="button-new-enquiry"
            >
              Submit Another Enquiry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking-form"
      className="py-20 lg:py-28 bg-card"
      data-testid="section-booking-form"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            data-testid="text-booking-title"
          >
            The hardest part is working out{" "}
            <span className="text-primary">where to go.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Fill out the form below and we'll get back to you with a quote for your
            transfer.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6 lg:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <HoneypotField inputRef={honeypotRef} />
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Trip Details</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="whereTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Where to *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-where-to">
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whereFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Where from *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-where-from">
                                <SelectValue placeholder="Select pickup location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationOptions.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pick up date *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              min={new Date().toISOString().split("T")[0]}
                              data-testid="input-pickup-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-4 justify-end">
                      <FormField
                        control={form.control}
                        name="returnTrip"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-return-trip"
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Return trip?
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {watchReturnTrip && (
                        <FormField
                          control={form.control}
                          name="differentReturnAddress"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-different-return"
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Different return address?
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {watchReturnTrip && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="returnDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ?? ""}
                                min={watchPickupDate || new Date().toISOString().split("T")[0]}
                                data-testid="input-return-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="returnTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Approximate return time</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-return-time"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {watchReturnTrip && watchDifferentReturn && (
                    <FormField
                      control={form.control}
                      name="returnAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter return address"
                              {...field}
                              data-testid="input-return-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Passengers</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numAdults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of adults *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                              data-testid="input-num-adults"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numChildren"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of children</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              data-testid="input-num-children"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <User className="h-5 w-5 text-primary" />
                    <span>Your Details</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Smith"
                              {...field}
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+61 400 000 000"
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requests, luggage requirements, or additional information..."
                            className="min-h-[100px] resize-none"
                            {...field}
                            data-testid="input-additional-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={mutation.isPending}
                  data-testid="button-submit-enquiry"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Enquiry"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

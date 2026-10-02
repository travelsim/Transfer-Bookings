import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Booking enquiry schema
export const bookingEnquiries = pgTable("booking_enquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whereTo: text("where_to").notNull(),
  whereFrom: text("where_from").notNull(),
  pickupDate: text("pickup_date").notNull(),
  returnTrip: boolean("return_trip").default(false),
  differentReturnAddress: boolean("different_return_address").default(false),
  returnAddress: text("return_address"),
  returnDate: text("return_date"),
  returnTime: text("return_time"),
  numAdults: integer("num_adults").notNull(),
  numChildren: integer("num_children").default(0),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  additionalInfo: text("additional_info"),
  // Honeypot: real users never see or fill this. Bots that submit every
  // field populate it. Accepted by validation, discarded by the route.
  website: text("website"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookingEnquiryBaseSchema = createInsertSchema(bookingEnquiries)
  .omit({
    id: true,
    // Server-owned. A client must never be able to set enquiry state.
    status: true,
    createdAt: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    numAdults: z.number().min(1, "At least 1 adult is required"),
    numChildren: z.number().min(0).max(20).optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    whereTo: z.string().min(1, "Destination is required"),
    whereFrom: z.string().min(1, "Pickup location is required"),
    pickupDate: z.string().min(1, "Pickup date is required"),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    // Optional and not nullable at the API boundary. The database columns stay
    // nullable; the route maps "absent" to SQL NULL explicitly.
    returnAddress: z.string().max(500).optional(),
    phone: z.string().max(40).optional(),
    additionalInfo: z.string().max(2000).optional(),
    website: z.string().max(200).optional(),
  });

export const insertBookingEnquirySchema = bookingEnquiryBaseSchema.superRefine(
  (value, ctx) => {
    // A return trip without a return date is unquotable, so it must not
    // reach the operator as a half-finished request.
    if (value.returnTrip && !value.returnDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDate"],
        message: "Please select a return date",
      });
    }
    if (
      value.returnDate &&
      value.pickupDate &&
      value.returnDate < value.pickupDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDate"],
        message: "Return date cannot be before the pick up date",
      });
    }
  },
);

export type InsertBookingEnquiry = z.infer<typeof insertBookingEnquirySchema>;
export type BookingEnquiry = typeof bookingEnquiries.$inferSelect;

// Destinations data
export const destinations = [
  {
    id: "mount-hotham",
    name: "Mount Hotham & Dinner Plain",
    description: "Experience Victoria's highest ski resort with stunning alpine views and world-class skiing.",
    image: "mount-hotham",
  },
  {
    id: "falls-creek",
    name: "Falls Creek",
    description: "Australia's premier alpine village offering incredible skiing and snowboarding terrain.",
    image: "falls-creek",
  },
  {
    id: "mount-buller",
    name: "Mount Buller",
    description: "Victoria's most accessible ski resort, just 3 hours from Melbourne.",
    image: "mount-buller",
  },
  {
    id: "alpine-crossing",
    name: "The Alpine Crossing",
    description: "A spectacular multi-day hiking adventure through Victoria's stunning alpine region.",
    image: "alpine-crossing",
  },
] as const;

export const services = [
  {
    id: "mountain-escape",
    title: "Escape to the mountains",
    description: "Forget about chains, icy roads and trying to fit you and your gear into a car. Your luggage is stored safely in our rooftop luggage pod which means there's more room for you to relax in comfort all the way to the top of the mountain, no matter the conditions. With door to door service to Mount Buller, Mount Hotham, and Falls Creek, the lifts are basically turning a few meters from your front door.",
    image: "winery-tours",
    ctaText: "Explore our mountain services",
  },
  {
    id: "wine-tours",
    title: "Relax in the valleys",
    description: "Leave the keys at home and wine and dine your way through the best of Victoria's wine regions. Full and half day tours to your favourite wineries or let us plan the perfect tour for you and your friends.",
    image: "winery-tours",
    ctaText: "Read about our winery tours",
  },
  {
    id: "airport-pickup",
    title: "Leave your stress at the airport",
    description: "Step out of the terminal into the Alpine Shuttle van and let us worry about the rest. With airport pickups from Melbourne Tullamarine, Melbourne Avalon and Albury airports, you can leave all the stress inside the airport and relax all of the way to your destination.",
    image: "airport-pickup",
    ctaText: "Find out more",
  },
] as const;

export const testimonials = [
  {
    id: "1",
    quote: "Hamish provides an excellent, friendly service in a very clean and comfortable van. Very reliable and punctual and as a local he provides great tips about a range of activities to do in the region. I have used his transport services twice already for drop offs to both Falls Creek and Hotham for hikes I've done in the mountains in the last few months. Highly recommend!",
    author: "Chris C-W",
    location: "Melbourne VIC",
  },
  {
    id: "2",
    quote: "Holy crap!! Alpine Shuttle Transport is way more than transport! Hamish is kind and fun and knows everything you need to know and more. Those extra touches are much appreciated and he really goes out of his way to make sure you and your mates have a stress free and fab time! Can't thank you enough for making my birthday with the girls so special.",
    author: "JC",
    location: "Melbourne, VIC",
  },
  {
    id: "3",
    quote: "Exceptional service from start to finish. The van was immaculate, the driver was professional and friendly, and the entire journey was smooth and comfortable. Will definitely be using Alpine Shuttle for all our future mountain trips.",
    author: "Sarah M",
    location: "Geelong, VIC",
  },
] as const;

export const partners = [
  { id: "hotham", name: "Hotham" },
  { id: "falls-creek", name: "Falls Creek" },
  { id: "snowriders", name: "Snowriders" },
  { id: "hoys", name: "Hoys Ski Hire" },
] as const;

export const wineryPartners = [
  { id: "gapsted", name: "Gapsted Wines" },
  { id: "feathertop", name: "Feathertop Wines" },
  { id: "alpine-hotel", name: "Alpine Hotel Bright" },
] as const;

export const locationOptions = [
  "Melbourne CBD",
  "Melbourne Airport (Tullamarine)",
  "Melbourne Avalon Airport",
  "Albury Airport",
  "Mount Hotham",
  "Dinner Plain",
  "Falls Creek",
  "Mount Buller",
  "Bright",
  "Wangaratta",
  "Albury",
  "Other",
] as const;

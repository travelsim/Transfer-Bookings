import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingEnquirySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAdminToken } from "./auth";
import { createRateLimiter } from "./rateLimit";
import { notifyOperator } from "./notify";

const enquiryLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Booking enquiry endpoint
  app.post("/api/booking-enquiry", enquiryLimiter, async (req, res) => {
    try {
      const parseResult = insertBookingEnquirySchema.safeParse(req.body);

      if (!parseResult.success) {
        const error = fromZodError(parseResult.error);
        return res.status(400).json({
          message: "Validation error",
          errors: error.message,
        });
      }

      // Honeypot: the field is hidden from people, so anything in it is a bot.
      // Respond exactly as a success would so the bot learns nothing, but store
      // nothing and notify nobody.
      if (parseResult.data.website) {
        return res.status(201).json({
          message: "Booking enquiry submitted successfully",
        });
      }

      const { website: _honeypot, ...enquiryInput } = parseResult.data;
      const enquiry = await storage.createBookingEnquiry(enquiryInput);

      // Fire-and-forget: the enquiry is already durable. A notification failure
      // is logged by notifyOperator and must not lose the customer's request.
      void notifyOperator(enquiry);

      // Deliberately does not echo the stored enquiry back. The response goes
      // over the network and would otherwise restate the customer's PII
      // unnecessarily; the client only needs to know it was accepted.
      return res.status(201).json({
        message: "Booking enquiry submitted successfully",
        enquiryId: enquiry.id,
      });
    } catch (error) {
      // Log the error object only. The request body carries names, emails and
      // phone numbers and must never be written to logs.
      console.error("Error creating booking enquiry:", error);
      return res.status(500).json({
        message: "An error occurred while processing your request",
      });
    }
  });

  // Get all booking enquiries. Contains customer names, emails, phone numbers
  // and travel details, so it requires a bearer token.
  app.get("/api/booking-enquiries", requireAdminToken, async (req, res) => {
    try {
      const enquiries = await storage.getBookingEnquiries();
      res.setHeader("Cache-Control", "no-store");
      return res.json(enquiries);
    } catch (error) {
      console.error("Error fetching booking enquiries:", error);
      return res.status(500).json({
        message: "An error occurred while fetching enquiries",
      });
    }
  });

  // Single-enquiry lookup, equally protected.
  app.get("/api/booking-enquiries/:id", requireAdminToken, async (req, res) => {
    try {
      const enquiry = await storage.getBookingEnquiry(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ message: "Enquiry not found" });
      }
      res.setHeader("Cache-Control", "no-store");
      return res.json(enquiry);
    } catch (error) {
      console.error("Error fetching booking enquiry:", error);
      return res.status(500).json({
        message: "An error occurred while fetching the enquiry",
      });
    }
  });

  return httpServer;
}
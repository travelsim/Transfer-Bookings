import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingEnquirySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Booking enquiry endpoint
  app.post("/api/booking-enquiry", async (req, res) => {
    try {
      const parseResult = insertBookingEnquirySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const error = fromZodError(parseResult.error);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.message 
        });
      }

      const enquiry = await storage.createBookingEnquiry(parseResult.data);
      
      return res.status(201).json({
        message: "Booking enquiry submitted successfully",
        enquiry
      });
    } catch (error) {
      console.error("Error creating booking enquiry:", error);
      return res.status(500).json({ 
        message: "An error occurred while processing your request" 
      });
    }
  });

  // Get all booking enquiries (for admin purposes)
  app.get("/api/booking-enquiries", async (req, res) => {
    try {
      const enquiries = await storage.getBookingEnquiries();
      return res.json(enquiries);
    } catch (error) {
      console.error("Error fetching booking enquiries:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching enquiries" 
      });
    }
  });

  return httpServer;
}

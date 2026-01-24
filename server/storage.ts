import { type User, type InsertUser, type BookingEnquiry, type InsertBookingEnquiry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBookingEnquiry(enquiry: InsertBookingEnquiry): Promise<BookingEnquiry>;
  getBookingEnquiries(): Promise<BookingEnquiry[]>;
  getBookingEnquiry(id: string): Promise<BookingEnquiry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookingEnquiries: Map<string, BookingEnquiry>;

  constructor() {
    this.users = new Map();
    this.bookingEnquiries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBookingEnquiry(enquiry: InsertBookingEnquiry): Promise<BookingEnquiry> {
    const id = randomUUID();
    const bookingEnquiry: BookingEnquiry = {
      id,
      whereTo: enquiry.whereTo,
      whereFrom: enquiry.whereFrom,
      pickupDate: enquiry.pickupDate,
      returnTrip: enquiry.returnTrip ?? false,
      differentReturnAddress: enquiry.differentReturnAddress ?? false,
      returnAddress: enquiry.returnAddress ?? null,
      numAdults: enquiry.numAdults,
      numChildren: enquiry.numChildren ?? 0,
      firstName: enquiry.firstName,
      lastName: enquiry.lastName,
      email: enquiry.email,
      phone: enquiry.phone ?? null,
      additionalInfo: enquiry.additionalInfo ?? null,
    };
    this.bookingEnquiries.set(id, bookingEnquiry);
    return bookingEnquiry;
  }

  async getBookingEnquiries(): Promise<BookingEnquiry[]> {
    return Array.from(this.bookingEnquiries.values());
  }

  async getBookingEnquiry(id: string): Promise<BookingEnquiry | undefined> {
    return this.bookingEnquiries.get(id);
  }
}

export const storage = new MemStorage();

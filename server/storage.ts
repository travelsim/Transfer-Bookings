import {
  type User,
  type InsertUser,
  type BookingEnquiry,
  type InsertBookingEnquiry,
  bookingEnquiries,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";

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
      returnDate: enquiry.returnDate ?? null,
      returnTime: enquiry.returnTime ?? null,
      differentReturnAddress: enquiry.differentReturnAddress ?? false,
      returnAddress: enquiry.returnAddress ?? null,
      numAdults: enquiry.numAdults,
      numChildren: enquiry.numChildren ?? 0,
      firstName: enquiry.firstName,
      lastName: enquiry.lastName,
      email: enquiry.email,
      phone: enquiry.phone ?? null,
      additionalInfo: enquiry.additionalInfo ?? null,
      website: null,
      status: "new",
      createdAt: new Date(),
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

/**
 * Durable storage backed by PostgreSQL.
 *
 * This is the storage the server must use in production. MemStorage loses every
 * enquiry the moment the process restarts or scales, which on an autoscale
 * deployment is routine rather than exceptional.
 */
export class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const rows = await getDb()
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await getDb()
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const rows = await getDb()
      .insert(users)
      .values({ ...insertUser, id: randomUUID() })
      .returning();
    return rows[0];
  }

  async createBookingEnquiry(enquiry: InsertBookingEnquiry): Promise<BookingEnquiry> {
    const rows = await getDb()
      .insert(bookingEnquiries)
      .values({
        whereTo: enquiry.whereTo,
        whereFrom: enquiry.whereFrom,
        pickupDate: enquiry.pickupDate,
        returnTrip: enquiry.returnTrip ?? false,
        returnDate: enquiry.returnDate ?? null,
        returnTime: enquiry.returnTime ?? null,
        differentReturnAddress: enquiry.differentReturnAddress ?? false,
        returnAddress: enquiry.returnAddress ?? null,
        numAdults: enquiry.numAdults,
        numChildren: enquiry.numChildren ?? 0,
        firstName: enquiry.firstName,
        lastName: enquiry.lastName,
        email: enquiry.email,
        phone: enquiry.phone ?? null,
        additionalInfo: enquiry.additionalInfo ?? null,
        website: null,
      })
      .returning();

    if (!rows[0]) {
      throw new Error("Enquiry insert returned no row");
    }
    return rows[0];
  }

  async getBookingEnquiries(): Promise<BookingEnquiry[]> {
    return getDb().select().from(bookingEnquiries).orderBy(desc(bookingEnquiries.createdAt));
  }

  async getBookingEnquiry(id: string): Promise<BookingEnquiry | undefined> {
    const rows = await getDb()
      .select()
      .from(bookingEnquiries)
      .where(eq(bookingEnquiries.id, id))
      .limit(1);
    return rows[0];
  }
}

/**
 * In-memory storage is permitted only outside production. In production a
 * missing DATABASE_URL is a hard startup failure: silently accepting enquiries
 * into a Map that will discard them is the exact failure this project exists to
 * prevent.
 */
function createStorage(): IStorage {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required in production. Refusing to start with " +
          "in-memory enquiry storage; enquiries would be lost on restart.",
      );
    }
    return new PgStorage();
  }

  if (process.env.DATABASE_URL) {
    return new PgStorage();
  }

  console.warn(
    "DATABASE_URL is not set; using in-memory storage. Enquiries will be lost " +
      "on restart. This is only acceptable for local development.",
  );
  return new MemStorage();
}

export const storage: IStorage = createStorage();
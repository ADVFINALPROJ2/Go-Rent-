import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const userRoles = ["renter", "owner", "admin"] as const;
export const accountStatuses = ["active", "disabled"] as const;
export const carStatuses = [
  "draft",
  "available",
  "unavailable",
  "disabled",
  "rented",
  "archived",
] as const;
export const bookingStatuses = [
  "pending",
  "approved",
  "declined",
  "completed",
  "cancelled",
] as const;

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: userRoles }).notNull().default("renter"),
    status: text("status", { enum: accountStatuses }).notNull().default("active"),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name"),
    phone: text("phone"),
    location: text("location"),
    bio: text("bio"),
    ...timestamps,
  },
  (table) => ({
    userIdx: uniqueIndex("profiles_user_id_idx").on(table.userId),
  }),
);

export const cars = sqliteTable(
  "cars",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    category: text("category"),
    mileage: integer("mileage"),
    dailyRate: real("daily_rate").notNull(),
    location: text("location").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    status: text("status", { enum: carStatuses }).notNull().default("available"),
    seats: integer("seats"),
    transmission: text("transmission"),
    fuelType: text("fuel_type"),
    ...timestamps,
  },
  (table) => ({
    ownerIdx: index("cars_owner_id_idx").on(table.ownerId),
    statusLocationIdx: index("cars_status_location_idx").on(
      table.status,
      table.location,
    ),
    rateCheck: check("cars_daily_rate_positive", sql`${table.dailyRate} > 0`),
    yearCheck: check("cars_year_valid", sql`${table.year} >= 1980`),
  }),
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    carId: text("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    renterId: text("renter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    totalPrice: real("total_price").notNull().default(0),
    status: text("status", { enum: bookingStatuses }).notNull().default("pending"),
    message: text("message"),
    ...timestamps,
  },
  (table) => ({
    carIdx: index("bookings_car_id_idx").on(table.carId),
    renterIdx: index("bookings_renter_id_idx").on(table.renterId),
    ownerIdx: index("bookings_owner_id_idx").on(table.ownerId),
    dateCheck: check("bookings_valid_dates", sql`${table.endDate} >= ${table.startDate}`),
    peopleCheck: check("bookings_distinct_people", sql`${table.ownerId} <> ${table.renterId}`),
  }),
);

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    carId: text("car_id").references(() => cars.id, { onDelete: "set null" }),
    bookingId: text("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    senderIdx: index("messages_sender_id_idx").on(table.senderId),
    receiverIdx: index("messages_receiver_id_idx").on(table.receiverId),
    carIdx: index("messages_car_id_idx").on(table.carId),
    bookingIdx: index("messages_booking_id_idx").on(table.bookingId),
    peopleCheck: check("messages_distinct_people", sql`${table.senderId} <> ${table.receiverId}`),
  }),
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    carId: text("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),
    renterId: text("renter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    bookingIdx: uniqueIndex("reviews_booking_id_idx").on(table.bookingId),
    carIdx: index("reviews_car_id_idx").on(table.carId),
    renterIdx: index("reviews_renter_id_idx").on(table.renterId),
    ownerIdx: index("reviews_owner_id_idx").on(table.ownerId),
    ratingCheck: check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
    peopleCheck: check("reviews_distinct_people", sql`${table.ownerId} <> ${table.renterId}`),
  }),
);

export type UserRole = (typeof userRoles)[number];
export type AccountStatus = (typeof accountStatuses)[number];
export type CarStatus = (typeof carStatuses)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Car = typeof cars.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;

import { hashSync } from "bcryptjs";

import { db, sqlite } from "../src/db/client";
import { bookings, cars, messages, profiles, reviews, users } from "../src/db/schema";

const now = new Date().toISOString();
const passwordHash = hashSync("Password123!", 12);

const demoUsers = [
  {
    id: "admin-user",
    email: "admin@gorent.test",
    role: "admin" as const,
    fullName: "Avery Admin",
    location: "Nairobi",
    bio: "Platform administrator for the GoRent demo.",
  },
  {
    id: "owner-user",
    email: "owner@gorent.test",
    role: "owner" as const,
    fullName: "Olivia Owner",
    location: "Nairobi West",
    bio: "Local host with clean, reliable cars.",
  },
  {
    id: "renter-user",
    email: "renter@gorent.test",
    role: "renter" as const,
    fullName: "Ryan Renter",
    location: "Kilimani",
    bio: "Weekend traveler and GoRent demo renter.",
  },
];

function seedUsers() {
  for (const user of demoUsers) {
    db.insert(users)
      .values({
        id: user.id,
        email: user.email,
        passwordHash,
        role: user.role,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();

    db.insert(profiles)
      .values({
        id: `${user.id}-profile`,
        userId: user.id,
        fullName: user.fullName,
        phone: "+254700000000",
        location: user.location,
        bio: user.bio,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();
  }
}

function seedCars() {
  db.insert(cars)
    .values([
      {
        id: "demo-car",
        ownerId: "owner-user",
        title: "2023 Tesla Model 3 Long Range",
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        dailyRate: 99,
        location: "Nairobi West",
        description:
          "A clean electric sedan with quick acceleration, premium interior, and excellent city range.",
        imageUrl:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80",
        status: "available",
        seats: 5,
        transmission: "Automatic",
        fuelType: "Electric",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "city-suv",
        ownerId: "owner-user",
        title: "2022 Toyota RAV4 Adventure",
        make: "Toyota",
        model: "RAV4",
        year: 2022,
        dailyRate: 72,
        location: "Kilimani",
        description:
          "Comfortable SUV with room for bags, errands, and short road trips around Nairobi.",
        imageUrl:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
        status: "available",
        seats: 5,
        transmission: "Automatic",
        fuelType: "Hybrid",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "compact-hatch",
        ownerId: "owner-user",
        title: "2021 Volkswagen Golf City Hatch",
        make: "Volkswagen",
        model: "Golf",
        year: 2021,
        dailyRate: 48,
        location: "Westlands",
        description:
          "Compact, fuel-efficient hatchback for easy city parking and daily commutes.",
        imageUrl:
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
        status: "available",
        seats: 5,
        transmission: "Automatic",
        fuelType: "Petrol",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();
}

function seedBookings() {
  db.insert(bookings)
    .values([
      {
        id: "booking-pending",
        carId: "demo-car",
        renterId: "renter-user",
        ownerId: "owner-user",
        startDate: "2026-07-05",
        endDate: "2026-07-07",
        totalPrice: 297,
        status: "pending",
        message: "Can I pick this up near Nairobi West in the morning?",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "booking-approved",
        carId: "compact-hatch",
        renterId: "renter-user",
        ownerId: "owner-user",
        startDate: "2026-07-10",
        endDate: "2026-07-12",
        totalPrice: 144,
        status: "approved",
        message: "Need it for a weekend city trip.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "booking-completed",
        carId: "city-suv",
        renterId: "renter-user",
        ownerId: "owner-user",
        startDate: "2026-06-10",
        endDate: "2026-06-11",
        totalPrice: 144,
        status: "completed",
        message: "Great host and smooth pickup.",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();
}

function seedMessages() {
  db.insert(messages)
    .values([
      {
        id: "message-1",
        senderId: "renter-user",
        receiverId: "owner-user",
        carId: "demo-car",
        bookingId: "booking-pending",
        body: "Hi, is the Tesla available for morning pickup?",
        createdAt: now,
      },
      {
        id: "message-2",
        senderId: "owner-user",
        receiverId: "renter-user",
        carId: "demo-car",
        bookingId: "booking-pending",
        body: "Yes, morning pickup works. I can meet you near Nairobi West.",
        createdAt: now,
      },
    ])
    .onConflictDoNothing()
    .run();
}

function seedReviews() {
  db.insert(reviews)
    .values({
      id: "review-city-suv",
      bookingId: "booking-completed",
      carId: "city-suv",
      renterId: "renter-user",
      ownerId: "owner-user",
      rating: 5,
      comment: "Clean car, clear communication, and very easy pickup.",
      createdAt: now,
    })
    .onConflictDoNothing()
    .run();
}

seedUsers();
seedCars();
seedBookings();
seedMessages();
seedReviews();
sqlite.close();

console.log("Seeded local GoRent SQLite demo data.");
console.log("Admin: admin@gorent.test / Password123!");
console.log("Owner: owner@gorent.test / Password123!");
console.log("Renter: renter@gorent.test / Password123!");

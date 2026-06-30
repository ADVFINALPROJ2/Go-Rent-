import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, sqlite } from "../src/db/client";
import { bookings, cars, messages, profiles, reviews, users } from "../src/db/schema";

const now = new Date().toISOString();
const passwordHash = hashSync("Password123!", 12);

const demoUsers = [
  {
    id: "admin-user",
    email: "admin@gorent.test",
    role: "admin" as const,
    fullName: "Amanuel Admin",
    location: "Bole",
    bio: "Platform administrator for the GoRent demo.",
  },
  {
    id: "owner-user",
    email: "owner@gorent.test",
    role: "owner" as const,
    fullName: "Selam Owner",
    location: "Kazanchis",
    bio: "Addis host with clean, reliable cars and flexible pickup areas.",
  },
  {
    id: "renter-user",
    email: "renter@gorent.test",
    role: "renter" as const,
    fullName: "Dagi Renter",
    location: "Piassa",
    bio: "Weekend traveler and GoRent demo renter in Addis Ababa.",
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
        phone: "+251 911 234 567",
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
        title: "2023 BYD Atto 3 Bole EV",
        make: "BYD",
        model: "Atto 3",
        year: 2023,
        category: "Electric",
        mileage: 18500,
        dailyRate: 4500,
        location: "Bole",
        description:
          "A clean electric crossover with smooth acceleration, premium interior, and excellent Addis city range.",
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
        title: "2022 Toyota RAV4 CMC SUV",
        make: "Toyota",
        model: "RAV4",
        year: 2022,
        category: "SUV",
        mileage: 34200,
        dailyRate: 3800,
        location: "CMC",
        description:
          "Comfortable SUV with room for bags, errands, and short road trips around Addis Ababa.",
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
        title: "2021 Hyundai Elantra Kazanchis Sedan",
        make: "Hyundai",
        model: "Elantra",
        year: 2021,
        category: "Sedan",
        mileage: 58100,
        dailyRate: 2200,
        location: "Kazanchis",
        description:
          "Fuel-efficient sedan for easy city parking, daily commutes, and local business trips.",
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

  db.update(cars)
    .set({
      category: "Electric",
      mileage: 18500,
      fuelType: "Electric",
      transmission: "Automatic",
      location: "Bole",
      seats: 5,
      updatedAt: now,
    })
    .where(eq(cars.id, "demo-car"))
    .run();

  db.update(cars)
    .set({
      category: "SUV",
      mileage: 34200,
      fuelType: "Hybrid",
      transmission: "Automatic",
      location: "CMC",
      seats: 5,
      updatedAt: now,
    })
    .where(eq(cars.id, "city-suv"))
    .run();

  db.update(cars)
    .set({
      category: "Sedan",
      mileage: 58100,
      fuelType: "Petrol",
      transmission: "Automatic",
      location: "Kazanchis",
      seats: 5,
      updatedAt: now,
    })
    .where(eq(cars.id, "compact-hatch"))
    .run();

  db.update(cars)
    .set({ fuelType: "Petrol", updatedAt: now })
    .where(eq(cars.fuelType, "Benzene"))
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
        totalPrice: 13500,
        status: "pending",
        message: "Can I pick this up near Bole in the morning?",
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
        totalPrice: 6600,
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
        totalPrice: 7600,
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
        body: "Hi, is the BYD available for morning pickup in Bole?",
        createdAt: now,
      },
      {
        id: "message-2",
        senderId: "owner-user",
        receiverId: "renter-user",
        carId: "demo-car",
        bookingId: "booking-pending",
        body: "Yes, morning pickup works. I can meet you near Bole Medhanialem.",
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

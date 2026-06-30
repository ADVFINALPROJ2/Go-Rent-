import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";

const now = new Date().toISOString();
const databasePath = process.env.SQLITE_DB_PATH ?? "./data/gorent.sqlite";
const resolvedDatabasePath = path.resolve(process.cwd(), databasePath);

fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

const db = new Database(resolvedDatabasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function runMigrations() {
  const migrationsDir = path.join(process.cwd(), "drizzle");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("No drizzle migration directory found. Skipping migrations.");
    return;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS __gorent_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  const applied = new Set(
    db.prepare("SELECT id FROM __gorent_migrations").all().map((row) => row.id),
  );

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    const applyMigration = db.transaction(() => {
      for (const statement of statements) {
        db.exec(statement);
      }

      db.prepare("INSERT INTO __gorent_migrations (id) VALUES (?)").run(file);
    });

    applyMigration();
    console.log(`Applied migration: ${file}`);
  }
}

function seedDemoData() {
  const passwordHash = hashSync("Password123!", 12);

  const userInsert = db.prepare(`
    INSERT OR IGNORE INTO users (
      id, email, password_hash, role, status, created_at, updated_at
    ) VALUES (
      @id, @email, @passwordHash, @role, 'active', @now, @now
    )
  `);

  const profileInsert = db.prepare(`
    INSERT OR IGNORE INTO profiles (
      id, user_id, full_name, phone, location, bio, created_at, updated_at
    ) VALUES (
      @id, @userId, @fullName, @phone, @location, @bio, @now, @now
    )
  `);

  const users = [
    {
      id: "admin-user",
      email: "admin@gorent.test",
      role: "admin",
      fullName: "Amanuel Admin",
      location: "Bole",
      bio: "Platform administrator for the GoRent demo.",
    },
    {
      id: "owner-user",
      email: "owner@gorent.test",
      role: "owner",
      fullName: "Selam Owner",
      location: "Kazanchis",
      bio: "Addis host with clean, reliable cars and flexible pickup areas.",
    },
    {
      id: "renter-user",
      email: "renter@gorent.test",
      role: "renter",
      fullName: "Dagi Renter",
      location: "Piassa",
      bio: "Weekend traveler and GoRent demo renter in Addis Ababa.",
    },
  ];

  for (const user of users) {
    userInsert.run({ ...user, passwordHash, now });
    profileInsert.run({
      id: `${user.id}-profile`,
      userId: user.id,
      fullName: user.fullName,
      phone: "+251 911 234 567",
      location: user.location,
      bio: user.bio,
      now,
    });
  }

  db.prepare(`
    INSERT OR IGNORE INTO cars (
      id, owner_id, title, make, model, year, category, mileage, daily_rate,
      location, description, image_url, status, seats, transmission, fuel_type,
      created_at, updated_at
    ) VALUES (
      @id, 'owner-user', @title, @make, @model, @year, @category, @mileage,
      @dailyRate, @location, @description, @imageUrl, 'available', @seats,
      @transmission, @fuelType, @now, @now
    )
  `).run({
    id: "demo-car",
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
    seats: 5,
    transmission: "Automatic",
    fuelType: "Electric",
    now,
  });

  db.prepare(`
    INSERT OR IGNORE INTO cars (
      id, owner_id, title, make, model, year, category, mileage, daily_rate,
      location, description, image_url, status, seats, transmission, fuel_type,
      created_at, updated_at
    ) VALUES (
      @id, 'owner-user', @title, @make, @model, @year, @category, @mileage,
      @dailyRate, @location, @description, @imageUrl, 'available', @seats,
      @transmission, @fuelType, @now, @now
    )
  `).run({
    id: "city-suv",
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
    seats: 5,
    transmission: "Automatic",
    fuelType: "Hybrid",
    now,
  });

  db.prepare(`
    INSERT OR IGNORE INTO cars (
      id, owner_id, title, make, model, year, category, mileage, daily_rate,
      location, description, image_url, status, seats, transmission, fuel_type,
      created_at, updated_at
    ) VALUES (
      @id, 'owner-user', @title, @make, @model, @year, @category, @mileage,
      @dailyRate, @location, @description, @imageUrl, 'available', @seats,
      @transmission, @fuelType, @now, @now
    )
  `).run({
    id: "compact-hatch",
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
    seats: 5,
    transmission: "Automatic",
    fuelType: "Petrol",
    now,
  });

  db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id, car_id, renter_id, owner_id, start_date, end_date, total_price,
      status, message, created_at, updated_at
    ) VALUES (
      'booking-pending', 'demo-car', 'renter-user', 'owner-user', '2026-07-05',
      '2026-07-07', 13500, 'pending',
      'Can I pick this up near Bole in the morning?', @now, @now
    )
  `).run({ now });

  db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id, car_id, renter_id, owner_id, start_date, end_date, total_price,
      status, message, created_at, updated_at
    ) VALUES (
      'booking-approved', 'compact-hatch', 'renter-user', 'owner-user',
      '2026-07-10', '2026-07-12', 6600, 'approved',
      'Need it for a weekend city trip.', @now, @now
    )
  `).run({ now });

  db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id, car_id, renter_id, owner_id, start_date, end_date, total_price,
      status, message, created_at, updated_at
    ) VALUES (
      'booking-completed', 'city-suv', 'renter-user', 'owner-user',
      '2026-06-10', '2026-06-11', 7600, 'completed',
      'Great host and smooth pickup.', @now, @now
    )
  `).run({ now });

  db.prepare(`
    INSERT OR IGNORE INTO messages (
      id, sender_id, receiver_id, car_id, booking_id, body, created_at
    ) VALUES (
      'message-1', 'renter-user', 'owner-user', 'demo-car', 'booking-pending',
      'Hi, is the BYD available for morning pickup in Bole?', @now
    )
  `).run({ now });

  db.prepare(`
    INSERT OR IGNORE INTO messages (
      id, sender_id, receiver_id, car_id, booking_id, body, created_at
    ) VALUES (
      'message-2', 'owner-user', 'renter-user', 'demo-car', 'booking-pending',
      'Yes, morning pickup works. I can meet you near Bole Medhanialem.', @now
    )
  `).run({ now });

  db.prepare(`
    INSERT OR IGNORE INTO reviews (
      id, booking_id, car_id, renter_id, owner_id, rating, comment, created_at
    ) VALUES (
      'review-city-suv', 'booking-completed', 'city-suv', 'renter-user',
      'owner-user', 5, 'Clean car, clear communication, and very easy pickup.',
      @now
    )
  `).run({ now });

  console.log("Verified demo users and cars.");
}

runMigrations();
seedDemoData();
db.close();

if (process.env.GORENT_SETUP_ONLY === "1") {
  process.exit(0);
}

const child = spawn("npm", ["run", "start"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

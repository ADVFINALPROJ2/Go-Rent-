CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`car_id` text NOT NULL,
	`renter_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`total_price` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`renter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "bookings_valid_dates" CHECK("bookings"."end_date" >= "bookings"."start_date"),
	CONSTRAINT "bookings_distinct_people" CHECK("bookings"."owner_id" <> "bookings"."renter_id")
);
--> statement-breakpoint
CREATE INDEX `bookings_car_id_idx` ON `bookings` (`car_id`);--> statement-breakpoint
CREATE INDEX `bookings_renter_id_idx` ON `bookings` (`renter_id`);--> statement-breakpoint
CREATE INDEX `bookings_owner_id_idx` ON `bookings` (`owner_id`);--> statement-breakpoint
CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`daily_rate` real NOT NULL,
	`location` text NOT NULL,
	`description` text,
	`image_url` text,
	`status` text DEFAULT 'available' NOT NULL,
	`seats` integer,
	`transmission` text,
	`fuel_type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "cars_daily_rate_positive" CHECK("cars"."daily_rate" > 0),
	CONSTRAINT "cars_year_valid" CHECK("cars"."year" >= 1980)
);
--> statement-breakpoint
CREATE INDEX `cars_owner_id_idx` ON `cars` (`owner_id`);--> statement-breakpoint
CREATE INDEX `cars_status_location_idx` ON `cars` (`status`,`location`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`sender_id` text NOT NULL,
	`receiver_id` text NOT NULL,
	`car_id` text,
	`booking_id` text,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "messages_distinct_people" CHECK("messages"."sender_id" <> "messages"."receiver_id")
);
--> statement-breakpoint
CREATE INDEX `messages_sender_id_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `messages_receiver_id_idx` ON `messages` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `messages_car_id_idx` ON `messages` (`car_id`);--> statement-breakpoint
CREATE INDEX `messages_booking_id_idx` ON `messages` (`booking_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`full_name` text,
	`phone` text,
	`location` text,
	`bio` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_idx` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`car_id` text NOT NULL,
	`renter_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`renter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reviews_rating_range" CHECK("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_distinct_people" CHECK("reviews"."owner_id" <> "reviews"."renter_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_booking_id_idx` ON `reviews` (`booking_id`);--> statement-breakpoint
CREATE INDEX `reviews_car_id_idx` ON `reviews` (`car_id`);--> statement-breakpoint
CREATE INDEX `reviews_renter_id_idx` ON `reviews` (`renter_id`);--> statement-breakpoint
CREATE INDEX `reviews_owner_id_idx` ON `reviews` (`owner_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'renter' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
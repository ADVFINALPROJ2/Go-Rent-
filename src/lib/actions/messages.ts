"use server";

import { and, asc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/db/client";
import { cars, messages, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export type MessageWithContext = {
  id: string;
  booking_id: string | null;
  car_id: string | null;
  sender_id: string;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  otherUserId: string;
  otherUserName: string;
  carTitle: string | null;
  carLocation: string | null;
  carImageUrl: string | null;
};

export type UserMessagesResult = {
  currentUserId: string;
  messages: MessageWithContext[];
};

export type SendMessageInput = {
  receiverId: string;
  carId?: string | null;
  bookingId?: string | null;
  body: string;
};

function formatShortUser(id: string) {
  return `User ${id.slice(0, 8)}`;
}

export async function sendMessage(input: SendMessageInput) {
  const user = await requireUser();

  if (!user) {
    throw new Error("Please log in before sending a message.");
  }

  const body = input.body.trim();

  if (!body) {
    throw new Error("Message cannot be empty.");
  }

  if (user.id === input.receiverId) {
    throw new Error("You cannot send a message to yourself.");
  }

  if (input.carId) {
    const car = db.query.cars.findFirst({
      where: eq(cars.id, input.carId),
    });

    if (!car) {
      throw new Error("Car not found.");
    }
  }

  db.insert(messages)
    .values({
      id: crypto.randomUUID(),
      senderId: user.id,
      receiverId: input.receiverId,
      carId: input.carId || null,
      bookingId: input.bookingId || null,
      body,
    })
    .run();
}

export async function getUserMessages(): Promise<UserMessagesResult> {
  const user = await requireUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const rows = db.query.messages.findMany({
    where: or(eq(messages.senderId, user.id), eq(messages.receiverId, user.id)),
    orderBy: asc(messages.createdAt),
  });

  const userIds = [
    ...new Set(rows.flatMap((message) => [message.senderId, message.receiverId])),
  ];
  const carIds = [
    ...new Set(rows.map((message) => message.carId).filter((id): id is string => Boolean(id))),
  ];
  const profileRows = userIds.length
    ? db.query.profiles.findMany({
        where: inArray(profiles.userId, userIds),
      })
    : [];
  const carRows = carIds.length
    ? db.query.cars.findMany({
        where: inArray(cars.id, carIds),
      })
    : [];

  const profileMap = new Map(profileRows.map((profile) => [profile.userId, profile]));
  const carMap = new Map(carRows.map((car) => [car.id, car]));

  return {
    currentUserId: user.id,
    messages: rows.map((message) => {
      const otherUserId =
        message.senderId === user.id ? message.receiverId : message.senderId;
      const otherProfile = profileMap.get(otherUserId);
      const car = message.carId ? carMap.get(message.carId) : null;

      return {
        id: message.id,
        booking_id: message.bookingId,
        car_id: message.carId,
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        body: message.body,
        read_at: message.readAt,
        created_at: message.createdAt,
        otherUserId,
        otherUserName: otherProfile?.fullName ?? formatShortUser(otherUserId),
        carTitle: car ? car.title || `${car.make} ${car.model}` : null,
        carLocation: car?.location ?? null,
        carImageUrl: car?.imageUrl ?? null,
      };
    }),
  };
}

export async function markMessagesRead(messageIds: string[]) {
  const user = await requireUser();

  if (!user || messageIds.length === 0) {
    return null;
  }

  const readAt = new Date().toISOString();
  db.update(messages)
    .set({ readAt })
    .where(and(inArray(messages.id, messageIds), eq(messages.receiverId, user.id)))
    .run();

  return readAt;
}

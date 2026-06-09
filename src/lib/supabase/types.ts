export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "owner" | "renter" | "admin";
export type CarStatus = "draft" | "available" | "unavailable" | "archived";
export type BookingStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled"
  | "completed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: ProfileRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: ProfileRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: ProfileRole;
          updated_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          make: string;
          model: string;
          year: number;
          location: string;
          daily_rate: number;
          status: CarStatus;
          image_urls: string[];
          seats: number | null;
          transmission: string | null;
          fuel_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          make: string;
          model: string;
          year: number;
          location: string;
          daily_rate: number;
          status?: CarStatus;
          image_urls?: string[];
          seats?: number | null;
          transmission?: string | null;
          fuel_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cars"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          car_id: string;
          owner_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status: BookingStatus;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          owner_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status?: BookingStatus;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          booking_id: string | null;
          sender_id: string;
          receiver_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          sender_id: string;
          receiver_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          body?: string;
          read_at?: string | null;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          car_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          car_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
    };
  };
};

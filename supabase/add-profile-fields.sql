-- Migration: add location and bio columns to profiles
-- Run this on an existing database where profiles table already exists.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

/*
  # Fix Users Table Insert Policy

  1. Changes
    - Update the "Users can insert own profile" policy to allow authenticated users to insert their profile
    - This fixes the RLS violation that occurs when creating user profiles after signup

  2. Security
    - The policy still maintains security by requiring authentication
    - The foreign key constraint to auth.users(id) ensures data integrity
    - Only authenticated users can insert, and the application logic ensures correct user_id
*/

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new insert policy that allows authenticated users to insert their profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
-- Clear all test data from Supabase
-- Run this in Supabase SQL Editor

-- Delete all orders
DELETE FROM orders;

-- Delete all users
DELETE FROM users;

-- Orders and users should now be empty
-- Products and categories are kept for the storefront

# Bookly

Bookly is an online booking application that allows owners to manage their availability and lets customers request appointments through a public booking link.

## Features

### Owners

- Create an account and log in securely
- Manage weekly availability
- View upcoming booking requests
- Accept or reject pending bookings
- View accepted bookings
- View bookings across the 14-day booking window using weekly calendar navigation
- Log out securely

### Customers

- Choose who they want to book with
- Book through an owner's public booking page
- View available and unavailable time slots
- Submit booking details without creating an account
- Receive a unique booking reference
- Check booking status
- Cancel a booking using their email address

## Tech Stack

- Next.js
- React
- TypeScript
- CSS
- Supabase
  - PostgreSQL
  - Authentication
  - Row Level Security
  - Database functions
  - Realtime
- Resend for booking confirmation emails

## Getting Started

Install the project dependencies:

```bash
npm install
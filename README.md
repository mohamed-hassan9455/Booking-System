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
```

Create a `.env.local` file in the project root if one does not already exist.

Copy the variable names from `.env.example` into `.env.local`, then add the correct values.

The required environment variables are:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
APP_URL=
NEXT_PUBLIC_OWNER_REQUEST_EMAIL=
```

Do not commit real environment values, API keys, or other secrets to the repository.

## Environment Variables

### `NEXT_PUBLIC_SUPABASE_URL`

The URL of the Supabase project.

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The public Supabase client key used by the application.

### `RESEND_API_KEY`

The server-side API key used to send booking confirmation emails.

### `RESEND_FROM_EMAIL`

The verified email address used to send Bookly confirmation emails.

### `APP_URL`

The base URL of the application.

For local development:

```text
http://localhost:3000
```

For production, this should be changed to the live Bookly URL.

### `NEXT_PUBLIC_OWNER_REQUEST_EMAIL`

The contact email address used when someone requests access to create an owner account.

## Running Locally

Start the development server:

```bash
npm run dev
```

If PowerShell blocks `npm.ps1` on Windows, use:

```powershell
npm.cmd run dev
```

Then open:

```text
http://localhost:3000
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

On Windows, if required:

```powershell
npm.cmd run build
```

Start the production server:

```bash
npm start
```

## Database

Bookly uses Supabase PostgreSQL.

Database migrations are stored in:

```text
supabase/migrations
```

The database includes:

- owner profiles
- weekly availability
- bookings
- owner invite controls
- Row Level Security policies
- booking-related database functions

## Owner Access

Owner registration is invite-only.

An owner's approved email address must exist in the `owner_invites` table before they can create an account.

Users who have not been invited can use the owner access request link shown on the signup page.

## Booking Flow

Customers can select an owner, choose an available date and time, enter their booking details, and submit a booking request.

Each successful booking receives a unique booking reference.

Owners can view pending requests from the dashboard and either accept or reject them.

Customers can use their booking reference to check the current status of their booking and cancel it when permitted.

## Email Delivery

Bookly uses Resend to send booking confirmation emails.

If email delivery fails after a booking has already been created successfully, the booking remains saved and the customer still receives their booking reference on screen.

For external email delivery, the sender domain must be verified with Resend and `RESEND_FROM_EMAIL` must use a verified sender address.

## Production Deployment

Before deploying Bookly, configure all required environment variables in the hosting provider.

Important production configuration includes:

- Set `APP_URL` to the live Bookly URL
- Configure the production Supabase URL and publishable key
- Configure `RESEND_API_KEY`
- Set `RESEND_FROM_EMAIL` to a verified sender address
- Set `NEXT_PUBLIC_OWNER_REQUEST_EMAIL` to the correct Bookly contact address
- Configure the production site URL in Supabase Authentication
- Add the required authentication redirect URLs
- Confirm the Resend sender domain has been verified
- Test booking confirmation emails with an external email address

## Quality Checks

Run the project lint checks:

```bash
npm run lint
```

On Windows, if required:

```powershell
npm.cmd run lint
```

Run a production build before release:

```bash
npm run build
```

The project should only be considered release-ready once the build succeeds and the main customer and owner booking flows have been tested successfully.
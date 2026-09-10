import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      ownerId,
      customerName,
      customerEmail,
      bookingDate,
      startTime,
      reason,
    } = body;

    if (
      !ownerId ||
      !customerName ||
      !customerEmail ||
      !bookingDate ||
      !startTime
    ) {
      return NextResponse.json(
        { error: "Missing required booking information." },
        { status: 400 }
      );
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(customerEmail)) {
  return NextResponse.json(
    { error: "Please enter a valid email address." },
    { status: 400 }
  );
}

    const supabase = await createClient();

    const { data: referenceId, error: bookingError } =
      await supabase.rpc("create_booking_request", {
        p_owner_id: ownerId,
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_booking_date: bookingDate,
        p_start_time: startTime,
        p_reason: reason || null,
      });

    if (bookingError) {
      return NextResponse.json(
        { error: bookingError.message },
        { status: 400 }
      );
    }

    const { data: owner } = await supabase
      .from("profiles")
      .select("first_name, surname, business_title")
      .eq("id", ownerId)
      .single();

      const safeCustomerName = escapeHtml(customerName);

const safeOwnerName = owner
  ? `${escapeHtml(owner.first_name)} ${escapeHtml(owner.surname)}`
  : "";

const safeBusinessTitle = owner?.business_title
  ? escapeHtml(owner.business_title)
  : "";

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${bookingDate}T00:00:00`));

    const statusUrl = `${process.env.APP_URL}/booking/${referenceId}`;

    const { error: emailError } = await resend.emails.send({
      from:
  process.env.RESEND_FROM_EMAIL ??
  "Booking System <onboarding@resend.dev>",
      to: customerEmail,
      subject: "Your booking request has been received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Booking request received</h1>

          <p>Hi ${safeCustomerName},</p>

          <p>Your booking request has been submitted successfully.</p>

          ${owner
  ? `<p><strong>Booking with:</strong> ${safeOwnerName}</p>`
  : ""
}

          ${safeBusinessTitle
  ? `<p><strong>Business / role:</strong> ${safeBusinessTitle}</p>`
  : ""
}

          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${startTime}</p>

          <p>
            <strong>Booking reference:</strong>
            ${referenceId}
          </p>

          <p>
            <a href="${statusUrl}">
              View your booking status
            </a>
          </p>

          <p>
            Keep your booking reference safe. You can use it to check
            the status of your booking or cancel it.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Booking email failed:", emailError);

      return NextResponse.json({
        referenceId,
        emailSent: false,
      });
    }

    return NextResponse.json({
      referenceId,
      emailSent: true,
    });
  } catch (error) {
    console.error("Booking route error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the booking." },
      { status: 500 }
    );
  }
}
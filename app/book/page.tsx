import Link from "next/link";
import BooklyLogo from "@/components/BooklyLogo";
import { createClient } from "@/lib/supabase/server";

export default async function StaffSelectionPage() {
  const supabase = await createClient();

  const { data: staff, error } = await supabase
    .from("profiles")
    .select("id, first_name, surname, username, business_title")
    .order("first_name", { ascending: true });

  return (
    <main className="staff-selection-page">
      <div className="staff-selection-container">
        <BooklyLogo />

        <div className="staff-selection-heading">
          <p className="booking-eyebrow">Book an appointment</p>

          <h1>Choose who you'd like to book with</h1>

          <p>
            Select a team member to view their availability and request an
            appointment.
          </p>
        </div>

        {error && (
          <p className="booking-error">There was a problem loading the team.</p>
        )}

        {!error && (!staff || staff.length === 0) && (
          <p className="booking-empty">
            No team members are currently available.
          </p>
        )}

        {!error && staff && staff.length > 0 && (
          <div className="staff-grid">
            {staff.map((person) => (
              <article key={person.id} className="staff-card">
                <div className="staff-avatar">
                  {person.first_name.charAt(0)}
                  {person.surname.charAt(0)}
                </div>

                <div className="staff-details">
                  <h2>
                    {person.first_name} {person.surname}
                  </h2>

                  {person.business_title && <p>{person.business_title}</p>}

                  <span>@{person.username}</span>
                </div>

                <Link
                  href={`/book/${person.username}`}
                  className="staff-book-button"
                >
                  Book with {person.first_name}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

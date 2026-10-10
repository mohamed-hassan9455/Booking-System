"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import BooklyLogo from "@/components/BooklyLogo";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const ownerRequestEmail = process.env.NEXT_PUBLIC_OWNER_REQUEST_EMAIL;
  const ownerRequestHref = ownerRequestEmail
    ? `mailto:${ownerRequestEmail}?subject=${encodeURIComponent(
        "Bookly owner access request",
      )}&body=${encodeURIComponent(
        "Hi Bookly team,\n\nI would like to request access to create a Bookly owner account.\n\nEmail address:\nBusiness / role:\nReason for requesting access:\n\nThank you.",
      )}`
    : null;

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [businessTitle, setBusinessTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          surname,
          username,
          business_title: businessTitle,
        },
      },
    });

    if (error) {
      const message =
        error.message === "Database error saving new user"
          ? "Account could not be created. Make sure you're using an invited email and that your details are valid."
          : error.message;

      setErrorMessage(message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccessMessage(
        "Account created. Check your email to confirm your account.",
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <BooklyLogo />

        <h1>Create your Bookly owner account</h1>

        <div className="auth-invite-info">
          <p className="auth-subtitle">
            Owner registration is by invite only. Use the email address approved
            for your Bookly account.
          </p>

          {ownerRequestHref && (
            <p className="auth-invite-request">
              Not invited yet?{" "}
              <a href={ownerRequestHref}>Request owner access</a>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="name-row">
            <div>
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="surname">Surname</label>
              <input
                id="surname"
                type="text"
                value={surname}
                onChange={(event) => setSurname(event.target.value)}
                required
              />
            </div>
          </div>

          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value.toLowerCase().trim())
            }
            required
          />

          <label htmlFor="businessTitle">Business / job title</label>
          <input
            id="businessTitle"
            type="text"
            value={businessTitle}
            onChange={(event) => setBusinessTitle(event.target.value)}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}

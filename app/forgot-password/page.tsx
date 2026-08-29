"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for the password reset link.");
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Forgot password</h1>

        <p className="auth-subtitle">
          Enter your email and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {errorMessage && (
            <p className="auth-error">{errorMessage}</p>
          )}

          {message && (
            <p className="auth-success">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}
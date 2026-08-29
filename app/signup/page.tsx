"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

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
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccessMessage(
        "Account created. Check your email to confirm your account."
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
        <h1>Create an account</h1>

        <p className="auth-subtitle">
          Create your owner account to start accepting bookings.
        </p>

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

          {errorMessage && (
            <p className="auth-error">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="auth-success">{successMessage}</p>
          )}

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
import Link from "next/link";

export default function BooklyLogo() {
  return (
    <Link href="/" className="bookly-logo" aria-label="Bookly home">
      <span className="bookly-logo-mark">B</span>
      <span>Bookly</span>
    </Link>
  );
}

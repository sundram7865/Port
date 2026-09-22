import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-4 py-20 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-fg">This page does not exist</h1>
      <p className="mt-4 text-base leading-relaxed text-fg-muted">
        The link is either wrong or points at something I have since removed.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-accent-solid px-4 py-2.5 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
        >
          Back to the homepage
        </Link>
      </p>
    </div>
  );
}

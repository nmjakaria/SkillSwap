import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4 text-center">
      {/* Big 404 */}
      <div className="relative select-none">
        <span className="text-[8rem] font-black leading-none text-primary/10 tracking-tighter">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[3.5rem] font-black text-primary leading-none tracking-tighter">
          404
        </span>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Double-check the URL or head back home.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          ← Back to Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Explore Skills
        </Link>
      </div>
    </div>
  );
}

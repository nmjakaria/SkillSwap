import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4 text-center">
      {/* Icon / code */}
      <div className="relative select-none">
        <span className="text-[8rem] font-black leading-none text-destructive/10 tracking-tighter">
          401
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[3.5rem] font-black text-destructive leading-none tracking-tighter">
          🔒
        </span>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">
          Unauthorized Access
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You don&apos;t have permission to view this page. Please sign in with
          an authorized account, or return to the home page.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          Sign In
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

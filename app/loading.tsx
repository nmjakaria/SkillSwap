export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary/40 animate-spin [animation-direction:reverse] [animation-duration:0.8s]" />
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground animate-pulse">
          Loading…
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait while we fetch the content
        </p>
      </div>
    </div>
  );
}

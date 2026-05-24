export function AuthDivider() {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label="or">
      <div className="h-px flex-1 bg-[#e5e7eb]" />
      <span className="text-xs text-[#a0aab5]">or</span>
      <div className="h-px flex-1 bg-[#e5e7eb]" />
    </div>
  );
}

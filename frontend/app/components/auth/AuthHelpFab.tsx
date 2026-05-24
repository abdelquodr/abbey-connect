import Image from "next/image";

export function AuthHelpFab() {
  return (
    <button
      type="button"
      aria-label="Get Help"
      className="absolute bottom-10 right-10 flex h-10 items-center gap-2 rounded-full bg-brand-orange px-4 text-xs font-semibold text-white shadow-[0_18px_30px_rgba(255,134,0,0.28)] transition hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
    >
      <span>Get Help</span>
      <span className="flex h-5 w-5 items-center justify-center ">
        <Image src="/icons/help.svg" alt="check-mail" width={64} height={64} />
      </span>
    </button>
  );
}

import { IoMail } from "react-icons/io5";
import {
  AuthButton,
  AuthCard,
  AuthDivider,
  AuthHelpFab,
} from "../../components/auth";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.4-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.4-6 6.9l6.3 5.3C39.2 36.8 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export default function SignupPage() {
  return (
    <section className="relative flex w-full items-center justify-center bg-[#f7f8fc] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04),transparent_60%)]" />
      <AuthCard
        title="Create your account"
        footerLabel="Already have an account?"
        footerLinkLabel="Sign in"
        footerHref="/auth/signin"
      >
        <div className="space-y-4">
          <AuthButton
            icon={<IoMail className="h-4 w-4 text-[#2b2f38]" />}
            ariaLabel="Sign up with email"
            href="/auth/signup/email"
          >
            Sign up with email
          </AuthButton>

          <AuthDivider />

          <AuthButton icon={<GoogleIcon />} ariaLabel="Sign up with Google">
            Sign up with Google
          </AuthButton>
        </div>
      </AuthCard>

      <AuthHelpFab />
    </section>
  );
}

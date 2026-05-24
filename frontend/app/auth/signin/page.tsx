"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IoMail } from "react-icons/io5";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { AuthHelpFab } from "@/app/components/auth/AuthHelpFab";
import {
  AuthApiError,
  authApi,
  getAuthTokenFromResponse,
} from "@/app/lib/auth-api";
import { useAuth } from "@/app/lib/auth-context";
import { loginSchema } from "@/app/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setEmail } = useAuth();

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.trim().length > 0;

  const toFieldErrors = (issues: Record<string, string[] | undefined>) =>
    Object.entries(issues).reduce<Record<string, string>>(
      (accumulator, [key, value]) => {
        if (value?.[0]) {
          accumulator[key] = value[0];
        }

        return accumulator;
      },
      {},
    );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const parsed = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors(toFieldErrors(flattened));
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const token = getAuthTokenFromResponse(response);

      if (!token) {
        throw new Error("Login succeeded, but no auth token was returned.");
      }

      setToken(token);
      setEmail(formData.email.trim());

      router.push("/app");
    } catch (error) {
      const submitMessage =
        error instanceof AuthApiError
          ? error.code === "TIMEOUT_ERROR"
            ? "Login is taking longer than expected. Please check your connection and try again."
            : error.message
          : error instanceof Error
            ? error.message
            : "Unable to log in right now.";

      setErrors((previous) => ({
        ...previous,
        submit: submitMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex w-full min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04),transparent_60%)]" />
      <AuthCard
        title="Log in to your account"
        subtitle="Proceed to access your account and continue your work."
        footerLabel="Don't have an account?"
        footerLinkLabel="Sign up"
        footerHref="/auth/signup"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            icon={
              <IoMail className="h-4 w-4 text-[#B0BABF]" aria-hidden="true" />
            }
            iconPosition="left"
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />

          {errors.submit && (
            <p className="text-xs text-red-500" role="alert">
              {errors.submit}
            </p>
          )}

          <Button
            variant="primary"
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </AuthCard>

      <AuthHelpFab />
    </section>
  );
}

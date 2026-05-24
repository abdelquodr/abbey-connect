"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { AuthCard } from "@/app/components/auth/AuthCard";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { AuthHelpFab } from "@/app/components/auth/AuthHelpFab";
import { AuthApiError, authApi } from "@/app/lib/auth-api";
import { useAuth } from "@/app/lib/auth-context";
import { registerSchema } from "@/app/utils/validation";

export default function EmailSignupPage() {
  const router = useRouter();
  const { clear, setEmail } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.trim().length >= 8;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const parsed = registerSchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      clear();
      setEmail(formData.email.trim());

      router.push("/auth/signup/check-mail");
    } catch (error) {
      const submitMessage =
        error instanceof AuthApiError
          ? error.code === "TIMEOUT_ERROR"
            ? "Registration is taking longer than expected. Please check your connection and try again."
            : error.message
          : error instanceof Error
            ? error.message
            : "An error occurred";

      if (
        process.env.NODE_ENV !== "production" &&
        !(error instanceof AuthApiError)
      ) {
        console.error("Registration error:", error);
      }

      setErrors((prev) => ({
        ...prev,
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
        title="Register your account"
        subtitle="Proceed to create account and setup your organization"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              disabled={isLoading}
              icon={
                <FaUser className="h-4 w-4 text-[#B0BABF]" aria-hidden="true" />
              }
              iconPosition="left"
            />
            <Input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              disabled={isLoading}
              icon={
                <FaUser className="h-4 w-4 text-[#B0BABF]" aria-hidden="true" />
              }
              iconPosition="left"
            />
          </div>

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
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </AuthCard>

      <AuthHelpFab />
    </section>
  );
}

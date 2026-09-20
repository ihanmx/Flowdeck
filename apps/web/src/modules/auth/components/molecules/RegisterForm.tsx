"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/modules/auth/schemas";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";
import { useRegister } from "@/modules/auth/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";
import { RememberMe } from "./RememberMe";
import { setRememberMe } from "@/stores/auth.store";

const scheme = registerSchema;
type FormValues = RegisterFormValues;

export function RegisterForm() {
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(scheme),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const { mutate, isPending, error } = useRegister();
  const serverError = error?.response?.data.message ?? null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted">
        Start managing projects in minutes
      </p>

      <form
        onSubmit={handleSubmit(({ rememberMe, ...data }) => {
          setRememberMe(rememberMe);
          mutate(data);
        })}
        className="mt-6 flex flex-col gap-4"
      >
        <FormField label="Full name" error={errors.name?.message}>
          <Input
            placeholder="Alex Morgan"
            leftIcon={<User size={16} />}
            {...field("name")}
          />
        </FormField>

        <FormField label="Email address" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@company.com"
            leftIcon={<Mail size={16} />}
            {...field("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="At least 8 characters"
            leftIcon={<Lock size={16} />}
            {...field("password")}
          />
        </FormField>
        <RememberMe {...field("rememberMe")} />

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" loading={isPending} className="w-full h-11">
          Sign up
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or continue with{" "}
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* OAuth not wired yet — visual only */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" type="button" className="h-11">
          Google
        </Button>
        <Button variant="secondary" type="button" className="h-11">
          GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-500 hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

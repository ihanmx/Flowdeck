"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useLogin } from "@/modules/auth/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending, error } = useLogin();
  const serverError = error?.response?.data.message ?? null; // typed! (AxiosError<ApiError>)

  return (
    <form
      onSubmit={handleSubmit((values) => mutate(values))}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6"
    >
      <h1 className="font-display text-xl font-semibold text-ink">
        Welcome back
      </h1>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-body">Email</label>
        <Input type="email" placeholder="you@company.com" {...field("email")} />
        {errors.email && (
          <span className="text-xs text-danger">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-body">Password</label>
        <Input type="password" placeholder="••••••••" {...field("password")} />
        {errors.password && (
          <span className="text-xs text-danger">{errors.password.message}</span>
        )}
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" loading={isPending}>
        Log in
      </Button>

      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-primary-500 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useLogin } from "@/modules/auth/hooks";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { FormField } from "@/shared/components/ui/FormField";
import { RememberMe } from "./RememberMe";
import { setRememberMe } from "@/stores/auth.store";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });
  const { mutate, isPending, error } = useLogin();
  const serverError = error?.response?.data.message ?? null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to your Flowdeck workspace
      </p>

      <form
        onSubmit={handleSubmit(({ rememberMe, ...credentials }) => {
          setRememberMe(rememberMe);
          mutate(credentials);
        })}
        className="mt-6 flex flex-col gap-4"
      >
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
            placeholder="••••••••"
            {...field("password")}
          />
        </FormField>

        <div className="flex items-center justify-between -mt-1">
          <RememberMe {...field("rememberMe")} />
          <Link
            href="/forgot-password"
            className="text-sm text-primary-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" loading={isPending} className="w-full h-11">
          Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or continue with{" "}
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* NOTE: OAuth isn't wired to the backend yet (stretch feature) — visual for now */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" type="button" className="h-11">
          Google
        </Button>
        <Button variant="secondary" type="button" className="h-11">
          GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary-500 hover:underline font-medium"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}

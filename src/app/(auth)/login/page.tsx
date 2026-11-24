"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { safeRedirectTarget } from "@/lib/safeRedirect";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  // Login OK y navegando: el botón sigue deshabilitado hasta que cargue la
  // página siguiente (isSubmitting vuelve a false antes de que termine la recarga).
  const [redirecting, setRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message,
      );
      return;
    }
    // Recarga completa (no router.push): así el servidor y el navegador
    // arrancan con las cookies de sesión ya escritas, sin depender de que
    // Next.js invalide una versión en caché de la página pedida sin sesión.
    // Vuelve a donde el usuario estaba (?next=) si venía de una redirección
    // del proxy, o a /cuenta si entró a /login directamente.
    const target = safeRedirectTarget(searchParams.get("next"));
    setRedirecting(true);
    window.location.assign(target);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-8 text-[32px] font-bold leading-tight text-ink">Iniciar sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field label="Correo" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
          />
        </Field>

        <Field label="Contraseña" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-[11px] border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-ink focus:ring-[3px] focus:ring-mint"
          />
        </Field>

        {serverError && <p className="text-xs text-danger">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting || redirecting}
          className="mt-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-ink disabled:opacity-60"
        >
          {isSubmitting || redirecting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href={
            searchParams.get("next")
              ? `/registro?next=${encodeURIComponent(searchParams.get("next")!)}`
              : "/registro"
          }
          className="font-semibold text-accent hover:text-accent-ink"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow text-muted">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

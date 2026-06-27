"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase().auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
  }

  return (
    <div
      className="flex min-h-full flex-1 items-center justify-center px-4 font-mono"
      style={{ backgroundColor: "#0A0B0D", color: "#E8E6E1" }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-lg tracking-wider">Connexion</h1>

        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="rounded border px-3 py-2 outline-none focus:border-[#FAC775]"
            style={{
              backgroundColor: "#13151A",
              borderColor: "#22252A",
              color: "#E8E6E1",
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="rounded border px-3 py-2 outline-none focus:border-[#FAC775]"
            style={{
              backgroundColor: "#13151A",
              borderColor: "#22252A",
              color: "#E8E6E1",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer rounded px-4 py-2 font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "#FAC775", color: "#0A0B0D" }}
        >
          Se connecter
        </button>

        {error && (
          <p className="text-sm" style={{ color: "#E24B4A" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

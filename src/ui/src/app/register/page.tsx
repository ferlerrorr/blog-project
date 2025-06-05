// src/app/register/page.tsx
"use client";

import React, { useState, type FormEvent, type JSX } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function RegisterPage(): JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className='max-w-md mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Register</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && <p className='text-red-600 font-semibold'>{error}</p>}
        <div>
          <label htmlFor='email' className='block font-medium mb-1'>
            Email
          </label>
          <input
            id='email'
            type='email'
            className='w-full border rounded px-3 py-2'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor='password' className='block font-medium mb-1'>
            Password
          </label>
          <input
            id='password'
            type='password'
            className='w-full border rounded px-3 py-2'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50'
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}

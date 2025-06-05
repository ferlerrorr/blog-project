"use client";

import React, { useState, type FormEvent, type JSX } from "react";
import { supabase } from "../lib/supabase";

type AuthModalProps = {
  onLoginSuccess: (userId: string) => void;
  onClose: () => void;
};

export default function AuthModal({
  onLoginSuccess,
  onClose,
}: AuthModalProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegister, setIsRegister] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    if (isRegister) {
      if (!fullName.trim()) {
        setError("Full name is required");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    let userId: string | null = null;

    if (isRegister) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: undefined },
        });

      if (signUpError || !signUpData.user) {
        setLoading(false);
        setError(signUpError?.message ?? "Registration failed");
        return;
      }

      userId = signUpData.user.id;

      const { error: insertError } = await supabase.from("users").insert([
        {
          id: userId,
          full_name: fullName,
          email: email,
        },
      ]);

      if (insertError) {
        setLoading(false);
        setError("User profile creation failed");
        return;
      }
      localStorage.setItem("userEmail", email);
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (signInError || !signInData.user) {
      setError(signInError?.message ?? "Failed to authenticate");
      return;
    }

    localStorage.setItem("userEmail", email);
    onLoginSuccess(signInData.user.id);
    onClose();
  }

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
      <div className='bg-white rounded p-6 w-full max-w-md shadow-lg relative'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-600 hover:text-gray-900'
          aria-label='Close auth modal'
        >
          &times;
        </button>

        <h2 className='text-2xl font-bold mb-4'>
          {isRegister ? "Register" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && <p className='text-red-600 font-semibold'>{error}</p>}

          {isRegister && (
            <div>
              <label htmlFor='fullName' className='block font-medium mb-1'>
                Full Name
              </label>
              <input
                id='fullName'
                type='text'
                className='w-full border rounded px-3 py-2'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

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
              type={showPassword ? "text" : "password"}
              className='w-full border rounded px-3 py-2'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {isRegister && (
            <div>
              <label
                htmlFor='confirmPassword'
                className='block font-medium mb-1'
              >
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                type={showPassword ? "text" : "password"}
                className='w-full border rounded px-3 py-2'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className='flex items-center space-x-2'>
            <input
              id='showPassword'
              type='checkbox'
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor='showPassword' className='text-sm'>
              Show password
            </label>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className='mt-4 text-center text-sm text-gray-600'>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type='button'
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className='text-blue-600 hover:underline font-semibold'
          >
            {isRegister ? "Login here" : "Register here"}
          </button>
        </p>
      </div>
    </div>
  );
}

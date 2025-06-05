// src/app/create/page.tsx
"use client";

import React, { useState, type FormEvent, JSX, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CreateBlogPage(): JSX.Element {
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Authentication guard
  useEffect(() => {
    async function checkAuth(): Promise<void> {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login"); // Redirect to login if not authenticated
        return;
      }

      setCheckingAuth(false); // User is authenticated, allow page to render
    }

    void checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <main className='max-w-3xl mx-auto p-6'>
        <p>Checking authentication...</p>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    const author = user?.email ?? "anonymous";

    const { error: supabaseError } = await supabase
      .from("blogs")
      .insert([{ title, content, author }]);

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className='max-w-3xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Create New Blog</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && <p className='text-red-600 font-semibold'>{error}</p>}
        <div>
          <label htmlFor='title' className='block font-medium mb-1'>
            Title
          </label>
          <input
            id='title'
            type='text'
            className='w-full border rounded px-3 py-2'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor='content' className='block font-medium mb-1'>
            Content
          </label>
          <textarea
            id='content'
            className='w-full border rounded px-3 py-2 min-h-[150px]'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? "Creating..." : "Create Blog"}
        </button>
      </form>
    </main>
  );
}

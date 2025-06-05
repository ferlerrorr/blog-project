"use client";

import React, { useState, useEffect, type FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditBlogPage({
  params,
}: EditBlogPageProps): JSX.Element {
  const router = useRouter();

  // Use state to hold resolved id after awaiting params
  const [id, setId] = useState<string | null>(null);

  // Blog data states
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Await the params promise on mount
  useEffect(() => {
    async function resolveParams(): Promise<void> {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
      } catch {
        setError("Failed to resolve params");
        setLoading(false);
      }
    }
    void resolveParams();
  }, [params]);

  // Fetch blog when id is set
  useEffect(() => {
    async function fetchBlog(): Promise<void> {
      if (!id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("title, content")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    }
    void fetchBlog();
  }, [id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (!id) {
      setError("Missing blog ID");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("blogs")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/");
  }

  if (loading) {
    return <p className='p-6'>Loading blog...</p>;
  }

  return (
    <main className='max-w-3xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Edit Blog</h1>
      {error && <p className='text-red-600 mb-4'>{error}</p>}
      <form onSubmit={handleSubmit} className='space-y-4'>
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
            disabled={saving}
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
            disabled={saving}
            required
          />
        </div>
        <button
          type='submit'
          disabled={saving}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}

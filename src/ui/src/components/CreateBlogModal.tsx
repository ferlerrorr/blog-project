"use client";

import React, { useState, useEffect, type FormEvent, type JSX } from "react";
import { supabase } from "../lib/supabase";

interface CreateBlogModalProps {
  onClose: () => void;
  onBlogCreated: () => void; // callback to refresh blog list
}

export default function CreateBlogModal({
  onClose,
  onBlogCreated,
}: CreateBlogModalProps): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth(): Promise<void> {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUnauthenticated(true);
        setAuthChecked(true);
        // Do NOT auto-close modal when unauthenticated
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? null);
      setUnauthenticated(false);
      setAuthChecked(true);
    }

    void checkAuth();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (!userId || !userEmail) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    const { error: supabaseError } = await supabase.from("blogs").insert([
      {
        title,
        content,
        author_id: userId,
        author_email: userEmail,
      },
    ]);

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }
    setTitle("");
    setContent("");

    onBlogCreated();
    onClose();
  }

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
    >
      <div
        className='bg-white rounded p-6 w-full max-w-md min-h-[330px] flex flex-col justify-between relative'
        onClick={(e) => e.stopPropagation()}
      >
        {/* X close button */}
        <button
          type='button'
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
          aria-label='Close modal'
          disabled={loading}
        >
          &#x2715;
        </button>

        {unauthenticated && authChecked ? (
          <div className='flex flex-col justify-center items-center flex-1 text-center'>
            <p className='text-gray-500 font-semibold'>
              Please login to create a blog.
            </p>
          </div>
        ) : (
          <>
            <div className='space-y-2'>
              <h1 className='text-2xl font-bold mb-4'>Create New Blog</h1>

              <form
                onSubmit={handleSubmit}
                className='space-y-3 flex flex-col w-full max-w-3xl'
              >
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
                    autoFocus
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

                <div className='flex justify-end gap-4 pt-2'>
                  <button
                    type='button'
                    onClick={onClose}
                    disabled={loading}
                    className='px-4 py-2 rounded border border-gray-300 hover:bg-gray-100'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    {loading ? "Creating..." : "Create Blog"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

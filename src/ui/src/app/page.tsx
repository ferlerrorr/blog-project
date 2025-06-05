"use client";

import React, { useEffect, useState, useCallback, type JSX } from "react";
import { supabase } from "../lib/supabase";
import type { Blog } from "../../types/blog";
import { BlogCard } from "../components/BlogCard";
import AuthModal from "../components/AuthModal";
import CreateBlogModal from "../components/CreateBlogModal";
import LogoutModal from "../components/LogoutModal";

const PAGE_SIZE = 5;

export default function Home(): JSX.Element {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<{
    email: string | null;
    avatarUrl?: string;
  } | null>(null);

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const [isPageChanging, setIsPageChanging] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0); // 👈 new refresh key

  const fetchBlogs = useCallback(
    async (pageToFetch: number = page): Promise<void> => {
      if (!isPageChanging) setLoading(true);

      setError(null);

      const from = (pageToFetch - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const {
        data,
        error: fetchError,
        count,
      } = await supabase
        .from("blogs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) {
        setError(fetchError.message);
        setBlogs([]);
        setTotalCount(0);
      } else {
        setBlogs([...data]); // 👈 force new array reference
        setTotalCount(count ?? 0);
        setRefreshKey((prev) => prev + 1); // 👈 trigger BlogCard list rerender
      }

      setLoading(false);
      setIsPageChanging(false);
    },
    [page, isPageChanging]
  );

  function onPageChange(newPage: number): void {
    if (newPage !== page) {
      setIsPageChanging(true);
      setPage(newPage);
    }
  }

  useEffect(() => {
    void fetchBlogs(page);
  }, [page, fetchBlogs]);

  useEffect(() => {
    async function fetchUser(): Promise<void> {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          email: user.email ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
        });
      } else {
        setUser(null);
      }
    }

    void fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? undefined,
          });
        } else {
          setUser(null);
        }

        setPage(1);
        void fetchBlogs(1);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchBlogs]);

  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  function handleCreateClick(): void {
    setShowCreateModal(true);
  }

  function handleLoginSuccess(): void {
    setShowLoginModal(false);
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email ?? null,
          avatarUrl: data.user.user_metadata?.avatar_url ?? undefined,
        });
        setPage(1);
        void fetchBlogs(1);
      }
    });
  }

  function handleCreateClose(): void {
    setShowCreateModal(false);
  }

  return (
    <>
      <header className='max-w-[35em] flex justify-between items-center mx-auto pb-4'>
        <div className='flex items-center mt-[6em]'>
          {user ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              title={user.email ?? ""}
              className='w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm'
              style={{ position: "absolute", right: "1.5em", top: "1.2em" }}
            >
              {user.email?.charAt(0).toUpperCase() ?? ""}
            </button>
          ) : (
            <button
              type='button'
              onClick={() => setShowLoginModal(true)}
              className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'
              style={{ position: "absolute", right: "1.5em", top: "1.2em" }}
            >
              Login
            </button>
          )}

          <h1 className='text-3xl font-bold text-gray-700 tracking-[1.2px]'>
            Blog Posts
          </h1>
        </div>
        <button
          onClick={handleCreateClick}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-[6em]'
          type='button'
        >
          Create Blog
        </button>
      </header>

      <main className='max-w-[35em] mx-auto'>
        {loading && !isPageChanging && <p>Loading blogs...</p>}
        {error && <p className='text-red-600 font-semibold'>{error}</p>}
        {!loading && !error && blogs.length === 0 && <p>No blogs found.</p>}

        {/* 👇 force BlogCard rerender on refreshKey change */}
        <div className='grid gap-6' key={refreshKey}>
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        <div className='flex justify-center gap-4 mt-8'>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            className='px-4 py-2 bg-gray-300 rounded disabled:opacity-50'
          >
            Previous
          </button>
          <span className='self-center'>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            className='px-4 py-2 bg-gray-300 rounded disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </main>

      {showLoginModal && (
        <AuthModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateBlogModal
          onClose={handleCreateClose}
          onBlogCreated={async () => {
            setShowCreateModal(false);
            setPage(1);
            await fetchBlogs(1);
          }}
        />
      )}

      {showLogoutModal && (
        <LogoutModal onClose={() => setShowLogoutModal(false)} />
      )}
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import type { Blog } from "../../types/blog";
import { supabase } from "../lib/supabase";

type BlogCardProps = {
  blog: Blog;
  currentUserEmail: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  currentUserEmail,
  onEdit,
  onDelete,
}) => {
  const [authorName, setAuthorName] = useState<string>("Loading...");
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async (): Promise<void> => {
      if (!blog.author_email) {
        setAuthorName("Unknown author");
        setAuthorEmail(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("email", blog.author_email)
        .single();

      if (error || !data) {
        setAuthorName("Unknown author");
        setAuthorEmail(null);
        return;
      }

      setAuthorName(data.full_name);
      setAuthorEmail(data.email ?? null);
    };

    void fetchAuthor();
  }, [blog.author_email]);

  const isOwner = currentUserEmail !== null && authorEmail === currentUserEmail;

  return (
    <div className='border rounded-md pl-5 pr-5 pt-2 pb-2 shadow-sm hover:shadow-md transition-shadow bg-white'>
      <h2 className='text-lg font-semibold mb-2'>{blog.title}</h2>
      <p className='text-gray-700 mb-4 text-sm'>
        {blog.content.slice(0, 150)}...
      </p>
      <div className='flex justify-between items-center text-xs text-gray-500 mb-2'>
        <span>By {authorName}</span>
        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
      </div>
      {isOwner && (onEdit || onDelete) && (
        <div className='flex space-x-2'>
          {onEdit && (
            <button
              type='button'
              className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
              onClick={() => onEdit(blog.id)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type='button'
              className='px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
              onClick={() => onDelete(blog.id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

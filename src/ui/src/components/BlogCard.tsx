"use client";

import React, { useEffect, useState } from "react";
import type { Blog } from "../../types/blog";
import { supabase } from "../lib/supabase";

type BlogCardProps = {
  blog: Blog;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onEdit,
  onDelete,
}) => {
  const [authorName, setAuthorName] = useState<string>("Loading...");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setCurrentUserEmail(email ?? null);
  }, []);

  useEffect(() => {
    const fetchAuthor = async (): Promise<void> => {
      if (!blog.author_email) {
        setAuthorName("Unknown author");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("full_name")
        .eq("email", blog.author_email)
        .single();

      if (error || !data) {
        setAuthorName("Unknown author");
        return;
      }

      setAuthorName(data.full_name);
    };

    void fetchAuthor();
  }, [blog.author_email]);

  const isOwner =
    currentUserEmail !== null && currentUserEmail === blog.author_email;

  console.log("== BlogCard debug ==");
  console.log("Blog ID:", blog.id);
  console.log("Current User Email:", currentUserEmail);
  console.log("Blog Author Email:", blog.author_email);
  console.log("Is Owner:", isOwner);

  return (
    <div className='border rounded-md pl-5 pr-5 pt-2 pb-2 shadow-sm hover:shadow-md transition-shadow bg-white'>
      <div className='flex justify-between items-center mb-2'>
        <h2 className='text-lg font-semibold flex-grow'>{blog.title}</h2>
        {isOwner && (
          <div className='flex space-x-2'>
            <button
              type='button'
              className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
              onClick={() => onEdit?.(blog.id)}
            >
              Edit
            </button>
            <button
              type='button'
              className='px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
              onClick={() => onDelete?.(blog.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p className='text-gray-700 mb-4 text-sm'>
        {blog.content.slice(0, 150)}...
      </p>
      <div className='flex justify-between items-center text-xs text-gray-500 mb-2'>
        <span>By {authorName}</span>
        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

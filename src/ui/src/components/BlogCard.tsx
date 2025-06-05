"use client";

import React, { useEffect, useState } from "react";
import type { Blog } from "../../types/blog";
import { supabase } from "../lib/supabase";

type BlogCardProps = {
  blog: Blog;
  onEditSuccess?: () => void;
  onDelete?: (id: string) => void;
};

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onEditSuccess,
  onDelete,
}) => {
  const [authorName, setAuthorName] = useState<string>("Loading...");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState<boolean>(false);

  const [editTitle, setEditTitle] = useState<string>(blog.title);
  const [editContent, setEditContent] = useState<string>(blog.content);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const handleSave = async (): Promise<void> => {
    console.log("Starting save operation for blog:", blog.id);
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ title: editTitle.trim(), content: editContent.trim() })
        .eq("id", blog.id);

      if (error) {
        console.error("Save error:", error);
        setErrorMsg("Failed to update blog.");
        setIsSaving(false);
        return;
      }

      console.log("Save successful, closing modal and calling onEditSuccess");
      setIsEditModalOpen(false);
      setIsSaving(false);

      if (onEditSuccess) {
        console.log("Calling onEditSuccess callback");
        onEditSuccess();
      } else {
        console.warn("onEditSuccess callback not provided");
      }
    } catch (err) {
      console.error("Unexpected save error:", err);
      setErrorMsg("Unexpected error occurred.");
      setIsSaving(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (isDeleting) {
      console.log("Delete operation already in progress, ignoring");
      return;
    }

    console.log("Starting delete operation for blog:", blog.id);
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", blog.id);

      if (error) {
        console.error("Delete error:", error);
        setErrorMsg("Failed to delete blog.");
        setIsDeleting(false);
        return;
      }

      console.log("Delete successful for blog:", blog.id);
      setIsDeleting(false);
      setIsConfirmDeleteModalOpen(false);

      if (onDelete) {
        console.log("Calling onDelete callback with ID:", blog.id);
        onDelete(blog.id);
      } else {
        console.warn("onDelete callback not provided");
      }
    } catch (err) {
      console.error("Unexpected delete error:", err);
      setErrorMsg("Unexpected error occurred during deletion.");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className='border rounded-md pl-5 pr-5 pt-2 pb-2 shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer'
        onClick={() => setIsViewModalOpen(true)}
      >
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-lg font-semibold flex-grow mr-[.5em]'>
            {blog.title.slice(0, 30)}
          </h2>
          {isOwner && (
            <div
              className='flex space-x-2'
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type='button'
                className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
                onClick={() => {
                  setEditTitle(blog.title);
                  setEditContent(blog.content);
                  setErrorMsg(null);
                  setIsEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type='button'
                className='px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50'
                onClick={() => {
                  console.log("Delete button clicked for blog:", blog.id);
                  setIsConfirmDeleteModalOpen(true);
                }}
                disabled={isDeleting}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <p className='text-gray-700 mb-4 text-sm'>
          {blog.content.slice(0, 60)}...
        </p>
        <div className='flex justify-between items-center text-xs text-gray-500 mb-2'>
          <span>By {authorName}</span>
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {isViewModalOpen && (
        <Modal onClose={() => setIsViewModalOpen(false)} title={blog.title}>
          <div className='space-y-4'>
            <p className='text-gray-800 whitespace-pre-wrap'>{blog.content}</p>
            <div className='text-xs text-gray-500 flex justify-between'>
              <span>By {authorName}</span>
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Modal>
      )}

      {isEditModalOpen && (
        <Modal onClose={() => setIsEditModalOpen(false)} title='Edit Blog'>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSave();
            }}
            className='space-y-4'
          >
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Title
              </label>
              <input
                id='title'
                type='text'
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label
                htmlFor='content'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Content
              </label>
              <textarea
                id='content'
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
                disabled={isSaving}
              />
            </div>

            {errorMsg && <p className='text-red-600 text-sm'>{errorMsg}</p>}

            <div className='flex justify-end space-x-2'>
              <button
                type='button'
                onClick={() => setIsEditModalOpen(false)}
                className='px-4 py-2 rounded bg-gray-300 hover:bg-gray-400'
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isConfirmDeleteModalOpen && (
        <Modal
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          title='Confirm Deletion'
        >
          <p className='mb-4 text-gray-700'>
            Are you sure you want to delete <strong>{blog.title}</strong>?
          </p>
          {errorMsg && <p className='text-red-600 text-sm mb-2'>{errorMsg}</p>}
          <div className='flex justify-end space-x-2'>
            <button
              type='button'
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => {
                console.log("Confirm delete button clicked");
                void confirmDelete();
              }}
              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

type ModalProps = {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ onClose, title, children }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
    >
      <div
        className='bg-white rounded-md max-w-lg w-full p-6 relative'
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id='modal-title' className='text-xl font-semibold mb-4'>
          {title}
        </h3>
        <button
          type='button'
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-800'
          onClick={onClose}
          aria-label='Close modal'
        >
          ✕
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

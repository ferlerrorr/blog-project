// src/components/LogoutModal.tsx
"use client";

import { useState, type JSX } from "react";
import { supabase } from "../lib/supabase";

type LogoutModalProps = {
  onClose: () => void;
};

export default function LogoutModal({
  onClose,
}: LogoutModalProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);

  async function handleLogout(): Promise<void> {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    onClose();
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded p-6 w-full max-w-sm shadow-lg relative'>
        <p className='text-center text-gray-800 text-lg mb-4'>
          Are you sure you want to log out?
        </p>
        <div className='flex justify-center gap-4'>
          <button
            onClick={handleLogout}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50'
            disabled={loading}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
          <button
            onClick={onClose}
            className='bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400'
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

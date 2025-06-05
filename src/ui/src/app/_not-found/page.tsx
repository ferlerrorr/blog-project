"use client";

import { JSX, useEffect } from "react";

export default function NotFound(): JSX.Element {
  useEffect(() => {
    console.error("404 - Not Found");
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full text-center'>
        <h1 className='text-6xl font-bold text-gray-900 mb-4'>{"404"}</h1>
        <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
          {"Page Not Found"}
        </h2>
        <p className='text-gray-600 mb-8'>
          {"The page youre looking for doesnt exist."}
        </p>
      </div>
    </div>
  );
}

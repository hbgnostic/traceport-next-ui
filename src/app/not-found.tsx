// src/app/not-found.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NotFoundContent() {
  const params = useSearchParams(); // this is safe now
  console.log("404 params:", params);
  return <p>Sorry, page not found.</p>;
}

export default function NotFound() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">404 – Not Found</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <NotFoundContent />
      </Suspense>
    </main>
  );
}
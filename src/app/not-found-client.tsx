'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchParamLogger() {
  const params = useSearchParams();
  console.log('404 search params:', params.toString());
  return null;
}

export default function NotFoundClient() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">404 – Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Suspense fallback={null}>
        <SearchParamLogger />
      </Suspense>
    </main>
  );
}
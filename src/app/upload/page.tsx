'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-docs', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadSuccess(true);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-[#16243E]">Upload Docs</h1>

      {!uploadSuccess ? (
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block font-semibold">Form 990 (PDF)</label>
            <input type="file" name="form990" accept=".pdf" required className="border p-2 w-full" />
          </div>
          <div>
            <label className="block font-semibold">Annual Report (PDF, optional)</label>
            <input type="file" name="annualReport" accept=".pdf" className="border p-2 w-full" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#019AA8] text-white px-4 py-2 rounded"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          {error && <p className="text-red-600">{error}</p>}
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-green-700 font-semibold">✅ Files uploaded successfully! You may continue.</p>
          <Link href="/program-allocator">
            <button className="bg-[#019AA8] text-white px-6 py-2 rounded">Continue to Smart Quiz</button>
          </Link>
        </div>
      )}
    </main>
  );
}
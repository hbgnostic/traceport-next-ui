'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-docs', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/functional-allocation');
      } else {
        const data = await res.json();
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto text-gray-800">
     <h1 className="text-3xl font-bold mb-4 text-[#16243E]">Welcome to Traceport Smart Guidance</h1>

<p className="mb-6 text-lg leading-relaxed">
  TracePort helps you allocate unrestricted donations with clarity and precision — even before the funds arrive. 
  By analyzing your IRS Form 990 and annual report or other program documents, we guide you in building a transparent, trustworthy allocation model.
</p>

<p className="mb-4 font-semibold text-[#16243E]">This process helps you:</p>
<ul className="list-disc list-inside mb-6 text-gray-800">
  <li>Break down expenses into Program vs Administrative vs Fundraising</li>
  <li>Estimate how program dollars are distributed across initiatives</li>
  <li>Create audit-ready, donor-friendly reporting — backed by real data</li>
</ul>

<p className="mb-6 text-gray-600 italic">
  🌐 Bonus: Even if Traceport vanished tomorrow, your allocations are cryptographically secured on-chain — 
  permanent, verifiable, and portable.
</p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Upload IRS Form 990 (PDF)</label>
          <input type="file" name="form990" accept=".pdf" required className="border p-2 w-full" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Upload Annual Report (Optional)</label>
          <input type="file" name="annualReport" accept=".pdf" className="border p-2 w-full" />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#019AA8] text-white px-6 py-2 rounded"
        >
          {loading ? 'Uploading...' : 'Start Smart Allocation'}
        </button>
      </form>
    </main>
  );
}
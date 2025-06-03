'use client';

import { useUploadContext } from '@/context/UploadContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mode, setMode, xmlUrl, setXmlUrl } = useUploadContext();
  console.log('🔍 current mode:', mode);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      if (mode === 'pdf') {
        const formData = new FormData(e.currentTarget);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-docs`, {
          method: 'POST',
          body: formData,
        });
  
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Upload failed');
          return;
        }
  
        router.push(`/functional-allocation?mode=pdf`);
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/xml-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xml_url: xmlUrl }),
        });
  
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'XML fetch failed');
          return;
        }
  
        router.push(`/functional-allocation?mode=xml&xmlUrl=${encodeURIComponent(xmlUrl)}`);
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
        Traceport helps you allocate unrestricted donations with clarity and precision — even before the funds arrive. 
        By analyzing your IRS Form 990 and annual report or other program documents, we guide you in building a transparent, trustworthy allocation model.
      </p>

      <div className="mb-6">
        <label className="font-semibold block mb-2">Input Type</label>
        <select
          className="border p-2 w-full"
          value={mode}
          onChange={(e) => setMode(e.target.value as 'pdf' | 'xml')}
        >
          <option value="pdf">Upload PDF</option>
          <option value="xml">Paste XML URL</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'pdf' && (
          <>
            <div>
              <label className="block font-semibold mb-1">Upload IRS Form 990 (PDF)</label>
              <input type="file" name="form990" accept=".pdf" required className="border p-2 w-full" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Upload Annual Report (Optional)</label>
              <input type="file" name="annualReport" accept=".pdf" className="border p-2 w-full" />
            </div>
          </>
        )}

        {mode === 'xml' && (
          <div>
            <label className="block font-semibold mb-1">Enter XML URL</label>
            <input
              type="url"
              className="border p-2 w-full"
              placeholder="https://example.com/your-990.xml"
              value={xmlUrl}
              onChange={(e) => setXmlUrl(e.target.value)}
              required
            />
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#019AA8] text-white px-6 py-2 rounded"
        >
          {loading ? 'Processing...' : 'Start Smart Allocation'}
        </button>
      </form>
    </main>
  );
}
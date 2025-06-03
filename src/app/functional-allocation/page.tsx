'use client';
import { useUploadContext } from '@/context/UploadContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedPieChart from '@/components/UnifiedPieChart';

type Totals = {
  program: number;
  admin: number;
  fundraising: number;
  program_pct: number;
  admin_pct: number;
  fundraising_pct: number;
};

export default function FunctionalAllocation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { mode, xmlUrl, totals, setTotals } = useUploadContext();

  useEffect(() => {
    async function fetchFunctionalData() {
      // already done via the hook above
      const endpoint =
        mode === 'xml'
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/xml-analyze`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analyze`;
  
      try {
        const options: RequestInit = { method: 'POST' };
  
        if (mode === 'xml') {
          options.headers = { 'Content-Type': 'application/json' };
          options.body = JSON.stringify({ xml_url: xmlUrl });
        }
  
        const res = await fetch(endpoint, options);
        const data = await res.json();
  
        if (res.ok && !data.error) {
          setTotals(data);
        } else {
          setError(data.error || `Server error: ${res.status}`);
        }
      } catch (err) {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    }
  
    fetchFunctionalData();
  }, []);

  return (
    <main className="p-6 max-w-xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center text-[#16243E]">Functional Expense Allocation</h1>

      {loading && <p className="text-center">📤 Loading functional expense data...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {totals && (
        <section className="mt-8">
            <h2 className="text-xl font-semibold text-center">Your Functional Expense Allocation</h2>
            <p className="text-center mb-4">
              Based on your uploaded IRS Form 990, we've extracted how your organization allocates expenses between
              <strong> program services</strong>, <strong>administration</strong>, and <strong>fundraising</strong>.
            </p>
            <p className="text-center mb-6 text-gray-700">
              This step establishes your organization’s overall spending profile — a required foundation for allocating
              <em>unrestricted</em> donations in Traceport. Your salaries and overhead are already accounted for here.
            </p>

            <ul className="list-none p-0 mb-4">
              <li>
                <strong>Program Services:</strong> ${totals.program.toLocaleString()} ({totals.program_pct}%)
              </li>
              <li>
                <strong>Administrative:</strong> ${totals.admin.toLocaleString()} ({totals.admin_pct}%)
              </li>
              <li>
                <strong>Fundraising:</strong> ${totals.fundraising.toLocaleString()} ({totals.fundraising_pct}%)
              </li>
            </ul>

            <UnifiedPieChart
              data={[
                { label: 'Program Services', value: totals.program_pct },
                { label: 'Administrative', value: totals.admin_pct },
                { label: 'Fundraising', value: totals.fundraising_pct }
              ]}
              size="large"
              showPercentagesInLegend={true}
            />
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                router.push('/program-intro');
              }}
              className="bg-[#019AA8] text-white px-4 py-2 rounded"
            >
              ✅ Yes, use this allocation
            </button>

            <button
              disabled
              className="bg-gray-300 text-white px-4 py-2 rounded cursor-not-allowed"
              title="Manual adjustment not yet available"
            >
              ❌ No, I want to adjust
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
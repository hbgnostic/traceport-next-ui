'use client';
console.log("trigger rebuild");
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type Totals = {
  program: number;
  admin: number;
  fundraising: number;
  program_pct: number;
  admin_pct: number;
  fundraising_pct: number;
};

export default function FunctionalAllocation() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchFunctionalData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analyze`, {
          method: 'POST',
        });

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
              <em>unrestricted</em> donations in TracePort. Your salaries and overhead are already accounted for here.
            </p>

          <ul className="list-none p-0 mb-4">
            <li><strong>Program Services:</strong> ${totals.program} ({totals.program_pct}%)</li>
            <li><strong>Administrative:</strong> ${totals.admin} ({totals.admin_pct}%)</li>
            <li><strong>Fundraising:</strong> ${totals.fundraising} ({totals.fundraising_pct}%)</li>
          </ul>

          <div className="w-72 mx-auto mb-6">
            <Pie
              data={{
                labels: ['Program Services', 'Administrative', 'Fundraising'],
                datasets: [
                  {
                    data: [
                      totals.program_pct,
                      totals.admin_pct,
                      totals.fundraising_pct,
                    ],
                    backgroundColor: ['#019AA8', '#C9E5E9', '#16243E'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                localStorage.setItem('functional', JSON.stringify(totals));
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
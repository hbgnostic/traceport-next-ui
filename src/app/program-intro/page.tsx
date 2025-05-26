'use client';
import { useRouter } from 'next/navigation';

export default function ProgramIntro() {
  const router = useRouter();

  return (
    <main className="p-6 max-w-xl mx-auto text-gray-800 text-center">
      <h1 className="text-2xl font-bold mb-4 text-[#16243E]">Functional Allocation Confirmed ✅</h1>
      <p className="mb-4">
        We've saved your overall budget allocation across program services, administration, and fundraising.
        Next, you'll break down your <strong>program spending</strong> into individual initiatives.
      </p>
      <p className="mb-6 text-gray-600">
        This step helps you allocate unrestricted donations in a mission-driven, reportable way.
      </p>
      <button
        onClick={() => router.push('/program-allocator')}
        className="bg-[#019AA8] text-white px-6 py-2 rounded"
      >
        🚀 Continue to Program Allocation
      </button>
    </main>
  );
}
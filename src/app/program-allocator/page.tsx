'use client';
console.log("trigger rebuild");
import { useEffect, useState } from 'react';

type Program = {
  name: string;
  description: string;
  percentage: string;
};

export default function ProgramAllocator() {
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSuggestedPrograms() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/suggest-programs`, {
          method: 'POST'
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const withPercents = data.map((p: any) => ({ ...p, percentage: '' }));
          setPrograms(withPercents);
        } else {
          setError('Could not load suggestions.');
        }
      } catch (e) {
        setError('Failed to fetch suggestions. Please ensure your Flask API is running and documents are uploaded.');
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestedPrograms();
  }, []);

  if (loading) return <main className="p-6 text-center">Loading suggestions...</main>;
  if (error) return <main className="p-6 text-red-600 text-center">{error}</main>;

  return (
    <main className="p-6 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-[#16243E]">Program Allocation Assistant</h1>

      {step === 1 && (
        <>
          <p className="mb-4">
            Based on your documents, we’ve suggested some likely program areas. You can edit or add more.
          </p>
          <button onClick={() => setStep(2)} className="bg-[#019AA8] text-white px-4 py-2 rounded">
            Start
          </button>
        </>
      )}

      {step === 2 && (
        <>
        {programs.map((prog, i) => (
        <div key={i} className="mb-4 border p-4 rounded relative">
          <button
            onClick={() => {
              const newProgs = [...programs];
              newProgs.splice(i, 1);
              setPrograms(newProgs);
            }}
            className="absolute top-2 right-2 text-red-600"
            title="Delete this program"
          >
            ❌
          </button>
          <input
            type="text"
            placeholder="Program name"
            value={prog.name}
            onChange={(e) => {
              const newProgs = [...programs];
              newProgs[i].name = e.target.value;
              setPrograms(newProgs);
            }}
            className="border p-2 w-full mb-2"
          />
          <textarea
            placeholder="Description"
            value={prog.description}
            onChange={(e) => {
              const newProgs = [...programs];
              newProgs[i].description = e.target.value;
              setPrograms(newProgs);
            }}
            className="border p-2 w-full"
          />
        </div>
      ))}
          <button
            onClick={() => setPrograms([...programs, { name: '', description: '', percentage: '' }])}
            className="text-sm text-[#019AA8] underline mb-4 block"
          >
            ➕ Add another program
          </button>
          <button onClick={() => setStep(3)} className="bg-[#019AA8] text-white px-4 py-2 rounded">
            Next
          </button>
        </>
      )}

{step === 3 && (
  <>
<p className="mb-4">
  <strong>Now that we’ve identified your core program areas, you’ll estimate how much of your program budget goes to each one.</strong><br />
 </p><p className="mb-4"> This step allows TracePort to allocate future unrestricted donations more transparently — connecting every dollar to its mission-driven impact.
</p>

<p className="mb-4 italic text-sm text-gray-700">
  💡 <strong>Note:</strong> These allocations build on your functional expenses — salaries, overhead, and shared costs have already been accounted for.
  What you're doing now is showing how your program budget breaks down across the areas where real impact happens.
</p>

<p className="mb-4">
  <strong>These estimates don’t need to be exact.</strong><br />
  They serve as a thoughtful guide for how unrestricted donations will be distributed and reported — helping build trust with your board, donors, and the public.
</p>

    {programs.map((prog, i) => (
      <div key={i} className="mb-4">
        <label className="block font-semibold mb-1">{prog.name || `Program ${i + 1}`}</label>
        <input
          type="number"
          placeholder="% of program spending"
          value={prog.percentage}
          onChange={(e) => {
            const newProgs = [...programs];
            newProgs[i].percentage = e.target.value;
            setPrograms(newProgs);
          }}
          className="border p-2 w-full"
        />
      </div>
    ))}

    {/* 🧠 Validation */}
    {(() => {
      const totalPercent = programs.reduce((sum, p) => sum + Number(p.percentage || 0), 0);
      const isValidTotal = Math.abs(totalPercent - 100) <= 1;

      return (
        <>
          {!isValidTotal && (
            <p className="text-red-600 mb-2 text-sm">
              Please ensure your program percentages total approximately 100%. (Current total: {totalPercent}%)
            </p>
          )}
          <button onClick={() => {
            localStorage.setItem('programs', JSON.stringify(programs));
            window.location.href = '/review';
          }} className="bg-[#019AA8] text-white px-4 py-2 rounded">
            Finish
        </button>
        </>
      );
    })()}
  </>
)}

      {step === 4 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Review</h2>
          <ul className="mb-4">
            {programs.map((p, i) => (
              <li key={i}>
                <strong>{p.name}:</strong> {p.percentage}% – {p.description}
              </li>
            ))}
          </ul>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/program-allocation`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ programs })
                });
                const data = await res.json();
                alert(data.status || JSON.stringify(data));
              } catch (err) {
                alert('Submission failed.');
              }
            }}
            className="bg-[#019AA8] text-white px-4 py-2 rounded"
          >
            ✅ Confirm and Submit
          </button>
        </>
      )}
    </main>
  );
}
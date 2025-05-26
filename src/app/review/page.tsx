// src/app/review/page.tsx
'use client';

import { useEffect, useState } from 'react';
import UnifiedPieChart from '@/components/UnifiedPieChart';

export default function ReviewPage() {
  const [functional, setFunctional] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    const f = localStorage.getItem('functional');
    const p = localStorage.getItem('programs');
    if (f) setFunctional(JSON.parse(f));
    if (p) setPrograms(JSON.parse(p));
  }, []);

  // Prepare functional allocation data
  const functionalData = functional ? [
    { label: 'Program', value: functional.program_pct, color: '#019AA8' },
    { label: 'Admin', value: functional.admin_pct, color: '#C9E5E9' },
    { label: 'Fundraising', value: functional.fundraising_pct, color: '#16243E' }
  ] : [];

  // Prepare program breakdown data
  const programData = programs.map((p, index) => ({
    label: p.name,
    value: parseFloat(p.percentage),
    // Use consistent colors from our palette
    color: ['#A0D3D8', '#5DBABF', '#2D8A8F', '#019AA8', '#7BB3B8', '#4A9BA0'][index % 6]
  }));

  // Prepare combined allocation data
  const combinedData = functional && programs.length > 0 ? [
    // Program allocations (scaled by program percentage)
    ...programs.map((p, index) => ({
      label: p.name,
      value: (parseFloat(p.percentage) / 100) * functional.program_pct,
      color: ['#A0D3D8', '#5DBABF', '#2D8A8F', '#019AA8', '#7BB3B8', '#4A9BA0'][index % 6]
    })),
    // Admin and fundraising
    { label: 'Admin', value: functional.admin_pct, color: '#C9E5E9' },
    { label: 'Fundraising', value: functional.fundraising_pct, color: '#16243E' }
  ] : [];

  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📊 Review Your Allocations
      </h1>

      {/* Functional Allocation Section */}
      {functional && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Functional Allocation</h2>
          <div className="mb-4 text-sm">
            <p>Program: ${functional.program} ({functional.program_pct}%)</p>
            <p>Admin: ${functional.admin} ({functional.admin_pct}%)</p>
            <p>Fundraising: ${functional.fundraising} ({functional.fundraising_pct}%)</p>
          </div>
          
          <UnifiedPieChart 
            data={functionalData}
            size="large"
            showPercentagesInLegend={true}
          />
        </div>
      )}

      {/* Program Breakdown Section */}
      {programs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Program Breakdown</h2>
          <div className="mb-4 text-sm">
            {programs.map((p, i) => (
              <p key={i} className="mb-1">
                <strong>{p.name}:</strong> {p.percentage}% — {p.description}
              </p>
            ))}
          </div>
          
          <UnifiedPieChart 
            data={programData}
            size="large"
            showPercentagesInLegend={true}
          />
        </div>
      )}

      {/* Combined Allocation Section */}
      {functional && programs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Combined Allocation View</h2>
          <UnifiedPieChart 
            data={combinedData}
            size="large"
            showPercentagesInLegend={true}
          />
        </div>
      )}
      
      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            const functional = JSON.parse(localStorage.getItem('functional') || '{}');
            const programs = JSON.parse(localStorage.getItem('programs') || '[]');

            const summary = {
              functional_allocation: functional,
              program_allocation: programs,
              generated_at: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'traceport_allocation_summary.json';
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-[#019AA8] text-white px-4 py-2 rounded mt-6"
        >
          📥 Download Summary
        </button>
      </div>
    </main>
  );
}
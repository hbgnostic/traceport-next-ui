// src/app/review/page.tsx
'use client';

import { useUploadContext } from '@/context/UploadContext';
import UnifiedPieChart from '@/components/UnifiedPieChart';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useRef } from 'react';
import jsPDF from 'jspdf';

export default function ReviewPage() {
  const { totals: functional, programs } = useUploadContext();
  const pdfRef = useRef<HTMLDivElement>(null);

        // Prepare functional allocation data
      const functionalData = functional ? [
        { label: 'Program', value: functional.program_pct },
        { label: 'Admin', value: functional.admin_pct },
        { label: 'Fundraising', value: functional.fundraising_pct }
      ] : [];

      // Program Breakdown 
      const programData = programs.map((p) => ({
        label: p.name,
        value: parseFloat(p.percentage),
      }));

    // Combined view 
    const combinedData = functional && programs.length > 0 ? [
      ...programs.map((p) => ({
        label: p.name,
        value: (parseFloat(p.percentage) / 100) * functional.program_pct,
      })),
      { label: 'Admin', value: functional.admin_pct },
      { label: 'Fundraising', value: functional.fundraising_pct }
    ] : [];

    return (
      <main className="p-6 max-w-4xl mx-auto text-gray-800">
    
        {/* PDF Export Wrapper */}
        <div id="pdf-content">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔀 Review Your Allocations
          </h1>
    
          {/* Functional Allocation Section */}
          {functional && (
             <div className="mb-12 p-4 break-inside-avoid"> {/* ⬅️ Padding + break avoid */}
              <h2 className="text-xl font-semibold mb-2">🧾 Functional Allocation</h2>
              <div className="mb-4 text-sm">
                <p>Program: ${functional.program.toLocaleString()} ({functional.program_pct}%)</p>
                <p>Admin: ${functional.admin.toLocaleString()} ({functional.admin_pct}%)</p>
                <p>Fundraising: ${functional.fundraising.toLocaleString()} ({functional.fundraising_pct}%)</p>
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
            <div className="mb-12 p-4 break-inside-avoid page-break"> 
              <h2 className="text-xl font-semibold mb-2">🗂️ Program Breakdown</h2>
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
            <div className="mb-12 p-4 break-inside-avoid page-break"> 
              <h2 className="text-xl font-semibold mb-2">🧩 Combined Allocation View</h2>
              <UnifiedPieChart 
                data={combinedData}
                size="large"
                showPercentagesInLegend={true}
              />
            </div>
          )}
        </div>
    
        {/* Control Buttons (NOT included in PDF) */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={() => {
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
            className="bg-[#019AA8] text-white px-4 py-2 rounded"
          >
            📥 Download Summary
          </button>
    
          <button
            onClick={() => {
              const summary = {
                functional_allocation: functional,
                program_allocation: programs,
                generated_at: new Date().toISOString(),
              };
    
              navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
              alert('Copied JSON to clipboard!');
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            📋 Copy JSON
          </button>
    
          <button
            onClick={() => {
              const opt = {
                margin:       0.5,
                filename:     'traceport_allocation_summary.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
              };
    
              const content = document.getElementById('pdf-content');
              if (content) html2pdf().set(opt).from(content).save();
            }}
            className="bg-[#019AA8] text-white px-4 py-2 rounded"
          >
            📄 Download PDF
          </button>
        </div>
      </main>
    );
}
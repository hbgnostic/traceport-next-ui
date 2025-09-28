'use client';
import { useUploadContext } from '@/context/UploadContext';
import { useRouter } from 'next/navigation';

export default function Review() {
  const router = useRouter();
  const { programs, totals, mode, apiResponse } = useUploadContext();

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  const getGovernanceColor = (rating?: string) => {
    switch (rating) {
      case 'strong': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs_improvement': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getProgramRatioColor = (ratio?: number) => {
    if (!ratio) return 'text-gray-600';
    if (ratio >= 75) return 'text-green-600';
    if (ratio >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Generate the complete JSON structure for easy copying
  const generateCompleteJSON = () => {
    const dbFormat = generateDatabaseFormat();

    return {
      "1_functional_and_program_allocations": dbFormat.defaultAllocations,
      "2_transparency_metrics": dbFormat.transparencyMetrics,
      generated_at: new Date().toISOString()
    };
  };

  // Generate database-ready JSON format
  const generateDatabaseFormat = () => {
    const transparencyMetrics = (totals as any)?.transparency_metrics;

    // Combine user-edited program data with API meta_tags
    let programBreakdown;
    if (mode === 'xml' && apiResponse?.functionalAllocation?.programBreakdown) {
      // For XML mode: Use user edits for names/percentages, but preserve API meta_tags
      const apiPrograms = apiResponse.functionalAllocation.programBreakdown;
      programBreakdown = programs
        .filter(p => p.percentage && p.percentage !== "") // Only include programs with percentages
        .map((program, index) => {
          // Try to find corresponding API program to get meta_tags
          const matchingApiProgram = apiPrograms[index]; // Match by index for now
          return {
            programId: `prog_${Date.now()}_${index + 1}`, // Generate unique IDs
            programName: program.name, // Use user-edited name
            percentageOfProgram: parseInt(program.percentage) || 0, // Use user-edited percentage
            metaTags: matchingApiProgram?.metaTags || [] // Use API meta_tags if available
          };
        });
    } else {
      // For PDF mode or fallback: Use only user-edited data
      programBreakdown = programs
        .filter(p => p.percentage && p.percentage !== "") // Only include programs with percentages
        .map((program, index) => ({
          programId: `prog_${Date.now()}_${index + 1}`, // Generate unique IDs
          programName: program.name,
          percentageOfProgram: parseInt(program.percentage) || 0,
          metaTags: [] // No meta_tags for PDF mode
        }));
    }

    // Format defaultAllocations JSONB field
    const defaultAllocations = {
      fiscalYearStart: "2024-01-01", // You may want to make this dynamic
      functionalAllocation: {
        program: totals?.program_pct || 0,
        admin: totals?.admin_pct || 0,
        fundraising: totals?.fundraising_pct || 0
      },
      programBreakdown
    };

    // Format transparencyMetrics JSONB field (if available)
    let transparencyMetricsFormatted = null;
    if (transparencyMetrics) {
      transparencyMetricsFormatted = {
        source: transparencyMetrics.source,
        data_quality: transparencyMetrics.data_quality,
        last_updated: transparencyMetrics.last_updated,
        
        // Filing Information
        tax_year: transparencyMetrics.tax_year,
        filing_date: transparencyMetrics.filing_date,
        filing_status: transparencyMetrics.filing_status,
        
        // Financial Health
        financial_health: {
          total_revenue: transparencyMetrics.total_revenue,
          total_expenses: transparencyMetrics.total_expenses,
          net_assets: transparencyMetrics.net_assets,
          program_ratio: transparencyMetrics.program_ratio,
          admin_ratio: transparencyMetrics.admin_ratio,
          fundraising_ratio: transparencyMetrics.fundraising_ratio
        },
        
        // Governance
        governance: {
          board_size: transparencyMetrics.board_size,
          independent_members: transparencyMetrics.independent_members,
          governance_rating: transparencyMetrics.governance_rating,
          has_conflict_policy: transparencyMetrics.has_conflict_policy,
          has_whistleblower_policy: transparencyMetrics.has_whistleblower_policy,
          has_retention_policy: transparencyMetrics.has_retention_policy
        },
        
        // Transparency
        transparency: {
          website_url: transparencyMetrics.website_url,
          has_website: transparencyMetrics.has_website
        }
      };
    }

    return {
      defaultAllocations,
      transparencyMetrics: transparencyMetricsFormatted
    };
  };

  const handleCopyJSON = () => {
    const jsonData = JSON.stringify(generateCompleteJSON(), null, 2);
    navigator.clipboard.writeText(jsonData);
    alert('Complete JSON copied to clipboard!');
  };

  const handleCopyDatabaseFormat = () => {
    const dbFormat = generateDatabaseFormat();
    const jsonData = JSON.stringify(dbFormat, null, 2);
    navigator.clipboard.writeText(jsonData);
    alert('Database-formatted JSON copied to clipboard!');
  };

  const handleGenerateSQL = () => {
    const dbFormat = generateDatabaseFormat();
    
    // Helper function to properly escape JSON for SQL
    const escapeJsonForSQL = (obj: any) => {
      return JSON.stringify(obj).replace(/'/g, "''");
    };
    
    const sql = `-- =====================================================
-- TRACEPORT ORGANIZATION DATA UPDATE
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- Step 1: Find your organization ID (run this first to get the org ID)
SELECT id, name, "createdAt" 
FROM "Organization" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Step 2: Replace 'YOUR_ORG_ID_HERE' with actual ID and run the update
UPDATE "Organization" 
SET 
  "defaultAllocations" = '${escapeJsonForSQL(dbFormat.defaultAllocations)}',
  ${dbFormat.transparencyMetrics ? `"transparencyMetrics" = '${escapeJsonForSQL(dbFormat.transparencyMetrics)}',` : ''}
  "updatedAt" = NOW()
WHERE id = 'YOUR_ORG_ID_HERE';

-- Step 3: Verify the update worked
SELECT 
  name,
  "defaultAllocations"->>'fiscalYearStart' as fiscal_year,
  "defaultAllocations"->'functionalAllocation'->>'program' as program_pct,
  ${dbFormat.transparencyMetrics ? `"transparencyMetrics"->>'tax_year' as tax_year,` : ''}
  ${dbFormat.transparencyMetrics ? `"transparencyMetrics"->'financial_health'->>'program_ratio' as transparency_program_ratio,` : ''}
  "updatedAt"
FROM "Organization" 
WHERE id = 'YOUR_ORG_ID_HERE';

-- Optional: View the complete JSON data
-- SELECT 
--   name,
--   "defaultAllocations",
--   "transparencyMetrics"
-- FROM "Organization" 
-- WHERE id = 'YOUR_ORG_ID_HERE';`;
    
    navigator.clipboard.writeText(sql);
    alert('Complete SQL script copied to clipboard! Just replace YOUR_ORG_ID_HERE with the actual organization ID.');
  };

  const handleGenerateSeparateQueries = () => {
    const dbFormat = generateDatabaseFormat();
    
    const escapeJsonForSQL = (obj: any) => {
      return JSON.stringify(obj).replace(/'/g, "''");
    };
    
    const queries = `-- =====================================================
-- TRACEPORT ORGANIZATION DATA - SEPARATE QUERIES
-- Generated: ${new Date().toISOString()}
-- =====================================================

-- QUERY 1: Find Organization ID
SELECT id, name, "createdAt" 
FROM "Organization" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- QUERY 2: Update defaultAllocations
UPDATE "Organization" 
SET 
  "defaultAllocations" = '${escapeJsonForSQL(dbFormat.defaultAllocations)}',
  "updatedAt" = NOW()
WHERE id = 'YOUR_ORG_ID_HERE';

${dbFormat.transparencyMetrics ? `-- QUERY 3: Update transparencyMetrics
UPDATE "Organization" 
SET 
  "transparencyMetrics" = '${escapeJsonForSQL(dbFormat.transparencyMetrics)}',
  "updatedAt" = NOW()
WHERE id = 'YOUR_ORG_ID_HERE';

` : '-- No transparency metrics to update (PDF upload)\n\n'}-- QUERY 4: Verify Updates
SELECT 
  name,
  "defaultAllocations"->>'fiscalYearStart' as fiscal_year,
  "defaultAllocations"->'functionalAllocation'->>'program' as program_pct,
  ${dbFormat.transparencyMetrics ? `"transparencyMetrics"->>'tax_year' as tax_year,` : ''}
  "updatedAt"
FROM "Organization" 
WHERE id = 'YOUR_ORG_ID_HERE';`;
    
    navigator.clipboard.writeText(queries);
    alert('Separate SQL queries copied to clipboard! Run them one by one, replacing YOUR_ORG_ID_HERE with the actual organization ID.');
  };

  const handleSubmit = async () => {
    try {
      // Generate the database-ready JSON
      const dbFormat = generateDatabaseFormat();
      const jsonData = JSON.stringify(dbFormat, null, 2);
      
      // Create email content
      const subject = `New Organization Setup Complete - ${programs[0]?.name ? programs[0].name.split(' ')[0] + ' Organization' : 'Organization'}`;
      const body = `Hi Bridget,

A new organization has completed their allocation setup through the Traceport tool.

ORGANIZATION DETAILS:
${totals && (totals as any).transparency_metrics ? `
- Tax Year: ${(totals as any).transparency_metrics.tax_year}
- Revenue: ${(totals as any).transparency_metrics.total_revenue?.toLocaleString()}
- Program Efficiency: ${(totals as any).transparency_metrics.program_ratio}%
- Website: ${(totals as any).transparency_metrics.website_url}
- Governance: ${(totals as any).transparency_metrics.governance_rating}
` : 'No transparency metrics available (PDF upload)'}

PROGRAM BREAKDOWN:
${programs.map(p => `- ${p.name}: ${p.percentage}%`).join('\n')}

DATABASE-READY JSON:
Please copy this JSON for manual database entry:

${jsonData}

Best regards,
Traceport Allocation Tool`;

      // Open email client
      const mailtoLink = `mailto:bridget.doran@traceport.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      // Also copy to clipboard as backup
      navigator.clipboard.writeText(jsonData);
      
      alert('Email opened with organization data! JSON also copied to clipboard as backup.');
      router.push('/');
    } catch (err) {
      alert('Email failed to open. JSON copied to clipboard instead.');
      handleCopyDatabaseFormat();
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#16243E]">
        🎉 Allocation Setup Complete - Review & Confirm
      </h1>

      <div className="space-y-8">
        {/* Functional Allocation Summary */}
        {totals && (
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#16243E]">
              📊 Functional Allocation Summary
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{totals.program_pct}%</div>
                <div className="text-sm text-gray-600">Program Services</div>
                <div className="text-xs text-gray-500">${totals.program.toLocaleString()}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{totals.admin_pct}%</div>
                <div className="text-sm text-gray-600">Administration</div>
                <div className="text-xs text-gray-500">${totals.admin.toLocaleString()}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{totals.fundraising_pct}%</div>
                <div className="text-sm text-gray-600">Fundraising</div>
                <div className="text-xs text-gray-500">${totals.fundraising.toLocaleString()}</div>
              </div>
            </div>
          </section>
        )}

        {/* Program Allocation Breakdown */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#16243E]">
            🎯 Program Allocation Breakdown
          </h2>
          <div className="space-y-4">
            {programs.map((program, index) => (
              <div key={index} className="border-l-4 border-[#019AA8] pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <span className="text-xl font-bold text-[#019AA8]">{program.percentage}%</span>
                </div>
                <p className="text-gray-600 text-sm">{program.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Total Program Allocation:</strong> {programs.reduce((sum, p) => sum + Number(p.percentage || 0), 0)}%
              {programs.reduce((sum, p) => sum + Number(p.percentage || 0), 0) === 100 && (
                <span className="text-green-600 ml-2">✓ Perfect!</span>
              )}
            </p>
          </div>
        </section>

        {/* Transparency Metrics (if available) */}
        {(totals as any)?.transparency_metrics && mode === 'xml' && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#16243E]">
              🌟 Transparency Health Overview
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Additional organizational transparency metrics extracted from your 990 filing.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Financial Health */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-[#16243E] flex items-center text-sm">
                  💰 Financial Health
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Tax Year:</span>
                    <span className="font-medium">{(totals as any).transparency_metrics.tax_year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span className="font-medium">{formatCurrency((totals as any).transparency_metrics.total_revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Program Efficiency:</span>
                    <span className={`font-medium ${getProgramRatioColor((totals as any).transparency_metrics.program_ratio)}`}>
                      {(totals as any).transparency_metrics.program_ratio?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Assets:</span>
                    <span className="font-medium">{formatCurrency((totals as any).transparency_metrics.net_assets)}</span>
                  </div>
                </div>
              </div>

              {/* Governance */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-[#16243E] flex items-center text-sm">
                  🏛️ Governance
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Board Size:</span>
                    <span className="font-medium">{(totals as any).transparency_metrics.board_size || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Independent:</span>
                    <span className="font-medium">{(totals as any).transparency_metrics.independent_members || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span className={`font-medium capitalize ${getGovernanceColor((totals as any).transparency_metrics.governance_rating)}`}>
                      {(totals as any).transparency_metrics.governance_rating || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Policies:</p>
                    <div className="flex flex-wrap gap-1">
                      {(totals as any).transparency_metrics.has_conflict_policy && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">Conflict ✓</span>
                      )}
                      {(totals as any).transparency_metrics.has_whistleblower_policy && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">Whistleblower ✓</span>
                      )}
                      {(totals as any).transparency_metrics.has_retention_policy && (
                        <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">Retention ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transparency */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-[#16243E] flex items-center text-sm">
                  🌐 Transparency
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>990 Filed:</span>
                    <span className="font-medium">{formatDate((totals as any).transparency_metrics.filing_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize text-green-600">
                      {(totals as any).transparency_metrics.filing_status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Website:</span>
                    <span className="font-medium">
                      {(totals as any).transparency_metrics.has_website ? '✓' : '✗'}
                    </span>
                  </div>
                  {(totals as any).transparency_metrics.website_url && (
                    <div className="mt-2">
                      <a 
                        href={(totals as any).transparency_metrics.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#019AA8] hover:underline break-all"
                      >
                        Visit Website ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-400">
              <p className="text-xs text-blue-800">
                <strong>📋 Data Quality:</strong> {(totals as any).transparency_metrics.data_quality} 
                ({(totals as any).transparency_metrics.source.toUpperCase()} source)
                - All transparency metrics successfully extracted from your 990 filing.
              </p>
            </div>
          </section>
        )}

        {/* Developer Helper Section */}
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#16243E]">
            🔧 Database Integration
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Ready-to-use formats for manual database entry:
          </p>
          
          <div className="grid md:grid-cols-4 gap-3 mb-4">
            <button
              onClick={handleCopyJSON}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              📋 Copy Raw JSON
            </button>
            <button
              onClick={handleCopyDatabaseFormat}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              🗄️ Copy Database Format
            </button>
            <button
              onClick={handleGenerateSQL}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              📝 Complete SQL Script
            </button>
            <button
              onClick={handleGenerateSeparateQueries}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
            >
              📋 Separate Queries
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-xs text-gray-500 bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">defaultAllocations JSONB:</h4>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(generateDatabaseFormat().defaultAllocations, null, 2).substring(0, 200)}...
              </pre>
            </div>
            
            {generateDatabaseFormat().transparencyMetrics && (
              <div className="text-xs text-gray-500 bg-white p-3 rounded border">
                <h4 className="font-semibold mb-2">transparencyMetrics JSONB:</h4>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(generateDatabaseFormat().transparencyMetrics, null, 2).substring(0, 200)}...
                </pre>
              </div>
            )}
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-xs text-blue-700">
              <strong>💡 Usage:</strong> 
              <br/>• "Complete SQL Script" = One script with all queries and verification steps
              <br/>• "Separate Queries" = Individual queries you can run one by one
              <br/>• Both include org ID lookup and verification steps
              <br/>• Just replace 'YOUR_ORG_ID_HERE' with the actual organization ID
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            ← Back to Edit
          </button>
          
          <button
            onClick={handleSubmit}
            className="bg-[#019AA8] text-white px-6 py-2 rounded hover:bg-[#017a85]"
          >
            ✅ Confirm & Complete Setup
          </button>
        </div>
      </div>
    </main>
  );
}
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
  transparency_metrics?: TransparencyMetrics;
} & {
  [key: string]: any; // Allow additional properties
};

type TransparencyMetrics = {
  source: string;
  data_quality: string;
  tax_year?: number;
  filing_date?: string;
  filing_status?: string;
  total_revenue?: number;
  total_expenses?: number;
  net_assets?: number;
  program_ratio?: number;
  admin_ratio?: number;
  fundraising_ratio?: number;
  board_size?: number;
  independent_members?: number;
  governance_rating?: string;
  has_conflict_policy?: boolean;
  has_whistleblower_policy?: boolean;
  has_retention_policy?: boolean;
  website_url?: string;
  has_website?: boolean;
};

export default function FunctionalAllocation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { mode, xmlUrl, totals, setTotals, apiResponse, setApiResponse } = useUploadContext();

  useEffect(() => {
    async function fetchFunctionalData() {
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
          console.log('📊 Received data from API:', data);

          if (mode === 'xml') {
            // Handle new nested structure for XML
            setApiResponse(data);
            const functionalData = data.functionalAllocation?.functionalAllocation;
            if (functionalData) {
              // Convert to legacy format for backward compatibility
              const legacyTotals = {
                ...functionalData,
                transparency_metrics: data.transparencyMetrics ? {
                  source: data.transparencyMetrics.source,
                  data_quality: data.transparencyMetrics.data_quality,
                  last_updated: data.transparencyMetrics.last_updated,
                  tax_year: data.transparencyMetrics.tax_year,
                  filing_date: data.transparencyMetrics.filing_date,
                  filing_status: data.transparencyMetrics.filing_status,
                  total_revenue: data.transparencyMetrics.financial_health?.total_revenue,
                  total_expenses: data.transparencyMetrics.financial_health?.total_expenses,
                  net_assets: data.transparencyMetrics.financial_health?.net_assets,
                  program_ratio: data.transparencyMetrics.financial_health?.program_ratio,
                  admin_ratio: data.transparencyMetrics.financial_health?.admin_ratio,
                  fundraising_ratio: data.transparencyMetrics.financial_health?.fundraising_ratio,
                  board_size: data.transparencyMetrics.governance?.board_size,
                  independent_members: data.transparencyMetrics.governance?.independent_members,
                  governance_rating: data.transparencyMetrics.governance?.governance_rating,
                  has_conflict_policy: data.transparencyMetrics.governance?.has_conflict_policy,
                  has_whistleblower_policy: data.transparencyMetrics.governance?.has_whistleblower_policy,
                  has_retention_policy: data.transparencyMetrics.governance?.has_retention_policy,
                  website_url: data.transparencyMetrics.transparency?.website_url,
                  has_website: data.transparencyMetrics.transparency?.has_website
                } : undefined
              };
              setTotals(legacyTotals);
            }
          } else {
            // PDF mode - keep existing behavior
            setTotals(data);
          }
        } else {
          setError(data.error || `Server error: ${res.status}`);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    }
  
    fetchFunctionalData();
  }, [mode, xmlUrl, setTotals]);

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



  return (
    <main className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center text-[#16243E]">Functional Expense Allocation</h1>

      {loading && <p className="text-center">📤 Loading functional expense data...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}



      {totals && (
        <>
          {/* Functional Allocation Section */}
          <section className="mt-8 mb-8">
            <h2 className="text-xl font-semibold text-center">Your Functional Expense Allocation</h2>
            <p className="text-center mb-4">
              Based on your uploaded IRS Form 990, we've extracted how your organization allocates expenses between
              <strong> program services</strong>, <strong>administration</strong>, and <strong>fundraising</strong>.
            </p>
            <p className="text-center mb-6 text-gray-700">
              This step establishes your organization's overall spending profile — a required foundation for allocating
              <em> unrestricted</em> donations in Traceport. Your salaries and overhead are already accounted for here.
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
          </section>

          {/* Transparency Metrics Section */}
          {(totals as any)?.transparency_metrics && mode === 'xml' && (() => {
            const metrics = (totals as any).transparency_metrics;
            return (
              <section className="mt-8 mb-8 bg-gray-50 p-6 rounded-lg border">
                <h2 className="text-xl font-semibold text-center mb-4 text-[#16243E]">
                  🌟 Transparency Health Overview
                </h2>
                <p className="text-center mb-6 text-gray-600">
                  Additional insights extracted from your 990 filing that help demonstrate organizational transparency and health.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Financial Health */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-3 text-[#16243E] flex items-center">
                      💰 Financial Health
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tax Year:</span>
                        <span className="font-medium">{metrics.tax_year || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">{formatCurrency(metrics.total_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Program Efficiency:</span>
                        <span className={`font-medium ${getProgramRatioColor(metrics.program_ratio)}`}>
                          {metrics.program_ratio?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Assets:</span>
                        <span className="font-medium">{formatCurrency(metrics.net_assets)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Governance */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-3 text-[#16243E] flex items-center">
                      🏛️ Governance
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Board Size:</span>
                        <span className="font-medium">{metrics.board_size || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Independent Members:</span>
                        <span className="font-medium">{metrics.independent_members || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Governance Rating:</span>
                        <span className={`font-medium capitalize ${getGovernanceColor(metrics.governance_rating)}`}>
                          {metrics.governance_rating || 'N/A'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Policies in place:</p>
                        <div className="flex flex-wrap gap-1">
                          {metrics.has_conflict_policy && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Conflict ✓</span>
                          )}
                          {metrics.has_whistleblower_policy && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Whistleblower ✓</span>
                          )}
                          {metrics.has_retention_policy && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Retention ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transparency */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-3 text-[#16243E] flex items-center">
                      🌐 Transparency
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>990 Filed:</span>
                        <span className="font-medium">{formatDate(metrics.filing_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Filing Status:</span>
                        <span className="font-medium capitalize text-green-600">
                          {metrics.filing_status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Website:</span>
                        <span className="font-medium">
                          {metrics.has_website ? '✓' : '✗'}
                        </span>
                      </div>
                      {metrics.website_url && (
                        <div className="mt-2">
                          <a 
                            href={metrics.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#019AA8] hover:underline break-all"
                          >
                            {metrics.website_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data Quality Note */}
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">
                    <strong>📋 Data Quality:</strong> {metrics.data_quality} 
                    ({metrics.source.toUpperCase()} source)
                    {metrics.data_quality === 'complete' && 
                      ' - All transparency metrics successfully extracted from your 990 filing.'
                    }
                  </p>
                </div>
              </section>
            );
          })()}

          {/* PDF Notice */}
          {mode === 'pdf' && (
            <section className="mt-8 mb-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">📄 PDF Upload Notice</h3>
              <p className="text-sm text-yellow-700">
                Transparency metrics are only available for electronic 990 filings (XML). 
                For the most comprehensive analysis, consider using the XML option if your organization's 990 is available electronically.
              </p>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
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
        </>
      )}
    </main>
  );
}
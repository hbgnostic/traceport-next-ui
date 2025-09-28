'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

type UploadMode = 'pdf' | 'xml';
type FunctionalAllocation = {
  program: number;
  admin: number;
  fundraising: number;
  program_pct: number;
  admin_pct: number;
  fundraising_pct: number;
};

type ProgramBreakdown = {
  programId: string;
  programName: string;
  percentageOfProgram: number;
  metaTags: string[];
};

type TransparencyMetrics = {
  source: string;
  data_quality: string;
  last_updated?: string;
  tax_year?: number;
  filing_date?: string;
  filing_status?: string;
  financial_health: {
    total_revenue?: number;
    total_expenses?: number;
    net_assets?: number;
    program_ratio?: number;
    admin_ratio?: number;
    fundraising_ratio?: number;
  };
  governance: {
    board_size?: number;
    independent_members?: number;
    governance_rating?: string;
    has_conflict_policy?: boolean;
    has_whistleblower_policy?: boolean;
    has_retention_policy?: boolean;
  };
  transparency: {
    website_url?: string;
    has_website?: boolean;
  };
};

type APIResponse = {
  functionalAllocation: {
    functionalAllocation: FunctionalAllocation;
    programBreakdown: ProgramBreakdown[];
  };
  transparencyMetrics?: TransparencyMetrics;
};

type Totals = FunctionalAllocation & { transparency_metrics?: any };
type Program = { name: string; description: string; percentage: string; };

interface UploadContextType {
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
  xmlUrl: string;
  setXmlUrl: (url: string) => void;
  totals: Totals | null;
  setTotals: (t: Totals | null) => void;
  apiResponse: APIResponse | null;
  setApiResponse: (r: APIResponse | null) => void;
  programs: Program[];
  setPrograms: (p: Program[]) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<UploadMode>('pdf');
  const [xmlUrl, setXmlUrl] = useState('');
  const [totals, setTotals] = useState<Totals | null>(null);
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const param = searchParams.get('mode');
    if (param === 'xml' || param === 'pdf') {
      setMode(param);
    }
  }, [searchParams]);

  return (
    <UploadContext.Provider value={{ mode, setMode, xmlUrl, setXmlUrl, totals, setTotals, programs, setPrograms, apiResponse, setApiResponse }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUploadContext must be used within UploadProvider');
  return context;
}
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

type UploadMode = 'pdf' | 'xml';
type Totals = { program: number; admin: number; fundraising: number; program_pct: number; admin_pct: number; fundraising_pct: number; };
type Program = { name: string; description: string; percentage: string; };

interface UploadContextType {
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
  xmlUrl: string;
  setXmlUrl: (url: string) => void;
  totals: Totals | null;
  setTotals: (t: Totals | null) => void;
  programs: Program[];
  setPrograms: (p: Program[]) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<UploadMode>('pdf');
  const [xmlUrl, setXmlUrl] = useState('');
  const [totals, setTotals] = useState<Totals | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const param = searchParams.get('mode');
    if (param === 'xml' || param === 'pdf') {
      setMode(param);
    }
  }, [searchParams]);

  return (
    <UploadContext.Provider value={{ mode, setMode, xmlUrl, setXmlUrl, totals, setTotals, programs, setPrograms }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (!context) throw new Error('useUploadContext must be used within UploadProvider');
  return context;
}
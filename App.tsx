
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { DeviationRecord, ComputedDeviationRecord } from './types';
import { SCRIPT_URL } from './constants';
import { DeviationTable } from './components/DeviationTable';
import { LossChart } from './components/LossChart';
import { StatsCard } from './components/StatsCard';

const App: React.FC = () => {
  const [records, setRecords] = useState<DeviationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showGraph, setShowGraph] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getFuzzy = (obj: any, target: string, type: 'string' | 'number' = 'string'): any => {
    if (!obj || typeof obj !== 'object') return type === 'number' ? 0 : '';
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    const keys = Object.keys(obj);
    
    const exactKey = keys.find(key => key.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget);
    if (exactKey) return obj[exactKey];

    const foundKey = keys.find(key => {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanKey.startsWith(cleanTarget) || cleanTarget.startsWith(cleanKey);
    });
    
    const val = foundKey ? obj[foundKey] : undefined;
    if (type === 'number') {
      if (typeof val === 'number') return val;
      const strVal = String(val || '0').replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(strVal);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val !== undefined && val !== null ? String(val).trim() : '';
  };

  /**
   * Formats dates to MM/DD/YYYY
   */
  const formatDateForDisplay = (dateVal: string | number): string => {
    if (!dateVal) return '';
    const dStr = String(dateVal);
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dStr)) {
        const [m, d, y] = dStr.split('/');
        return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    }
    
    try {
      const d = new Date(dateVal);
      const num = parseFloat(dStr);
      if (!isNaN(num) && num > 40000) {
        const dateObj = new Date((num - 25569) * 86400 * 1000);
        return `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
      }
      if (isNaN(d.getTime())) return dStr;
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return dStr;
    }
  };

  const fetchData = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`Network Error: ${response.status}`);
      const data = await response.json();
      if (data && data.error) throw new Error(data.error);
      
      const normalizedData: DeviationRecord[] = (Array.isArray(data) ? data : []).filter(Boolean).map((r: any, idx: number) => {
        return {
          id: String(r.id || `row-${idx}`),
          date: formatDateForDisplay(getFuzzy(r, 'date')),
          jobNo: String(getFuzzy(r, 'jobno') || getFuzzy(r, 'job') || ''),
          companyName: getFuzzy(r, 'companyname') || getFuzzy(r, 'company'),
          itemName: getFuzzy(r, 'itemname') || getFuzzy(r, 'item'),
          erpCode: getFuzzy(r, 'erpcode') || getFuzzy(r, 'erpco'),
          planQty: getFuzzy(r, 'planqty', 'number'),
          ffgPrinting: getFuzzy(r, 'ffgprinting', 'number'),
          sheetWeight: getFuzzy(r, 'sheetweight', 'number'),
          rate: getFuzzy(r, 'rate', 'number'),
          remarks: getFuzzy(r, 'remarks'),
          sheetLeastSheetWeight: getFuzzy(r, 'leastsheetweight', 'number'),
          sheetLeastSheetWeightDate: formatDateForDisplay(getFuzzy(r, 'leastsheetweightdate')),
          sheetDifference: getFuzzy(r, 'difference', 'number'),
          sheetLeastJobNo: String(getFuzzy(r, 'leastjobno') || getFuzzy(r, 'leastjobn') || ''),
          sheetWeightLoss: getFuzzy(r, 'weightloss', 'number'),
          sheetAmount: getFuzzy(r, 'amount', 'number')
        };
      });
      setRecords(normalizedData);
    } catch (err: any) {
      setError(`Data Sync Failed: ${err.message}`);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const computedRecords = useMemo((): ComputedDeviationRecord[] => {
    const minWeightsByErp: Record<string, DeviationRecord> = {};
    records.forEach(r => {
      if (!r.erpCode) return;
      if (!minWeightsByErp[r.erpCode] || r.sheetWeight < minWeightsByErp[r.erpCode].sheetWeight) {
        minWeightsByErp[r.erpCode] = r;
      }
    });

    return records.map(current => {
      const hasSheetDate = !!current.sheetLeastSheetWeightDate && current.sheetLeastSheetWeightDate.includes('/');
      
      const leastSheetWeight = (current.sheetLeastSheetWeight !== undefined && current.sheetLeastSheetWeight > 0) 
        ? current.sheetLeastSheetWeight! 
        : (minWeightsByErp[current.erpCode]?.sheetWeight || current.sheetWeight);
      
      const leastSheetWeightDate = hasSheetDate 
        ? current.sheetLeastSheetWeightDate! 
        : (minWeightsByErp[current.erpCode]?.date || current.date);
      
      const leastJobNo = (current.sheetLeastJobNo && current.sheetLeastJobNo !== '0' && current.sheetLeastJobNo !== '') 
        ? current.sheetLeastJobNo! 
        : (minWeightsByErp[current.erpCode]?.jobNo || current.jobNo);
      
      const difference = Math.max(0, current.sheetWeight - leastSheetWeight);
      const weightLoss = difference * current.planQty;
      const amount = weightLoss * current.rate;

      return {
        ...current,
        leastSheetWeight,
        leastSheetWeightDate,
        leastJobNo,
        difference,
        weightLoss,
        amount
      };
    }).sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    // Convert HTML5 date input (YYYY-MM-DD) to compare-ready timestamps
    const fromTime = fromDate ? new Date(fromDate).setHours(0,0,0,0) : -Infinity;
    const toTime = toDate ? new Date(toDate).setHours(23,59,59,999) : Infinity;

    return computedRecords.filter(r => {
      // 1. Text Search across key fields
      const matchesSearch = !term || [r.jobNo, r.itemName, r.erpCode, r.date, r.companyName].some(field => String(field || '').toLowerCase().includes(term));
      
      // 2. Company Filter
      const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(r.companyName);
      
      // 3. Date Filter strictly on 'Date' column (MM/DD/YYYY)
      const parseMMDDYYYY = (dStr: string) => {
        const p = dStr.split('/');
        if (p.length === 3) {
            return new Date(parseInt(p[2]), parseInt(p[0]) - 1, parseInt(p[1])).getTime();
        }
        return new Date(dStr).getTime();
      };
      
      const recordTime = parseMMDDYYYY(r.date);
      const matchesDate = (isNaN(recordTime) || (recordTime >= fromTime && recordTime <= toTime));

      return matchesSearch && matchesCompany && matchesDate;
    });
  }, [computedRecords, searchTerm, selectedCompanies, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalWeight = filteredRecords.reduce((sum, r) => sum + r.weightLoss, 0);
    return { count: filteredRecords.length, weightLoss: totalWeight, amountLoss: totalAmount };
  }, [filteredRecords]);

  const handleDownloadExcel = () => {
    if (filteredRecords.length === 0) return;
    
    const fmt = (num: number) => {
      if (Number.isInteger(num)) return num.toString();
      return num.toFixed(3);
    };

    const headers = ['Date', 'Job No', 'Company Name', 'Item Name', 'ERP Code', 'Plan QTY', 'FFG PRINTING', 'Sheet Weight', 'Least Sheet Weight', 'Difference', 'Least Sheet Weight Date', 'Least Job No', 'Weight Loss', 'Rate', 'Amount', 'Remarks'];
    const csvRows = filteredRecords.map(r => [
      r.date, r.jobNo, `"${r.companyName.replace(/"/g, '""')}"`, `"${r.itemName.replace(/"/g, '""')}"`, 
      r.erpCode, fmt(r.planQty), fmt(r.ffgPrinting), fmt(r.sheetWeight), fmt(r.leastSheetWeight),
      fmt(r.difference), r.leastSheetWeightDate, r.leastJobNo, fmt(r.weightLoss), fmt(r.rate), fmt(r.amount), `"${(r.remarks || '').replace(/"/g, '""')}"`
    ].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Final_Deviation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allCompaniesSorted = useMemo(() => Array.from(new Set(records.map(r => r.companyName).filter(Boolean))).sort(), [records]);
  const filteredCompanyList = useMemo(() => allCompaniesSorted.filter(c => c.toLowerCase().includes(companySearchTerm.toLowerCase())), [allCompaniesSorted, companySearchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-black">
      {/* 1. Header & Title */}
      <header className="max-w-[1440px] mx-auto w-full px-8 pt-10">
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-[32px] font-[1000] text-black uppercase tracking-tighter leading-none text-center">
            Least Cost Deviation Tracker
          </h1>
        </div>

        {/* 2. Filters (Excel-Style Layout) */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-end gap-5 justify-center">
            
            {/* Company Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Company Filter</label>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)} className="min-w-[200px] px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-[900] uppercase text-black flex items-center justify-between gap-4 hover:border-black transition-all">
                  {selectedCompanies.length === 0 ? 'All Companies' : `${selectedCompanies.length} Selected`}
                  <span className="text-[10px]">{isCompanyDropdownOpen ? '▲' : '▼'}</span>
                </button>
                {isCompanyDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-80 bg-white border-2 border-black shadow-2xl rounded-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <div className="flex gap-2 mb-3">
                        <button onClick={() => setSelectedCompanies(allCompaniesSorted)} className="flex-1 px-3 py-2 bg-black text-white text-[10px] font-black uppercase rounded-lg">All</button>
                        <button onClick={() => setSelectedCompanies([])} className="flex-1 px-3 py-2 bg-white border border-black text-black text-[10px] font-black uppercase rounded-lg">Clear</button>
                      </div>
                      <input type="text" placeholder="Search Company..." className="w-full px-3 py-2 text-[11px] border border-slate-300 rounded-lg outline-none font-bold uppercase focus:border-black transition-colors" value={companySearchTerm} onChange={e => setCompanySearchTerm(e.target.value)} />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredCompanyList.map(c => (
                        <label key={c} className="flex items-center gap-3 py-2 px-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors">
                          <input type="checkbox" checked={selectedCompanies.includes(c)} onChange={() => setSelectedCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} className="w-4 h-4 accent-black rounded" />
                          <span className="text-[11px] font-[800] text-black uppercase truncate">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">From Date (Date Col)</label>
              <input type="date" className="px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-bold outline-none uppercase hover:border-black focus:border-black transition-all" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">To Date (Date Col)</label>
              <input type="date" className="px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-bold outline-none uppercase hover:border-black focus:border-black transition-all" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>

            {/* Global Search */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Global Filter</label>
              <input type="text" placeholder="Search anything..." className="min-w-[220px] px-5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[11px] font-bold outline-none uppercase hover:border-black focus:border-black transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button onClick={() => { setSearchTerm(''); setSelectedCompanies([]); setFromDate(''); setToDate(''); }} className="px-6 py-3 bg-white border border-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Reset</button>
              <button onClick={() => setShowGraph(!showGraph)} className={`px-6 py-3 border border-black rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${showGraph ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'}`}>
                {showGraph ? 'Hide Chart' : 'Show Chart'}
              </button>
              <button onClick={handleDownloadExcel} title="Download Report" className="p-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all active:scale-90 border border-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* 3. Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <StatsCard title="Selected Jobs" value={stats.count} />
          <StatsCard title="Total Weight Var (KG)" value={stats.weightLoss} />
          <StatsCard title="Total Cost Var (₹)" value={stats.amountLoss} />
        </div>
      </header>

      {/* 4. Main Content (Chart and Table) */}
      <main className="max-w-[1440px] mx-auto px-8 pb-32 flex-grow w-full">
        {error && <div className="mb-8 p-6 border-2 border-red-500 bg-red-50 text-red-700 rounded-xl text-[14px] font-black uppercase text-center tracking-widest shadow-lg">{error}</div>}
        
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-48 opacity-90">
            <div className="w-16 h-16 border-[8px] border-slate-100 border-t-black rounded-full animate-spin mb-10"></div>
            <p className="text-black font-[900] text-xl uppercase tracking-[0.4em]">Compiling Analytics Engine...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {showGraph && <LossChart records={filteredRecords} />}
            <DeviationTable records={filteredRecords} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 text-center mt-auto">
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.8em]">CORE Performance Audit System &bull; Enterprise 2026</div>
      </footer>
    </div>
  );
};

export default App;

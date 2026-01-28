
import React, { useState } from 'react';
import { ComputedDeviationRecord, SortField, SortOrder } from '../types';

interface DeviationTableProps {
  records: ComputedDeviationRecord[];
}

export const DeviationTable: React.FC<DeviationTableProps> = ({ records }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    }
    return 0;
  });

  const headers: { label: string; field: SortField; width: string }[] = [
    { label: 'Date', field: 'date', width: '85px' },
    { label: 'Job No', field: 'jobNo', width: '65px' },
    { label: 'Company Name', field: 'companyName', width: '160px' },
    { label: 'Item Name', field: 'itemName', width: '240px' },
    { label: 'ERP Code', field: 'erpCode', width: '110px' },
    { label: 'Plan QTY', field: 'planQty', width: '100px' },
    { label: 'FFG PRINTING', field: 'ffgPrinting', width: '110px' },
    { label: 'Sheet Weight', field: 'sheetWeight', width: '100px' },
    { label: 'Least Sheet Weight', field: 'leastSheetWeight', width: '110px' },
    { label: 'Difference', field: 'difference', width: '100px' },
    { label: 'Least Sheet Weight Date', field: 'leastSheetWeightDate', width: '110px' },
    { label: 'Least Job No', field: 'leastJobNo', width: '100px' },
    { label: 'Weight Loss', field: 'weightLoss', width: '110px' },
    { label: 'Rate', field: 'rate', width: '90px' },
    { label: 'Amount', field: 'amount', width: '120px' },
    { label: 'Remarks', field: 'remarks', width: '250px' },
  ];

  // Recalculated sticky offsets based on reduced widths:
  // Date: 0
  // Job No: 85
  // Company Name: 85 + 65 = 150
  // Item Name: 150 + 160 = 310
  const stickyOffsets = [0, 85, 150, 310];

  const formatValue = (val: any, field: string) => {
    if (val === null || val === undefined || val === '') return '';

    const numericFields = [
      'planQty', 
      'ffgPrinting', 
      'sheetWeight', 
      'leastSheetWeight', 
      'difference', 
      'weightLoss', 
      'rate', 
      'amount'
    ];

    if (numericFields.includes(field)) {
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      if (isNaN(num)) return val;
      if (Number.isInteger(num)) return num.toString();
      return num.toFixed(3);
    }

    return val;
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <table className="min-w-full border-separate border-spacing-0 font-sans text-black">
          <thead>
            <tr className="bg-slate-50">
              {headers.map((h, idx) => {
                const isSticky = idx < 4;
                return (
                  <th
                    key={h.field}
                    onClick={() => handleSort(h.field)}
                    style={{
                      width: h.width,
                      minWidth: h.width,
                      position: isSticky ? 'sticky' : 'relative',
                      left: isSticky ? stickyOffsets[idx] : undefined,
                      zIndex: isSticky ? 50 : 10,
                    }}
                    className={`
                      px-4 py-5 text-center text-[10px] font-black text-slate-600 uppercase tracking-wider cursor-pointer select-none transition-colors border-b-2 border-slate-200
                      ${isSticky ? 'bg-slate-50' : 'bg-slate-50'}
                      ${idx === 3 ? 'border-r-2 border-r-slate-400' : 'border-r border-r-slate-200'}
                      hover:bg-slate-100
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {h.label}
                      {sortField === h.field && (
                        <span className="text-black">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedRecords.map((record) => {
              const hasDev = record.difference > 0;
              return (
                <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                  {headers.map((h, idx) => {
                    const val = record[h.field as keyof ComputedDeviationRecord];
                    const isNumericField = [
                      'planQty', 'ffgPrinting', 'sheetWeight', 'leastSheetWeight', 
                      'difference', 'weightLoss', 'rate', 'amount'
                    ].includes(h.field);
                    const isSticky = idx < 4;
                    
                    return (
                      <td 
                        key={h.field} 
                        style={{
                          width: h.width,
                          minWidth: h.width,
                          position: isSticky ? 'sticky' : 'relative',
                          left: isSticky ? stickyOffsets[idx] : undefined,
                          zIndex: isSticky ? 20 : 5,
                        }}
                        className={`
                          px-2 py-4 text-[11px] border-b border-slate-100 text-center align-middle
                          ${isSticky ? 'bg-white group-hover:bg-slate-50' : 'bg-white group-hover:bg-slate-50'}
                          ${isSticky && hasDev ? 'bg-orange-50 group-hover:bg-orange-100' : ''}
                          ${!isSticky && hasDev ? 'bg-orange-50/20' : ''}
                          ${idx === 3 ? 'border-r-2 border-r-slate-400 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)]' : 'border-r border-r-slate-100'}
                        `}
                      >
                        <div className={`
                          ${idx === 2 || idx === 3 || idx === 15 ? "whitespace-normal break-words" : "whitespace-nowrap"} 
                          ${h.field === 'sheetWeight' || isNumericField ? 'font-black' : 'font-semibold'} 
                          text-center
                          ${(h.field === 'difference' || h.field === 'amount' || h.field === 'weightLoss') && hasDev ? 'text-red-600' : 'text-slate-800'}
                        `}>
                          {formatValue(val, h.field)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedRecords.length === 0 && (
        <div className="py-32 text-center bg-slate-50/50">
           <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">No matching records found</p>
        </div>
      )}
    </div>
  );
};

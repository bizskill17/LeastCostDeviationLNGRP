
import React, { useState } from 'react';
import { DeviationRecord } from '../types';

interface RecordFormProps {
  onAdd: (record: Omit<DeviationRecord, 'id'>) => void;
  onClose: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    jobNo: '',
    companyName: '',
    itemName: '',
    erpCode: '',
    planQty: '',
    ffgPrinting: '',
    sheetWeight: '',
    rate: '',
    remarks: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      date: formData.date,
      jobNo: formData.jobNo,
      companyName: formData.companyName,
      itemName: formData.itemName,
      erpCode: formData.erpCode,
      planQty: Number(formData.planQty),
      ffgPrinting: Number(formData.ffgPrinting),
      sheetWeight: Number(formData.sheetWeight),
      rate: Number(formData.rate),
      remarks: formData.remarks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Add New Production Record</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job No</label>
            <input type="text" required placeholder="e.g. 4428" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.jobNo} onChange={e => setFormData({...formData, jobNo: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
            <input type="text" required placeholder="Full registered company name" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input type="text" required placeholder="Complete item description" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ERP Code</label>
            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.erpCode} onChange={e => setFormData({...formData, erpCode: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plan QTY</label>
            <input type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.planQty} onChange={e => setFormData({...formData, planQty: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">FFG Printing</label>
            <input type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.ffgPrinting} onChange={e => setFormData({...formData, ffgPrinting: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sheet Weight (kg)</label>
            <input type="number" step="0.001" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.sheetWeight} onChange={e => setFormData({...formData, sheetWeight: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹/kg)</label>
            <input type="number" step="0.1" required className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">Add Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

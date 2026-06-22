import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface DataPoint {
  target: number;
  realisasi: number;
}

// Sub-component 1: Reusable FilterSelect
interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none min-w-[100px]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// Sub-component 2: Reusable ChartCard
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
    <div className="p-4 border-b border-slate-100 bg-white">
      <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-4 flex flex-col justify-center items-center">
      {children}
    </div>
  </div>
);

// Sub-component 3: Reusable ConfirmationModal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50"
          >
            Tidak
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded bg-primary-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary-800 shadow-sm"
          >
            Ya, Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

// Initial mock data map for years 2022-2024
const initialDataMap: Record<string, DataPoint> = {
  // 2024
  '2024-TW I': { target: 100, realisasi: 90 },
  '2024-TW II': { target: 100, realisasi: 95 },
  '2024-TW III': { target: 100, realisasi: 100 },
  '2024-TW IV': { target: 100, realisasi: 92 },
  // 2023
  '2023-TW I': { target: 100, realisasi: 85 },
  '2023-TW II': { target: 100, realisasi: 88 },
  '2023-TW III': { target: 100, realisasi: 90 },
  '2023-TW IV': { target: 100, realisasi: 95 },
  // 2022
  '2022-TW I': { target: 100, realisasi: 80 },
  '2022-TW II': { target: 100, realisasi: 85 },
  '2022-TW III': { target: 100, realisasi: 88 },
  '2022-TW IV': { target: 100, realisasi: 90 },
};

// Triwulan mapping rules
const twMap: Record<string, string> = {
  'TW I': 'Maret',
  'TW II': 'Juni',
  'TW III': 'Oktober',
  'TW IV': 'Desember',
};

const triwulans = ['TW I', 'TW II', 'TW III', 'TW IV'];
const years = Array.from({ length: 9 }, (_, i) => (2022 + i).toString());
const allYearsRange = ['2020', '2021', ...years];

export const RealisasiProgramKerjaPage: React.FC = () => {
  const [triwulan, setTriwulan] = useState<string>('TW III');
  const [tahun, setTahun] = useState<string>('2024');
  const [dataMap, setDataMap] = useState<Record<string, DataPoint>>(initialDataMap);

  // Year to Date filters range
  const [startYear, setStartYear] = useState<string>('2020');
  const [endYear, setEndYear] = useState<string>('2024');

  // Form input state
  const [targetInput, setTargetInput] = useState<string>('');
  const [realisasiInput, setRealisasiInput] = useState<string>('');

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Key for referencing the data
  const dataKey = `${tahun}-${triwulan}`;
  const activeData = dataMap[dataKey];

  // Sync inputs with active data
  useEffect(() => {
    if (activeData) {
      setTargetInput(activeData.target.toString());
      setRealisasiInput(activeData.realisasi.toString());
    } else {
      setTargetInput('');
      setRealisasiInput('');
    }
  }, [tahun, triwulan, activeData]);

  // Handle custom save modal trigger
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetInput === '' || realisasiInput === '') {
      alert('Mohon isi semua field input target dan realisasi.');
      return;
    }
    setIsModalOpen(true);
  };

  // Perform save operation
  const handleConfirmSave = async () => {
    setIsModalOpen(false);

    const updatedData = {
      target: parseFloat(targetInput),
      realisasi: parseFloat(realisasiInput),
    };

    // Update state locally
    setDataMap((prev) => ({
      ...prev,
      [dataKey]: updatedData,
    }));

    // Toast UI notification
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    // Backend integration skeleton
    try {
      console.log('Sending data payload to backend API...', {
        tahun,
        triwulan,
        ...updatedData
      });
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  };

  // YTD cumulative average calculation: averages triwulans up to selected Triwulan, or all 4 if past
  const getYearCumulativeAvg = (yr: string) => {
    if (yr === '2020') return 10;
    if (yr === '2021') return 30;

    let sum = 0;
    let count = 0;
    triwulans.forEach(tw => {
      const key = `${yr}-${tw}`;
      const item = dataMap[key];
      if (item) {
        sum += item.realisasi;
        count++;
      }
    });
    return count > 0 ? sum / count : 0;
  };

  // Dynamic headers
  const bulanText = twMap[triwulan] || '';
  const tableHeaderTitle = `${triwulan} s.d ${bulanText} ${tahun}`;
  const targetColTitle = `Target s.d ${triwulan} (%)`;
  const realisasiColTitle = `Realisasi s.d ${bulanText} ${tahun} (%)`;

  // Rekapitulasi Realisasi: uses the current inputs dynamically or activeData as fallback
  const currentTargetVal = targetInput !== '' ? parseFloat(targetInput) : (activeData?.target || 0);
  const currentRealisasiVal = realisasiInput !== '' ? parseFloat(realisasiInput) : (activeData?.realisasi || 0);

  // Generate dynamic years range for YTD Chart
  const start = parseInt(startYear);
  const end = parseInt(endYear);
  const activeYearsRange: string[] = [];
  if (start <= end) {
    for (let y = start; y <= end; y++) {
      activeYearsRange.push(y.toString());
    }
  } else {
    activeYearsRange.push(startYear);
  }

  // Y-coordinate helper for Line Chart (from 0% to 100%)
  const getY = (val: number) => {
    // scale 0% -> 180, 100% -> 40
    return 180 - (val / 100) * 140;
  };

  // X-coordinate helper for Line Chart
  const getX = (index: number, total: number) => {
    if (total <= 1) return 500;
    return (index / (total - 1)) * 1000;
  };

  // SVG Line path generator
  const linePath = activeYearsRange
    .map((yr, idx) => {
      const val = getYearCumulativeAvg(yr);
      const x = getX(idx, activeYearsRange.length);
      const y = getY(val);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="w-full flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0f2e60] text-white px-4 py-2.5 rounded-lg shadow-lg animate-bounce transition-all duration-300">
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs font-semibold">Data disimpan!</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Realisasi Program Kerja TI</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect 
            label="Triwulan"
            value={triwulan}
            onChange={setTriwulan}
            options={triwulans}
          />
          <FilterSelect 
            label="Tahun"
            value={tahun}
            onChange={setTahun}
            options={years}
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left side: Controlled Form / Table Container (8 cols) */}
        <form onSubmit={handleSaveClick} className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 bg-slate-50/50">
                  <th className="p-3 w-12 text-center border-r border-slate-200" rowSpan={2}>No</th>
                  <th className="p-3 text-center text-primary-900 border-r border-slate-200" colSpan={2}>
                    {tableHeaderTitle}
                  </th>
                  <th className="p-3 text-center w-20" rowSpan={2}>Aksi</th>
                </tr>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 bg-slate-50/50">
                  <th className="p-3 text-right w-1/2 border-r border-slate-200">{targetColTitle}</th>
                  <th className="p-3 text-right w-1/2 border-r border-slate-200">{realisasiColTitle}</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-3 text-center font-medium text-slate-400 border-r border-slate-200">1</td>
                  
                  {/* Target Column */}
                  <td className="p-2 border-r border-slate-200">
                    <input 
                      type="number"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="w-full px-2.5 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                    />
                  </td>

                  {/* Realisasi Column */}
                  <td className="p-2 border-r border-slate-200">
                    <input 
                      type="number"
                      value={realisasiInput}
                      onChange={(e) => setRealisasiInput(e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="w-full px-2.5 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                    />
                  </td>

                  {/* Action Column */}
                  <td className="p-3 text-center">
                    <button 
                      type="button" 
                      onClick={() => { setTargetInput(''); setRealisasiInput(''); }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Clear Inputs"
                    >
                      <X className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Form Actions footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end gap-2.5">
            <button 
              type="button"
              onClick={() => {
                if (activeData) {
                  setTargetInput(activeData.target.toString());
                  setRealisasiInput(activeData.realisasi.toString());
                } else {
                  setTargetInput('');
                  setRealisasiInput('');
                }
              }}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold text-[10px] hover:bg-slate-100 transition-colors uppercase tracking-wider"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex items-center gap-1.5 bg-primary-900 text-white px-4 py-1.5 rounded font-semibold text-[10px] hover:bg-primary-800 transition-all shadow-sm uppercase tracking-wider"
            >
              <Save className="w-3.5 h-3.5" />
              Konfirmasi & Simpan
            </button>
          </div>
        </form>

        {/* Right side: Charts & YTD (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          
          {/* Card 1: Rekapitulasi Realisasi Chart */}
          <ChartCard 
            title="Rekapitulasi Realisasi"
            subtitle={`${triwulan} s.d ${bulanText} ${tahun}`}
          >
            <div className="w-full border border-slate-100 rounded p-4 relative bg-slate-50/50 flex gap-3 h-[300px] min-h-[300px]">
              {/* Left Y Axis Ticks */}
              <div className="flex flex-col justify-between text-[8px] text-slate-400 font-mono h-full pt-1 select-none pr-1">
                <span>100%</span>
                <span>80%</span>
                <span>60%</span>
                <span>40%</span>
                <span>20%</span>
                <span>0%</span>
              </div>

              {/* Main chart canvas with bars */}
              <div className="flex-1 h-full relative flex items-end justify-center gap-6">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                  <div className="w-full h-[1px] bg-slate-200/50"></div>
                  <div className="w-full h-[1px] bg-slate-200/50"></div>
                  <div className="w-full h-[1px] bg-slate-200/50"></div>
                  <div className="w-full h-[1px] bg-slate-200/50"></div>
                  <div className="w-full h-[1px] bg-slate-200/50"></div>
                  <div className="w-full h-[1px] bg-slate-300/80"></div>
                </div>
                
                {/* Target Bar */}
                <div className="flex flex-col items-center w-14 h-full justify-end relative z-10">
                  <div 
                    className="w-full bg-primary-900 rounded-t flex items-start justify-center pt-1 transition-all duration-500 hover:opacity-95" 
                    style={{ height: `${currentTargetVal}%` }}
                  >
                    <span className="text-[9px] font-bold text-white font-mono">{currentTargetVal}%</span>
                  </div>
                </div>

                {/* Realisasi Bar */}
                <div className="flex flex-col items-center w-14 h-full justify-end relative z-10">
                  <div 
                    className="w-full bg-amber-500 rounded-t flex items-start justify-center pt-1 transition-all duration-500 hover:opacity-95" 
                    style={{ height: `${currentRealisasiVal}%` }}
                  >
                    <span className="text-[9px] font-bold text-white font-mono">{currentRealisasiVal}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex gap-4 mt-3 justify-center text-[9px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-900" />
                <span>Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Realisasi</span>
              </div>
            </div>
          </ChartCard>

          {/* Card 2: Performa Year to Date (YTD) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD)</h3>
              
              {/* Year range filters */}
              <div className="flex items-center gap-2 mt-1">
                <FilterSelect 
                  label="Tahun Awal"
                  value={startYear}
                  onChange={setStartYear}
                  options={allYearsRange}
                />
                <span className="text-slate-400 text-xs mt-4">s.d</span>
                <FilterSelect 
                  label="Tahun Akhir"
                  value={endYear}
                  onChange={setEndYear}
                  options={allYearsRange}
                />
              </div>
            </div>
            
            <div className="p-4">
              <div className="w-full h-[180px] relative flex items-end gap-2 pt-6 pb-2 px-2 bg-slate-50/50 rounded border border-slate-100">
                {/* SVG Line Chart */}
                <svg className="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="100" x2="1000" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                  <line x1="0" y1="150" x2="1000" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" />
                  
                  {/* Target Line (100% flat at y=40) */}
                  <path d="M 0 40 L 250 40 L 500 40 L 750 40 L 1000 40" fill="none" stroke="#0f2e60" strokeDasharray="6,4" strokeWidth="2"></path>
                  
                  {/* Realization Line */}
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#fea619" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3.5"
                  />
                  
                  {/* Target & Realization labels with small font size */}
                  {activeYearsRange.map((yr, idx) => {
                    const val = getYearCumulativeAvg(yr);
                    const x = getX(idx, activeYearsRange.length);
                    const y = getY(val);
                    return (
                      <g key={yr}>
                        <text className="font-mono fill-primary-900" style={{ fontSize: '9px' }} textAnchor="middle" x={x} y={25}>
                          100%
                        </text>
                        <text className="font-mono fill-amber-600" style={{ fontSize: '9px' }} textAnchor="middle" x={x} y={y - 10}>
                          {val.toFixed(1)}%
                        </text>
                        <circle cx={x} cy={y} fill="#fea619" r="4.5" />
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis labels */}
                <div className="absolute bottom-1.5 left-0 w-full flex justify-between px-3 text-[8px] font-bold text-slate-500">
                  {activeYearsRange.map((yr, idx) => (
                    <span 
                      key={yr} 
                      style={{ 
                        position: 'absolute', 
                        left: `${(idx / (activeYearsRange.length - 1)) * 90 + 5}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {yr}
                    </span>
                  ))}
                </div>
              </div>

              {/* YTD Chart Legend */}
              <div className="flex gap-4 mt-6 justify-center text-[9px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-[1.5px] border-t-2 border-dashed border-primary-900"></div>
                  <span>Target Tahunan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-[2.5px] bg-amber-500 rounded-full"></div>
                  <span>Realisasi Kumulatif</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan target (${targetInput}%) dan realisasi (${realisasiInput}%) untuk ${triwulan} ${tahun}?`}
      />

    </div>
  );
};

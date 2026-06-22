import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, X, Home } from 'lucide-react';
import { BaseDoughnutChart } from '@/components/charts/BaseDoughnutChart';
import { navigateTo } from '@/utils/navigation';

interface DataPoint {
  realisasi: number;
  costReduction: number;
}

// Sub-component 1: FilterSelect
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
      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none min-w-[110px]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

// Sub-component 2: ChartCard
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

// Sub-component 3: ConfirmationModal
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

// Formatting helpers
const formatNumber = (num: number | string): string => {
  if (num === '') return '';
  const clean = num.toString().replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

const parseFormattedNumber = (str: string): number => {
  return parseFloat(str.replace(/,/g, '')) || 0;
};

// Initial mock data map for RKAP (2022 - 2024)
const initialRkapDataMap: Record<string, DataPoint> = {
  // 2024
  '2024-Januari': { realisasi: 500000000, costReduction: 600000000 },
  '2024-Februari': { realisasi: 1000000000, costReduction: 1200000000 },
  '2024-Maret': { realisasi: 1500000000, costReduction: 1800000000 },
  '2024-April': { realisasi: 2000000000, costReduction: 2400000000 },
  '2024-Mei': { realisasi: 2500000000, costReduction: 300000000, },
  '2024-Juni': { realisasi: 3000000000, costReduction: 3600000000 },
  '2024-Juli': { realisasi: 3500000000, costReduction: 4200000000 },
  '2024-Agustus': { realisasi: 4000000000, costReduction: 4800000000 },
  '2024-September': { realisasi: 4800000000, costReduction: 5500000000 },
  '2024-Oktober': { realisasi: 5400000000, costReduction: 6100000000 },
  '2024-November': { realisasi: 6000000000, costReduction: 6800000000 },
  '2024-Desember': { realisasi: 6543134277, costReduction: 7333309366 },

  // 2023
  '2023-Desember': { realisasi: 6000000000, costReduction: 7272727272 },
  // 2022
  '2022-Desember': { realisasi: 5400000000, costReduction: 9000000000 },
};

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const yearsList = Array.from({ length: 9 }, (_, i) => (2022 + i).toString());
const allYearsRange = ['2020', '2021', ...yearsList];

export const RealisasiRkapPage: React.FC = () => {
  const [bulan, setBulan] = useState<string>('Desember');
  const [tahun, setTahun] = useState<string>('2024');
  const [dataMap, setDataMap] = useState<Record<string, DataPoint>>(initialRkapDataMap);

  // YTD Line Chart filters
  const [startYear, setStartYear] = useState<string>('2020');
  const [endYear, setEndYear] = useState<string>('2024');

  // Input states (Controlled Components)
  const [realisasiInput, setRealisasiInput] = useState<string>('');
  const [costReductionInput, setCostReductionInput] = useState<string>('');

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dataKey = `${tahun}-${bulan}`;
  const activeData = dataMap[dataKey];

  // Simulating initial fetch (GET)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Sync input fields with active data
  useEffect(() => {
    if (activeData) {
      setRealisasiInput(formatNumber(activeData.realisasi));
      setCostReductionInput(formatNumber(activeData.costReduction));
    } else {
      setRealisasiInput('');
      setCostReductionInput('');
    }
  }, [tahun, bulan, activeData]);

  // Compute live values
  const rVal = parseFormattedNumber(realisasiInput);
  const cVal = parseFormattedNumber(costReductionInput);
  const diffVal = cVal - rVal;
  const percentageVal = cVal > 0 ? (rVal / cVal) * 100 : 0;

  // Handle Save
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (realisasiInput === '' || costReductionInput === '') {
      alert('Mohon isi field Realisasi dan Cost Reduction.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);

    // Simulate API call with delay (async database save simulation)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Save locally
      setDataMap((prev) => ({
        ...prev,
        [dataKey]: {
          realisasi: rVal,
          costReduction: cVal,
        },
      }));

      // Toast
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // POST Backend integration skeleton
      console.log('Sending RKAP payload to backend API...', {
        tahun,
        bulan,
        realisasi: rVal,
        costReduction: cVal,
        percentage: percentageVal
      });
    } catch (err) {
      console.error('Failed to sync RKAP with backend:', err);
    }
  };

  // YTD cumulative average calculation
  const getYearCumulativeAvg = (yr: string) => {
    if (yr === '2020') return 10;
    if (yr === '2021') return 30;

    // Averages up to selected month for active year, or all 12 months for past years
    let sumRealisasi = 0;
    let sumCostReduction = 0;
    
    // Determine limit: if selected year, only sum up to selected month. Otherwise sum all.
    const monthIndexLimit = yr === tahun ? monthsList.indexOf(bulan) : 11;

    for (let i = 0; i <= monthIndexLimit; i++) {
      const key = `${yr}-${monthsList[i]}`;
      const item = dataMap[key];
      if (item) {
        sumRealisasi += item.realisasi;
        sumCostReduction += item.costReduction;
      }
    }

    return sumCostReduction > 0 ? (sumRealisasi / sumCostReduction) * 100 : 0;
  };

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

  // Y-coordinate helper for Line Chart
  const getY = (val: number) => {
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

  // Donut chart dataset configuration using BaseDoughnutChart (based on saved data, not live inputs)
  const chartRealisasi = activeData ? activeData.realisasi : 0;
  const chartCostReduction = activeData ? activeData.costReduction : 0;
  const chartPercentageVal = chartCostReduction > 0 ? (chartRealisasi / chartCostReduction) * 100 : 0;

  const donutData = {
    labels: ['Realisasi', 'Remaining'],
    datasets: [{
      data: [chartPercentageVal, Math.max(0, 100 - chartPercentageVal)],
      backgroundColor: ['#0f2e60', '#f59e0b'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-900 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat Realisasi RKAP TI...</span>
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold text-slate-800">Realisasi RKAP TI</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect 
            label="Bulan"
            value={bulan}
            onChange={setBulan}
            options={monthsList}
          />
          <FilterSelect 
            label="Tahun"
            value={tahun}
            onChange={setTahun}
            options={yearsList}
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left side: Table form (8 cols) */}
        <form onSubmit={handleSaveClick} className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary-900">Data Realisasi</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Metric</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider">{bulan} {tahun}</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                
                {/* Row 1: Realisasi */}
                <tr className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-2.5 px-4 font-semibold border border-slate-200">Realisasi (Rp)</td>
                  <td className="py-1.5 px-3 border border-slate-200">
                    <input 
                      type="text"
                      value={realisasiInput}
                      onChange={(e) => setRealisasiInput(formatNumber(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center border border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setRealisasiInput('')}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>

                {/* Row 2: Cost Reduction */}
                <tr className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-2.5 px-4 font-semibold border border-slate-200">Cost Reduction (Rp)</td>
                  <td className="py-1.5 px-3 border border-slate-200">
                    <input 
                      type="text"
                      value={costReductionInput}
                      onChange={(e) => setCostReductionInput(formatNumber(e.target.value))}
                      placeholder="0"
                      className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center border border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setCostReductionInput('')}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>

                {/* Row 3: Selisih (Difference) */}
                <tr className="border-b border-slate-200 bg-amber-50/50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 border border-slate-200">Selisih (Rp)</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 border border-slate-200">
                    {formatNumber(diffVal)}
                  </td>
                  <td className="py-2.5 px-4 border border-slate-200"></td>
                </tr>

                {/* Row 4: % Realisasi */}
                <tr className="bg-amber-100/50">
                  <td className="py-2.5 px-4 font-bold text-slate-800 border border-slate-200 uppercase tracking-wide">% Realisasi</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 border border-slate-200">
                    {percentageVal.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-4 border border-slate-200"></td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end gap-2.5">
            <button 
              type="button"
              onClick={() => {
                if (activeData) {
                  setRealisasiInput(formatNumber(activeData.realisasi));
                  setCostReductionInput(formatNumber(activeData.costReduction));
                } else {
                  setRealisasiInput('');
                  setCostReductionInput('');
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
          {/* Card 1: Distribution Overview */}
          <ChartCard 
            title="Distribution Overview"
            subtitle={`${bulan} ${tahun}`}
          >
            <div className="relative w-44 h-44 flex items-center justify-center my-3">
              <BaseDoughnutChart data={donutData} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-primary-900">{chartPercentageVal.toFixed(0)}%</span>
                <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider">Realisasi</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 mt-4 justify-center text-[9px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-primary-900" />
                <span>Realisasi (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span>Cost Reduction (%)</span>
              </div>
            </div>
          </ChartCard>

          {/* Card 2: Performa Year to Date (YTD) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
              <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD)</h3>
              
              {/* Year Range Selectors */}
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
                  
                  {/* Cost Reduction Tahunan Line (100% Flat) */}
                  <path d="M 0 40 L 250 40 L 500 40 L 750 40 L 1000 40" fill="none" stroke="#f59e0b" strokeDasharray="6,4" strokeWidth="2"></path>
                  
                  {/* Realisasi Kumulatif Line */}
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#0f2e60" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3.5"
                  />
                  
                  {/* Ticks and Data Labels */}
                  {activeYearsRange.map((yr, idx) => {
                    const val = getYearCumulativeAvg(yr);
                    const x = getX(idx, activeYearsRange.length);
                    const y = getY(val);
                    return (
                      <g key={yr}>
                        <text className="font-mono fill-amber-500" style={{ fontSize: '9px' }} textAnchor="middle" x={x} y={25}>
                          100%
                        </text>
                        <text className="font-mono fill-primary-900" style={{ fontSize: '9px' }} textAnchor="middle" x={x} y={y - 10}>
                          {val.toFixed(1)}%
                        </text>
                        <circle cx={x} cy={y} fill="#0f2e60" r="4.5" />
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
                  <div className="w-6 h-[1.5px] border-t-2 border-dashed border-amber-500"></div>
                  <span>Cost Reduction Tahunan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-[2.5px] bg-[#0f2e60] rounded-full"></div>
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
        message={`Apakah Anda yakin ingin menyimpan perubahan Realisasi (${realisasiInput}) dan Cost Reduction (${costReductionInput}) untuk ${bulan} ${tahun}?`}
      />

    </div>
  );
};

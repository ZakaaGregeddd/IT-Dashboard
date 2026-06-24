import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, ChartLegend);

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

// Initial data map starts empty
const initialDataMap: Record<string, DataPoint> = {};

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
  const getCurrentTriwulan = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 4 && month <= 6) return 'TW II';
    if (month >= 7 && month <= 10) return 'TW III';
    if (month >= 11 && month <= 12) return 'TW IV';
    return 'TW I';
  };
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [triwulan, setTriwulan] = useState<string>(getCurrentTriwulan());
  const [tahun, setTahun] = useState<string>(getCurrentYear());
  const [dataMap, setDataMap] = useState<Record<string, DataPoint>>(initialDataMap);

  // Year to Date filters range
  const [startYear, setStartYear] = useState<string>('2022');
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // Form input state
  const [targetInput, setTargetInput] = useState<string>('');
  const [realisasiInput, setRealisasiInput] = useState<string>('');
  const [currentId, setCurrentId] = useState<string | null>(null);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Key for referencing the data
  const dataKey = `${tahun}-${triwulan}`;
  const activeData = dataMap[dataKey];

  // Fetch all historical data on mount to populate chart/YTD performance
  useEffect(() => {
    const fetchHistoricalData = async () => {
      const reverseMonthMap: Record<number, string> = {
        3: 'TW I',
        6: 'TW II',
        10: 'TW III',
        12: 'TW IV'
      };

      try {
        const response = await fetch('http://localhost:5000/api/program-kerja');
        const result = await response.json();
        
        const loadedData: Record<string, DataPoint> = {};
        if (result.success && Array.isArray(result.data)) {
          result.data.forEach((master: any) => {
            const twName = reverseMonthMap[master.bulan];
            if (twName && master.detail_program_kerja_ti && master.detail_program_kerja_ti.length > 0) {
              const detail = master.detail_program_kerja_ti[0];
              loadedData[`${master.tahun}-${twName}`] = {
                target: parseFloat(detail.target_persen),
                realisasi: parseFloat(detail.realisasi_persen)
              };
            }
          });
          setDataMap(prev => ({ ...prev, ...loadedData }));
        }
      } catch (error) {
        console.error('Failed to fetch historical YTD data:', error);
      }
    };
    fetchHistoricalData();
  }, []);

  // Fetch and sync data from backend on filter changes
  useEffect(() => {
    const fetchData = async () => {
      const monthNum = triwulan === 'TW I' ? 3 : triwulan === 'TW II' ? 6 : triwulan === 'TW III' ? 10 : 12;
      try {
        const response = await fetch(`http://localhost:5000/api/program-kerja?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && result.data.detail_program_kerja_ti && result.data.detail_program_kerja_ti.length > 0) {
          const detail = result.data.detail_program_kerja_ti[0];
          setCurrentId(detail.id);
          setTargetInput(detail.target_persen.toString());
          setRealisasiInput(detail.realisasi_persen.toString());
          
          // Update dataMap so chart/YTD works
          setDataMap((prev) => ({
            ...prev,
            [dataKey]: { target: parseFloat(detail.target_persen), realisasi: parseFloat(detail.realisasi_persen) }
          }));
        } else {
          setCurrentId(null);
          setTargetInput('');
          setRealisasiInput('');
        }
      } catch (error) {
        console.error('Failed to fetch from backend:', error);
      }
    };
    fetchData();
  }, [tahun, triwulan, dataKey]);

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

    const targetVal = parseFloat(targetInput);
    const realisasiVal = parseFloat(realisasiInput);
    const monthNum = triwulan === 'TW I' ? 3 : triwulan === 'TW II' ? 6 : triwulan === 'TW III' ? 10 : 12;

    const payload: any = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      details: [
        {
          urutan: 1,
          nama_program: 'Program Kerja TI',
          target_persen: targetVal,
          realisasi_persen: realisasiVal
        }
      ]
    };

    if (currentId) {
      payload.details[0].id = currentId;
    }

    try {
      const response = await fetch('http://localhost:5000/api/program-kerja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        // Update state locally
        const updatedData = {
          target: targetVal,
          realisasi: realisasiVal,
        };
        setDataMap((prev) => ({
          ...prev,
          [dataKey]: updatedData,
        }));
        
        // Update current ID if newly created
        if (result.data && result.data.detail_program_kerja_ti && result.data.detail_program_kerja_ti.length > 0) {
          setCurrentId(result.data.detail_program_kerja_ti[0].id);
        }

        // Toast UI notification
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // YTD cumulative average calculation: averages triwulans up to selected Triwulan, or all 4 if past
  const getYearCumulativeAvg = (yr: string) => {
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

  // YTD Line Chart configuration
  const lineChartData = {
    labels: activeYearsRange,
    datasets: [
      {
        label: 'Target Tahunan',
        data: activeYearsRange.map(() => 100),
        borderColor: '#0f2e60',
        borderDash: [6, 4],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Realisasi Kumulatif',
        data: activeYearsRange.map((yr) => getYearCumulativeAvg(yr)),
        borderColor: '#fea619',
        backgroundColor: '#fea619',
        borderWidth: 3.5,
        pointRadius: 4.5,
        fill: false,
        tension: 0.1,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide default legend as we already have a custom clean HTML legend below
      },
      tooltip: {
        backgroundColor: '#213145',
        titleFont: { family: 'Inter', weight: 'bold' as const },
        bodyFont: { family: 'Inter' },
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: { family: 'Inter', size: 10 },
          callback: (value: any) => `${value}%`
        },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      }
    }
  };

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

      {/* Main Stacked Layout */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Top: Controlled Form / Table Container */}
        <form onSubmit={handleSaveClick} className="w-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
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

        {/* Middle: Rekapitulasi Realisasi Chart */}
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

        {/* Bottom: Performa Year to Date (YTD) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
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
            <div className="w-full h-[220px] bg-slate-50/50 rounded border border-slate-100 p-2">
              <Line data={lineChartData} options={lineChartOptions} />
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

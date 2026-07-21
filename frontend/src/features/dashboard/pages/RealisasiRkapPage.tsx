import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, X, Trash2 } from 'lucide-react';
import { DeletePeriodModal } from '@/components/DeletePeriodModal';
import { BaseDoughnutChart } from '@/components/charts/BaseDoughnutChart';
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
            <p className="text-xs text-slate-500 mt-1">
              {message.includes("periode ") ? (
                (() => {
                  const parts = message.split("periode ");
                  return (
                    <>
                      {parts[0]}periode <span className="font-bold text-slate-800">{parts[1]}</span>
                    </>
                  );
                })()
              ) : (
                message
              )}
            </p>
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

// Initial data map starts empty
const initialRkapDataMap: Record<string, DataPoint> = {};

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const yearsList = Array.from({ length: 9 }, (_, i) => (2022 + i).toString());
const allYearsRange = ['2020', '2021', ...yearsList];

export const RealisasiRkapPage: React.FC = () => {
  const getCurrentMonthName = () => {
    const monthsNameMap = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return monthsNameMap[new Date().getMonth()];
  };
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());
  const [dataMap, setDataMap] = useState<Record<string, DataPoint>>(initialRkapDataMap);

  // YTD Line Chart filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // Input states (Controlled Components)
  const [realisasiInput, setRealisasiInput] = useState<string>('');
  const [costReductionInput, setCostReductionInput] = useState<string>('');

  // IDs state
  const [detailIds, setDetailIds] = useState<{ realisasi: string | null; costReduction: string | null }>({
    realisasi: null,
    costReduction: null
  });

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const monthsNumMap: Record<string, number> = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
    'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
  };

  const handleConfirmDelete = async () => {
    const monthNum = monthsNumMap[bulan] || 1;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/rkap?bulan=${monthNum}&tahun=${tahun}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setIsDeleteModalOpen(false);
        setRealisasiInput('');
        setCostReductionInput('');
        setDataMap(prev => {
          const next = { ...prev };
          delete next[dataKey];
          return next;
        });
      } else {
        alert(result.message || 'Gagal menghapus data.');
      }
    } catch (error) {
      console.error('Failed to delete RKAP data:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const dataKey = `${tahun}-${bulan}`;
  const activeData = dataMap[dataKey];

  // Fetch all historical data on mount to populate chart/YTD performance
  useEffect(() => {
    const fetchHistoricalData = async () => {
      const monthsNameMap: Record<number, string> = {
        1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April', 5: 'Mei', 6: 'Juni',
        7: 'Juli', 8: 'Agustus', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
      };

      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5000/api/rkap');
        const result = await response.json();
        
        const loadedData: Record<string, DataPoint> = {};
        if (result.success && Array.isArray(result.data)) {
          result.data.forEach((master: any) => {
            const mName = monthsNameMap[master.bulan];
            const details = master.detail_rkap_ti || [];
            const relDetail = details.find((d: any) => d.urutan === 1);
            const costDetail = details.find((d: any) => d.urutan === 2);
            
            if (mName) {
              loadedData[`${master.tahun}-${mName}`] = {
                realisasi: relDetail ? parseFloat(relDetail.nilai_nominal) : 0,
                costReduction: costDetail ? parseFloat(costDetail.nilai_nominal) : 0
              };
            }
          });
          setDataMap(loadedData);
        }
      } catch (error) {
        console.error('Failed to fetch historical YTD data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistoricalData();
  }, []);

  // Fetch active details from backend on filter changes
  useEffect(() => {
    const monthsNumMap: Record<string, number> = {
      'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
      'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    };
    const monthNum = monthsNumMap[bulan] || 12;

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/rkap?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && result.data.id) {
          const details = result.data.detail_rkap_ti || [];
          const relDetail = details.find((d: any) => d.urutan === 1);
          const costDetail = details.find((d: any) => d.urutan === 2);

          setDetailIds({
            realisasi: relDetail ? relDetail.id : null,
            costReduction: costDetail ? costDetail.id : null
          });

          const rValue = relDetail ? parseFloat(relDetail.nilai_nominal) : 0;
          const cValue = costDetail ? parseFloat(costDetail.nilai_nominal) : 0;

          setRealisasiInput(formatNumber(rValue));
          setCostReductionInput(formatNumber(cValue));

          setDataMap((prev) => ({
            ...prev,
            [dataKey]: { realisasi: rValue, costReduction: cValue }
          }));
        } else {
          setDetailIds({ realisasi: null, costReduction: null });
          setRealisasiInput('');
          setCostReductionInput('');
        }
      } catch (error) {
        console.error('Failed to fetch RKAP details:', error);
      }
    };
    fetchData();
  }, [tahun, bulan, dataKey]);

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

    const monthsNumMap: Record<string, number> = {
      'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
      'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    };
    const monthNum = monthsNumMap[bulan] || 12;

    const payload: any = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      kalkulasi_cost_reduction_rp: diffVal,
      kalkulasi_persentase_realisasi: percentageVal,
      details: [
        {
          urutan: 1,
          nama_metrik: 'Realisasi',
          nilai_nominal: rVal
        },
        {
          urutan: 2,
          nama_metrik: 'Cost Reduction',
          nilai_nominal: cVal
        }
      ]
    };

    if (detailIds.realisasi) payload.details[0].id = detailIds.realisasi;
    if (detailIds.costReduction) payload.details[1].id = detailIds.costReduction;

    try {
      const response = await fetch('http://localhost:5000/api/rkap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
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
        
        // Update IDs
        if (result.data && result.data.id) {
          const details = result.data.detail_rkap_ti || [];
          const relDetail = details.find((d: any) => d.urutan === 1);
          const costDetail = details.find((d: any) => d.urutan === 2);
          setDetailIds({
            realisasi: relDetail ? relDetail.id : null,
            costReduction: costDetail ? costDetail.id : null
          });
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (err) {
      console.error('Failed to sync RKAP with backend:', err);
      alert('Koneksi bermasalah saat menyimpan data.');
    }
  };

  // YTD cumulative average calculation
  const getYearCumulativeAvg = (yr: string) => {
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

  // YTD Line Chart configuration
  const lineChartData = {
    labels: activeYearsRange,
    datasets: [
      {
        label: 'Cost Reduction Tahunan',
        data: activeYearsRange.map(() => 100),
        borderColor: '#f59e0b',
        borderDash: [6, 4],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Realisasi Kumulatif',
        data: activeYearsRange.map((yr) => getYearCumulativeAvg(yr)),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        borderWidth: 3.5,
        pointRadius: 4.5,
        fill: false,
        tension: 0.3,
        cubicInterpolationMode: 'monotone' as const,
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

      {/* Main Stacked Layout */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Top: Table form */}
        <form onSubmit={handleSaveClick} className="w-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
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
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-1.5 rounded font-semibold text-[10px] hover:bg-red-700 transition-all shadow-sm uppercase tracking-wider"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Data Periode
            </button>
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

        {/* Middle: Distribution Overview */}
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

        {/* Bottom: Performa Year to Date (YTD) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD) - Rata-rata Realisasi & Saving RKAP</h3>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan Realisasi (${realisasiInput}) dan Cost Reduction (${costReductionInput}) untuk ${bulan} ${tahun}?`}
      />

      <DeletePeriodModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        periodText={`${bulan} ${tahun}`}
        isDeleting={isDeleting}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SistemDetail {
  id?: string;
  urutan: number;
  nama_sistem: string;
  rencana_persen: number;
  realisasi_persen: number;
}

interface SistemData {
  id?: string;
  bulan: number;
  tahun: number;
  rata_rata_rencana_persen: number;
  rata_rata_realisasi_persen: number;
  detail_ketersediaan_sistem: SistemDetail[];
}

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

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const monthsNumMap: Record<string, number> = {
  'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
  'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
};

const yearsList = Array.from({ length: 9 }, (_, i) => (2022 + i).toString());

const DEFAULT_ROWS: SistemDetail[] = [
  { urutan: 1, nama_sistem: 'Ellipse', rencana_persen: 0, realisasi_persen: 0 },
  { urutan: 2, nama_sistem: 'Email', rencana_persen: 0, realisasi_persen: 0 },
  { urutan: 3, nama_sistem: 'CISEA', rencana_persen: 0, realisasi_persen: 0 },
  { urutan: 4, nama_sistem: 'SIMKES', rencana_persen: 0, realisasi_persen: 0 }
];

export const TingkatKetersediaanSistemPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input state
  const [sistemRows, setSistemRows] = useState<SistemDetail[]>(DEFAULT_ROWS);

  // Historical data for YTD Chart
  const [allSistemRecords, setAllSistemRecords] = useState<SistemData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all historical records on mount for YTD Chart
  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/sistem');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllSistemRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sistem historical data:', error);
    }
  };

  useEffect(() => {
    fetchAllHistoricalData();
  }, []);

  // Fetch active details on filter changes
  useEffect(() => {
    const fetchActiveData = async () => {
      const monthNum = monthsNumMap[bulan] || 1;
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/ketersediaan/sistem?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_sistem) && result.data.detail_ketersediaan_sistem.length > 0) {
          // Parse decimal objects to numbers if needed
          const parsed = result.data.detail_ketersediaan_sistem.map((item: any) => ({
            ...item,
            rencana_persen: parseFloat(item.rencana_persen) || 0,
            realisasi_persen: parseFloat(item.realisasi_persen) || 0
          }));
          setSistemRows(parsed);
        } else {
          setSistemRows(DEFAULT_ROWS);
        }
      } catch (error) {
        console.error('Failed to fetch sistem active data:', error);
        setSistemRows(DEFAULT_ROWS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Handle edit row input value
  const handlePercentChange = (index: number, field: 'rencana_persen' | 'realisasi_persen', val: string) => {
    const parsed = parseFloat(val) || 0;
    setSistemRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: parsed };
      return updated;
    });
  };

  // Handle Save
  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);
    const monthNum = monthsNumMap[bulan] || 1;

    const payload = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      details: sistemRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        nama_sistem: row.nama_sistem,
        rencana_persen: row.rencana_persen,
        realisasi_persen: row.realisasi_persen
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/sistem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        fetchAllHistoricalData();
        if (result.data && result.data.detail_ketersediaan_sistem) {
          const parsed = result.data.detail_ketersediaan_sistem.map((item: any) => ({
            ...item,
            rencana_persen: parseFloat(item.rencana_persen) || 0,
            realisasi_persen: parseFloat(item.realisasi_persen) || 0
          }));
          setSistemRows(parsed);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save sistem data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Bar Chart data
  const barData: ChartData<'bar'> = {
    labels: sistemRows.map(r => r.nama_sistem),
    datasets: [
      {
        label: 'Rencana (%)',
        data: sistemRows.map(r => r.rencana_persen),
        backgroundColor: '#0f2e60',
        borderRadius: 4
      },
      {
        label: 'Realisasi (%)',
        data: sistemRows.map(r => r.realisasi_persen),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ]
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 10 },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#213145',
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 12, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { display: false }
      }
    }
  };

  // Prepare YTD Line Chart data
  const start = parseInt(startYear, 10);
  const end = parseInt(endYear, 10);
  const selectedYears: string[] = [];
  if (start <= end) {
    for (let y = start; y <= end; y++) {
      selectedYears.push(y.toString());
    }
  } else {
    selectedYears.push(startYear);
  }

  const getYearlyAvg = (yr: string, type: 'rencana' | 'realisasi'): number => {
    const yearRecs = allSistemRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        const total = sistemRows.reduce((acc, cur) => acc + (type === 'rencana' ? cur.rencana_persen : cur.realisasi_persen), 0);
        return sistemRows.length > 0 ? parseFloat((total / sistemRows.length).toFixed(2)) : 0;
      }
      return 0;
    }
    let sum = 0;
    yearRecs.forEach((rec) => {
      sum += type === 'rencana' ? (Number(rec.rata_rata_rencana_persen) || 0) : (Number(rec.rata_rata_realisasi_persen) || 0);
    });
    return parseFloat((sum / yearRecs.length).toFixed(2));
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'Rata-rata Target Rencana (%)',
        data: selectedYears.map((yr) => getYearlyAvg(yr, 'rencana')),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        tension: 0.3,
        cubicInterpolationMode: 'monotone' as const,
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      },
      {
        label: 'Rata-rata Ketersediaan Sistem (%)',
        data: selectedYears.map((yr) => getYearlyAvg(yr, 'realisasi')),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.3,
        cubicInterpolationMode: 'monotone' as const,
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      }
    ]
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 10 },
          usePointStyle: true,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#213145',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 110,
        ticks: {
          font: { family: 'Inter', size: 10 },
          stepSize: 10,
          callback: function(value: any) {
            if (value > 100) return null;
            return value + '%';
          }
        },
        grid: {
          color: (context) => {
            if (context.tick && context.tick.value > 100) return 'transparent';
            return '#f1f5f9';
          }
        }
      },
      x: {
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-900 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat Data Tingkat Ketersediaan Sistem...</span>
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
          <span className="text-xs font-semibold">Data berhasil disimpan!</span>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tingkat Ketersediaan Sistem</h2>
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
        
        {/* Row 1: Input Data (Full Width) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary-900">Data Entri Ketersediaan</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">SISTEM</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-44 bg-blue-50/30">RENCANA (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-44 bg-blue-50/30">REALISASI (%)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {sistemRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold border border-slate-200">
                      {row.nama_sistem}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        step="0.01"
                        value={row.rencana_persen === 0 ? '' : row.rencana_persen}
                        onChange={(e) => handlePercentChange(index, 'rencana_persen', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max="100"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        step="0.01"
                        value={row.realisasi_persen === 0 ? '' : row.realisasi_persen}
                        onChange={(e) => handlePercentChange(index, 'realisasi_persen', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max="100"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                  </tr>
                ))}
                {sistemRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end items-center gap-2.5">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const monthNum = monthsNumMap[bulan] || 1;
                  fetch(`http://localhost:5000/api/ketersediaan/sistem?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_sistem) && result.data.detail_ketersediaan_sistem.length > 0) {
                        const parsed = result.data.detail_ketersediaan_sistem.map((item: any) => ({
                          ...item,
                          rencana_persen: parseFloat(item.rencana_persen) || 0,
                          realisasi_persen: parseFloat(item.realisasi_persen) || 0
                        }));
                        setSistemRows(parsed);
                      } else {
                        setSistemRows(DEFAULT_ROWS);
                      }
                    })
                    .catch(() => {
                      setSistemRows(DEFAULT_ROWS);
                    });
                }}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold text-[10px] hover:bg-slate-100 transition-colors uppercase tracking-wider"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleSaveClick}
                className="flex items-center gap-1.5 bg-primary-900 text-white px-4 py-1.5 rounded font-semibold text-[10px] hover:bg-primary-800 transition-all shadow-sm uppercase tracking-wider"
              >
                <Save className="w-3.5 h-3.5" />
                Konfirmasi &amp; Simpan
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Bar Chart (Full Width) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Grafik Ketersediaan Sistem</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Target Rencana vs Realisasi ({bulan} {tahun})</p>
          </div>
          <div className="p-4 flex flex-col justify-center items-center h-[300px] relative">
            {sistemRows.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <span className="text-xs text-slate-400">Tidak ada data.</span>
            )}
          </div>
        </div>

        {/* Row 3: Performa Year to Date (YTD) - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD) - Rata-rata Ketersediaan Sistem</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Rata-rata Ketersediaan Sistem</p>
            
            {/* Year Range Selectors */}
            <div className="flex items-center gap-2 mt-1">
              <FilterSelect 
                label="Dari Tahun"
                value={startYear}
                onChange={setStartYear}
                options={yearsList}
              />
              <span className="text-slate-400 text-xs mt-4">s.d</span>
              <FilterSelect 
                label="Sampai Tahun"
                value={endYear}
                onChange={setEndYear}
                options={yearsList}
              />
            </div>
          </div>
          
          <div className="p-4 h-[300px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan data ketersediaan sistem untuk periode ${bulan} ${tahun}?`}
      />

    </div>
  );
};

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

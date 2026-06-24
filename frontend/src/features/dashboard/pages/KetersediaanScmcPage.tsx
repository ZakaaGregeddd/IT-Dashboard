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

interface SCMCDetail {
  id?: string;
  urutan: number;
  keterangan: string;
  jumlah: number;
}

interface SCMCData {
  id?: string;
  bulan: number;
  tahun: number;
  detail_ketersediaan_scmc: SCMCDetail[];
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

const DEFAULT_ROWS: SCMCDetail[] = [
  { urutan: 1, keterangan: 'Realisasi Jumlah Laporan', jumlah: 0 },
  { urutan: 2, keterangan: 'Jumlah Laporan Tersedia', jumlah: 0 }
];

export const KetersediaanScmcPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input state
  const [scmcRows, setScmcRows] = useState<SCMCDetail[]>(DEFAULT_ROWS);

  // Historical data for YTD Chart
  const [allScmcRecords, setAllScmcRecords] = useState<SCMCData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 3).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all historical records on mount for YTD Chart
  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/scmc');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllScmcRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch SCMC historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/ketersediaan/scmc?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_scmc) && result.data.detail_ketersediaan_scmc.length > 0) {
          setScmcRows(result.data.detail_ketersediaan_scmc);
        } else {
          setScmcRows(DEFAULT_ROWS);
        }
      } catch (error) {
        console.error('Failed to fetch SCMC active data:', error);
        setScmcRows(DEFAULT_ROWS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Handle edit row input value
  const handleJumlahChange = (index: number, val: string) => {
    const parsed = parseInt(val, 10) || 0;
    setScmcRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], jumlah: parsed };
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
      details: scmcRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        keterangan: row.keterangan,
        jumlah: row.jumlah
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/scmc', {
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
        if (result.data && result.data.detail_ketersediaan_scmc) {
          setScmcRows(result.data.detail_ketersediaan_scmc);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save SCMC data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Bar Chart data
  const barData: ChartData<'bar'> = {
    labels: ['Realisasi Jumlah Laporan', 'Jumlah Laporan Tersedia'],
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: [
          scmcRows.find(r => r.urutan === 1)?.jumlah || 0,
          scmcRows.find(r => r.urutan === 2)?.jumlah || 0
        ],
        backgroundColor: ['#0f2e60', '#f59e0b'],
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
        ticks: { 
          font: { family: 'Inter', size: 10 },
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          }
        },
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

  const getYearlyAvg = (yr: string, keterangan: string): number => {
    const yearRecs = allScmcRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        const found = scmcRows.find((r) => r.keterangan === keterangan);
        return found ? found.jumlah : 0;
      }
      return 0;
    }
    let sum = 0;
    let count = 0;
    yearRecs.forEach((rec) => {
      const detail = rec.detail_ketersediaan_scmc.find((d) => d.keterangan === keterangan);
      if (detail) {
        sum += detail.jumlah;
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'Realisasi Jumlah Laporan',
        data: selectedYears.map((yr) => getYearlyAvg(yr, 'Realisasi Jumlah Laporan')),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      },
      {
        label: 'Jumlah Laporan Tersedia',
        data: selectedYears.map((yr) => getYearlyAvg(yr, 'Jumlah Laporan Tersedia')),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.4,
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
        ticks: { 
          font: { family: 'Inter', size: 10 },
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          }
        },
        grid: { color: '#f1f5f9' }
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Ketersediaan Report SCMC...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Ketersediaan Report Aplikasi SCMC</h2>
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
            <h3 className="text-xs font-bold text-primary-900">Data Input</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">KETERANGAN</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">{bulan} {tahun}</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {scmcRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold border border-slate-200">
                      {row.keterangan}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        value={row.jumlah === 0 ? '' : row.jumlah}
                        onChange={(e) => handleJumlahChange(index, e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                  </tr>
                ))}
                {scmcRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
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
                  fetch(`http://localhost:5000/api/ketersediaan/scmc?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_scmc) && result.data.detail_ketersediaan_scmc.length > 0) {
                        setScmcRows(result.data.detail_ketersediaan_scmc);
                      } else {
                        setScmcRows(DEFAULT_ROWS);
                      }
                    })
                    .catch(() => {
                      setScmcRows(DEFAULT_ROWS);
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
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi Bulanan</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Ketersediaan Report SCMC ({bulan} {tahun})</p>
          </div>
          <div className="p-4 flex flex-col justify-center items-center h-[300px] relative">
            {scmcRows.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <span className="text-xs text-slate-400">Tidak ada data.</span>
            )}
          </div>
        </div>

        {/* Row 3: Performa Year to Date (YTD) - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD)</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Ketersediaan Report SCMC</p>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan data ketersediaan report SCMC untuk periode ${bulan} ${tahun}?`}
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

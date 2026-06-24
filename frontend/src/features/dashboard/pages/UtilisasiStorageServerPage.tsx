import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { setIsDirtyCheck } from '@/utils/navigation';
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

interface StorageDetail {
  id?: string;
  urutan: number;
  nama_storage: string;
  capacity_tb: number;
  utilisasi_tb: number;
  free_tb: number;
  utilisasi_persen: number;
}

interface StorageData {
  id?: string;
  bulan: number;
  tahun: number;
  rata_rata_utilisasi_persen: number;
  total_kapasitas: number;
  total_utilisasi: number;
  total_free: number;
  target_utilisasi_persen: number;
  detail_utilisasi_storage: StorageDetail[];
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

const DEFAULT_ROWS: StorageDetail[] = [
  { urutan: 1, nama_storage: 'TJE-UNITY-DATA-1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 2, nama_storage: 'TJE-UNITY-DATA-2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 3, nama_storage: 'TJE-UNITY-DATA-3', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 4, nama_storage: 'TJE-UNITY-DATA-4', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 5, nama_storage: 'TJE-UNITY-DATA-5', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 6, nama_storage: 'STEVPS-LNV1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 7, nama_storage: 'STEVPS-LNV2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 8, nama_storage: 'STEVPS-LNV3', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 9, nama_storage: 'STEVPS-LNV4', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 10, nama_storage: 'STEVPS-LNV5', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 11, nama_storage: 'STEVPS-LNV6', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 12, nama_storage: 'STEVPS-LNV7', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 13, nama_storage: 'STEVPS-LNV8', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 14, nama_storage: 'STEVPS-SQL1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 15, nama_storage: 'STEVPS-EXCH1', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
  { urutan: 16, nama_storage: 'STEVPS-EXCH2', capacity_tb: 0, utilisasi_tb: 0, free_tb: 0, utilisasi_persen: 0 },
];

export const UtilisasiStorageServerPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Ada perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman ini?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    setIsDirtyCheck(() => isDirty);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setIsDirtyCheck(null);
    };
  }, [isDirty]);

  // Input states
  const [serverRows, setServerRows] = useState<StorageDetail[]>(DEFAULT_ROWS);
  const [targetUtilisasi, setTargetUtilisasi] = useState<number>(90);

  // Historical data for YTD Chart
  const [allStorageRecords, setAllStorageRecords] = useState<StorageData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem('storage_server_rowsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Reset page to 1 when filters or rowsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [bulan, tahun, rowsPerPage]);

  const totalPages = Math.ceil(serverRows.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = serverRows.slice(startIndex, startIndex + rowsPerPage);

  // Fetch all historical records on mount for YTD Chart
  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/utilisasi/storage');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllStorageRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch Storage historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/utilisasi/storage?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_utilisasi_storage) && result.data.detail_utilisasi_storage.length > 0) {
          const parsed = result.data.detail_utilisasi_storage.map((item: any) => {
            const cap = parseFloat(item.capacity_tb) || 0;
            const util = parseFloat(item.utilisasi_tb) || 0;
            return {
              ...item,
              capacity_tb: cap,
              utilisasi_tb: util,
              free_tb: cap - util,
              utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
            };
          });
          setServerRows(parsed);
          setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
          setIsDirty(false);
        } else {
          setServerRows(DEFAULT_ROWS);
          setIsDirty(false);
        }
      } catch (error) {
        console.error('Failed to fetch Storage active data:', error);
        setServerRows(DEFAULT_ROWS);
        setIsDirty(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Compute live totals
  const totalCapacity = serverRows.reduce((acc, row) => acc + (row.capacity_tb || 0), 0);
  const totalUtil = serverRows.reduce((acc, row) => acc + (row.utilisasi_tb || 0), 0);
  const avgUtilisasiPercent = totalCapacity > 0 ? Math.round((totalUtil / totalCapacity) * 100) : 0;
  const totalFree = totalCapacity - totalUtil;

  // Handle edit row inputs
  const handleInputChange = (index: number, field: 'capacity_tb' | 'utilisasi_tb', val: string) => {
    setIsDirty(true);
    setServerRows((prev) => {
      const updated = [...prev];
      const parsed = parseFloat(val) || 0;
      const currentCapacity = field === 'capacity_tb' ? parsed : (updated[index].capacity_tb || 0);
      const currentUtil = field === 'utilisasi_tb' ? parsed : (updated[index].utilisasi_tb || 0);
      const calculatedPercent = currentCapacity > 0 ? Math.round((currentUtil / currentCapacity) * 100) : 0;
      
      updated[index] = {
        ...updated[index],
        [field]: parsed,
        free_tb: currentCapacity - currentUtil,
        utilisasi_persen: calculatedPercent
      };
      return updated;
    });
  };

  // Save
  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);
    const monthNum = monthsNumMap[bulan] || 1;

    const payload = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      target_utilisasi_persen: targetUtilisasi,
      details: serverRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        nama_storage: row.nama_storage,
        capacity_tb: row.capacity_tb,
        utilisasi_tb: row.utilisasi_tb,
        free_tb: row.free_tb,
        utilisasi_persen: row.utilisasi_persen
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/utilisasi/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setShowToast(true);
        setIsDirty(false);
        setTimeout(() => setShowToast(false), 3000);
        fetchAllHistoricalData();
        if (result.data && result.data.detail_utilisasi_storage) {
          const parsed = result.data.detail_utilisasi_storage.map((item: any) => {
            const cap = parseFloat(item.capacity_tb) || 0;
            const util = parseFloat(item.utilisasi_tb) || 0;
            return {
              ...item,
              capacity_tb: cap,
              utilisasi_tb: util,
              free_tb: cap - util,
              utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
            };
          });
          setServerRows(parsed);
          setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save Storage data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Bar Chart data
  const barData: ChartData<'bar'> = {
    labels: serverRows.map(r => r.nama_storage || `Storage ${r.urutan}`),
    datasets: [
      {
        label: 'Capacity (TB)',
        data: serverRows.map(r => r.capacity_tb),
        backgroundColor: '#0f2e60',
        borderRadius: 4
      },
      {
        label: 'Utilisasi (TB)',
        data: serverRows.map(r => r.utilisasi_tb),
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

  const getYearlyValue = (yr: string, type: 'capacity' | 'utilisasi'): number => {
    const yearRecs = allStorageRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        return type === 'capacity' ? totalCapacity : totalUtil;
      }
      return 0;
    }
    let sum = 0;
    yearRecs.forEach((rec) => {
      sum += type === 'capacity' ? (Number(rec.total_kapasitas) || 0) : (Number(rec.total_utilisasi) || 0);
    });
    return parseFloat((sum / yearRecs.length).toFixed(2));
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'Storage Capacity (TB)',
        data: selectedYears.map((yr) => getYearlyValue(yr, 'capacity')),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      },
      {
        label: 'Utilisasi Storage (TB)',
        data: selectedYears.map((yr) => getYearlyValue(yr, 'utilisasi')),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
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
        ticks: { font: { family: 'Inter', size: 10 } },
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Utilisasi Storage Server...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Utilisasi Storage Server</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Target Utilisasi (%)</span>
            <input 
              type="number"
              value={targetUtilisasi}
              onChange={(e) => {
                setTargetUtilisasi(parseFloat(e.target.value) || 0);
                setIsDirty(true);
              }}
              className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none max-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Main Stacked Layout */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Row 0: Rekomendasi Kapasitas Storage */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg shrink-0 ${
                avgUtilisasiPercent >= targetUtilisasi 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi)
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {avgUtilisasiPercent >= targetUtilisasi || serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi) ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Rekomendasi Kapasitas Storage ({bulan} {tahun})
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {avgUtilisasiPercent >= targetUtilisasi ? (
                    <>
                      Rata-rata utilisasi storage saat ini sebesar <span className="font-semibold text-amber-700">{avgUtilisasiPercent}%</span>, telah mencapai atau melebihi target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. <strong>Waktunya untuk meningkatkan kapasitas storage.</strong>
                    </>
                  ) : serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi) ? (
                    <>
                      Rata-rata utilisasi storage saat ini aman sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, namun <strong>terdapat storage individual yang melebihi target utilisasi {targetUtilisasi}%</strong>. Perlu perhatian pada storage tersebut.
                    </>
                  ) : (
                    <>
                      Rata-rata utilisasi storage saat ini sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, masih berada di bawah target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. Kapasitas storage saat ini <strong>masih mencukupi</strong> dan belum memerlukan peningkatan kapasitas.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2.5 rounded-lg border text-center shrink-0 min-w-[150px] ${
              avgUtilisasiPercent >= targetUtilisasi
                ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                : serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi)
                  ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Status Sistem</span>
              <span className="text-base font-extrabold block mt-0.5 animate-pulse">
                {avgUtilisasiPercent >= targetUtilisasi 
                  ? 'PERLU UPGRADE' 
                  : serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi)
                    ? 'PERLU PERHATIAN'
                    : 'NORMAL'}
              </span>
            </div>
          </div>

          {/* Individual Storage Status Breakdown */}
          {serverRows.some(r => r.nama_storage && r.utilisasi_persen >= targetUtilisasi) && (
            <div className="border-t border-slate-100 pt-4 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Analisis Storage Individual
              </span>
              <div className="flex flex-wrap gap-2.5">
                {serverRows.map((row, idx) => {
                  if (!row.nama_storage) return null;
                  const isOver = row.utilisasi_persen >= targetUtilisasi;
                  
                  if (!isOver) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-red-50/85 border-red-200 text-red-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      <span className="font-semibold">{row.nama_storage}</span>
                      <span className="opacity-60">|</span>
                      <span>Utilisasi: <strong className="font-mono">{row.utilisasi_persen}%</strong></span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-red-100 text-red-800">
                        Melebihi Target
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Row 1: Input Data (Full Width) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary-900">Data Entri Storage</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">NAMA STORAGE</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">CAPACITY (TB)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">UTILISASI (TB)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">UTILISASI (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">FREE (TB)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {paginatedRows.map((row, index) => {
                  const actualIndex = startIndex + index;
                  return (
                    <tr key={actualIndex} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                        {actualIndex + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold border border-slate-200 text-slate-800">
                        {row.nama_storage}
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200">
                        <input 
                          type="number"
                          step="0.01"
                          value={row.capacity_tb === 0 ? '' : row.capacity_tb}
                          onChange={(e) => handleInputChange(actualIndex, 'capacity_tb', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200">
                        <input 
                          type="number"
                          step="0.01"
                          value={row.utilisasi_tb === 0 ? '' : row.utilisasi_tb}
                          onChange={(e) => handleInputChange(actualIndex, 'utilisasi_tb', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right border border-slate-200 font-mono font-semibold">
                        {row.utilisasi_persen}%
                      </td>
                      <td className="py-2.5 px-4 text-right border border-slate-200 font-mono font-semibold">
                        {row.free_tb.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total / Average Row */}
                {serverRows.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-4 text-right border border-slate-200" colSpan={2}>
                      RATA-RATA / TOTAL
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalCapacity.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalUtil.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200 text-sm">
                      {avgUtilisasiPercent}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalFree.toFixed(2)}
                    </td>
                  </tr>
                )}
                {serverRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form Actions with Pagination */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
              >
                &larr; Prev
              </button>
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <span>Halaman</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    setPageInput(valStr);
                    const val = parseInt(valStr, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  onBlur={() => {
                    setPageInput(currentPage.toString());
                  }}
                  className="w-12 text-center bg-white border border-slate-200 rounded py-1 px-1.5 font-bold focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>dari {totalPages}</span>
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
              >
                Next &rarr;
              </button>
              
              <span className="text-slate-400 font-normal ml-2">Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRowsPerPage(val);
                  localStorage.setItem('storage_server_rowsPerPage', val.toString());
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none cursor-pointer"
              >
                <option value={5}>5 Baris</option>
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={9999}>Semua</option>
              </select>
              <span className="text-[10px] font-normal text-slate-400 ml-2">
                (Menampilkan {paginatedRows.length} dari {serverRows.length} baris)
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const monthNum = monthsNumMap[bulan] || 1;
                  fetch(`http://localhost:5000/api/utilisasi/storage?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_utilisasi_storage) && result.data.detail_utilisasi_storage.length > 0) {
                        const parsed = result.data.detail_utilisasi_storage.map((item: any) => {
                          const cap = parseFloat(item.capacity_tb) || 0;
                          const util = parseFloat(item.utilisasi_tb) || 0;
                          return {
                            ...item,
                            capacity_tb: cap,
                            utilisasi_tb: util,
                            free_tb: cap - util,
                            utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
                          };
                        });
                        setServerRows(parsed);
                        setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
                        setIsDirty(false);
                        setCurrentPage(1);
                      } else {
                        setServerRows(DEFAULT_ROWS);
                        setIsDirty(false);
                      }
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
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi - Storage Capacity vs Utilization</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Kapasitas Storage dengan Utilisasi Storage ({bulan} {tahun})</p>
          </div>
          <div className="p-4 flex flex-col justify-center items-center h-[300px] relative">
            {serverRows.length > 0 ? (
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
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Storage Capacity vs Utilisasi Storage</p>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan data utilisasi Storage Server untuk periode ${bulan} ${tahun}?`}
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

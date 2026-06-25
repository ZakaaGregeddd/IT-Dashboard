import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, X, ArrowUpDown } from 'lucide-react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

interface SDMDetail {
  id?: string;
  urutan: number;
  role_divisi: string;
  jumlah: number;
}

interface SDMData {
  id?: string;
  bulan: number;
  tahun: number;
  total_keseluruhan_sdm: number;
  detail_sdm_it: SDMDetail[];
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



export const SdmItPage: React.FC = () => {
  const getCurrentMonthName = () => {
    return monthsList[new Date().getMonth()];
  };
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input state for details table
  const [sdmRows, setSdmRows] = useState<SDMDetail[]>([]);

  // Sort state for the input table: null | 'asc' | 'desc'
  const [jumlahSortOrder, setJumlahSortOrder] = useState<'asc' | 'desc' | null>(null);

  // All historical records for YTD
  const [allSdmRecords, setAllSdmRecords] = useState<SDMData[]>([]);

  // YTD Line Chart filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Colors palette
  const colors = ['#0f2e60', '#1c4587', '#2b5ea8', '#3c78c9', '#5392e6', '#71aef2', '#92cbfb', '#b5e3ff', '#a78bfa', '#ec4899'];

  // Fetch all historical data on mount for YTD Chart
  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sdm');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllSdmRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch historical SDM data:', error);
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
        const response = await fetch(`http://localhost:5000/api/sdm?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_sdm_it)) {
          setSdmRows(result.data.detail_sdm_it);
          setJumlahSortOrder(null); // Reset sorting when changing month/year
        } else {
          setSdmRows([]);
          setJumlahSortOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch active SDM data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Compute live total
  const totalJumlah = sdmRows.reduce((acc, row) => acc + (row.jumlah || 0), 0);

  // Handle edit row input value by unique urutan identifier
  const handleJumlahChangeByUrutan = (urutan: number, val: string) => {
    const parsed = parseInt(val, 10) || 0;
    setSdmRows((prev) => {
      return prev.map((row) => {
        if (row.urutan === urutan) {
          return { ...row, jumlah: parsed };
        }
        return row;
      });
    });
  };

  // Handle delete row by unique urutan identifier
  const handleDeleteRowByUrutan = (urutan: number) => {
    setSdmRows((prev) => {
      const updated = prev.filter((row) => row.urutan !== urutan);
      // Re-assign order (urutan)
      return updated.map((item, idx) => ({ ...item, urutan: idx + 1 }));
    });
  };

  // Get sorted rows
  const getSortedSdmRows = () => {
    const rows = [...sdmRows];
    if (jumlahSortOrder === 'asc') {
      rows.sort((a, b) => a.jumlah - b.jumlah);
    } else if (jumlahSortOrder === 'desc') {
      rows.sort((a, b) => b.jumlah - a.jumlah);
    }
    return rows;
  };

  const sortedSdmRows = getSortedSdmRows();



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
      total_keseluruhan_sdm: totalJumlah,
      details: sdmRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        role_divisi: row.role_divisi,
        jumlah: row.jumlah
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/sdm', {
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
        // Refresh historical data
        fetchAllHistoricalData();
        // Update active details
        if (result.data) {
          setSdmRows(result.data.detail_sdm_it || []);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save SDM data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Doughnut Chart data
  const doughnutData: ChartData<'doughnut'> = {
    labels: sdmRows.map((r) => r.role_divisi),
    datasets: [{
      data: sdmRows.map((r) => r.jumlah),
      backgroundColor: colors.slice(0, sdmRows.length).concat(Array(Math.max(0, sdmRows.length - colors.length)).fill('#cbd5e1')),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 10 },
          color: '#44474f',
          usePointStyle: true,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#213145',
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 12, weight: 'bold' }
      }
    }
  };

  // Prepare Line Chart (YTD) Data
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

  // Get distinct roles list from all historical records to show line for each
  const allRolesSet = new Set<string>();
  allSdmRecords.forEach((rec) => {
    rec.detail_sdm_it.forEach((d) => allRolesSet.add(d.role_divisi));
  });
  // Add active roles as well
  sdmRows.forEach((r) => allRolesSet.add(r.role_divisi));
  const distinctRoles = Array.from(allRolesSet);

  // Group by year and calculate latest count of each role
  const getYearlyRoleLatest = (yr: string, role: string): number => {
    const yearRecs = allSdmRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      // Fallback to active display if selected year is currently active and has no DB record yet
      if (yr === tahun) {
        const found = sdmRows.find((r) => r.role_divisi === role);
        return found ? found.jumlah : 0;
      }
      return 0;
    }
    
    // Find the record with the maximum month number (latest month) in this year
    const latestRec = yearRecs.reduce((latest, current) => {
      return current.bulan > latest.bulan ? current : latest;
    }, yearRecs[0]);

    const detail = latestRec.detail_sdm_it.find((d) => d.role_divisi === role);
    return detail ? detail.jumlah : 0;
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: distinctRoles.map((role, idx) => ({
      label: role,
      data: selectedYears.map((yr) => getYearlyRoleLatest(yr, role)),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length],
      tension: 0.3,
        cubicInterpolationMode: 'monotone' as const,
      borderWidth: 2,
      pointRadius: 3,
      fill: false
    }))
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data SDM IT...</span>
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
          <h2 className="text-xl font-bold text-slate-800">SDM IT (Outsource &amp; Pegawai)</h2>
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
        
        {/* Row 1: Input and Doughnut Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          {/* Left side: Table & Form (8 cols) */}
          <div className="xl:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-primary-900">Detail Komposisi SDM</h3>
            </div>
            
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                    <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                    <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">ROLE/DIVISI</th>
                    <th 
                      onClick={() => {
                        if (jumlahSortOrder === null) setJumlahSortOrder('asc');
                        else if (jumlahSortOrder === 'asc') setJumlahSortOrder('desc');
                        else setJumlahSortOrder(null);
                      }}
                      className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-32 cursor-pointer hover:bg-slate-100 select-none transition-colors"
                      title="Klik untuk mengurutkan berdasarkan Jumlah"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>JUMLAH</span>
                        <ArrowUpDown className={`w-3.5 h-3.5 ${jumlahSortOrder ? 'text-primary-900' : 'text-slate-400'}`} />
                      </div>
                    </th>
                    <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-20">AKSI</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {sortedSdmRows.map((row, index) => (
                    <tr key={row.urutan} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold border border-slate-200">
                        {row.role_divisi}
                      </td>
                      <td className="py-1.5 px-3 border border-slate-200">
                        <input 
                          type="number"
                          value={row.jumlah === 0 ? '' : row.jumlah}
                          onChange={(e) => handleJumlahChangeByUrutan(row.urutan, e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center border border-slate-200">
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRowByUrutan(row.urutan)}
                          className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Hapus"
                        >
                          <X className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-4 text-right border border-slate-200" colSpan={2}>
                      TOTAL
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200 text-sm">
                      {totalJumlah}
                    </td>
                    <td className="py-2.5 px-4 border border-slate-200"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Form Actions */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end items-center gap-2.5">
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    // reset to default or database values
                    const monthNum = monthsNumMap[bulan] || 1;
                    fetch(`http://localhost:5000/api/sdm?bulan=${monthNum}&tahun=${tahun}`)
                      .then(res => res.json())
                      .then(result => {
                        if (result.success && result.data && Array.isArray(result.data.detail_sdm_it)) {
                          setSdmRows(result.data.detail_sdm_it);
                        } else {
                          setSdmRows([]);
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

          {/* Right side: Doughnut Chart (4 cols) */}
          <div className="xl:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h3 className="text-xs font-semibold text-slate-800">Distribusi SDM IT</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Berdasarkan Role/Divisi ({bulan} {tahun})</p>
            </div>
            <div className="p-4 flex flex-col justify-center items-center h-[340px] relative">
              {sdmRows.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <span className="text-xs text-slate-400">Tidak ada data.</span>
              )}
            </div>
          </div>

        </div>

        {/* Row 2: Performa Year to Date (YTD) - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD) - Data Terkini SDM IT</h3>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan data komposisi SDM IT untuk periode ${bulan} ${tahun}?`}
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

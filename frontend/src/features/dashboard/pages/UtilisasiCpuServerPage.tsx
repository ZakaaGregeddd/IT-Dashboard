import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
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

interface CPUDetail {
  id?: string;
  urutan: number;
  nama_server: string;
  cpu_cores: number;
  utilisasi_ghz: number;
  utilisasi_persen: number;
}

interface CPUData {
  id?: string;
  bulan: number;
  tahun: number;
  rata_rata_utilisasi_persen: number;
  total_kapasitas: number;
  total_utilisasi: number;
  total_free: number;
  total_cpu_cores: number;
  total_utilisasi_ghz: number;
  target_utilisasi_persen: number;
  detail_utilisasi_cpu: CPUDetail[];
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

export const UtilisasiCpuServerPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input states
  const [serverRows, setServerRows] = useState<CPUDetail[]>([]);
  const [targetUtilisasi, setTargetUtilisasi] = useState<number>(90);

  // Historical data for YTD Chart
  const [allCpuRecords, setAllCpuRecords] = useState<CPUData[]>([]);

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
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllCpuRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch CPU historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/utilisasi/cpu?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_utilisasi_cpu)) {
          const parsed = result.data.detail_utilisasi_cpu.map((item: any) => ({
            ...item,
            cpu_cores: parseInt(item.cpu_cores, 10) || 0,
            utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
            utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
          }));
          setServerRows(parsed);
          setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
        } else {
          setServerRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch CPU active data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Compute live totals
  const totalCores = serverRows.reduce((acc, row) => acc + (row.cpu_cores || 0), 0);
  const totalGhz = serverRows.reduce((acc, row) => acc + (row.utilisasi_ghz || 0), 0);
  const avgUtilisasiPercent = totalCores > 0 ? Math.round((totalGhz / totalCores) * 100) : 0;

  // Handle edit row inputs
  const handleInputChange = (index: number, field: 'nama_server' | 'cpu_cores' | 'utilisasi_ghz', val: string) => {
    setServerRows((prev) => {
      const updated = [...prev];
      if (field === 'nama_server') {
        updated[index] = { ...updated[index], [field]: val };
      } else {
        const parsed = parseFloat(val) || 0;
        const currentCores = field === 'cpu_cores' ? parsed : (updated[index].cpu_cores || 0);
        const currentGhz = field === 'utilisasi_ghz' ? parsed : (updated[index].utilisasi_ghz || 0);
        const calculatedPercent = currentCores > 0 ? Math.round((currentGhz / currentCores) * 100) : 0;
        
        updated[index] = {
          ...updated[index],
          [field]: parsed,
          utilisasi_persen: calculatedPercent
        };
      }
      return updated;
    });
  };

  // Add dynamic row
  const handleAddRow = () => {
    setServerRows((prev) => [
      ...prev,
      {
        urutan: prev.length + 1,
        nama_server: '',
        cpu_cores: 0,
        utilisasi_ghz: 0,
        utilisasi_persen: 0
      }
    ]);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setServerRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, idx) => ({ ...item, urutan: idx + 1 }));
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
        nama_server: row.nama_server,
        cpu_cores: row.cpu_cores,
        utilisasi_ghz: row.utilisasi_ghz,
        utilisasi_persen: row.utilisasi_persen
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu', {
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
        if (result.data && result.data.detail_utilisasi_cpu) {
          const parsed = result.data.detail_utilisasi_cpu.map((item: any) => ({
            ...item,
            cpu_cores: parseInt(item.cpu_cores, 10) || 0,
            utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
            utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
          }));
          setServerRows(parsed);
          setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save CPU data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Bar Chart data
  const barData: ChartData<'bar'> = {
    labels: serverRows.map(r => r.nama_server || `Server ${r.urutan}`),
    datasets: [
      {
        label: 'CPU Cores',
        data: serverRows.map(r => r.cpu_cores),
        backgroundColor: '#0f2e60',
        borderRadius: 4
      },
      {
        label: 'Utilisasi Cores',
        data: serverRows.map(r => r.utilisasi_ghz),
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

  const getYearlyValue = (yr: string, type: 'cores' | 'utilisasi'): number => {
    const yearRecs = allCpuRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        return type === 'cores' ? totalCores : totalGhz;
      }
      return 0;
    }
    let sum = 0;
    yearRecs.forEach((rec) => {
      sum += type === 'cores' ? (Number(rec.total_cpu_cores) || 0) : (Number(rec.total_utilisasi_ghz) || 0);
    });
    return parseFloat((sum / yearRecs.length).toFixed(2));
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'CPU Cores',
        data: selectedYears.map((yr) => getYearlyValue(yr, 'cores')),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      },
      {
        label: 'Utilisasi Cores',
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Utilisasi CPU Server...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Utilisasi CPU Server</h2>
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
              onChange={(e) => setTargetUtilisasi(parseFloat(e.target.value) || 0)}
              className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none max-w-[120px]"
            />
          </div>
        </div>
      </div>

      {/* Main Stacked Layout */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Row 0: Rekomendasi Kapasitas CPU */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg shrink-0 ${
                avgUtilisasiPercent >= targetUtilisasi 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi)
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {avgUtilisasiPercent >= targetUtilisasi || serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi) ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Rekomendasi Kapasitas CPU ({bulan} {tahun})
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {avgUtilisasiPercent >= targetUtilisasi ? (
                    <>
                      Rata-rata utilisasi CPU saat ini sebesar <span className="font-semibold text-amber-700">{avgUtilisasiPercent}%</span>, telah mencapai atau melebihi target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. <strong>Waktunya untuk meningkatkan kapasitas CPU.</strong>
                    </>
                  ) : serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi) ? (
                    <>
                      Rata-rata utilisasi CPU saat ini aman sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, namun <strong>terdapat server individual yang melebihi target utilisasi {targetUtilisasi}%</strong>. Perlu perhatian pada server tersebut.
                    </>
                  ) : (
                    <>
                      Rata-rata utilisasi CPU saat ini sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, masih berada di bawah target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. Kapasitas CPU saat ini <strong>masih mencukupi</strong> dan belum memerlukan peningkatan kapasitas.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2.5 rounded-lg border text-center shrink-0 min-w-[150px] ${
              avgUtilisasiPercent >= targetUtilisasi
                ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                : serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi)
                  ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Status Sistem</span>
              <span className="text-base font-extrabold block mt-0.5 animate-pulse">
                {avgUtilisasiPercent >= targetUtilisasi 
                  ? 'PERLU UPGRADE' 
                  : serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi)
                    ? 'PERLU PERHATIAN'
                    : 'NORMAL'}
              </span>
            </div>
          </div>

          {/* Individual Server Status Breakdown */}
          {serverRows.some(r => r.nama_server && r.utilisasi_persen >= targetUtilisasi) && (
            <div className="border-t border-slate-100 pt-4 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Analisis Server Individual
              </span>
              <div className="flex flex-wrap gap-2.5">
                {serverRows.map((row, idx) => {
                  if (!row.nama_server) return null;
                  const isOver = row.utilisasi_persen >= targetUtilisasi;
                  
                  if (!isOver) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-red-50/85 border-red-200 text-red-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      <span className="font-semibold">{row.nama_server}</span>
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
            <h3 className="text-xs font-bold text-primary-900">Data Entri CPU</h3>
            <button 
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 bg-primary-900 text-white px-3 py-1 rounded text-[10px] font-semibold hover:bg-primary-800 transition-colors uppercase tracking-wider shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Server
            </button>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">NAMA SERVER</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">CPU CORES</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">UTILISASI CORES</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">UTILISASI (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-20">AKSI</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {serverRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-1 px-3 border border-slate-200">
                      <input 
                        type="text"
                        value={row.nama_server}
                        onChange={(e) => handleInputChange(index, 'nama_server', e.target.value)}
                        placeholder="Nama Server"
                        className="w-full px-2 py-1 text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-semibold"
                      />
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        value={row.cpu_cores === 0 ? '' : row.cpu_cores}
                        onChange={(e) => handleInputChange(index, 'cpu_cores', e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        step="0.01"
                        value={row.utilisasi_ghz === 0 ? '' : row.utilisasi_ghz}
                        onChange={(e) => handleInputChange(index, 'utilisasi_ghz', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right border border-slate-200 font-mono font-semibold">
                      {row.utilisasi_persen}%
                    </td>
                    <td className="py-2.5 px-4 text-center border border-slate-200">
                      <button 
                        type="button" 
                        onClick={() => handleDeleteRow(index)}
                        className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Total / Average Row */}
                {serverRows.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-4 text-right border border-slate-200" colSpan={2}>
                      RATA-RATA / TOTAL
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalCores}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalGhz.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200 text-sm">
                      {avgUtilisasiPercent}%
                    </td>
                    <td className="py-2.5 px-4 border border-slate-200"></td>
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

          {/* Form Actions */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end items-center gap-2.5">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const monthNum = monthsNumMap[bulan] || 1;
                  fetch(`http://localhost:5000/api/utilisasi/cpu?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_utilisasi_cpu)) {
                        const parsed = result.data.detail_utilisasi_cpu.map((item: any) => ({
                          ...item,
                          cpu_cores: parseInt(item.cpu_cores, 10) || 0,
                          utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
                          utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
                        }));
                        setServerRows(parsed);
                        setTargetUtilisasi(parseFloat(result.data.target_utilisasi_persen) || 90);
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
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi - CPU Cores vs Utilisasi</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Kapasitas Cores dengan Utilisasi Cores ({bulan} {tahun})</p>
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
            <p className="text-[10px] text-slate-500 mt-0.5">Tren CPU Cores vs Utilisasi Cores</p>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan data utilisasi CPU Server untuk periode ${bulan} ${tahun}?`}
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

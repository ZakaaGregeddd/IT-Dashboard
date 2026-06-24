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

interface CpuAppDetail {
  id?: string;
  urutan: number;
  nama_sistem: string;
  cpu_ghz: number;
  utilisasi_ghz: number;
  free_persen: number;
  utilisasi_persen: number;
}

interface CpuAppData {
  id?: string;
  bulan: number;
  tahun: number;
  detail_cpu_aplikasi: CpuAppDetail[];
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

const DEFAULT_ROWS: CpuAppDetail[] = [
  { urutan: 1, nama_sistem: 'CISEA', cpu_ghz: 0, utilisasi_ghz: 0, free_persen: 0, utilisasi_persen: 0 },
  { urutan: 2, nama_sistem: 'Ellipse', cpu_ghz: 0, utilisasi_ghz: 0, free_persen: 0, utilisasi_persen: 0 },
];

export const UtilisasiCpuAplikasiPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input states
  const [appRows, setAppRows] = useState<CpuAppDetail[]>(DEFAULT_ROWS);
  const [targetUtilisasi, setTargetUtilisasi] = useState<number>(90);

  // Historical data for YTD Chart
  const [allAppRecords, setAllAppRecords] = useState<CpuAppData[]>([]);

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
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu-app');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllAppRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch Application CPU historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/utilisasi/cpu-app?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_cpu_aplikasi) && result.data.detail_cpu_aplikasi.length > 0) {
          const parsed = result.data.detail_cpu_aplikasi.map((item: any) => {
            const cpu = parseFloat(item.cpu_ghz) || 0;
            const util = parseFloat(item.utilisasi_ghz) || 0;
            const p = cpu > 0 ? (util / cpu) * 100 : 0;
            return {
              ...item,
              cpu_ghz: cpu,
              utilisasi_ghz: util,
              free_persen: cpu > 0 ? 100 - p : 0,
              utilisasi_persen: p
            };
          });
          setAppRows(parsed);
        } else {
          setAppRows(DEFAULT_ROWS);
        }
      } catch (error) {
        console.error('Failed to fetch CPU Aplikasi active data:', error);
        setAppRows(DEFAULT_ROWS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Compute live totals
  const totalCpuGhz = appRows.reduce((acc, row) => acc + (row.cpu_ghz || 0), 0);
  const totalUtilGhz = appRows.reduce((acc, row) => acc + (row.utilisasi_ghz || 0), 0);
  const avgUtilisasiPercent = totalCpuGhz > 0 ? Math.round((totalUtilGhz / totalCpuGhz) * 100) : 0;

  // Handle edit row inputs
  const handleInputChange = (index: number, field: 'cpu_ghz' | 'utilisasi_ghz', val: string) => {
    setAppRows((prev) => {
      const updated = [...prev];
      const parsed = parseFloat(val) || 0;
      const currentCpu = field === 'cpu_ghz' ? parsed : (updated[index].cpu_ghz || 0);
      const currentUtil = field === 'utilisasi_ghz' ? parsed : (updated[index].utilisasi_ghz || 0);
      const calculatedPercent = currentCpu > 0 ? (currentUtil / currentCpu) * 100 : 0;
      
      updated[index] = {
        ...updated[index],
        [field]: parsed,
        free_persen: currentCpu > 0 ? 100 - calculatedPercent : 0,
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
      details: appRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        nama_sistem: row.nama_sistem,
        cpu_ghz: row.cpu_ghz,
        utilisasi_ghz: row.utilisasi_ghz,
        free_persen: row.free_persen,
        utilisasi_persen: row.utilisasi_persen
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu-app', {
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
        if (result.data && result.data.detail_cpu_aplikasi) {
          const parsed = result.data.detail_cpu_aplikasi.map((item: any) => {
            const cpu = parseFloat(item.cpu_ghz) || 0;
            const util = parseFloat(item.utilisasi_ghz) || 0;
            const p = cpu > 0 ? (util / cpu) * 100 : 0;
            return {
              ...item,
              cpu_ghz: cpu,
              utilisasi_ghz: util,
              free_persen: 100 - p,
              utilisasi_persen: p
            };
          });
          setAppRows(parsed);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save Application CPU data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Prepare Bar Chart data (Horizontal, Free vs Utilisasi %)
  const barData: ChartData<'bar'> = {
    labels: appRows.map(r => r.nama_sistem),
    datasets: [
      {
        label: 'Free (%)',
        data: appRows.map(r => r.free_persen),
        backgroundColor: '#0f2e60',
        borderRadius: 4
      },
      {
        label: 'Utilisasi (%)',
        data: appRows.map(r => r.utilisasi_persen),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ]
  };

  const barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
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
      x: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      },
      y: {
        stacked: true,
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

  const getYearlyValue = (yr: string, sysName: string): number => {
    const yearRecs = allAppRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        const found = appRows.find(r => r.nama_sistem.toLowerCase() === sysName.toLowerCase());
        return found ? parseFloat(found.utilisasi_persen.toFixed(2)) : 0;
      }
      return 0;
    }
    let sum = 0;
    let count = 0;
    yearRecs.forEach((rec) => {
      const match = rec.detail_cpu_aplikasi.find(d => d.nama_sistem.toLowerCase() === sysName.toLowerCase());
      if (match) {
        sum += Number(match.utilisasi_persen) || 0;
        count++;
      }
    });
    return count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'CISEA (%)',
        data: selectedYears.map((yr) => getYearlyValue(yr, 'CISEA')),
        borderColor: '#0f2e60',
        backgroundColor: '#0f2e60',
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        borderWidth: 2,
        pointRadius: 4,
        fill: false
      },
      {
        label: 'Ellipse (%)',
        data: selectedYears.map((yr) => getYearlyValue(yr, 'Ellipse')),
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Utilisasi CPU Aplikasi...</span>
        </div>
      </div>
    );
  }

  const isAnyOverTarget = appRows.some(r => r.utilisasi_persen >= targetUtilisasi);

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
          <h2 className="text-xl font-bold text-slate-800">Utilisasi CPU Aplikasi Ellipse dan CISEA</h2>
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
        
        {/* Row 0: Rekomendasi Kapasitas CPU Aplikasi */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg shrink-0 ${
                avgUtilisasiPercent >= targetUtilisasi 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : isAnyOverTarget
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {avgUtilisasiPercent >= targetUtilisasi || isAnyOverTarget ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Rekomendasi Kapasitas CPU Aplikasi ({bulan} {tahun})
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {avgUtilisasiPercent >= targetUtilisasi ? (
                    <>
                      Rata-rata utilisasi CPU aplikasi saat ini sebesar <span className="font-semibold text-amber-700">{avgUtilisasiPercent}%</span>, telah mencapai atau melebihi target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. <strong>Waktunya untuk meningkatkan kapasitas CPU aplikasi.</strong>
                    </>
                  ) : isAnyOverTarget ? (
                    <>
                      Rata-rata utilisasi CPU aplikasi saat ini aman sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, namun <strong>terdapat aplikasi individual yang melebihi target utilisasi {targetUtilisasi}%</strong>. Perlu perhatian pada aplikasi tersebut.
                    </>
                  ) : (
                    <>
                      Rata-rata utilisasi CPU aplikasi saat ini sebesar <span className="font-semibold text-emerald-700">{avgUtilisasiPercent}%</span>, masih berada di bawah target utilisasi <span className="font-semibold">{targetUtilisasi}%</span>. Kapasitas CPU aplikasi saat ini <strong>masih mencukupi</strong> dan belum memerlukan peningkatan.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2.5 rounded-lg border text-center shrink-0 min-w-[150px] ${
              avgUtilisasiPercent >= targetUtilisasi
                ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                : isAnyOverTarget
                  ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Status Sistem</span>
              <span className="text-base font-extrabold block mt-0.5 animate-pulse">
                {avgUtilisasiPercent >= targetUtilisasi 
                  ? 'PERLU UPGRADE' 
                  : isAnyOverTarget
                    ? 'PERLU PERHATIAN'
                    : 'NORMAL'}
              </span>
            </div>
          </div>

          {/* Individual CPU App Status Breakdown */}
          {isAnyOverTarget && (
            <div className="border-t border-slate-100 pt-4 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Analisis Aplikasi Individual
              </span>
              <div className="flex flex-wrap gap-2.5">
                {appRows.map((row, idx) => {
                  const isOver = row.utilisasi_persen >= targetUtilisasi;
                  if (!isOver) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-red-50/85 border-red-200 text-red-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      <span className="font-semibold">{row.nama_sistem}</span>
                      <span className="opacity-60">|</span>
                      <span>Utilisasi: <strong className="font-mono">{row.utilisasi_persen.toFixed(1)}%</strong></span>
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
            <h3 className="text-xs font-bold text-primary-900">Data Entri CPU Aplikasi</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">SISTEM</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">CPU (GHZ)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">UTILISASI (GHZ)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">FREE (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40">UTILISASI (%)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {appRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold border border-slate-200 text-slate-800">
                      {row.nama_sistem}
                    </td>
                    <td className="py-1.5 px-3 border border-slate-200">
                      <input 
                        type="number"
                        step="0.01"
                        value={row.cpu_ghz === 0 ? '' : row.cpu_ghz}
                        onChange={(e) => handleInputChange(index, 'cpu_ghz', e.target.value)}
                        placeholder="0.00"
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
                      {row.free_persen.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right border border-slate-200 font-mono font-semibold text-primary-900">
                      {row.utilisasi_persen.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                
                {/* Total / Average Row */}
                {appRows.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td className="py-2.5 px-4 text-right border border-slate-200" colSpan={2}>
                      RATA-RATA / TOTAL
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalCpuGhz.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {totalUtilGhz.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200">
                      {(totalCpuGhz > 0 ? 100 - avgUtilisasiPercent : 0).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200 text-sm">
                      {avgUtilisasiPercent}%
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
                  fetch(`http://localhost:5000/api/utilisasi/cpu-app?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_cpu_aplikasi) && result.data.detail_cpu_aplikasi.length > 0) {
                        const parsed = result.data.detail_cpu_aplikasi.map((item: any) => {
                          const cpu = parseFloat(item.cpu_ghz) || 0;
                          const util = parseFloat(item.utilisasi_ghz) || 0;
                          const p = cpu > 0 ? (util / cpu) * 100 : 0;
                          return {
                            ...item,
                            cpu_ghz: cpu,
                            utilisasi_ghz: util,
                            free_persen: cpu > 0 ? 100 - p : 0,
                            utilisasi_persen: p
                          };
                        });
                        setAppRows(parsed);
                      } else {
                        setAppRows(DEFAULT_ROWS);
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
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi Utilisasi CPU</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Free vs Utilisasi CPU Aplikasi ({bulan} {tahun})</p>
          </div>
          <div className="p-4 flex flex-col justify-center items-center h-[300px] relative">
            {appRows.length > 0 ? (
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
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Rata-rata Utilisasi CPU Aplikasi (%)</p>
            
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
        message={`Apakah Anda yakin ingin menyimpan perubahan data utilisasi CPU Aplikasi untuk periode ${bulan} ${tahun}?`}
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

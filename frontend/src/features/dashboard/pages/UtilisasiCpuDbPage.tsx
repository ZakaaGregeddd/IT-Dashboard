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

interface CPUDatabaseDetail {
  id?: string;
  urutan: number;
  nama_sistem: string;
  cpu_ghz: number;
  utilisasi_ghz: number;
  free_persen: number;
  utilisasi_persen: number;
}

interface CPUDatabaseData {
  id?: string;
  bulan: number;
  tahun: number;
  detail_cpu_db_aplikasi: CPUDatabaseDetail[];
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

export const UtilisasiCpuDbPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input states
  const [systemRows, setSystemRows] = useState<CPUDatabaseDetail[]>([]);
  const [allDbRecords, setAllDbRecords] = useState<CPUDatabaseData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 3).toString());
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu-database');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllDbRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch CPU database historical data:', error);
    }
  };

  useEffect(() => {
    fetchAllHistoricalData();
  }, []);

  useEffect(() => {
    const fetchActiveData = async () => {
      const monthNum = monthsNumMap[bulan] || 1;
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/utilisasi/cpu-database?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_cpu_db_aplikasi)) {
          const parsed = result.data.detail_cpu_db_aplikasi.map((item: any) => ({
            ...item,
            cpu_ghz: parseFloat(item.cpu_ghz) || 0,
            utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
            free_persen: parseFloat(item.free_persen) || 0,
            utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
          }));
          setSystemRows(parsed);
        } else {
          setSystemRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch CPU database active data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  const handleInputChange = (index: number, field: 'cpu_ghz' | 'utilisasi_ghz', val: string) => {
    setSystemRows((prev) => {
      const updated = [...prev];
      const parsed = parseFloat(val) || 0;
      const currentCpu = field === 'cpu_ghz' ? parsed : (updated[index].cpu_ghz || 0);
      const currentUtil = field === 'utilisasi_ghz' ? parsed : (updated[index].utilisasi_ghz || 0);

      let calculatedUtilPercent = 0;
      if (currentCpu > 0) {
        calculatedUtilPercent = parseFloat(((currentUtil / currentCpu) * 100).toFixed(2));
      }
      const calculatedFreePercent = parseFloat((100 - calculatedUtilPercent).toFixed(2));

      updated[index] = {
        ...updated[index],
        [field]: parsed,
        utilisasi_persen: calculatedUtilPercent,
        free_persen: calculatedFreePercent
      };
      return updated;
    });
  };

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);
    const monthNum = monthsNumMap[bulan] || 1;

    const payload = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      details: systemRows.map((row) => ({
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
      const response = await fetch('http://localhost:5000/api/utilisasi/cpu-database', {
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
        if (result.data && result.data.detail_cpu_db_aplikasi) {
          const parsed = result.data.detail_cpu_db_aplikasi.map((item: any) => ({
            ...item,
            cpu_ghz: parseFloat(item.cpu_ghz) || 0,
            utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
            free_persen: parseFloat(item.free_persen) || 0,
            utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
          }));
          setSystemRows(parsed);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save CPU database data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Stacked Bar Chart for Free % and Utilisasi %
  const barData: ChartData<'bar'> = {
    labels: systemRows.map((s) => s.nama_sistem),
    datasets: [
      {
        label: 'Free (%)',
        data: systemRows.map((s) => s.free_persen),
        backgroundColor: '#0f2e60',
        borderRadius: 4
      },
      {
        label: 'Utilisasi (%)',
        data: systemRows.map((s) => s.utilisasi_persen),
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

  // YTD Line Chart Data preparation
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

  const getYearlyValue = (yr: string, systemName: string): number => {
    const yearRecs = allDbRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        const currentMatch = systemRows.find(
          (s) => s.nama_sistem.toLowerCase() === systemName.toLowerCase()
        );
        return currentMatch ? currentMatch.utilisasi_persen : 0;
      }
      return 0;
    }
    let sum = 0;
    let count = 0;
    yearRecs.forEach((rec) => {
      const match = rec.detail_cpu_db_aplikasi.find(
        (d) => d.nama_sistem.toLowerCase() === systemName.toLowerCase()
      );
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
        label: 'CISEA',
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
        label: 'Ellipse',
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
        max: 100,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' },
        title: {
          display: true,
          text: 'Utilisasi (%)'
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Utilisasi CPU Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50 relative">
      
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0f2e60] text-white px-4 py-2.5 rounded-lg shadow-lg animate-bounce transition-all duration-300">
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs font-semibold">Data berhasil disimpan!</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Utilisasi CPU Database Aplikasi Ellipse dan CISEA</h2>
        </div>

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
        </div>
      </div>

      <div className="flex flex-col gap-5 w-full">
        
        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-primary-900">Data Utilisasi CPU Database</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">SISTEM</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-48 bg-blue-50/30">CPU (GHZ)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-48 bg-blue-50/30">UTILISASI (GHZ)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-48">FREE (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-48">UTILISASI (%)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {systemRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 border border-slate-200 font-semibold text-primary-900">
                      {row.nama_sistem}
                    </td>
                    <td className="py-1 px-3 border border-slate-200">
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
                        step="0.0001"
                        value={row.utilisasi_ghz === 0 ? '' : row.utilisasi_ghz}
                        onChange={(e) => handleInputChange(index, 'utilisasi_ghz', e.target.value)}
                        placeholder="0.0000"
                        min="0"
                        className="w-full px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right border border-slate-200 font-mono text-slate-500">
                      {row.free_persen.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right border border-slate-200 font-mono font-semibold text-primary-900">
                      {row.utilisasi_persen.toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {systemRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex justify-end items-center gap-2.5">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => {
                  const monthNum = monthsNumMap[bulan] || 1;
                  fetch(`http://localhost:5000/api/utilisasi/cpu-database?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_cpu_db_aplikasi)) {
                        const parsed = result.data.detail_cpu_db_aplikasi.map((item: any) => ({
                          ...item,
                          cpu_ghz: parseFloat(item.cpu_ghz) || 0,
                          utilisasi_ghz: parseFloat(item.utilisasi_ghz) || 0,
                          free_persen: parseFloat(item.free_persen) || 0,
                          utilisasi_persen: parseFloat(item.utilisasi_persen) || 0
                        }));
                        setSystemRows(parsed);
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

        {/* Monthly Visualisation Stacked Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi Utilisasi CPU Database</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Utilisasi dan Free Headroom ({bulan} {tahun})</p>
          </div>
          <div className="p-4 flex flex-col justify-center items-center h-[300px] relative">
            {systemRows.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <span className="text-xs text-slate-400">Tidak ada data.</span>
            )}
          </div>
        </div>

        {/* YTD Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-2 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD)</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Rata-rata Utilisasi CPU Database (%)</p>
            
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

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan data utilisasi CPU Database untuk periode ${bulan} ${tahun}?`}
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

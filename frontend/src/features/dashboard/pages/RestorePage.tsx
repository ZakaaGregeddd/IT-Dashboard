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

interface RestoreDetail {
  id?: string;
  urutan: number;
  bulan_teks: string;
  wo_masuk: number;
  wo_selesai: number;
}

interface RestoreData {
  id?: string;
  tahun: number;
  total_wo_masuk: number;
  total_wo_selesai: number;
  detail_realisasi_restore: RestoreDetail[];
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

const yearsList = Array.from({ length: 9 }, (_, i) => (2020 + i).toString());

export const RestorePage: React.FC = () => {
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input states
  const [systemRows, setSystemRows] = useState<RestoreDetail[]>([]);
  const [allDbRecords, setAllDbRecords] = useState<RestoreData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(new Date().getFullYear().toString());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/work-order/restore');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllDbRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch Restore historical data:', error);
    }
  };

  useEffect(() => {
    fetchAllHistoricalData();
  }, []);

  useEffect(() => {
    const fetchActiveData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/work-order/restore?tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_realisasi_restore)) {
          const parsed = result.data.detail_realisasi_restore.map((item: any) => ({
            ...item,
            wo_masuk: parseInt(item.wo_masuk, 10) || 0,
            wo_selesai: parseInt(item.wo_selesai, 10) || 0
          }));
          setSystemRows(parsed);
        } else {
          setSystemRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch Restore active data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun]);

  const handleInputChange = (index: number, field: 'wo_masuk' | 'wo_selesai', val: string) => {
    setSystemRows((prev) => {
      const updated = [...prev];
      const parsed = parseInt(val, 10) || 0;
      updated[index] = {
        ...updated[index],
        [field]: parsed
      };
      return updated;
    });
  };

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);

    const payload = {
      tahun: parseInt(tahun, 10),
      details: systemRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        bulan_teks: row.bulan_teks,
        wo_masuk: row.wo_masuk,
        wo_selesai: row.wo_selesai
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/work-order/restore', {
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
        if (result.data && result.data.detail_realisasi_restore) {
          const parsed = result.data.detail_realisasi_restore.map((item: any) => ({
            ...item,
            wo_masuk: parseInt(item.wo_masuk, 10) || 0,
            wo_selesai: parseInt(item.wo_selesai, 10) || 0
          }));
          setSystemRows(parsed);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save Restore data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Bar Chart: WO Masuk vs WO Selesai for selected year
  const barData: ChartData<'bar'> = {
    labels: systemRows.map((s) => s.bulan_teks),
    datasets: [
      {
        label: 'WO Masuk',
        data: systemRows.map((s) => s.wo_masuk),
        backgroundColor: '#0f2e60',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      },
      {
        label: 'WO Selesai',
        data: systemRows.map((s) => s.wo_selesai),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      }
    ]
  };

  const barOptions: ChartOptions<'bar'> = {
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
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  // YTD trend datasets: displays the yearly total completion
  const getYearlyTrendData = () => {
    const labels: string[] = [];
    const masuk: number[] = [];
    const selesai: number[] = [];
    
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10);
    
    for (let y = start; y <= end; y++) {
      labels.push(y.toString());
      const dbRecord = allDbRecords.find(rec => rec.tahun === y);
      
      let totalMasuk = 0;
      let totalSelesai = 0;
      
      if (dbRecord) {
        const details = (dbRecord as any).detail_pc_support || (dbRecord as any).detail_layanan_aplikasi || (dbRecord as any).detail_layanan_operasional || (dbRecord as any).detail_realisasi_restore;
        if (Array.isArray(details) && details.length > 0) {
          details.forEach(d => {
            totalMasuk += Number(d.wo_masuk) || 0;
            totalSelesai += Number(d.wo_selesai) || 0;
          });
        }
      } else if (y === parseInt(tahun, 10) && systemRows.length > 0) {
        systemRows.forEach(d => {
          totalMasuk += Number(d.wo_masuk) || 0;
          totalSelesai += Number(d.wo_selesai) || 0;
        });
      }
      
      masuk.push(totalMasuk);
      selesai.push(totalSelesai);
    }
    
    return { labels, masuk, selesai };
  };

  const trendData = getYearlyTrendData();

  const lineChartData: ChartData<'line'> = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'WO Masuk',
        data: trendData.masuk,
        borderColor: '#0f2e60',
        backgroundColor: 'rgba(15, 46, 96, 0.1)',
        tension: 0.3,
        cubicInterpolationMode: 'monotone',
        fill: true,
        pointRadius: 2
      },
      {
        label: 'WO Selesai',
        data: trendData.selesai,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        tension: 0.3,
        cubicInterpolationMode: 'monotone',
        fill: false,
        pointRadius: 2
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
        position: 'top',
        align: 'end',
        labels: {
          font: { family: 'Inter', size: 10 },
          usePointStyle: true,
          boxWidth: 8
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
        grid: { display: false }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-900 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium">Memuat Data Realisasi Restore Ellipse...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Realisasi Restore Ellipse dan Email sesuai kebutuhan</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
            <h3 className="text-xs font-bold text-primary-900">Data Realisasi Restore Ellipse dan Email</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Bulan</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">WO Masuk</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">WO Selesai</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {systemRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 border border-slate-200 text-center text-slate-500 font-mono">
                      {row.urutan}
                    </td>
                    <td className="py-2.5 px-4 border border-slate-200 font-semibold text-primary-900">
                      {row.bulan_teks}
                    </td>
                    <td className="py-1 px-3 border border-slate-200 bg-blue-50/10">
                      <div className="flex items-center justify-end">
                        <input 
                          type="number"
                          value={row.wo_masuk === 0 ? '' : row.wo_masuk}
                          onChange={(e) => handleInputChange(index, 'wo_masuk', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-32 px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                      </div>
                    </td>
                    <td className="py-1 px-3 border border-slate-200 bg-blue-50/10">
                      <div className="flex items-center justify-end">
                        <input 
                          type="number"
                          value={row.wo_selesai === 0 ? '' : row.wo_selesai}
                          onChange={(e) => handleInputChange(index, 'wo_selesai', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-32 px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {systemRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
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
                  fetch(`http://localhost:5000/api/work-order/restore?tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_realisasi_restore)) {
                        const parsed = result.data.detail_realisasi_restore.map((item: any) => ({
                          ...item,
                          wo_masuk: parseInt(item.wo_masuk, 10) || 0,
                          wo_selesai: parseInt(item.wo_selesai, 10) || 0
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

        {/* Monthly Visualisation Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi Realisasi Restore Ellipse dan Email</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan WO Masuk vs WO Selesai ({tahun})</p>
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
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD) - Jumlah Work Order Restore</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Jumlah Tahunan WO Masuk vs WO Selesai (Hanya menampilkan data dari database)</p>
            
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
          
          <div className="p-4 h-[350px]">
            {trendData.labels.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Tidak ada data historis dalam database untuk rentang tahun yang dipilih.
              </div>
            )}
          </div>
        </div>

      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan data realisasi restore untuk periode tahun ${tahun}?`}
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

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { DeletePeriodModal } from '@/components/DeletePeriodModal';
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

interface KeamananDetail {
  id?: string;
  urutan: number;
  nama_sistem: string;
  rencana_persen: number;
  realisasi_persen: number;
}

interface KeamananData {
  id?: string;
  bulan: number;
  tahun: number;
  detail_ketersediaan_keamanan: KeamananDetail[];
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

const yearsList = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());



export const KetersediaanKeamananPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // Input states
  const [systemRows, setSystemRows] = useState<KeamananDetail[]>([]);
  const [allDbRecords, setAllDbRecords] = useState<KeamananData[]>([]);

  // YTD filters
  const [startYear, setStartYear] = useState<string>((new Date().getFullYear() - 4).toString());
  const [endYear, setEndYear] = useState<string>(new Date().getFullYear().toString());

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleConfirmDelete = async () => {
    const monthNum = monthsNumMap[bulan] || 1;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/ketersediaan/keamanan?bulan=${monthNum}&tahun=${tahun}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setIsDeleteModalOpen(false);
        setSystemRows([]);
        fetchAllHistoricalData();
      } else {
        alert(result.message || 'Gagal menghapus data.');
      }
    } catch (error) {
      console.error('Failed to delete security availability data:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/keamanan');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllDbRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch Security availability historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/ketersediaan/keamanan?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_keamanan)) {
          const parsed = result.data.detail_ketersediaan_keamanan.map((item: any) => ({
            ...item,
            rencana_persen: parseFloat(item.rencana_persen) || 0,
            realisasi_persen: parseFloat(item.realisasi_persen) || 0
          }));
          setSystemRows(parsed);
        } else {
          setSystemRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch Security active data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  const handleInputChange = (index: number, field: 'rencana_persen' | 'realisasi_persen', val: string) => {
    setSystemRows((prev) => {
      const updated = [...prev];
      const parsed = parseFloat(val) || 0;
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
    const monthNum = monthsNumMap[bulan] || 1;

    const payload = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      details: systemRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        nama_sistem: row.nama_sistem,
        rencana_persen: row.rencana_persen,
        realisasi_persen: row.realisasi_persen
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/ketersediaan/keamanan', {
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
        if (result.data && result.data.detail_ketersediaan_keamanan) {
          const parsed = result.data.detail_ketersediaan_keamanan.map((item: any) => ({
            ...item,
            rencana_persen: parseFloat(item.rencana_persen) || 0,
            realisasi_persen: parseFloat(item.realisasi_persen) || 0
          }));
          setSystemRows(parsed);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save Security data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
    }
  };

  // Bar Chart for Current Month: Comparing Rencana and Realisasi
  const barData: ChartData<'bar'> = {
    labels: systemRows.map((s) => s.nama_sistem),
    datasets: [
      {
        label: 'Rencana (%)',
        data: systemRows.map((s) => s.rencana_persen),
        backgroundColor: '#0f2e60',
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7
      },
      {
        label: 'Realisasi (%)',
        data: systemRows.map((s) => s.realisasi_persen),
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
        max: 100,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' }
      }
    }
  };


  
  const locations = [
    { name: 'Proxy Tanjung Enim', color: '#0f2e60' },
    { name: 'Security Jaringan', color: '#f59e0b' },
    { name: 'Antivirus', color: '#10b981' }
  ];

  const getDynamicMockData = () => {
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10);
    const data = [];
    
    for (let yrNum = start; yrNum <= end; yrNum++) {
      const yrStr = yrNum.toString();
      const dbRecs = allDbRecords.filter(rec => rec.tahun === yrNum);
      
      const yearObj: Record<string, any> = { tahun: yrStr };
      
      locations.forEach(loc => {
        if (dbRecs.length > 0) {
          let sum = 0;
          let count = 0;
          dbRecs.forEach(rec => {
            const match = rec.detail_ketersediaan_keamanan.find(
              d => d.nama_sistem.toLowerCase() === loc.name.toLowerCase()
            );
            if (match) {
              sum += Number(match.realisasi_persen) || 0;
              count++;
            }
          });
          yearObj[loc.name] = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
        } else if (yrNum === parseInt(tahun, 10) && systemRows.length > 0) {
          const currentMatch = systemRows.find(
            s => s.nama_sistem.toLowerCase() === loc.name.toLowerCase()
          );
          yearObj[loc.name] = currentMatch ? currentMatch.realisasi_persen : 0;
        } else {
          yearObj[loc.name] = 0;
        }
      });
      data.push(yearObj);
    }
    return data;
  };

  const dynamicMockData = getDynamicMockData();
  const filteredMockData = dynamicMockData;

  const lineChartData: ChartData<'line'> = {
    labels: filteredMockData.map(d => d.tahun),
    datasets: locations.map(loc => {
      return {
        label: loc.name,
        data: filteredMockData.map(d => d[loc.name as keyof typeof d] as number),
        borderColor: loc.color,
        backgroundColor: loc.color,
        tension: 0.3,
        cubicInterpolationMode: 'monotone' as const,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false
      };
    })
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
        display: false // Using custom legends below
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
        max: 100,
        ticks: { font: { family: 'Inter', size: 10 } },
        grid: { color: '#f1f5f9' },
        title: {
          display: true,
          text: 'Ketersediaan (%)'
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Ketersediaan Keamanan...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Tingkat Ketersediaan Sistem Keamanan TI</h2>
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
            <h3 className="text-xs font-bold text-primary-900">Data Tingkat Ketersediaan Sistem Keamanan TI</h3>
          </div>
          
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Sistem</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">Rencana (%)</th>
                  <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-40 bg-blue-50/30">Realisasi (%)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {systemRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-2.5 px-4 border border-slate-200 text-center text-slate-500 font-mono">
                      {row.urutan}
                    </td>
                    <td className="py-2.5 px-4 border border-slate-200 font-semibold text-primary-900">
                      {row.nama_sistem}
                    </td>
                    <td className="py-1 px-3 border border-slate-200 bg-blue-50/10">
                      <div className="flex items-center justify-end gap-1.5">
                        <input 
                          type="number"
                          value={row.rencana_persen === 0 ? '' : row.rencana_persen}
                          onChange={(e) => handleInputChange(index, 'rencana_persen', e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          className="w-24 px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                        <span className="text-slate-500 font-medium text-xs">%</span>
                      </div>
                    </td>
                    <td className="py-1 px-3 border border-slate-200 bg-blue-50/10">
                      <div className="flex items-center justify-end gap-1.5">
                        <input 
                          type="number"
                          value={row.realisasi_persen === 0 ? '' : row.realisasi_persen}
                          onChange={(e) => handleInputChange(index, 'realisasi_persen', e.target.value)}
                          placeholder="0"
                          min="0"
                          max="100"
                          className="w-24 px-2 py-1 text-right text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all font-mono"
                        />
                        <span className="text-slate-500 font-medium text-xs">%</span>
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
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-1.5 rounded font-semibold text-[10px] hover:bg-red-700 transition-all shadow-sm uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Data Periode
              </button>
              <button 
                type="button"
                onClick={() => {
                  const monthNum = monthsNumMap[bulan] || 1;
                  fetch(`http://localhost:5000/api/ketersediaan/keamanan?bulan=${monthNum}&tahun=${tahun}`)
                    .then(res => res.json())
                    .then(result => {
                      if (result.success && result.data && Array.isArray(result.data.detail_ketersediaan_keamanan)) {
                        const parsed = result.data.detail_ketersediaan_keamanan.map((item: any) => ({
                          ...item,
                          rencana_persen: parseFloat(item.rencana_persen) || 0,
                          realisasi_persen: parseFloat(item.realisasi_persen) || 0
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
            <h3 className="text-xs font-semibold text-slate-800">Visualisasi Tingkat Ketersediaan Sistem Keamanan TI</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Perbandingan Rencana vs Realisasi ({bulan} {tahun})</p>
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
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD) - Rata-rata Ketersediaan Keamanan</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Ketersediaan Sistem Keamanan TI {startYear} - {endYear}</p>
            
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

          <div className="p-4 border-t border-slate-100 bg-slate-50/20">
            <div className="grid grid-cols-3 gap-3">
              {locations.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                  <span className="text-[10px] font-medium text-slate-600 truncate">{loc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan data ketersediaan keamanan untuk periode ${bulan} ${tahun}?`}
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

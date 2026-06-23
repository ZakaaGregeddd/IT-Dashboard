import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ChartData,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTooltip, ChartLegend);

interface LicenseDetail {
  id?: string;
  urutan: number;
  principle: string;
  nama_produk: string;
  total_lisensi: number;
  satuan?: string;
  tanggal_expired: string; // YYYY-MM-DD
  status: string;
  keterangan?: string;
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

const yearsList = Array.from({ length: 9 }, (_, i) => (2021 + i).toString());


export const LisensiPage: React.FC = () => {
  const getCurrentMonthName = () => monthsList[new Date().getMonth()];
  const getCurrentYear = () => new Date().getFullYear().toString();

  const [bulan, setBulan] = useState<string>(getCurrentMonthName());
  const [tahun, setTahun] = useState<string>(getCurrentYear());

  // License rows currently being edited
  const [licenseRows, setLicenseRows] = useState<LicenseDetail[]>([]);
  const [allLicenseRecords, setAllLicenseRecords] = useState<any[]>([]);
  
  // Chart filters
  const [startYear, setStartYear] = useState<string>('2021');
  const [endYear, setEndYear] = useState<string>(getCurrentYear());

  // UI state
  const [activeDetailView, setActiveDetailView] = useState<'urgent' | 'peringatan' | 'aman' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to format ISO Date strings for HTML date input
  const formatDateForInput = (dateVal: string | Date) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Fetch all historical records on mount for YTD Chart
  const fetchAllHistoricalData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/licenses');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setAllLicenseRecords(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch License historical data:', error);
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
        const response = await fetch(`http://localhost:5000/api/licenses?bulan=${monthNum}&tahun=${tahun}`);
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.detail_lisensi)) {
          const formatted = result.data.detail_lisensi.map((d: any) => ({
            ...d,
            satuan: d.satuan || 'Unit',
            keterangan: d.keterangan || '',
            tanggal_expired: formatDateForInput(d.tanggal_expired)
          }));
          setLicenseRows(formatted);
        } else {
          setLicenseRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch active license data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveData();
  }, [tahun, bulan]);

  // Compute month difference between expiration date and selected period
  const getMonthDifference = (expDateStr: string) => {
    if (!expDateStr) return 999;
    const expDate = new Date(expDateStr);
    if (isNaN(expDate.getTime())) return 999;

    const selectedMonth = monthsNumMap[bulan] || 1;
    const selectedYear = parseInt(tahun, 10);

    return (expDate.getFullYear() - selectedYear) * 12 + (expDate.getMonth() + 1 - selectedMonth);
  };

  // Categorize rows
  const urgentLicenses = licenseRows.filter((r) => getMonthDifference(r.tanggal_expired) <= 2);
  const warningLicenses = licenseRows.filter((r) => {
    const diff = getMonthDifference(r.tanggal_expired);
    return diff > 2 && diff <= 4;
  });
  const safeLicenses = licenseRows.filter((r) => getMonthDifference(r.tanggal_expired) > 4);

  // Compute live total
  const totalJumlah = licenseRows.reduce((acc, row) => acc + (row.total_lisensi || 0), 0);

  // Table row editing handlers
  const handleRowChange = (index: number, field: keyof LicenseDetail, val: any) => {
    setLicenseRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Add row (initialize with empty/blank values to allow user typing)
  const handleAddRow = () => {
    setLicenseRows((prev) => [
      ...prev,
      {
        urutan: prev.length + 1,
        principle: '',
        nama_produk: '',
        total_lisensi: 0,
        satuan: 'Unit',
        tanggal_expired: '',
        status: 'Aktif',
        keterangan: ''
      }
    ]);
  };

  // Delete row
  const handleDeleteRow = (index: number) => {
    setLicenseRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((item, idx) => ({ ...item, urutan: idx + 1 }));
    });
  };

  // Save changes
  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsModalOpen(false);
    const monthNum = monthsNumMap[bulan] || 1;

    const payload = {
      bulan: monthNum,
      tahun: parseInt(tahun, 10),
      total_keseluruhan_lisensi: totalJumlah,
      details: licenseRows.map((row) => ({
        id: row.id,
        urutan: row.urutan,
        principle: row.principle,
        nama_produk: row.nama_produk,
        total_lisensi: parseInt(row.total_lisensi as any, 10) || 0,
        tanggal_expired: row.tanggal_expired || formatDateForInput(new Date()),
        status: row.status
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/licenses', {
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
        if (result.data) {
          const formatted = (result.data.detail_lisensi || []).map((d: any) => ({
            ...d,
            satuan: d.satuan || 'Unit',
            keterangan: d.keterangan || '',
            tanggal_expired: formatDateForInput(d.tanggal_expired)
          }));
          setLicenseRows(formatted);
        }
      } else {
        alert('Gagal menyimpan data: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save license data:', error);
      alert('Terjadi kesalahan koneksi saat menyimpan data.');
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

  const getYearlyValue = (yr: string): number => {
    const yearRecs = allLicenseRecords.filter((rec) => rec.tahun === parseInt(yr, 10));
    if (yearRecs.length === 0) {
      if (yr === tahun) {
        return totalJumlah;
      }
      return 0;
    }
    let sum = 0;
    yearRecs.forEach((rec) => {
      sum += Number(rec.total_keseluruhan_lisensi) || 0;
    });
    return parseFloat((sum / yearRecs.length).toFixed(1));
  };

  const lineChartData: ChartData<'line'> = {
    labels: selectedYears,
    datasets: [
      {
        label: 'Jumlah Lisensi Aktif (Rata-rata Tahunan)',
        data: selectedYears.map((yr) => getYearlyValue(yr)),
        borderColor: '#f59e0b',
        backgroundColor: '#0f2e60',
        tension: 0.1,
        borderWidth: 3.5,
        pointRadius: 4.5,
        fill: false
      }
    ]
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
          <span className="text-xs text-slate-500 font-medium">Memuat Data Lisensi...</span>
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
          <h2 className="text-xl font-bold text-slate-800">Lisensi</h2>
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

      {/* Ringkasan Lisensi (Three Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Urgent Card */}
        <div 
          onClick={() => setActiveDetailView(activeDetailView === 'urgent' ? null : 'urgent')}
          className="bg-red-50 hover:bg-red-100/75 cursor-pointer rounded-xl p-5 flex flex-col gap-1 border border-red-200 transition-all shadow-sm"
        >
          <div className="text-red-700 font-bold text-xs uppercase tracking-wider">Urgent (&lt;= 2 Bulan)</div>
          <div className="text-3xl font-extrabold text-red-800 mt-2">{urgentLicenses.length}</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDetailView(activeDetailView === 'urgent' ? null : 'urgent');
            }}
            className="text-[10px] font-semibold text-red-600 mt-2 hover:underline flex items-center gap-1 text-left self-start"
          >
            Lihat Detail &rarr;
          </button>
        </div>

        {/* Peringatan Card */}
        <div 
          onClick={() => setActiveDetailView(activeDetailView === 'peringatan' ? null : 'peringatan')}
          className="bg-amber-50 hover:bg-amber-100/75 cursor-pointer rounded-xl p-5 flex flex-col gap-1 border border-amber-200 transition-all shadow-sm"
        >
          <div className="text-amber-700 font-bold text-xs uppercase tracking-wider">Peringatan (&gt; 2 - 4 Bulan)</div>
          <div className="text-3xl font-extrabold text-amber-800 mt-2">{warningLicenses.length}</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDetailView(activeDetailView === 'peringatan' ? null : 'peringatan');
            }}
            className="text-[10px] font-semibold text-amber-600 mt-2 hover:underline flex items-center gap-1 text-left self-start"
          >
            Lihat Detail &rarr;
          </button>
        </div>

        {/* Aman Card */}
        <div 
          onClick={() => setActiveDetailView(activeDetailView === 'aman' ? null : 'aman')}
          className="bg-[#0f2e60] hover:bg-[#0c244c] cursor-pointer rounded-xl p-5 flex flex-col gap-1 border border-[#0f2e60] transition-all shadow-sm"
        >
          <div className="text-white font-bold text-xs uppercase tracking-wider">Aman (&gt; 4 Bulan)</div>
          <div className="text-3xl font-extrabold text-white mt-2">{safeLicenses.length}</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveDetailView(activeDetailView === 'aman' ? null : 'aman');
            }}
            className="text-[10px] font-semibold text-white mt-2 hover:underline flex items-center gap-1 text-left self-start"
          >
            Lihat Detail &rarr;
          </button>
        </div>
      </div>

      {/* Expanded Area for Cards detail (Accordion table format) */}
      {activeDetailView && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary-900" />
              <h4 className="font-bold text-xs text-primary-900">
                Detail Lisensi:{' '}
                {activeDetailView === 'urgent'
                  ? 'Urgent (<= 2 Bulan)'
                  : activeDetailView === 'peringatan'
                  ? 'Peringatan (> 2 - 4 Bulan)'
                  : 'Aman (> 4 Bulan)'}
              </h4>
            </div>
            <button 
              onClick={() => setActiveDetailView(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Principle</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Nama Produk</th>
                  <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider text-center w-48">Exp Date</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                {(activeDetailView === 'urgent'
                  ? urgentLicenses
                  : activeDetailView === 'peringatan'
                  ? warningLicenses
                  : safeLicenses
                ).map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold border border-slate-200">
                      {row.principle}
                    </td>
                    <td className="py-2.5 px-4 border border-slate-200">
                      {row.nama_produk}
                    </td>
                    <td className="py-2.5 px-4 text-center border border-slate-200 font-mono">
                      {row.tanggal_expired || '-'}
                    </td>
                  </tr>
                ))}
                {(activeDetailView === 'urgent' ? urgentLicenses : activeDetailView === 'peringatan' ? warningLicenses : safeLicenses).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      Tidak ada lisensi dalam kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Entry Card (Adaptive Height) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-primary-900">Data Entri Lisensi</h3>
          <button 
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 bg-primary-900 text-white px-3 py-1.5 rounded font-semibold text-[10px] hover:bg-primary-800 transition-all shadow-sm uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Baris Baru
          </button>
        </div>
        
        <div className="overflow-x-auto h-auto p-4">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-16 text-center">NO</th>
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-40">Principle</th>
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider">Nama Produk</th>
                <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-24">Total</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-24">Satuan</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-36">Exp Date</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-48">Status</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider">Keterangan</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-16">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {licenseRows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="text"
                      value={row.principle}
                      onChange={(e) => handleRowChange(index, 'principle', e.target.value)}
                      placeholder="e.g. Check Point"
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="text"
                      value={row.nama_produk}
                      onChange={(e) => handleRowChange(index, 'nama_produk', e.target.value)}
                      placeholder="e.g. Insider Firewall"
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="number"
                      value={row.total_lisensi === 0 ? '' : row.total_lisensi}
                      onChange={(e) => handleRowChange(index, 'total_lisensi', parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      min="0"
                      className="w-full px-2 py-1 text-right text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none font-mono"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="text"
                      value={row.satuan || ''}
                      onChange={(e) => handleRowChange(index, 'satuan', e.target.value)}
                      placeholder="Unit"
                      className="w-full px-2 py-1 text-center text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="date"
                      value={row.tanggal_expired}
                      onChange={(e) => handleRowChange(index, 'tanggal_expired', e.target.value)}
                      className="w-full px-2 py-1 text-center text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none font-mono"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <select 
                      value={row.status}
                      onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    >
                      <option value="Aktif">Lisensi aktif</option>
                      <option value="Proses Renewal">Lisensi aktif, Proses Renewal</option>
                      <option value="Autodebet">Lisensi aktif, Autodebet</option>
                    </select>
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input 
                      type="text"
                      value={row.keterangan || ''}
                      onChange={(e) => handleRowChange(index, 'keterangan', e.target.value)}
                      placeholder="Catatan..."
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center border border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => handleDeleteRow(index)}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {licenseRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Belum ada data entri. Silakan tambah baris baru.
                  </td>
                </tr>
              )}
              
              {/* Total Row */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td className="py-2.5 px-4 text-right border border-slate-200" colSpan={3}>
                  TOTAL LISENSI
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-primary-900 border border-slate-200 text-sm">
                  {totalJumlah}
                </td>
                <td colSpan={6} className="py-2.5 px-4 border border-slate-200"></td>
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
                const monthNum = monthsNumMap[bulan] || 1;
                fetch(`http://localhost:5000/api/licenses?bulan=${monthNum}&tahun=${tahun}`)
                  .then(res => res.json())
                  .then(result => {
                    if (result.success && result.data && Array.isArray(result.data.detail_lisensi)) {
                      const formatted = result.data.detail_lisensi.map((d: any) => ({
                        ...d,
                        satuan: d.satuan || 'Unit',
                        keterangan: d.keterangan || '',
                        tanggal_expired: formatDateForInput(d.tanggal_expired)
                      }));
                      setLicenseRows(formatted);
                    } else {
                      setLicenseRows([]);
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

      {/* YTD Line Chart Card (Positioned directly below action buttons, with fixed minHeight wrapper) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <h3 className="text-xs font-semibold text-slate-800">Performa Year to Date (YTD)</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Tren Jumlah Lisensi Aktif</p>
          </div>
          
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
        
        <div className="w-full p-4" style={{ minHeight: '400px', position: 'relative' }}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Konfirmasi Penyimpanan"
        message={`Apakah Anda yakin ingin menyimpan perubahan data lisensi untuk periode ${bulan} ${tahun}?`}
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

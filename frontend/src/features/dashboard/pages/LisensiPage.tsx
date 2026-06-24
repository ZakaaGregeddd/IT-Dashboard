import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertTriangle, Plus, Trash2, X, AlertCircle, Settings } from 'lucide-react';
import { setIsDirtyCheck } from '@/utils/navigation';
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
  catatan?: string;
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

interface AutoResizeTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Adding a small padding offset so text doesn't feel cramped
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={className}
      style={{ overflowY: 'hidden', resize: 'none' }}
    />
  );
};

export const LisensiPage: React.FC = () => {
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
  // Expanded table checklist-based filtering states (Nama & Exp Date)
  const [enableNameFilter, setEnableNameFilter] = useState(false);
  const [enableDateFilter, setEnableDateFilter] = useState(false);
  const [detailSearchName, setDetailSearchName] = useState('');
  const [detailStartDate, setDetailStartDate] = useState('');
  const [detailEndDate, setDetailEndDate] = useState('');
  const [nameSortOrder, setNameSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [dateSortOrder, setDateSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Configuration state variables with localStorage persistence
  const [urgentLimit, setUrgentLimit] = useState<number>(() => {
    const saved = localStorage.getItem('lisensi_urgentLimit');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [warningLimit, setWarningLimit] = useState<number>(() => {
    const saved = localStorage.getItem('lisensi_warningLimit');
    return saved ? parseInt(saved, 10) : 4;
  });
  const detailRowsPerPage = (() => {
    const saved = localStorage.getItem('lisensi_detailRowsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  })();
  const entryRowsPerPage = (() => {
    const saved = localStorage.getItem('lisensi_entryRowsPerPage');
    return saved ? parseInt(saved, 10) : 10;
  })();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Entry table pagination states
  const [entryCurrentPage, setEntryCurrentPage] = useState(1);
  const [entryPageInput, setEntryPageInput] = useState(entryCurrentPage.toString());

  const [isLoading, setIsLoading] = useState(true);

  // Detail table pagination state
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailPageInput, setDetailPageInput] = useState(detailCurrentPage.toString());

  useEffect(() => {
    setEntryPageInput(entryCurrentPage.toString());
  }, [entryCurrentPage]);

  useEffect(() => {
    setDetailPageInput(detailCurrentPage.toString());
  }, [detailCurrentPage]);

  // Entry table checklist-based filtering states (Nama, Exp Date, Status)
  const [entryEnableNameFilter, setEntryEnableNameFilter] = useState(false);
  const [entryEnableDateFilter, setEntryEnableDateFilter] = useState(false);
  const [entryEnableStatusFilter, setEntryEnableStatusFilter] = useState(false);
  const [entrySearchName, setEntrySearchName] = useState('');
  const [entryStartDate, setEntryStartDate] = useState('');
  const [entryEndDate, setEntryEndDate] = useState('');
  const [entrySearchStatus, setEntrySearchStatus] = useState('Semua');
  const [entryNameSortOrder, setEntryNameSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [entryDateSortOrder, setEntryDateSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Reset detail filters when active detail view changes
  useEffect(() => {
    setEnableNameFilter(false);
    setEnableDateFilter(false);
    setDetailSearchName('');
    setDetailStartDate('');
    setDetailEndDate('');
    setNameSortOrder(null);
    setDateSortOrder(null);
    setDetailCurrentPage(1);
  }, [activeDetailView]);

  // Reset detail page to 1 when filters, sorting or limits change
  useEffect(() => {
    setDetailCurrentPage(1);
  }, [detailSearchName, detailStartDate, detailEndDate, nameSortOrder, dateSortOrder, detailRowsPerPage]);

  // Reset entry pagination page to 1 when filters or sorting change
  useEffect(() => {
    setEntryCurrentPage(1);
  }, [entrySearchName, entryStartDate, entryEndDate, entrySearchStatus, entryNameSortOrder, entryDateSortOrder, entryEnableNameFilter, entryEnableDateFilter, entryEnableStatusFilter]);

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
            catatan: d.catatan || '',
            tanggal_expired: formatDateForInput(d.tanggal_expired)
          }));
          setLicenseRows(formatted);
          setIsDirty(false);
        } else {
          setLicenseRows([]);
          setIsDirty(false);
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

  // Categorize rows based on dynamic thresholds
  const urgentLicenses = licenseRows.filter((r) => getMonthDifference(r.tanggal_expired) <= urgentLimit);
  const warningLicenses = licenseRows.filter((r) => {
    const diff = getMonthDifference(r.tanggal_expired);
    return diff > urgentLimit && diff <= warningLimit;
  });
  const safeLicenses = licenseRows.filter((r) => getMonthDifference(r.tanggal_expired) > warningLimit);

  // Compute live total
  const totalJumlah = licenseRows.reduce((acc, row) => acc + (row.total_lisensi || 0), 0);

  // Table row editing handlers (using unique urutan identifier for paginated/filtered list)
  const handleRowChangeByUrutan = (urutan: number, field: keyof LicenseDetail, val: any) => {
    setIsDirty(true);
    setLicenseRows((prev) => {
      return prev.map((row) => {
        if (row.urutan === urutan) {
          return { ...row, [field]: val };
        }
        return row;
      });
    });
  };

  // Add row (initialize with empty/blank values to allow user typing)
  // Resets filters and paginates to the last page so the new row is immediately visible
  const handleAddRow = () => {
    setIsDirty(true);
    setEntryEnableNameFilter(false);
    setEntryEnableDateFilter(false);
    setEntryEnableStatusFilter(false);
    setEntrySearchName('');
    setEntryStartDate('');
    setEntryEndDate('');
    setEntrySearchStatus('Semua');
    setEntryNameSortOrder(null);
    setEntryDateSortOrder(null);

    setLicenseRows((prev) => {
      const updated = [
        ...prev,
        {
          urutan: prev.length + 1,
          principle: '',
          nama_produk: '',
          total_lisensi: 0,
          satuan: 'Unit',
          tanggal_expired: '',
          status: 'Aktif',
          catatan: ''
        }
      ];
      // Automatically navigate to the new last page
      const lastPage = Math.ceil(updated.length / entryRowsPerPage);
      setEntryCurrentPage(lastPage);
      return updated;
    });
  };

  // Delete row by unique urutan identifier
  const handleDeleteRowByUrutan = (urutan: number) => {
    setIsDirty(true);
    setLicenseRows((prev) => {
      const updated = prev.filter((row) => row.urutan !== urutan);
      // Re-map the urutan sequential numbering
      const remapped = updated.map((item, idx) => ({ ...item, urutan: idx + 1 }));
      
      // Ensure the current page does not exceed the new total pages
      const totalPages = Math.ceil(remapped.length / entryRowsPerPage) || 1;
      if (entryCurrentPage > totalPages) {
        setEntryCurrentPage(totalPages);
      }
      return remapped;
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
        status: row.status,
        catatan: row.catatan || ''
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
        setIsDirty(false);
        setTimeout(() => setShowToast(false), 3000);
        fetchAllHistoricalData();
        if (result.data) {
          const formatted = (result.data.detail_lisensi || []).map((d: any) => ({
            ...d,
            satuan: d.satuan || 'Unit',
            catatan: d.catatan || '',
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

  const getFilteredDetailRows = () => {
    let rows = activeDetailView === 'urgent'
      ? urgentLicenses
      : activeDetailView === 'peringatan'
        ? warningLicenses
        : safeLicenses;

    // 1. Filter by Name (if enabled and text entered)
    if (enableNameFilter && detailSearchName.trim() !== '') {
      const q = detailSearchName.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.nama_produk || '').toLowerCase().includes(q) ||
          (r.principle || '').toLowerCase().includes(q)
      );
    }

    // 2. Filter by Exp Date range (if enabled and dates entered)
    if (enableDateFilter) {
      if (detailStartDate) {
        const start = new Date(detailStartDate).getTime();
        rows = rows.filter((r) => {
          const exp = new Date(r.tanggal_expired).getTime();
          return exp >= start;
        });
      }
      if (detailEndDate) {
        const end = new Date(detailEndDate).getTime();
        rows = rows.filter((r) => {
          const exp = new Date(r.tanggal_expired).getTime();
          return exp <= end;
        });
      }
    }
    // 3. Apply sorting
    const sorted = [...rows];
    if (nameSortOrder || dateSortOrder) {
      sorted.sort((a, b) => {
        if (dateSortOrder && nameSortOrder) {
          // Primary: Date, Secondary: Name
          const dateA = a.tanggal_expired ? new Date(a.tanggal_expired).getTime() : 0;
          const dateB = b.tanggal_expired ? new Date(b.tanggal_expired).getTime() : 0;
          if (dateA !== dateB) {
            return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
          const nameA = (a.nama_produk || '').toLowerCase();
          const nameB = (b.nama_produk || '').toLowerCase();
          return nameSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (dateSortOrder) {
          const dateA = a.tanggal_expired ? new Date(a.tanggal_expired).getTime() : 0;
          const dateB = b.tanggal_expired ? new Date(b.tanggal_expired).getTime() : 0;
          return dateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (nameSortOrder) {
          const nameA = (a.nama_produk || '').toLowerCase();
          const nameB = (b.nama_produk || '').toLowerCase();
          return nameSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        return 0;
      });
      return sorted;
    }
    return rows;
  };

  const filteredDetailRows = getFilteredDetailRows();
  const totalDetailPages = Math.ceil(filteredDetailRows.length / detailRowsPerPage) || 1;
  const detailStartIndex = (detailCurrentPage - 1) * detailRowsPerPage;
  const paginatedDetailRows = filteredDetailRows.slice(detailStartIndex, detailStartIndex + detailRowsPerPage);

  // Helper to filter and sort the license entry table
  const getFilteredEntryRows = () => {
    let rows = [...licenseRows];

    // 1. Filter by Name (if enabled and text entered)
    if (entryEnableNameFilter && entrySearchName.trim() !== '') {
      const q = entrySearchName.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.nama_produk || '').toLowerCase().includes(q) ||
          (r.principle || '').toLowerCase().includes(q)
      );
    }

    // 2. Filter by Exp Date range (if enabled and dates entered)
    if (entryEnableDateFilter) {
      if (entryStartDate) {
        const start = new Date(entryStartDate).getTime();
        rows = rows.filter((r) => {
          const exp = new Date(r.tanggal_expired).getTime();
          return exp >= start;
        });
      }
      if (entryEndDate) {
        const end = new Date(entryEndDate).getTime();
        rows = rows.filter((r) => {
          const exp = new Date(r.tanggal_expired).getTime();
          return exp <= end;
        });
      }
    }

    // 3. Filter by Status (if enabled)
    if (entryEnableStatusFilter && entrySearchStatus !== 'Semua') {
      rows = rows.filter((r) => r.status === entrySearchStatus);
    }

    // 4. Apply sorting
    const sorted = [...rows];
    if (entryNameSortOrder || entryDateSortOrder) {
      sorted.sort((a, b) => {
        if (entryDateSortOrder && entryNameSortOrder) {
          // Primary: Date, Secondary: Name
          const dateA = a.tanggal_expired ? new Date(a.tanggal_expired).getTime() : 0;
          const dateB = b.tanggal_expired ? new Date(b.tanggal_expired).getTime() : 0;
          if (dateA !== dateB) {
            return entryDateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          }
          const nameA = (a.nama_produk || '').toLowerCase();
          const nameB = (b.nama_produk || '').toLowerCase();
          return entryNameSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (entryDateSortOrder) {
          const dateA = a.tanggal_expired ? new Date(a.tanggal_expired).getTime() : 0;
          const dateB = b.tanggal_expired ? new Date(b.tanggal_expired).getTime() : 0;
          return entryDateSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (entryNameSortOrder) {
          const nameA = (a.nama_produk || '').toLowerCase();
          const nameB = (b.nama_produk || '').toLowerCase();
          return entryNameSortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        return 0;
      });
      return sorted;
    }

    return rows;
  };

  const filteredEntryRows = getFilteredEntryRows();
  const totalEntryPages = Math.ceil(filteredEntryRows.length / entryRowsPerPage) || 1;
  
  // Slice to get the current page's rows
  const entryStartIndex = (entryCurrentPage - 1) * entryRowsPerPage;
  const paginatedEntryRows = filteredEntryRows.slice(entryStartIndex, entryStartIndex + entryRowsPerPage);

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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Lisensi</h2>
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-250 text-slate-700 px-3.5 py-2 rounded-lg font-semibold text-xs hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            title="Pengaturan Parameter & Tabel"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Pengaturan</span>
          </button>
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
          <div className="text-red-700 font-bold text-xs uppercase tracking-wider">Urgent (&lt;= {urgentLimit} Bulan)</div>
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
          <div className="text-amber-700 font-bold text-xs uppercase tracking-wider">Peringatan (&gt; {urgentLimit} - {warningLimit} Bulan)</div>
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
          <div className="text-white font-bold text-xs uppercase tracking-wider">Aman (&gt; {warningLimit} Bulan)</div>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-150 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary-900 animate-pulse" />
              <h4 className="font-bold text-sm text-primary-900">
                Detail Kategori:{' '}
                {activeDetailView === 'urgent'
                  ? `Urgent (<= ${urgentLimit} Bulan)`
                  : activeDetailView === 'peringatan'
                    ? `Peringatan (> ${urgentLimit} - ${warningLimit} Bulan)`
                    : `Aman (> ${warningLimit} Bulan)`}
              </h4>
            </div>
            <button
              onClick={() => setActiveDetailView(null)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table Filters Checklist Bar */}
          <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Checklist & Sorting Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
              {/* Left: Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Filter:</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableNameFilter}
                    onChange={(e) => {
                      setEnableNameFilter(e.target.checked);
                      if (!e.target.checked) {
                        setDetailSearchName('');
                      }
                    }}
                    className="rounded border-slate-300 text-primary-900 focus:ring-primary-900 w-4 h-4"
                  />
                  <span>Nama</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableDateFilter}
                    onChange={(e) => {
                      setEnableDateFilter(e.target.checked);
                      if (!e.target.checked) {
                        setDetailStartDate('');
                        setDetailEndDate('');
                      }
                    }}
                    className="rounded border-slate-300 text-primary-900 focus:ring-primary-900 w-4 h-4"
                  />
                  <span>Exp Date</span>
                </label>

                {(enableNameFilter || enableDateFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEnableNameFilter(false);
                      setEnableDateFilter(false);
                      setDetailSearchName('');
                      setDetailStartDate('');
                      setDetailEndDate('');
                    }}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors ml-2"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Right: Sorting (Always Visible!) */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Urutkan:</span>
                
                {/* Sort Nama */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Nama</span>
                  <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 h-[28px] items-center">
                    <button
                      type="button"
                      onClick={() => setNameSortOrder(nameSortOrder === 'asc' ? null : 'asc')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                        nameSortOrder === 'asc'
                          ? 'bg-[#0f2e60] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Urutkan A-Z"
                    >
                      A-Z
                    </button>
                    <button
                      type="button"
                      onClick={() => setNameSortOrder(nameSortOrder === 'desc' ? null : 'desc')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                        nameSortOrder === 'desc'
                          ? 'bg-[#0f2e60] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Urutkan Z-A"
                    >
                      Z-A
                    </button>
                  </div>
                </div>

                {/* Sort Exp Date */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Exp Date</span>
                  <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 h-[28px] items-center">
                    <button
                      type="button"
                      onClick={() => setDateSortOrder(dateSortOrder === 'asc' ? null : 'asc')}
                      className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                        dateSortOrder === 'asc'
                          ? 'bg-[#0f2e60] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Urutkan Exp Date Terdekat"
                    >
                      Terdekat
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateSortOrder(dateSortOrder === 'desc' ? null : 'desc')}
                      className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                        dateSortOrder === 'desc'
                          ? 'bg-[#0f2e60] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="Urutkan Exp Date Terjauh"
                    >
                      Terjauh
                    </button>
                  </div>
                </div>

                {(nameSortOrder || dateSortOrder) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameSortOrder(null);
                      setDateSortOrder(null);
                    }}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors"
                  >
                    Reset Sort
                  </button>
                )}
              </div>
            </div>

            {/* Conditionally Rendered Inputs Row */}
            {(enableNameFilter || enableDateFilter) && (
              <div className="flex flex-wrap items-end gap-4 border-t border-slate-200/60 pt-3 mt-1">
                {/* Name Filter Input */}
                {enableNameFilter && (
                  <div className="flex-1 min-w-[280px] flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pencarian Nama</span>
                    <input
                      type="text"
                      value={detailSearchName}
                      onChange={(e) => setDetailSearchName(e.target.value)}
                      placeholder="Cari nama produk / principle..."
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full transition-all"
                    />
                  </div>
                )}

                {/* Date Range Filter Inputs */}
                {enableDateFilter && (
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mulai Tanggal</span>
                        <input
                          type="date"
                          value={detailStartDate}
                          onChange={(e) => setDetailStartDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono"
                        />
                      </div>
                      <span className="text-slate-400 text-xs mt-4">s.d</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Sampai Tanggal</span>
                        <input
                          type="date"
                          value={detailEndDate}
                          onChange={(e) => setDetailEndDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 border-r border-slate-200 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="py-3 px-4 border-r border-slate-200 uppercase tracking-wider">Principle</th>
                  <th className="py-3 px-4 border-r border-slate-200 uppercase tracking-wider">Nama Produk</th>
                  <th className="py-3 px-4 border-r border-slate-200 uppercase tracking-wider text-center w-44">Status</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-center w-48">Exp Date</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-150 bg-white">
                {paginatedDetailRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-center border-r border-slate-200 text-slate-400 font-medium">
                      {detailStartIndex + index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold border-r border-slate-200">
                      {row.principle}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200">
                      {row.nama_produk}
                    </td>
                    <td className="py-2.5 px-4 border-r border-slate-200 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : row.status === 'Proses Renewal'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-600">
                      {row.tanggal_expired || '-'}
                    </td>
                  </tr>
                ))}
                {paginatedDetailRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-slate-400 font-medium">
                      {detailSearchName ? 'Tidak ada data lisensi yang cocok dengan pencarian Anda.' : 'Tidak ada data lisensi dalam kategori ini.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail Table Pagination Controls */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <button
                type="button"
                disabled={detailCurrentPage === 1}
                onClick={() => setDetailCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
              >
                &larr; Prev
              </button>
              <div className="flex items-center gap-1 text-slate-600 font-bold">
                <span>Halaman</span>
                <input
                  type="number"
                  min={1}
                  max={totalDetailPages}
                  value={detailPageInput}
                  onChange={(e) => {
                    const valStr = e.target.value;
                    setDetailPageInput(valStr);
                    const val = parseInt(valStr, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalDetailPages) {
                      setDetailCurrentPage(val);
                    }
                  }}
                  onBlur={() => {
                    setDetailPageInput(detailCurrentPage.toString());
                  }}
                  className="w-12 text-center bg-white border border-slate-200 rounded py-1 px-1.5 font-bold focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span>dari {totalDetailPages}</span>
              </div>
              <button
                type="button"
                disabled={detailCurrentPage === totalDetailPages}
                onClick={() => setDetailCurrentPage((p) => Math.min(p + 1, totalDetailPages))}
                className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
              >
                Next &rarr;
              </button>
              <span className="text-[10px] font-normal text-slate-400 ml-2">
                (Menampilkan {paginatedDetailRows.length} dari {filteredDetailRows.length} data detail)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Entry Card (Adaptive Height with Filters and Pagination) */}
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

        {/* Entry Table Checklist Filters Bar */}
        <div className="flex flex-col gap-3 bg-slate-50/50 p-4 border-b border-slate-150">
          {/* Checklist & Sorting Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
            {/* Left: Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Filter:</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entryEnableNameFilter}
                  onChange={(e) => {
                    setEntryEnableNameFilter(e.target.checked);
                    if (!e.target.checked) {
                      setEntrySearchName('');
                    }
                  }}
                  className="rounded border-slate-300 text-primary-900 focus:ring-primary-900 w-4 h-4"
                />
                <span>Nama</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entryEnableDateFilter}
                  onChange={(e) => {
                    setEntryEnableDateFilter(e.target.checked);
                    if (!e.target.checked) {
                      setEntryStartDate('');
                      setEntryEndDate('');
                    }
                  }}
                  className="rounded border-slate-300 text-primary-900 focus:ring-primary-900 w-4 h-4"
                />
                <span>Exp Date</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entryEnableStatusFilter}
                  onChange={(e) => {
                    setEntryEnableStatusFilter(e.target.checked);
                    if (!e.target.checked) {
                      setEntrySearchStatus('Semua');
                    }
                  }}
                  className="rounded border-slate-300 text-primary-900 focus:ring-primary-900 w-4 h-4"
                />
                <span>Status</span>
              </label>

              {(entryEnableNameFilter || entryEnableDateFilter || entryEnableStatusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setEntryEnableNameFilter(false);
                    setEntryEnableDateFilter(false);
                    setEntryEnableStatusFilter(false);
                    setEntrySearchName('');
                    setEntryStartDate('');
                    setEntryEndDate('');
                    setEntrySearchStatus('Semua');
                  }}
                  className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors ml-2"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Right: Sorting (Always Visible!) */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Urutkan:</span>
              
              {/* Sort Nama */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Nama</span>
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 h-[28px] items-center">
                  <button
                    type="button"
                    onClick={() => setEntryNameSortOrder(entryNameSortOrder === 'asc' ? null : 'asc')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                      entryNameSortOrder === 'asc'
                        ? 'bg-[#0f2e60] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Urutkan A-Z"
                  >
                    A-Z
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryNameSortOrder(entryNameSortOrder === 'desc' ? null : 'desc')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                      entryNameSortOrder === 'desc'
                        ? 'bg-[#0f2e60] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Urutkan Z-A"
                  >
                    Z-A
                  </button>
                </div>
              </div>

              {/* Sort Exp Date */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Exp Date</span>
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 h-[28px] items-center">
                  <button
                    type="button"
                    onClick={() => setEntryDateSortOrder(entryDateSortOrder === 'asc' ? null : 'asc')}
                    className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                      entryDateSortOrder === 'asc'
                        ? 'bg-[#0f2e60] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Urutkan Exp Date Terdekat"
                  >
                    Terdekat
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryDateSortOrder(entryDateSortOrder === 'desc' ? null : 'desc')}
                    className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all h-full flex items-center ${
                      entryDateSortOrder === 'desc'
                        ? 'bg-[#0f2e60] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title="Urutkan Exp Date Terjauh"
                  >
                    Terjauh
                  </button>
                </div>
              </div>

              {(entryNameSortOrder || entryDateSortOrder) && (
                <button
                  type="button"
                  onClick={() => {
                    setEntryNameSortOrder(null);
                    setEntryDateSortOrder(null);
                  }}
                  className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Reset Sort
                </button>
              )}
            </div>
          </div>
 
          {/* Conditionally Rendered Inputs Row */}
          {(entryEnableNameFilter || entryEnableDateFilter || entryEnableStatusFilter) && (
            <div className="flex flex-wrap items-end gap-4 border-t border-slate-200/60 pt-3 mt-1">
              {/* Name Filter Input */}
              {entryEnableNameFilter && (
                <div className="flex-1 min-w-[280px] flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pencarian Nama</span>
                  <input
                    type="text"
                    value={entrySearchName}
                    onChange={(e) => setEntrySearchName(e.target.value)}
                    placeholder="Cari nama produk / principle..."
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full transition-all"
                  />
                </div>
              )}
 
              {/* Date Range Filter Inputs */}
              {entryEnableDateFilter && (
                <div className="flex items-end gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mulai Tanggal</span>
                      <input
                        type="date"
                        value={entryStartDate}
                        onChange={(e) => setEntryStartDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono"
                      />
                    </div>
                    <span className="text-slate-400 text-xs mt-4">s.d</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Sampai Tanggal</span>
                      <input
                        type="date"
                        value={entryEndDate}
                        onChange={(e) => setEntryEndDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
 
              {/* Status Filter Dropdown */}
              {entryEnableStatusFilter && (
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Filter Status</span>
                  <select
                    value={entrySearchStatus}
                    onChange={(e) => setEntrySearchStatus(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full transition-all"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Lisensi aktif</option>
                    <option value="Proses Renewal">Lisensi aktif, Proses Renewal</option>
                    <option value="Autodebet">Lisensi aktif, Autodebet</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto h-auto p-4">
          <table className="w-full min-w-[1650px] text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500">
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-20 text-center">NO. URUTAN</th>
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-[320px]">Principle</th>
                <th className="py-2.5 px-4 border border-slate-200 uppercase tracking-wider w-[400px]">Nama Produk</th>
                <th className="py-2.5 px-4 border border-slate-200 text-right uppercase tracking-wider w-24">Total</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-24">Satuan</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-36">Exp Date</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-[280px]">Status</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-[500px]">Catatan</th>
                <th className="py-2.5 px-4 border border-slate-200 text-center uppercase tracking-wider w-16">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
              {paginatedEntryRows.map((row) => (
                <tr key={row.urutan} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-2.5 px-4 text-center border border-slate-200 text-slate-400 font-medium">
                    {row.urutan}
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <AutoResizeTextarea
                      value={row.principle}
                      onChange={(val) => handleRowChangeByUrutan(row.urutan, 'principle', val)}
                      placeholder="e.g. Check Point"
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <AutoResizeTextarea
                      value={row.nama_produk}
                      onChange={(val) => handleRowChangeByUrutan(row.urutan, 'nama_produk', val)}
                      placeholder="e.g. Insider Firewall"
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input
                      type="number"
                      value={row.total_lisensi === 0 ? '' : row.total_lisensi}
                      onChange={(e) => handleRowChangeByUrutan(row.urutan, 'total_lisensi', parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      min="0"
                      className="w-full px-2 py-1 text-right text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none font-mono"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input
                      type="text"
                      value={row.satuan || ''}
                      onChange={(e) => handleRowChangeByUrutan(row.urutan, 'satuan', e.target.value)}
                      placeholder="Unit"
                      className="w-full px-2 py-1 text-center text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <input
                      type="date"
                      value={row.tanggal_expired}
                      onChange={(e) => handleRowChangeByUrutan(row.urutan, 'tanggal_expired', e.target.value)}
                      className="w-full px-2 py-1 text-center text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none font-mono"
                    />
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <select
                      value={row.status}
                      onChange={(e) => handleRowChangeByUrutan(row.urutan, 'status', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    >
                      <option value="Aktif">Lisensi aktif</option>
                      <option value="Proses Renewal">Lisensi aktif, Proses Renewal</option>
                      <option value="Autodebet">Lisensi aktif, Autodebet</option>
                    </select>
                  </td>
                  <td className="py-1 px-2 border border-slate-200">
                    <AutoResizeTextarea
                      value={row.catatan || ''}
                      onChange={(val) => handleRowChangeByUrutan(row.urutan, 'catatan', val)}
                      placeholder="Catatan..."
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 bg-white outline-none"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleDeleteRowByUrutan(row.urutan)}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedEntryRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    {entrySearchName || entryStartDate || entryEndDate || entrySearchStatus !== 'Semua'
                      ? 'Tidak ada data entri yang cocok dengan filter Anda.'
                      : 'Belum ada data entri. Silakan tambah baris baru.'}
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

        {/* Form Actions with Pagination */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/40 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Pagination Controls */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <button
              type="button"
              disabled={entryCurrentPage === 1}
              onClick={() => setEntryCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
            >
              &larr; Prev
            </button>
            <div className="flex items-center gap-1 text-slate-600 font-bold">
              <span>Halaman</span>
              <input
                type="number"
                min={1}
                max={totalEntryPages}
                value={entryPageInput}
                onChange={(e) => {
                  const valStr = e.target.value;
                  setEntryPageInput(valStr);
                  const val = parseInt(valStr, 10);
                  if (!isNaN(val) && val >= 1 && val <= totalEntryPages) {
                    setEntryCurrentPage(val);
                  }
                }}
                onBlur={() => {
                  setEntryPageInput(entryCurrentPage.toString());
                }}
                className="w-12 text-center bg-white border border-slate-200 rounded py-1 px-1.5 font-bold focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span>dari {totalEntryPages}</span>
            </div>
            <button
              type="button"
              disabled={entryCurrentPage === totalEntryPages}
              onClick={() => setEntryCurrentPage((p) => Math.min(p + 1, totalEntryPages))}
              className="px-3 py-1.5 rounded border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-[11px]"
            >
              Next &rarr;
            </button>
            <span className="text-[10px] font-normal text-slate-400 ml-2">
              (Menampilkan {paginatedEntryRows.length} dari {filteredEntryRows.length} data entri)
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                // Clear filters
                setEntryEnableNameFilter(false);
                setEntryEnableDateFilter(false);
                setEntryEnableStatusFilter(false);
                setEntrySearchName('');
                setEntryStartDate('');
                setEntryEndDate('');
                setEntrySearchStatus('Semua');
                setEntryNameSortOrder(null);
                setEntryDateSortOrder(null);
                setEntryCurrentPage(1);

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
                      setIsDirty(false);
                    } else {
                      setLicenseRows([]);
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

      {/* Configuration Settings Modal */}
      <ConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        urgentLimit={urgentLimit}
        warningLimit={warningLimit}
        onSave={(urgent, warning) => {
          setUrgentLimit(urgent);
          setWarningLimit(warning);
          
          localStorage.setItem('lisensi_urgentLimit', urgent.toString());
          localStorage.setItem('lisensi_warningLimit', warning.toString());
          
          setIsConfigModalOpen(false);
        }}
      />

    </div>
  );
};

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  urgentLimit: number;
  warningLimit: number;
  onSave: (urgent: number, warning: number) => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  urgentLimit,
  warningLimit,
  onSave,
}) => {
  const [tempUrgent, setTempUrgent] = useState(urgentLimit);
  const [tempWarning, setTempWarning] = useState(warningLimit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempUrgent(urgentLimit);
      setTempWarning(warningLimit);
      setError('');
    }
  }, [isOpen, urgentLimit, warningLimit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUrgent <= 0 || tempWarning <= 0) {
      setError('Semua nilai harus berupa angka positif lebih besar dari 0.');
      return;
    }
    if (tempWarning <= tempUrgent) {
      setError('Batas Peringatan harus lebih besar dari Batas Urgent.');
      return;
    }
    setError('');
    onSave(tempUrgent, tempWarning);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2 text-primary-900">
            <Settings className="w-5 h-5" />
            <h4 className="font-bold text-sm">Pengaturan Parameter Kategori</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-1 uppercase tracking-wide text-[10px] text-slate-500">
              Masa Berlaku Kategori (Bulan)
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Batas Kategori Urgent</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">&lt;=</span>
                  <input
                    type="number"
                    value={tempUrgent}
                    onChange={(e) => setTempUrgent(parseInt(e.target.value, 10) || 0)}
                    min="1"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono font-bold text-slate-700"
                  />
                  <span className="text-slate-500">Bln</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-600">Batas Kategori Peringatan</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">&lt;=</span>
                  <input
                    type="number"
                    value={tempWarning}
                    onChange={(e) => setTempWarning(parseInt(e.target.value, 10) || 0)}
                    min="1"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none font-mono font-bold text-slate-700"
                  />
                  <span className="text-slate-500">Bln</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Kategori Aman otomatis diset jika masa berlaku lebih dari batas Peringatan (&gt; {tempWarning} bulan).
            </p>
          </div>

          <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors uppercase tracking-wider text-[10px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-primary-900 text-white px-5 py-2 rounded font-semibold hover:bg-primary-800 transition-all shadow-sm uppercase tracking-wider text-[10px]"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
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
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors uppercase tracking-wider text-[10px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-primary-900 text-white px-5 py-2 rounded font-semibold hover:bg-primary-800 transition-all shadow-sm uppercase tracking-wider text-[10px]"
          >
            Ya, Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

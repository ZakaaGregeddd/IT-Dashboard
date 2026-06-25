import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Play, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import * as XLSX from 'xlsx';

interface ParsedSheet {
  sheetName: string;
  category: string;
  month: number;
  year: number;
  headers: string[];
  rows: any[][]; // original rows as raw 2D arrays
  mappedData: any[]; // mapped rows as objects
  status: 'success' | 'warning' | 'error';
  errorMessage?: string;
  columnMapping: Record<string, string>; // targetField -> excelColumnName
}

const CATEGORIES = [
  { id: 'PROGRAM_KERJA', name: 'Realisasi Program Kerja TI', api: 'http://localhost:5000/api/program-kerja', periodType: 'MONTH_YEAR' },
  { id: 'RKAP', name: 'Realisasi RKAP TI', api: 'http://localhost:5000/api/rkap', periodType: 'MONTH_YEAR' },
  { id: 'SDM', name: 'SDM IT (Outsource & Pegawai)', api: 'http://localhost:5000/api/sdm', periodType: 'MONTH_YEAR' },
  { id: 'LISENSI', name: 'Lisensi', api: 'http://localhost:5000/api/licenses', periodType: 'MONTH_YEAR' },
  { id: 'KETERSEDIAAN_SCMC', name: 'Ketersediaan SCMC', api: 'http://localhost:5000/api/ketersediaan/scmc', periodType: 'MONTH_YEAR' },
  { id: 'KETERSEDIAAN_KEAMANAN', name: 'Ketersediaan Keamanan Informasi', api: 'http://localhost:5000/api/ketersediaan/keamanan', periodType: 'MONTH_YEAR' },
  { id: 'KETERSEDIAAN_SISTEM', name: 'Tingkat Ketersediaan Sistem', api: 'http://localhost:5000/api/ketersediaan/sistem', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_BANDWIDTH', name: 'Rata-rata Utilisasi Bandwidth Jaringan', api: 'http://localhost:5000/api/utilisasi/bandwidth', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_CPU_SERVER', name: 'Utilisasi CPU Server', api: 'http://localhost:5000/api/utilisasi/cpu', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_MEMORY_SERVER', name: 'Utilisasi Memory Server', api: 'http://localhost:5000/api/utilisasi/memory', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_STORAGE_SERVER', name: 'Utilisasi Storage Server', api: 'http://localhost:5000/api/utilisasi/storage', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_CPU_APP', name: 'Utilisasi CPU Aplikasi', api: 'http://localhost:5000/api/utilisasi/cpu-app', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_MEMORY_APP', name: 'Utilisasi Memory Aplikasi', api: 'http://localhost:5000/api/utilisasi/memory-app', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_CPU_DB', name: 'Utilisasi CPU Database Aplikasi', api: 'http://localhost:5000/api/utilisasi/cpu-database', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_MEMORY_DB', name: 'Utilisasi Memory Database Aplikasi', api: 'http://localhost:5000/api/utilisasi/memory-database', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_STORAGE_DB', name: 'Utilisasi Storage Database Aplikasi', api: 'http://localhost:5000/api/utilisasi/storage-database', periodType: 'MONTH_YEAR' },
  { id: 'UTILISASI_WAN_BACKUP', name: 'Utilisasi WAN Backup', api: 'http://localhost:5000/api/utilisasi/wan-backup', periodType: 'MONTH_YEAR' },
  { id: 'PC_SUPPORT', name: 'Penyelesaian Pekerjaan PC Support', api: 'http://localhost:5000/api/work-order/pc-support', periodType: 'YEAR_ONLY' },
  { id: 'LAYANAN_APLIKASI', name: 'Penyelesaian Permintaan Layanan Aplikasi TI', api: 'http://localhost:5000/api/work-order/layanan-app', periodType: 'YEAR_ONLY' },
  { id: 'LAYANAN_OPERASIONAL', name: 'Penyelesaian Permintaan Layanan TI di Operasional TI', api: 'http://localhost:5000/api/work-order/operasional', periodType: 'YEAR_ONLY' },
  { id: 'RESTORE', name: 'Realisasi Restore Ellipse dan Email', api: 'http://localhost:5000/api/work-order/restore', periodType: 'YEAR_ONLY' }
];

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const FIELD_ALIASES: Record<string, { label: string; aliases: string[] }> = {
  nama_program: { label: 'Nama Program', aliases: ['nama program', 'program', 'nama_program'] },
  target_persen: { label: 'Target (%)', aliases: ['target', 'target (%)', 'target_persen', 'rencana', 'plan'] },
  realisasi_persen: { label: 'Realisasi (%)', aliases: ['realisasi', 'realisasi (%)', 'realisasi_persen', 'aktual', 'actual'] },
  realisasi_nominal: { label: 'Realisasi (Rp)', aliases: ['realisasi', 'realisasi (rp)', 'nominal', 'nilai', 'realisasi nominal'] },
  cost_reduction: { label: 'Cost Reduction (Rp)', aliases: ['cost reduction', 'cost reduction (rp)', 'saving', 'penghematan'] },
  role_divisi: { label: 'Role/Divisi', aliases: ['role/divisi', 'role', 'divisi', 'jabatan', 'bagian', 'role_divisi'] },
  jumlah_sdm: { label: 'Jumlah SDM', aliases: ['jumlah', 'qty', 'total', 'jumlah sdm', 'count', 'sdm'] },
  principle: { label: 'Principle/Vendor', aliases: ['principle', 'vendor', 'pembuat', 'brand'] },
  nama_produk: { label: 'Nama Produk', aliases: ['nama produk', 'nama_produk', 'produk', 'product name', 'aplikasi'] },
  total_lisensi: { label: 'Total Lisensi', aliases: ['total', 'jumlah', 'total_lisensi', 'qty', 'volume'] },
  tanggal_expired: { label: 'Tanggal Expired', aliases: ['exp date', 'tanggal expired', 'expired date', 'tanggal_expired', 'exp_date', 'expired'] },
  status_lisensi: { label: 'Status Lisensi', aliases: ['status', 'keterangan status', 'status_lisensi'] },
  catatan_lisensi: { label: 'Catatan', aliases: ['catatan', 'keterangan', 'note', 'catatan_lisensi'] },
  nama_sistem: { label: 'Nama Sistem/Aplikasi', aliases: ['nama sistem', 'nama aplikasi', 'sistem', 'aplikasi', 'nama_sistem', 'system', 'nama server', 'server', 'nama_server', 'site', 'lokasi', 'keterangan', 'layanan'] },
  rencana_persen: { label: 'Rencana (%)', aliases: ['rencana', 'target', 'rencana (%)', 'rencana_persen'] },
  keterangan: { label: 'Keterangan', aliases: ['keterangan', 'deskripsi', 'detail', 'keterangan_scmc'] },
  jumlah: { label: 'Jumlah', aliases: ['jumlah', 'qty', 'total', 'count'] },
  lokasi: { label: 'Lokasi/Site', aliases: ['lokasi', 'site', 'cabang', 'kantor', 'lokasi_site'] },
  bandwidth_mbps: { label: 'Bandwidth (Mbps)', aliases: ['bandwidth', 'kapasitas', 'bandwidth (mbps)', 'bandwidth_mbps'] },
  utilisasi_mbps: { label: 'Utilisasi (Mbps)', aliases: ['utilisasi', 'utilisasi (mbps)', 'utilisasi_mbps', 'rata-rata utilisasi', 'rata_utilisasi_mbps'] },
  nama_server: { label: 'Nama Server', aliases: ['nama server', 'server', 'nama_server', 'hostname'] },
  cpu_cores: { label: 'CPU Cores', aliases: ['cpu cores', 'cores', 'core', 'cpu_cores'] },
  utilisasi_ghz: { label: 'Utilisasi Cores (GHz)', aliases: ['utilisasi cores', 'utilisasi (ghz)', 'utilisasi cores (ghz)', 'utilisasi_ghz'] },
  utilisasi_persen: { label: 'Utilisasi (%)', aliases: ['utilisasi (%)', 'utilisasi_persen', 'persen', '%', 'rata-rata utilisasi (%)', 'rata_utilisasi_persen', 'utilisasi_persen'] },
  memory_gb: { label: 'Kapasitas RAM (GB)', aliases: ['kapasitas', 'ram', 'memory (gb)', 'memory_gb', 'kapasitas ram', 'memory_gb'] },
  utilisasi_gb: { label: 'Utilisasi RAM (GB)', aliases: ['utilisasi ram', 'utilisasi (gb)', 'utilisasi_gb', 'ram terpakai', 'utilisasi_gb'] },
  nama_storage: { label: 'Nama Storage', aliases: ['nama storage', 'storage', 'nama_storage', 'disk'] },
  capacity_tb: { label: 'Kapasitas (TB)', aliases: ['kapasitas', 'kapasitas (tb)', 'capacity (tb)', 'capacity_tb', 'size'] },
  utilisasi_tb: { label: 'Utilisasi (TB)', aliases: ['utilisasi', 'utilisasi (tb)', 'utilisasi_tb', 'storage terpakai'] },
  free_persen: { label: 'Free (%)', aliases: ['free (%)', 'free_persen', 'sisa (%)', 'free'] },
  storage_tb: { label: 'Kapasitas Storage (TB)', aliases: ['kapasitas storage', 'storage (tb)', 'storage_tb'] },
  ketersediaan_persen: { label: 'Ketersediaan (%)', aliases: ['ketersediaan', 'ketersediaan (%)', 'ketersediaan_persen', 'availability'] },
  bulan_teks: { label: 'Bulan', aliases: ['bulan', 'periode', 'month', 'bulan_teks'] },
  wo_masuk: { label: 'WO Masuk', aliases: ['wo masuk', 'masuk', 'wo_masuk', 'order masuk'] },
  wo_selesai: { label: 'WO Selesai', aliases: ['wo selesai', 'selesai', 'wo_selesai', 'order selesai'] }
};

// Track last play time to prevent double-triggering in React 18 Strict Mode
let lastPlayedBetaWarningTime = 0;

export const UploadFilePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ category: string; success: boolean; message: string }[]>([]);
  const [showBetaModal, setShowBetaModal] = useState(true);

  // SFX Synth Engines (Web Audio API - License Free / Royalty Free)
  const playSuccessSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Chime note 1 (C5 to A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
      
      // Chime note 2 (E5 to C6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.22);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.error('SFX failed to play:', e);
    }
  };

  const playErrorSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.error('SFX failed to play:', e);
    }
  };

  const playWarningNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      // Soft elegant warning arpeggio (A4 -> C#5 -> E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.linearRampToValueAtTime(554.37, now + 0.08);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, now + 0.08);
      osc2.frequency.linearRampToValueAtTime(659.25, now + 0.16);
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.error('Warning SFX failed to play:', e);
    }
  };

  React.useEffect(() => {
    // Play warning sound when the page is loaded and the beta warning modal shows up
    const now = Date.now();
    if (now - lastPlayedBetaWarningTime > 1000) {
      playWarningNotificationSound();
      lastPlayedBetaWarningTime = now;
    }
  }, []);

  // Overwrite Warning Modal State
  const [overwriteModal, setOverwriteModal] = useState<{
    isOpen: boolean;
    sheetIdx: number;
    categoryName: string;
    periodText: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Main Excel Processing Logic
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setParsedSheets([]);
    setActiveSheetIdx(null);
    setImportResults([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const sheetsList: ParsedSheet[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        // Parse sheet as 2D array to scan cells dynamically
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (rawRows.length === 0) return;

        // 1. Detect Category by scanning first 5 rows and keys
        let matchedCategory = 'UNKNOWN';

        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          for (let c = 0; c < Math.min(rawRows[r].length, 5); c++) {
            const val = String(rawRows[r][c] || '').trim();
            if (!val) continue;

            const valLower = val.toLowerCase();
            if (valLower.includes('program kerja') || valLower.includes('proker')) {
              matchedCategory = 'PROGRAM_KERJA';
              break;
            } else if (valLower.includes('rkap')) {
              matchedCategory = 'RKAP';
              break;
            } else if (valLower.includes('sdm') || valLower.includes('sumber daya manusia') || valLower.includes('tenaga kerja')) {
              matchedCategory = 'SDM';
              break;
            } else if (valLower.includes('lisensi') || valLower.includes('license')) {
              matchedCategory = 'LISENSI';
              break;
            } else if (valLower.includes('scmc')) {
              matchedCategory = 'KETERSEDIAAN_SCMC';
              break;
            } else if (valLower.includes('keamanan') || valLower.includes('security') || valLower.includes('firewall') || valLower.includes('antivirus')) {
              matchedCategory = 'KETERSEDIAAN_KEAMANAN';
              break;
            } else if (valLower.includes('ketersediaan sistem') || valLower.includes('ketersediaan aplikasi') || valLower.includes('ketersediaan db') || valLower.includes('availability')) {
              matchedCategory = 'KETERSEDIAAN_SISTEM';
              break;
            } else if (valLower.includes('wan backup') || valLower.includes('wan_backup') || valLower.includes('backup wan')) {
              matchedCategory = 'UTILISASI_WAN_BACKUP';
              break;
            } else if (valLower.includes('bandwidth') || valLower.includes('utilisasi bandwidth') || valLower.includes('jaringan')) {
              matchedCategory = 'UTILISASI_BANDWIDTH';
              break;
            } else if (valLower.includes('cpu')) {
              if (valLower.includes('db') || valLower.includes('database')) {
                matchedCategory = 'UTILISASI_CPU_DB';
              } else if (valLower.includes('aplikasi') || valLower.includes('app')) {
                matchedCategory = 'UTILISASI_CPU_APP';
              } else {
                matchedCategory = 'UTILISASI_CPU_SERVER';
              }
              break;
            } else if (valLower.includes('memory') || valLower.includes('ram')) {
              if (valLower.includes('db') || valLower.includes('database')) {
                matchedCategory = 'UTILISASI_MEMORY_DB';
              } else if (valLower.includes('aplikasi') || valLower.includes('app')) {
                matchedCategory = 'UTILISASI_MEMORY_APP';
              } else {
                matchedCategory = 'UTILISASI_MEMORY_SERVER';
              }
              break;
            } else if (valLower.includes('storage') || valLower.includes('disk') || valLower.includes('kapasitas') || valLower.includes('hdds')) {
              if (valLower.includes('db') || valLower.includes('database')) {
                matchedCategory = 'UTILISASI_STORAGE_DB';
              } else {
                matchedCategory = 'UTILISASI_STORAGE_SERVER';
              }
              break;
            } else if (valLower.includes('pc support') || valLower.includes('pc_support')) {
              matchedCategory = 'PC_SUPPORT';
              break;
            } else if (valLower.includes('layanan aplikasi') || valLower.includes('layanan_app') || valLower.includes('permintaan layanan aplikasi')) {
              matchedCategory = 'LAYANAN_APLIKASI';
              break;
            } else if (valLower.includes('operasional ti') || valLower.includes('operasional_ti') || valLower.includes('layanan operasional')) {
              matchedCategory = 'LAYANAN_OPERASIONAL';
              break;
            } else if (valLower.includes('restore')) {
              matchedCategory = 'RESTORE';
              break;
            }
          }
          if (matchedCategory !== 'UNKNOWN') break;
        }

        // 2. Detect Period (Month & Year) by scanning cell contents using regex
        let detectedMonth = new Date().getMonth() + 1; // fallback
        let detectedYear = new Date().getFullYear(); // fallback
        let periodFound = false;

        const monthRegex = /(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i;
        const yearRegex = /\b(202\d|203\d)\b/;

        for (let r = 0; r < Math.min(rawRows.length, 8); r++) {
          for (let c = 0; c < rawRows[r].length; c++) {
            const val = String(rawRows[r][c] || '').trim();
            if (!val) continue;

            const mMatch = val.match(monthRegex);
            const yMatch = val.match(yearRegex);

            if (mMatch && yMatch) {
              const monthStr = mMatch[1].toLowerCase();
              const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === monthStr);
              if (monthIdx !== -1) {
                detectedMonth = monthIdx + 1;
                detectedYear = parseInt(yMatch[1], 10);
                periodFound = true;
                break;
              }
            } else if (mMatch && !periodFound) {
              const monthStr = mMatch[1].toLowerCase();
              const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === monthStr);
              if (monthIdx !== -1) {
                detectedMonth = monthIdx + 1;
              }
            } else if (yMatch && !periodFound) {
              detectedYear = parseInt(yMatch[1], 10);
            }
          }
          if (periodFound) break;
        }

        // 3. Find Header Row & Column Mappings
        let headerRowIdx = -1;
        let bestMatchCount = 0;
        const possibleFields = getFieldsForCategory(matchedCategory);

        // Find which row matches the most headers
        for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
          let matchCount = 0;
          rawRows[r].forEach((cellVal) => {
            const valStr = String(cellVal || '').toLowerCase().trim();
            if (!valStr) return;

            possibleFields.forEach((field) => {
              const config = FIELD_ALIASES[field];
              if (config && config.aliases.some(alias => valStr.includes(alias))) {
                matchCount++;
              }
            });
          });

          if (matchCount > bestMatchCount) {
            bestMatchCount = matchCount;
            headerRowIdx = r;
          }
        }

        // Fallback header row if none matched well
        if (headerRowIdx === -1) {
          for (let r = 0; r < rawRows.length; r++) {
            if (rawRows[r].some(cell => String(cell || '').trim() !== '')) {
              headerRowIdx = r;
              break;
            }
          }
        }

        const headers = headerRowIdx !== -1 ? rawRows[headerRowIdx].map(h => String(h || '').trim()) : [];
        const dataRows = headerRowIdx !== -1 ? rawRows.slice(headerRowIdx + 1) : rawRows;

        // Build mapping: targetField -> excelColumnName
        const columnMapping: Record<string, string> = {};
        possibleFields.forEach((field) => {
          const config = FIELD_ALIASES[field];
          if (config) {
            const matchedHeader = headers.find(h => {
              const hLower = h.toLowerCase();
              return config.aliases.some(alias => hLower.includes(alias));
            });
            if (matchedHeader) {
              columnMapping[field] = matchedHeader;
            }
          }
        });

        // Map rows into clean objects
        const mappedData = dataRows
          .filter(row => row.some(cell => String(cell || '').trim() !== '')) // skip empty rows
          .map((row, rIdx) => {
            const obj: any = { _id: `${sheetName}-${rIdx}` };
            possibleFields.forEach((field) => {
              const colName = columnMapping[field];
              const colIdx = headers.indexOf(colName);
              if (colIdx !== -1 && colIdx < row.length) {
                obj[field] = row[colIdx];
              } else {
                obj[field] = null;
              }
            });
            return obj;
          });

        // Determine initial status & detailed warning/error messages
        const missingFields = possibleFields.filter(f => !columnMapping[f]);
        const status = matchedCategory === 'UNKNOWN' 
          ? 'error' 
          : (missingFields.length > 0 ? 'warning' : 'success');

        let errorMessage = undefined;
        if (matchedCategory === 'UNKNOWN') {
          errorMessage = 'Kategori data tidak dapat dikenali secara otomatis. Harap pilih secara manual.';
        } else if (missingFields.length > 0) {
          const fieldLabels = missingFields.map(f => FIELD_ALIASES[f]?.label || f).join(', ');
          errorMessage = `Kolom berikut tidak terdeteksi otomatis: ${fieldLabels}. Harap petakan secara manual.`;
        }

        sheetsList.push({
          sheetName,
          category: matchedCategory,
          month: detectedMonth,
          year: detectedYear,
          headers,
          rows: dataRows,
          mappedData,
          status,
          columnMapping,
          errorMessage
        });
      });

      setParsedSheets(sheetsList);
      if (sheetsList.length > 0) {
        setActiveSheetIdx(0);
        playSuccessSound();
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const getFieldsForCategory = (cat: string): string[] => {
    switch (cat) {
      case 'PROGRAM_KERJA':
        return ['target_persen', 'realisasi_persen'];
      case 'RKAP':
        return ['realisasi_nominal', 'cost_reduction'];
      case 'SDM':
        return ['role_divisi', 'jumlah_sdm'];
      case 'LISENSI':
        return ['principle', 'nama_produk', 'total_lisensi', 'tanggal_expired', 'status_lisensi', 'catatan_lisensi'];
      case 'KETERSEDIAAN_SCMC':
        return ['keterangan', 'jumlah'];
      case 'KETERSEDIAAN_KEAMANAN':
      case 'KETERSEDIAAN_SISTEM':
        return ['nama_sistem', 'rencana_persen', 'realisasi_persen'];
      case 'UTILISASI_BANDWIDTH':
        return ['lokasi', 'bandwidth_mbps', 'utilisasi_mbps'];
      case 'UTILISASI_CPU_SERVER':
        return ['nama_server', 'cpu_cores', 'utilisasi_ghz', 'utilisasi_persen'];
      case 'UTILISASI_MEMORY_SERVER':
        return ['nama_server', 'memory_gb', 'utilisasi_gb', 'utilisasi_persen'];
      case 'UTILISASI_STORAGE_SERVER':
        return ['nama_storage', 'capacity_tb', 'utilisasi_tb', 'utilisasi_persen'];
      case 'UTILISASI_CPU_APP':
      case 'UTILISASI_CPU_DB':
      case 'UTILISASI_MEMORY_APP':
      case 'UTILISASI_MEMORY_DB':
        return ['nama_sistem', 'utilisasi_persen'];
      case 'UTILISASI_STORAGE_DB':
        return ['nama_sistem', 'storage_tb', 'utilisasi_tb', 'utilisasi_persen'];
      case 'UTILISASI_WAN_BACKUP':
        return ['lokasi', 'ketersediaan_persen'];
      case 'PC_SUPPORT':
      case 'LAYANAN_APLIKASI':
      case 'LAYANAN_OPERASIONAL':
      case 'RESTORE':
        return ['bulan_teks', 'wo_masuk', 'wo_selesai'];
      default:
        return [];
    }
  };

  const checkSheetStatus = (category: string, columnMapping: Record<string, string>, mappedData: any[]) => {
    if (category === 'UNKNOWN') {
      return {
        status: 'error' as const,
        errorMessage: 'Kategori data tidak dapat dikenali secara otomatis. Harap pilih secara manual.'
      };
    }

    const possibleFields = getFieldsForCategory(category);
    const missingFields = possibleFields.filter(f => !columnMapping[f]);
    
    // Check if every row has valid, non-empty, non-null values for all possible fields
    const isDataFilled = mappedData.length > 0 && mappedData.every((row: any) => {
      return possibleFields.every((field: string) => {
        const val = row[field];
        return val !== null && val !== undefined && String(val).trim() !== '';
      });
    });

    const isComplete = missingFields.length === 0 || isDataFilled;
    const status = isComplete ? ('success' as const) : ('warning' as const);

    let errorMessage = undefined;
    if (!isComplete) {
      const fieldLabels = missingFields.map(f => FIELD_ALIASES[f]?.label || f).join(', ');
      errorMessage = `Kolom berikut belum terpetakan atau belum terisi lengkap: ${fieldLabels}. Harap petakan kolom atau lengkapi data secara manual.`;
    }

    return { status, errorMessage };
  };

  const handleCategoryChange = (sheetIdx: number, newCat: string) => {
    setParsedSheets(prev => {
      return prev.map((sheet, idx) => {
        if (idx !== sheetIdx) return sheet;

        // Re-map columns for the new category
        const possibleFields = getFieldsForCategory(newCat);
        const columnMapping: Record<string, string> = {};
        possibleFields.forEach((field) => {
          const config = FIELD_ALIASES[field];
          if (config) {
            const matchedHeader = sheet.headers.find(h => {
              const hLower = h.toLowerCase();
              return config.aliases.some(alias => hLower.includes(alias));
            });
            if (matchedHeader) {
              columnMapping[field] = matchedHeader;
            }
          }
        });

        // Re-map rows
        const mappedData = sheet.rows
          .filter(row => row.some((cell: any) => String(cell || '').trim() !== ''))
          .map((row, rIdx) => {
            const obj: any = { _id: `${sheet.sheetName}-${rIdx}` };
            possibleFields.forEach((field) => {
              const colName = columnMapping[field];
              const colIdx = sheet.headers.indexOf(colName);
              if (colIdx !== -1 && colIdx < row.length) {
                obj[field] = row[colIdx];
              } else {
                obj[field] = null;
              }
            });
            return obj;
          });

        const { status, errorMessage } = checkSheetStatus(newCat, columnMapping, mappedData);

        return {
          ...sheet,
          category: newCat,
          columnMapping,
          mappedData,
          status,
          errorMessage
        };
      });
    });
  };

  const handlePeriodChange = (sheetIdx: number, field: 'month' | 'year', val: number) => {
    setParsedSheets(prev => {
      return prev.map((sheet, idx) => {
        if (idx !== sheetIdx) return sheet;
        return {
          ...sheet,
          [field]: val
        };
      });
    });
  };

  const handleColumnMapChange = (sheetIdx: number, field: string, excelColName: string) => {
    setParsedSheets(prev => {
      return prev.map((sheet, idx) => {
        if (idx !== sheetIdx) return sheet;

        const columnMapping = { ...sheet.columnMapping };
        if (excelColName === '') {
          delete columnMapping[field];
        } else {
          columnMapping[field] = excelColName;
        }

        const possibleFields = getFieldsForCategory(sheet.category);

        // Re-map rows
        const mappedData = sheet.rows
          .filter(row => row.some((cell: any) => String(cell || '').trim() !== ''))
          .map((row, rIdx) => {
            const obj: any = { _id: `${sheet.sheetName}-${rIdx}` };
            possibleFields.forEach((f) => {
              const colName = columnMapping[f];
              const colIdx = sheet.headers.indexOf(colName);
              if (colIdx !== -1 && colIdx < row.length) {
                obj[f] = row[colIdx];
              } else {
                obj[f] = null;
              }
            });
            return obj;
          });

        const { status, errorMessage } = checkSheetStatus(sheet.category, columnMapping, mappedData);

        return {
          ...sheet,
          columnMapping,
          mappedData,
          status,
          errorMessage
        };
      });
    });
  };

  const handleDeletePreviewRow = (sheetIdx: number, rowIdx: number) => {
    setParsedSheets(prev => {
      return prev.map((sheet, idx) => {
        if (idx !== sheetIdx) return sheet;
        const newMappedData = sheet.mappedData.filter((_, rIdx) => rIdx !== rowIdx);
        const { status, errorMessage } = checkSheetStatus(sheet.category, sheet.columnMapping, newMappedData);
        return {
          ...sheet,
          mappedData: newMappedData,
          status,
          errorMessage
        };
      });
    });
  };

  const handlePreviewRowChange = (sheetIdx: number, rowIdx: number, field: string, value: any) => {
    setParsedSheets(prev => {
      return prev.map((sheet, idx) => {
        if (idx !== sheetIdx) return sheet;

        const mappedData = sheet.mappedData.map((row, rIdx) => {
          if (rIdx !== rowIdx) return row;

          const updatedRow = { ...row };
          const numericFields = [
            'target_persen', 'realisasi_persen', 'realisasi_nominal', 'cost_reduction', 'jumlah_sdm', 'total_lisensi',
            'jumlah', 'rencana_persen', 'bandwidth_mbps', 'utilisasi_mbps', 'cpu_cores', 'utilisasi_ghz',
            'utilisasi_persen', 'memory_gb', 'utilisasi_gb', 'capacity_tb', 'utilisasi_tb', 'storage_tb',
            'ketersediaan_persen', 'wo_masuk', 'wo_selesai'
          ];
          if (numericFields.includes(field)) {
            updatedRow[field] = value === '' ? '' : (parseFloat(value) || 0);
          } else {
            updatedRow[field] = value;
          }
          return updatedRow;
        });

        const { status, errorMessage } = checkSheetStatus(sheet.category, sheet.columnMapping, mappedData);

        return {
          ...sheet,
          mappedData,
          status,
          errorMessage
        };
      });
    });
  };

  // Overwrite Checker & Save Handler
  const handleImportSheetClick = (idx: number) => {
    const sheet = parsedSheets[idx];
    if (sheet.category === 'UNKNOWN') {
      alert('Mohon tentukan kategori data terlebih dahulu.');
      return;
    }

    const catConfig = CATEGORIES.find(c => c.id === sheet.category);
    if (!catConfig) return;

    const isYearOnly = catConfig.periodType === 'YEAR_ONLY';

    // Check if data already exists in database
    checkIfDataExists(sheet.category, sheet.month, sheet.year).then((exists) => {
      if (exists) {
        // Show popup warning
        setOverwriteModal({
          isOpen: true,
          sheetIdx: idx,
          categoryName: catConfig.name,
          periodText: isYearOnly ? String(sheet.year) : `${MONTHS[sheet.month - 1]} ${sheet.year}`,
          onConfirm: () => {
            setOverwriteModal(null);
            saveSheetToBackend(idx);
          },
          onCancel: () => {
            setOverwriteModal(null);
          }
        });
      } else {
        saveSheetToBackend(idx);
      }
    });
  };

  const checkIfDataExists = async (category: string, month: number, year: number): Promise<boolean> => {
    try {
      const catConfig = CATEGORIES.find(c => c.id === category);
      if (!catConfig) return false;

      const response = await fetch(catConfig.api);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        if (catConfig.periodType === 'YEAR_ONLY') {
          return result.data.some((rec: any) => rec.tahun === year);
        } else {
          return result.data.some((rec: any) => rec.bulan === month && rec.tahun === year);
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const saveSheetToBackend = async (idx: number) => {
    const sheet = parsedSheets[idx];
    const catConfig = CATEGORIES.find(c => c.id === sheet.category);
    if (!catConfig) return;

    setIsImporting(true);

    // Build specific payload based on category
    let payload: any = {};
    const monthNum = sheet.month;
    const yearNum = sheet.year;

    if (sheet.category === 'PROGRAM_KERJA') {
      payload = {
        tahun: yearNum,
        bulan: monthNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_program: String(r.nama_program || 'Program Kerja TI').trim(),
          target_persen: parseFloat(r.target_persen) || 0,
          realisasi_persen: parseFloat(r.realisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'RKAP') {
      const rRow = sheet.mappedData.find(r => String(r.realisasi_nominal || '').toLowerCase().includes('realisasi') || true) || {};
      const cRow = sheet.mappedData.find(r => String(r.cost_reduction || '').toLowerCase().includes('cost') || true) || {};
      payload = {
        tahun: yearNum,
        bulan: monthNum,
        details: [
          { urutan: 1, nama_metrik: 'Realisasi', nilai_nominal: parseFloat(rRow.realisasi_nominal) || 0 },
          { urutan: 2, nama_metrik: 'Cost Reduction', nilai_nominal: parseFloat(cRow.cost_reduction) || 0 }
        ]
      };
    } else if (sheet.category === 'SDM') {
      const totalSdm = sheet.mappedData.reduce((sum, r) => sum + (parseInt(r.jumlah_sdm, 10) || 0), 0);
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        total_keseluruhan_sdm: totalSdm,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          role_divisi: String(r.role_divisi || '').trim(),
          jumlah: parseInt(r.jumlah_sdm, 10) || 0
        }))
      };
    } else if (sheet.category === 'LISENSI') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          principle: String(r.principle || '').trim(),
          nama_produk: String(r.nama_produk || '').trim(),
          total_lisensi: parseInt(r.total_lisensi, 10) || 0,
          tanggal_expired: r.tanggal_expired || new Date().toISOString().split('T')[0],
          status: r.status_lisensi || 'Lisensi Aktif',
          catatan: r.catatan_lisensi || ''
        }))
      };
    } else if (sheet.category === 'KETERSEDIAAN_SCMC') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          keterangan: String(r.keterangan || '').trim(),
          jumlah: parseInt(r.jumlah, 10) || 0
        }))
      };
    } else if (sheet.category === 'KETERSEDIAAN_KEAMANAN' || sheet.category === 'KETERSEDIAAN_SISTEM') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_sistem: String(r.nama_sistem || '').trim(),
          rencana_persen: parseFloat(r.rencana_persen) || 0,
          realisasi_persen: parseFloat(r.realisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'UTILISASI_BANDWIDTH') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => {
          const bw = parseFloat(r.bandwidth_mbps) || 0;
          const ut = parseFloat(r.utilisasi_mbps) || 0;
          const pct = bw > 0 ? Math.round((ut / bw) * 100) : 0;
          return {
            urutan: i + 1,
            lokasi: String(r.lokasi || '').trim(),
            bandwidth_mbps: bw,
            utilisasi_mbps: ut,
            sisa_persen: 100 - pct,
            utilisasi_persen: pct
          };
        })
      };
    } else if (sheet.category === 'UTILISASI_CPU_SERVER') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_server: String(r.nama_server || '').trim(),
          cpu_cores: parseInt(r.cpu_cores, 10) || 0,
          utilisasi_ghz: parseFloat(r.utilisasi_ghz) || 0,
          utilisasi_persen: parseFloat(r.utilisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'UTILISASI_MEMORY_SERVER') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_server: String(r.nama_server || '').trim(),
          memory_gb: parseFloat(r.memory_gb) || 0,
          utilisasi_gb: parseFloat(r.utilisasi_gb) || 0,
          utilisasi_persen: parseFloat(r.utilisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'UTILISASI_STORAGE_SERVER') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => {
          const cap = parseFloat(r.capacity_tb) || 0;
          const ut = parseFloat(r.utilisasi_tb) || 0;
          return {
            urutan: i + 1,
            nama_storage: String(r.nama_storage || r.nama_sistem || '').trim(),
            capacity_tb: cap,
            utilisasi_tb: ut,
            free_tb: Math.max(0, cap - ut),
            utilisasi_persen: parseFloat(r.utilisasi_persen) || (cap > 0 ? Math.round((ut / cap) * 100) : 0)
          };
        })
      };
    } else if (['UTILISASI_CPU_APP', 'UTILISASI_CPU_DB', 'UTILISASI_MEMORY_APP', 'UTILISASI_MEMORY_DB'].includes(sheet.category)) {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_sistem: String(r.nama_sistem || '').trim(),
          utilisasi_persen: parseFloat(r.utilisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'UTILISASI_STORAGE_DB') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          nama_sistem: String(r.nama_sistem || '').trim(),
          storage_tb: parseFloat(r.storage_tb) || 0,
          utilisasi_tb: parseFloat(r.utilisasi_tb) || 0,
          utilisasi_persen: parseFloat(r.utilisasi_persen) || 0
        }))
      };
    } else if (sheet.category === 'UTILISASI_WAN_BACKUP') {
      payload = {
        bulan: monthNum,
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          lokasi: String(r.lokasi || '').trim(),
          ketersediaan_persen: parseFloat(r.ketersediaan_persen) || 0
        }))
      };
    } else if (['PC_SUPPORT', 'LAYANAN_APLIKASI', 'LAYANAN_OPERASIONAL', 'RESTORE'].includes(sheet.category)) {
      payload = {
        tahun: yearNum,
        details: sheet.mappedData.map((r, i) => ({
          urutan: i + 1,
          bulan_teks: String(r.bulan_teks || MONTHS[i] || '').trim(),
          wo_masuk: parseInt(r.wo_masuk, 10) || 0,
          wo_selesai: parseInt(r.wo_selesai, 10) || 0
        }))
      };
    }

    try {
      const response = await fetch(catConfig.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        playSuccessSound();
        setImportResults(prev => [
          ...prev.filter(r => r.category !== sheet.category),
          { category: sheet.category, success: true, message: `Sheet '${sheet.sheetName}' berhasil di-import!` }
        ]);
      } else {
        playErrorSound();
        setImportResults(prev => [
          ...prev.filter(r => r.category !== sheet.category),
          { category: sheet.category, success: false, message: `Gagal: ${result.message}` }
        ]);
      }
    } catch (err) {
      playErrorSound();
      setImportResults(prev => [
        ...prev.filter(r => r.category !== sheet.category),
        { category: sheet.category, success: false, message: 'Gagal menghubungkan ke server.' }
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAll = async () => {
    const validSheets = parsedSheets.filter(s => s.category !== 'UNKNOWN');
    if (validSheets.length === 0) {
      alert('Tidak ada data sheet yang valid untuk di-import.');
      return;
    }

    for (let i = 0; i < parsedSheets.length; i++) {
      if (parsedSheets[i].category !== 'UNKNOWN') {
        await handleImportSheetClick(i);
      }
    }
  };

  return (
    <div className="w-full flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50 relative">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          Upload & Import File Excel
          <span className="bg-amber-500/10 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-amber-300/30 tracking-wide">
            Beta
          </span>
        </h2>
        <p className="text-xs text-slate-500">Impor data laporan bulanan secara massal melalui berbagai sheet Excel.</p>
      </div>

      {/* Upload Drag & Drop Area */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-primary-900 bg-white rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:bg-slate-50/50 group shadow-sm"
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <div className="p-4 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-primary-900 rounded-full transition-all">
          <Upload className="w-8 h-8" />
        </div>
        <div className="text-center">
          <span className="text-sm font-bold text-slate-700 block">
            {file ? file.name : 'Tarik & Lepas File Excel di sini'}
          </span>
          <span className="text-xs text-slate-400">
            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'atau klik untuk memilih file dari komputer Anda'}
          </span>
        </div>
      </div>

      {parsedSheets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Panel: Sheets List */}
          <div className="flex flex-col gap-3">
            <CardTitle>Sheet Terdeteksi ({parsedSheets.length})</CardTitle>
            <div className="flex flex-col gap-2">
              {parsedSheets.map((sheet, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveSheetIdx(idx)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between shadow-sm bg-white ${
                    activeSheetIdx === idx 
                      ? 'border-primary-900 ring-1 ring-primary-900 bg-blue-50/10' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      sheet.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      sheet.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">Sheet: {sheet.sheetName}</span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {CATEGORIES.find(c => c.id === sheet.category)?.name || 'Kategori Tidak Dikenal'}
                      </span>
                      {sheet.errorMessage && (
                        <span className={`text-[9px] font-semibold mt-0.5 leading-tight ${
                          sheet.status === 'error' ? 'text-rose-500' : 'text-amber-600'
                        }`}>
                          {sheet.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sheet.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {sheet.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {sheet.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleImportAll}
              disabled={isImporting}
              className="mt-2 w-full bg-primary-900 hover:bg-primary-800 text-white p-3 rounded-lg font-bold text-xs shadow transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              Import Semua Sheet Valid
            </button>
          </div>

          {/* Right Panel: Sheet Details & Preview */}
          {activeSheetIdx !== null && parsedSheets[activeSheetIdx] && (
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Alert Banner for Warning/Error */}
              {parsedSheets[activeSheetIdx].status !== 'success' && parsedSheets[activeSheetIdx].errorMessage && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                  parsedSheets[activeSheetIdx].status === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50/50 border-amber-200 text-amber-850'
                }`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    parsedSheets[activeSheetIdx].status === 'error' ? 'text-rose-500' : 'text-amber-600'
                  }`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold">
                      {parsedSheets[activeSheetIdx].status === 'error' ? 'Kategori Tidak Dikenali' : 'Peringatan Pemetaan Kolom'}
                    </span>
                    <p className="text-xs font-semibold leading-relaxed">
                      {parsedSheets[activeSheetIdx].errorMessage}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Configuration Card */}
              <Card>
                <CardTitle>Konfigurasi & Pemetaan Sheet: {parsedSheets[activeSheetIdx].sheetName}</CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  {/* Category Mapping */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Laporan</span>
                    <select
                      value={parsedSheets[activeSheetIdx].category}
                      onChange={(e) => handleCategoryChange(activeSheetIdx, e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full font-medium"
                    >
                      <option value="UNKNOWN">-- Pilih Kategori --</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month Select */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Periode Bulan</span>
                    {(() => {
                      const catConfig = CATEGORIES.find(c => c.id === parsedSheets[activeSheetIdx].category);
                      const isYearOnly = catConfig?.periodType === 'YEAR_ONLY';
                      return (
                        <select
                          value={isYearOnly ? 1 : parsedSheets[activeSheetIdx].month}
                          disabled={isYearOnly}
                          onChange={(e) => handlePeriodChange(activeSheetIdx, 'month', parseInt(e.target.value, 10))}
                          className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isYearOnly ? (
                            <option value={1}>Seluruh Bulan (Tahunan)</option>
                          ) : (
                            MONTHS.map((m, idx) => (
                              <option key={idx} value={idx + 1}>{m}</option>
                            ))
                          )}
                        </select>
                      );
                    })()}
                  </div>

                  {/* Year Select */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Periode Tahun</span>
                    <select
                      value={parsedSheets[activeSheetIdx].year}
                      onChange={(e) => handlePeriodChange(activeSheetIdx, 'year', parseInt(e.target.value, 10))}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none w-full font-medium"
                    >
                      {Array.from({ length: 10 }, (_, i) => (2020 + i).toString()).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Column Mapper UI */}
                {parsedSheets[activeSheetIdx].category !== 'UNKNOWN' && (
                  <div className="border-t border-slate-100 mt-5 pt-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Pemetaan Kolom Excel</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getFieldsForCategory(parsedSheets[activeSheetIdx].category).map((field) => (
                        <div key={field} className="flex items-center justify-between gap-4 p-2 bg-slate-50/50 rounded border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700">{FIELD_ALIASES[field]?.label}</span>
                            <span className="text-[9px] text-slate-400 font-mono">({field})</span>
                          </div>
                          <select
                            value={parsedSheets[activeSheetIdx].columnMapping[field] || ''}
                            onChange={(e) => handleColumnMapChange(activeSheetIdx, field, e.target.value)}
                            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs focus:border-primary-900 focus:ring-1 focus:ring-primary-900 outline-none min-w-[140px] font-medium"
                          >
                            <option value="">-- Lewati Kolom --</option>
                            {parsedSheets[activeSheetIdx].headers.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Data Preview Table */}
              {parsedSheets[activeSheetIdx].category !== 'UNKNOWN' && (
                <Card className="flex flex-col overflow-hidden">
                  <div className="p-1 border-b border-slate-100 flex justify-between items-center">
                    <CardTitle className="text-xs">Pratinjau Baris Data ({parsedSheets[activeSheetIdx].mappedData.length})</CardTitle>
                    <button
                      onClick={() => handleImportSheetClick(activeSheetIdx)}
                      disabled={isImporting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[10px] font-bold shadow transition-all uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      Import Sheet Ini
                    </button>
                  </div>

                  <div className="overflow-x-auto p-4 max-h-[300px]">
                    <table className="w-full text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-2 px-3 border border-slate-200 text-center w-12">No</th>
                          {getFieldsForCategory(parsedSheets[activeSheetIdx].category).map(field => (
                            <th key={field} className="py-2 px-3 border border-slate-200">
                              {FIELD_ALIASES[field]?.label}
                            </th>
                          ))}
                          <th className="py-2 px-3 border border-slate-200 text-center w-16">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
                        {parsedSheets[activeSheetIdx].mappedData.map((row, idx) => (
                          <tr key={row._id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 border border-slate-200 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            {getFieldsForCategory(parsedSheets[activeSheetIdx].category).map(field => {
                              const isNumeric = [
                                'target_persen', 'realisasi_persen', 'realisasi_nominal', 'cost_reduction', 'jumlah_sdm', 'total_lisensi',
                                'jumlah', 'rencana_persen', 'bandwidth_mbps', 'utilisasi_mbps', 'cpu_cores', 'utilisasi_ghz',
                                'utilisasi_persen', 'memory_gb', 'utilisasi_gb', 'capacity_tb', 'utilisasi_tb', 'storage_tb',
                                'ketersediaan_persen', 'wo_masuk', 'wo_selesai'
                              ].includes(field);
                              const isDate = field === 'tanggal_expired';
                              return (
                                <td key={field} className="py-1 px-2 border border-slate-200 bg-white min-w-[120px]">
                                  <input
                                    type={isDate ? 'date' : (isNumeric ? 'number' : 'text')}
                                    value={row[field] === null || row[field] === undefined ? '' : row[field]}
                                    onChange={(e) => handlePreviewRowChange(activeSheetIdx, idx, field, e.target.value)}
                                    className={`w-full px-1.5 py-1 text-xs rounded border border-transparent hover:border-slate-200 focus:border-primary-900 focus:ring-1 focus:ring-primary-900 focus:bg-white bg-transparent outline-none transition-all ${
                                      isNumeric ? 'text-right font-mono font-bold text-slate-800' : 'text-left font-medium text-slate-700'
                                    }`}
                                    placeholder="-"
                                  />
                                </td>
                              );
                            })}
                            <td className="py-1 px-3 border border-slate-200 text-center">
                              <button
                                onClick={() => handleDeletePreviewRow(activeSheetIdx, idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-all"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Status & Results */}
              {importResults.some(r => r.category === parsedSheets[activeSheetIdx].category) && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
                  importResults.find(r => r.category === parsedSheets[activeSheetIdx].category)?.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {importResults.find(r => r.category === parsedSheets[activeSheetIdx].category)?.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold">Status Impor</span>
                    <p className="text-xs font-medium">
                      {importResults.find(r => r.category === parsedSheets[activeSheetIdx].category)?.message}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Overwrite Warning Dialog Modal */}
      {overwriteModal && overwriteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-slate-800">Ganti Data Terdaftar?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Laporan untuk kategori <strong className="text-slate-800">{overwriteModal.categoryName}</strong> pada periode <strong className="text-slate-800">{overwriteModal.periodText}</strong> sudah ada di database. 
                  Apakah Anda ingin menimpa (replace) data lama tersebut dengan data baru ini?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-2 pt-3 border-t border-slate-150">
              <button
                type="button"
                onClick={overwriteModal.onCancel}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-[10px] uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={overwriteModal.onConfirm}
                className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm text-[10px] uppercase tracking-wider"
              >
                Ya, Gantikan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beta Warning Notice Dialog Modal */}
      {showBetaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-250 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-bold text-slate-800">Fitur Pengembangan (Beta)</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fitur <strong>Upload & Import File Excel</strong> saat ini masih dalam tahap pengembangan (Beta). 
                  Terdapat kemungkinan ketidakakuratan atau ketidaksesuaian data dalam pemetaan otomatis.
                  <br /><br />
                  Harap periksa kembali seluruh data pratinjau dengan seksama. Anda dapat mengubah data yang salah secara langsung pada tabel pratinjau sebelum menyimpannya ke database.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 mt-2 pt-3 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setShowBetaModal(false)}
                className="w-full bg-primary-900 hover:bg-primary-800 text-white py-2.5 rounded-lg font-semibold transition-all shadow-sm text-[10px] uppercase tracking-wider text-center"
              >
                Saya Mengerti &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

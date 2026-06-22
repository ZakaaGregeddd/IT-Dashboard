import React from 'react';
import { LayoutDashboard, ArrowLeft, FileText, Upload, History, User } from 'lucide-react';
import { navigateTo } from '@/utils/navigation';

interface ReportDetailPageProps {
  path: string;
}

// Map slug to human readable title
const getReportTitle = (path: string): string => {
  const cleanPath = path.replace(/^\//, '');
  return cleanPath
    .split('-')
    .map(word => {
      if (['dan', 'di', 's.d', 'ke'].includes(word)) return word;
      if (['cpu', 'rkap', 'sdm', 'it', 'scmc', 'cisea', 'wan', 'dr', 'pc', 'ti'].includes(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ path }) => {
  const title = getReportTitle(path);

  return (
    <div className="w-full flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto bg-slate-50">
      {/* Header & Back Button */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => navigateTo('/data-overall')}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-900 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Data Overall
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Detail Pelaporan</span>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          </div>
          
          <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all w-fit">
            <Upload className="w-4 h-4" />
            Upload Dokumen Pendukung
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Visualization & Analysis Placeholder */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Chart/Data Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary-900" />
              Visualisasi Data Terbaru
            </h3>
            
            {/* Elegant placeholder indicating layout development */}
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 p-6 text-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">Grafik Detail: {title}</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Visualisasi interaktif sedang dimuat berdasarkan data mutakhir dari sistem server pelaporan.
              </p>
            </div>
          </div>

          {/* Document Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Dokumen Terkait (SSOT)</h3>
            <p className="text-xs text-slate-500 mb-4">
              File dokumen resmi Single Source of Truth yang digunakan untuk menyusun pelaporan ini.
            </p>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
              <div className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Laporan_Bulanan_{cleanFilename(title)}.xlsx</p>
                    <p className="text-[10px] text-slate-400">1.2 MB • Diunggah 2 hari yang lalu oleh Admin TI</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-primary-800 hover:underline">Download</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata & History */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Laporan</h3>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Terverifikasi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Periode</span>
                <span className="font-semibold text-slate-700">Juni 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Frekuensi Input</span>
                <span className="font-semibold text-slate-700">Bulanan</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              Aktivitas Terakhir
            </h3>
            
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-slate-700">File Excel Laporan Bulanan diunggah</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3" /> Zakaa Greged • 2 hari yang lalu
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const cleanFilename = (str: string): string => {
  return str.replace(/\s+/g, '_').toLowerCase();
};

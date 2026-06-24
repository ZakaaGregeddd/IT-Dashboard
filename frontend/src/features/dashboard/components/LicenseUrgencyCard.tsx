import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LicenseUrgencyCardProps {
  data: {
    under2: number;
    between2and4: number;
    over4: number;
    rawList?: Array<{ nama_aplikasi: string; expiry_date: string }>;
  };
  onClick?: () => void;
}

export const LicenseUrgencyCard: React.FC<LicenseUrgencyCardProps> = ({ data, onClick }) => {
  const [showList, setShowList] = useState(false);
  const [page, setPage] = useState(0);

  const rawList = data.rawList || [];
  const sortedList = [...rawList].sort((a, b) => {
    const dateA = new Date(a.expiry_date).getTime();
    const dateB = new Date(b.expiry_date).getTime();
    const isInvalidA = isNaN(dateA);
    const isInvalidB = isNaN(dateB);
    if (isInvalidA && isInvalidB) return 0;
    if (isInvalidA) return 1;
    if (isInvalidB) return -1;
    return dateA - dateB;
  });
  const rowsPerPage = 3;
  const totalPages = Math.ceil(sortedList.length / rowsPerPage);
  const paginatedList = sortedList.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleToggleList = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's main onClick redirect
    setShowList(!showList);
    setPage(0);
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <Card 
      onClick={!showList ? onClick : undefined}
      className={`flex flex-col h-full min-h-[210px] p-4 bg-white rounded-xl border border-slate-200 shadow-sm ${
        !showList && onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 shrink-0">
        <span className="text-xs font-bold text-slate-800">Ringkasan Urgensi Kedaluwarsa Lisensi</span>
        <button
          type="button"
          onClick={handleToggleList}
          className="text-[9px] font-extrabold text-primary-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-all select-none uppercase tracking-wider"
        >
          {showList ? 'Kembali' : 'Lihat List'}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        {!showList ? (
          /* Card View (Default) */
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {/* Urgent */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 border border-red-100 text-center h-[110px] transition-all hover:bg-red-100/50">
              <span className="text-2xl font-black text-red-600 leading-none">{data.under2}</span>
              <span className="text-[9px] font-extrabold text-red-700 uppercase mt-2 tracking-wide">Urgensi</span>
              <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">&lt;= 2 Bulan</span>
            </div>

            {/* Peringatan */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 border border-amber-100 text-center h-[110px] transition-all hover:bg-amber-100/50">
              <span className="text-2xl font-black text-amber-600 leading-none">{data.between2and4}</span>
              <span className="text-[9px] font-extrabold text-amber-700 uppercase mt-2 tracking-wide">Peringatan</span>
              <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">2 - 4 Bulan</span>
            </div>

            {/* Aman */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-50 border border-blue-100 text-center h-[110px] transition-all hover:bg-blue-100/50">
              <span className="text-2xl font-black text-primary-900 leading-none">{data.over4}</span>
              <span className="text-[9px] font-extrabold text-slate-700 uppercase mt-2 tracking-wide">Aman</span>
              <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">&gt; 4 Bulan</span>
            </div>
          </div>
        ) : (
          /* Mini Table View (Expanded) */
          <div className="flex flex-col justify-between w-full h-full p-1 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 min-h-0 overflow-hidden">
              {rawList.length > 0 ? (
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="text-[8px] font-bold text-slate-400 border-b border-slate-150 uppercase tracking-wider">
                      <th className="py-1 px-1.5 w-7/12">Produk</th>
                      <th className="py-1 px-1.5 text-right w-5/12">Exp Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-[9.5px] text-slate-700 divide-y divide-slate-100 bg-white">
                    {paginatedList.map((lic, idx) => {
                      const expDate = new Date(lic.expiry_date);
                      const diffTime = expDate.getTime() - new Date().getTime();
                      const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);

                      let dateColorClass = 'text-slate-500';
                      if (diffMonths <= 2) dateColorClass = 'text-red-600 font-extrabold';
                      else if (diffMonths <= 4) dateColorClass = 'text-amber-600 font-extrabold';

                      const formattedDate = isNaN(expDate.getTime()) 
                        ? lic.expiry_date 
                        : expDate.toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });

                      return (
                        <tr key={idx} className="hover:bg-slate-50/55 transition-colors">
                          <td className="py-1.5 px-1.5 font-semibold break-words whitespace-normal leading-tight text-slate-800">{lic.nama_aplikasi}</td>
                          <td className={`py-1.5 px-1.5 text-right font-mono ${dateColorClass}`}>{formattedDate}</td>
                        </tr>
                      );
                    })}
                    {/* Fill empty rows to keep layout height stable */}
                    {Array.from({ length: Math.max(0, rowsPerPage - paginatedList.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="opacity-0">
                        <td className="py-1.5 px-1.5">-</td>
                        <td className="py-1.5 px-1.5">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-[9.5px] text-center text-slate-400 py-6 font-medium">Tidak ada data lisensi</div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-150 pt-1.5 shrink-0 mt-1">
                <span className="text-[8.5px] text-slate-400 font-bold">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={handlePrevPage}
                    className="p-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages - 1}
                    onClick={handleNextPage}
                    className="p-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

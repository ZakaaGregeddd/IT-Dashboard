import React, { useState, useEffect } from 'react';

export const TestPage: React.FC = () => {
  // 1. State untuk menampung data SDM dan status loading
  const [dataSdm, setDataSdm] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Fetch data saat halaman pertama kali dibuka
  useEffect(() => {
    fetch('http://localhost:5000/api/sdm') // Meminta data ke backend
      .then((response) => response.json())  // Mengubah respon menjadi JSON
      .then((result) => {
        if (result.success) {
          setDataSdm(result.data);          // Simpan data ke state jika sukses
        }
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));    // Matikan status loading
  }, []); // Array kosong [] berarti ini hanya berjalan 1 kali saat halaman dimuat

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Daftar Laporan SDM IT (Tanpa Filter)</h2>

      {loading ? (
        <p className="text-xs text-slate-500">Sedang mengambil data...</p>
      ) : dataSdm.length > 0 ? (
        <div className="flex flex-col gap-3">
          {/* Looping data SDM */}
          {dataSdm.map((laporan: any) => (
            <div key={laporan.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <h3 className="font-semibold text-sm text-primary-900">
                Periode: Bulan {laporan.bulan} - Tahun {laporan.tahun}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Total Keseluruhan SDM: <strong className="text-slate-800">{laporan.total_keseluruhan_sdm}</strong> orang
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Tidak ada data ditemukan.</p>
      )}
    </div>
  );
};

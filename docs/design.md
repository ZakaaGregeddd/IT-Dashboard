# Mockup Desain IT-Dashboard

Berkas ini berisi desain antarmuka asli (mockup) untuk IT Dashboard yang menggunakan HTML, Tailwind CSS, dan Chart.js.

## Kode Mockup HTML

```html
<!DOCTYPE html><html lang="id"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Dashboard Utama</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style data-purpose="custom-styles">@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', sans-serif; background-color: #f8fafc; } .sidebar-scroll::-webkit-scrollbar { width: 6px; } .sidebar-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); } .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; } .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); } .chart-container { position: relative; height: 180px; width: 100%; } .chart-container-donut { position: relative; height: 140px; width: 100%; display: flex; justify-content: center; align-items: center; }</style>
<script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              900: '#0f2e60', // Sidebar background & primary charts
              800: '#153b75', // Sidebar active
              700: '#1d4ed8',
              50: '#eff6ff',
            },
            amber: {
              400: '#fbbf24',
              500: '#f59e0b', // Realization charts
            },
            success: '#10b981',
            info: '#3b82f6',
            danger: '#ef4444'
          }
        }
      }
    }
  </script>
</head>
<body class="flex h-screen overflow-hidden text-slate-800">
<!-- BEGIN: Sidebar -->
<aside class="w-72 bg-primary-900 text-white flex flex-col flex-shrink-0 relative z-20">
<!-- Sidebar Header -->
<div class="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
<div class="flex items-center gap-3">
<div class="grid grid-cols-2 gap-0.5">
<div class="w-2.5 h-2.5 bg-amber-500 rounded-sm"></div>
<div class="w-2.5 h-2.5 bg-amber-500 rounded-sm"></div>
<div class="w-2.5 h-2.5 border border-white rounded-sm"></div>
<div class="w-2.5 h-2.5 border border-white rounded-sm"></div>
</div>
<span class="font-semibold text-sm leading-tight tracking-wide">Sistem Pelaporan<br>Bulanan Terpusat</span>
</div>
</div>
<!-- Sidebar Navigation -->
<nav class="flex-1 overflow-y-auto sidebar-scroll py-4 flex flex-col gap-1">
<!-- Active Dashboard Item -->
<a class="flex items-center gap-3 px-6 py-3 bg-primary-800 border-l-4 border-amber-500 text-white" href="#">
<svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
</svg>
<span class="font-medium text-sm">Dashboard</span>
</a>
<!-- Data Overall -->
<a class="flex items-center gap-3 px-6 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-colors" href="#"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg><span class="font-medium text-sm">Data Overall</span></a>
<!-- IT Planning & Security Menu -->
<div class="mt-2">
<button class="w-full flex items-center justify-between px-6 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
<div class="flex items-center gap-3">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="font-medium text-sm text-white">IT Planning &amp; Security</span>
</div>
<svg class="w-4 h-4 transform rotate-180 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
<div class="flex flex-col py-1">
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Realisasi Program Kerja TI</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Realisasi RKAP TI</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">SDM IT (Outsource &amp; Pegawai)</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Lisensi</a>
</div>
</div>
<!-- App Dev & Services / EIS Menu -->
<div>
<button class="w-full flex items-center justify-between px-6 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
<div class="flex items-center gap-3">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="font-medium text-sm text-white">App Dev &amp; Services / EIS</span>
</div>
<svg class="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
<div class="flex flex-col py-1"><a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">ketersediaan report aplikasi scmc</a><a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">tingkat ketersediaan sistem</a></div>
</div>
<!-- IT Operation Menu -->
<div>
<button class="w-full flex items-center justify-between px-6 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
<div class="flex items-center gap-3">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<span class="font-medium text-sm text-white">IT Operation</span>
</div>
<svg class="w-4 h-4 transform rotate-180 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
</button>
<div class="flex flex-col py-1">
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi CPU Server</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi Memory Server</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi Storage Server</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi CPU Aplikasi Ellipse dan CISEA</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi CPU Database aplikasi Ellipse dan CISEA</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi memory database Ellipse dan CISEA</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Utilisasi storage database Ellipse dan CISEA</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Rata-rata utilisasi bandwidth jaringan</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors leading-snug" href="#">Ketersediaan sistem backup Ellipse, email, DR Ellipse, jaringan (WAN) dan CISEA</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors leading-snug" href="#">Tingkat ketersediaan sistem keamanan TI</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Penyelesaian pekerjaan PC Support</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors" href="#">Penyelesaian permintaan layanan aplikasi TI</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors leading-snug" href="#">Penyelesaian Permintaan Layanan TI di Operasional TI</a>
<a class="pl-14 pr-6 py-2 text-sm text-slate-300 hover:text-white transition-colors leading-snug" href="#">Realisasi Restore Ellipse dan Email sesuai kebutuhan</a>
</div>
</div>
</nav>
</aside>
<!-- END: Sidebar -->
<!-- BEGIN: Main Content -->
<main class="flex-1 flex flex-col h-screen overflow-hidden bg-white relative z-10">
<!-- Top Header Navigation -->
<header class="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white shrink-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-slate-400 hover:text-slate-600" href="#">
<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
</a>
<span class="text-slate-300">/</span>
<span class="font-medium text-slate-700">Dashboard Utama</span>
</div>
<!-- User Avatar -->
<div class="flex items-center">
<div class="w-8 h-8 rounded bg-primary-900 text-white flex items-center justify-center font-bold text-sm">
          A
        </div>
</div>
</header>
<!-- Dashboard Content Area -->
<div class="flex-1 overflow-y-auto p-6 bg-slate-50"><div class="max-w-7xl mx-auto space-y-[10px] p-[10px]">
<!-- Top Row: 4 Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[10px]">
<!-- Card 1 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Realisasi Program Kerja TI</h3>
<div class="chart-container h-[180px]">
<canvas id="chartProgKerja" width="297" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 198.2px;"></canvas>
</div>
</div>
<!-- Card 2 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Realisasi RKAP TI</h3>
<div class="chart-container-donut h-[140px]">
<canvas id="chartRKAP" width="297" height="210" style="display: block; box-sizing: border-box; height: 140px; width: 198.2px;"></canvas>
<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
<span class="text-2xl font-bold text-slate-800">89%</span>
<span class="text-[8px] text-slate-500 font-medium">REALISASI</span>
</div>
</div>
<div class="flex justify-center gap-3 mt-2 text-[10px] text-slate-600">
<div class="flex items-center gap-1"><div class="w-2 h-2 bg-primary-900 rounded-sm"></div> Realisasi (%)</div>
<div class="flex items-center gap-1"><div class="w-2 h-2 bg-amber-500 rounded-sm"></div> Cost Reduction (%)</div>
</div>
</div>
<!-- Card 3 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Exp Rate Lisensi</h3>
<div class="chart-container h-[180px]">
<canvas id="chartLisensi" width="297" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 198.2px;"></canvas>
</div>
</div>
<!-- Card 4 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Ketersediaan Report Aplikasi SCMC</h3>
<div class="chart-container h-[180px]">
<canvas id="chartSCMC" width="297" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 198.2px;"></canvas>
</div>
</div>
</div>
<!-- Second Row: 3 Cards -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-[10px]">
<!-- Card 5 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Tingkat Ketersediaan Sistem</h3>
<div class="chart-container h-[180px]">
<canvas id="chartKetersediaanSistem" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
<!-- Card 6 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Utilisasi Bandwidth Jaringan</h3>
<div class="chart-container h-[180px]">
<canvas id="chartBandwidth" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
<!-- Card 7 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Penyelesaian Pekerjaan PC Support</h3>
<div class="chart-container h-[180px]">
<canvas id="chartPCSupport" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
</div>
<!-- Third Row: 3 Cards -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-[10px]">
<!-- Card 8 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Penyelesaian Permintaan Layanan Aplikasi TI</h3>
<div class="chart-container h-[180px]">
<canvas id="chartLayananAplikasi" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
<!-- Card 9 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Penyelesaian Permintaan Layanan TI di Operasional TI</h3>
<div class="chart-container h-[180px]">
<canvas id="chartLayananOperasional" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
<!-- Card 10 -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
<h3 class="text-xs font-semibold text-slate-800 mb-2">Visualisasi Realisasi Restore Ellipse dan Email</h3>
<div class="chart-container h-[180px]">
<canvas id="chartRestore" width="414" height="270" style="display: block; box-sizing: border-box; height: 180px; width: 276px;"></canvas>
</div>
</div>
</div>
</div></div>
</main>
<!-- END: Main Content -->
<!-- Chart.js Setup Scripts -->
<script data-purpose="charts-initialization">
    const chartOptionsBar = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 11, family: "'Inter', sans-serif" } } }
      }
    };

    // Card 1
    new Chart(document.getElementById('chartProgKerja'), {
      type: 'bar',
      data: {
        labels: ['TW III s.d Okt 2024'],
        datasets: [
          { label: 'Target', data: [100], backgroundColor: '#0f2e60', barThickness: 40 },
          { label: 'Realisasi', data: [92], backgroundColor: '#f59e0b', barThickness: 40 }
        ]
      },
      options: chartOptionsBar
    });

    // Card 2 (Donut)
    new Chart(document.getElementById('chartRKAP'), {
      type: 'doughnut',
      data: {
        labels: ['Realisasi', 'Remaining'],
        datasets: [{
          data: [89, 11],
          backgroundColor: ['#f59e0b', '#f1f5f9'],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        rotation: -90, circumference: 360,
      }
    });

    // Card 3
    new Chart(document.getElementById('chartLisensi'), {
      type: 'bar',
      data: {
        labels: ['Insider', 'Whatsapp', 'Docu', 'SSL', 'Web'],
        datasets: [{
          label: 'Status',
          data: [15, 25, 20, 75, 80],
          backgroundColor: ['#ef4444', '#3b82f6', '#3b82f6', '#10b981', '#10b981'],
          barThickness: 20
        }]
      },
      options: {
        ...chartOptionsBar,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              generateLabels: () => [
                { text: 'Proses Renewal', fillStyle: '#ef4444', hidden: false, index: 0 },
                { text: 'Autodebet', fillStyle: '#3b82f6', hidden: false, index: 1 },
                { text: 'Aktif', fillStyle: '#10b981', hidden: false, index: 2 }
              ],
              usePointStyle: true, boxWidth: 8, padding: 15, font: { size: 11 }
            }
          }
        }
      }
    });

    // Card 4
    new Chart(document.getElementById('chartSCMC'), {
      type: 'bar',
      data: {
        labels: ['JUNI 2024', 'OKTOBER 2024'],
        datasets: [
          { label: 'Realisasi Laporan yang Beroperasi Normal', data: [58, 58], backgroundColor: '#0f2e60', barThickness: 30 },
          { label: 'Jumlah Laporan Tersedia', data: [58, 58], backgroundColor: '#f59e0b', barThickness: 30 }
        ]
      },
      options: chartOptionsBar
    });

    // Card 5
    new Chart(document.getElementById('chartKetersediaanSistem'), {
      type: 'bar',
      data: {
        labels: ['Ellipse', 'Email', 'CISEA', 'SIMKES'],
        datasets: [
          { label: 'Rencana', data: [100, 100, 100, 100], backgroundColor: '#0f2e60', barThickness: 30 },
          { label: 'Realisasi', data: [99.5, 99.8, 98.5, 100], backgroundColor: '#f59e0b', barThickness: 30 }
        ]
      },
      options: chartOptionsBar
    });

    // Card 6
    new Chart(document.getElementById('chartBandwidth'), {
      type: 'bar',
      data: {
        labels: ['M.Kadin', 'Tarahan', 'Kertapati', 'Griya Puncak', 'Bukit Kecil', 'UPO'],
        datasets: [
          { label: 'Bandwidth (Mbps)', data: [32.41, 17.76, 8.82, 3.97, 9.83, 1.91], backgroundColor: '#0f2e60', barThickness: 20 },
          { label: 'Rata-rata Utilisasi (Mbps)', data: [7.59, 2.24, 1.18, 0.03, 0.17, 0.09], backgroundColor: '#f59e0b', barThickness: 20 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { stacked: true, beginAtZero: true, grid: { color: '#f1f5f9' }, border: { dash: [4, 4] } },
          x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 11, family: "'Inter', sans-serif" } } }
        }
      }
    });

    // Setup generic monthly data for trend charts
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    // Card 7
    new Chart(document.getElementById('chartPCSupport'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'WO Masuk', data: [10, 15, 80, 50, 45, 60, 50, 50, 50, 50, 850, 80], backgroundColor: '#0f2e60' },
          { label: 'WO Selesai', data: [9, 14, 75, 48, 45, 58, 48, 48, 48, 48, 700, 75], backgroundColor: '#f59e0b' }
        ]
      },
      options: { ...chartOptionsBar, scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} } } } }
    });

    // Card 8
    new Chart(document.getElementById('chartLayananAplikasi'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'WO Masuk', data: [10, 20, 40, 80, 120, 250, 180, 120, 110, 80, 70, 50], backgroundColor: '#0f2e60' },
          { label: 'WO Selesai', data: [9, 18, 38, 75, 115, 240, 175, 118, 108, 78, 68, 48], backgroundColor: '#f59e0b' }
        ]
      },
      options: { ...chartOptionsBar, scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} } } } }
    });

    // Card 9
    new Chart(document.getElementById('chartLayananOperasional'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'WO Masuk', data: [50, 60, 80, 220, 250, 240, 210, 160, 140, 140, 140, 130], backgroundColor: '#0f2e60' },
          { label: 'WO Selesai', data: [48, 58, 75, 215, 245, 235, 205, 155, 135, 138, 138, 128], backgroundColor: '#f59e0b' }
        ]
      },
      options: { ...chartOptionsBar, scales: { x: { ticks: { maxRotation: 45, minRotation: 45, font: {size: 10} } } } }
    });

    // Card 10 (Placeholder pattern for bottom chart)
    new Chart(document.getElementById('chartRestore'), {
      type: 'bar',
      data: {
        labels: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
        datasets: [
          { label: 'Target', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28], backgroundColor: '#0f2e60' },
          { label: 'Realisasi', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28], backgroundColor: '#f59e0b' }
        ]
      },
      options: { ...chartOptionsBar, scales: { x: { ticks: { maxRotation: 0, font: {size: 10} } } } }
    });
  </script>




</body></html>

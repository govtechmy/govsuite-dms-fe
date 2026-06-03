import { useState } from 'react'
import Ringkasan from '@/components/shared/Ringkasan';
import Selamat from '@/components/shared/Selamat';
import StatCard from '@/components/shared/statcard';

export function DropdownTahun() {
  const [tahun, setTahun] = useState(''); 

  return (
    <div className="flex items-center border border-gray-200 bg-white rounded-lg px-3 py-1 shadow-sm hover:border-gray-300 transition-colors cursor-pointer h-8 w-fit">
      <span className="text-sm font-normal text-gray-500 mr-1.5 select-none whitespace-nowrap">
        Tahun
      </span>
      
      <select
        value={tahun}
        onChange={(e) => setTahun(e.target.value)}
        className="text-sm font-semibold text-gray-800 bg-transparent pr-4 focus:outline-none appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231f2937' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'></path></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          backgroundSize: '12px'
        }}
      >
        <option value=""></option>
        <option value="2026">2026</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
      </select>
    </div>
  );
}

export default function HomePage() {
  // Data simulasi untuk 3 kad
  const dataJumlahDokumen = 821; 
  const dataPerlukanKelulusan = 42;
  const dataDokumenDitolak = 10; // Data baru untuk kad ketiga

  return (
    <div className="p-4 w-full">
      <Selamat />
      
      <div className="flex flex-col xl:flex-row items-start justify-between w-full mt-4 gap-6">
        
        <div className="flex flex-col gap-4 flex-1 w-full">
          <Ringkasan />
          

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-3xl">
            <StatCard 
              jumlah={dataJumlahDokumen} 
              label="Jumlah Dokumen" 
              varian="biru" 
            />
            <StatCard 
              jumlah={dataPerlukanKelulusan} 
              label="Perlukan Kelulusan" 
              varian="kuning" 
            />
            <StatCard 
              jumlah={dataDokumenDitolak} 
              label="Dokumen Ditolak" 
              varian="merah" 
            />
          </div>
        </div>
        
        {/* Bahagian Kanan: Dropdown */}
        <DropdownTahun />
        
      </div>
    </div>
  );
}
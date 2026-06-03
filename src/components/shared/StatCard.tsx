type Varian = 'biru' | 'kuning' | 'merah';

interface StatCardProps {
  jumlah?: number;
  label?: string;
  varian?: Varian;
}

export default function StatCard({ jumlah = 0, label = '', varian = 'biru' }: StatCardProps) {
  // Ditambah varian 'merah' mengikut tema kad ketiga dalam gambar
  const stailVarian: Record<Varian, { bg: string; border: string }> = {
    biru: {
      bg: 'bg-[#f0f5ff]',
      border: 'border-[#adc6ff]'
    },
    kuning: {
      bg: 'bg-[#fefee6]',
      border: 'border-[#ffe58f]'
    },
    merah: {
      bg: 'bg-[#fff1f0]', // Merah jambu / merah lembut pudar
      border: 'border-[#ffa39e]' // Garisan border merah pekat
    }
  };

  const warnaPilihan = stailVarian[varian] || stailVarian.biru;

  return (
    <div className={`flex flex-col items-center justify-center ${warnaPilihan.bg} border-l-4 ${warnaPilihan.border} rounded-r-xl rounded-l-md px-6 py-4 shadow-sm min-w-[180px] flex-1`}>
      {/* Nilai Angka */}
      <span className="text-4xl font-bold text-gray-800 tracking-tight">
        {jumlah}
      </span>
      
      {/* Label / Teks bawah */}
      <span className="text-sm font-medium text-gray-600 mt-1 select-none text-center whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
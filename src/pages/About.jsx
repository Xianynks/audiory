import { SpecPanel, Panel } from "../components/DetailParts.jsx";

export default function About() {
  return (
    <div className="detail">
      <h1 className="page-title">Tentang Audiory</h1>

      <Panel title="Apa itu Audiory">
        <p>
          Audiory adalah katalog informasi perangkat audio, dengan fokus utama
          pada In-Ear Monitor (IEM) dan pelengkapnya berupa DAC/Amp. Setiap
          perangkat dapat dikelompokkan berdasarkan tuning dan genre musik yang
          cocok, lengkap dengan deskripsi, spesifikasi, karakteristik suara, dan
          review.
        </p>
      </Panel>

      <Panel title="Fitur">
        <ul className="list">
          <li>Katalog IEM dan DAC/Amp dengan halaman detail</li>
          <li>Kategori Tuning dan Genre yang dapat ditambah, diubah, dan dihapus</li>
          <li>Tambah, ubah, dan hapus data beserta gambar dan grafik frequency response</li>
          <li>Hapus aman: data masuk ke Sampah dan bisa dipulihkan</li>
          <li>Dapat dipasang sebagai aplikasi (PWA)</li>
        </ul>
      </Panel>

      <SpecPanel
        title="Pembuat"
        rows={[
          ["Nama", "Mikail Hikam Altiyar"],
          ["NIM", "21120124130102"],
          ["Teknologi", "React, Vite, Axios, PWA (JavaScript)"],
          ["Versi", "2.0.0"]
        ]}
      />
    </div>
  );
}

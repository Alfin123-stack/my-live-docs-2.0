export type TemplateId = 'meeting-notes' | 'project-brief' | 'weekly-report';

export type TemplateBlock =
  | { type: 'heading'; tag: 'h1' | 'h2'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

export const TEMPLATE_IDS: TemplateId[] = ['meeting-notes', 'project-brief', 'weekly-report'];

// Isi diketik langsung dalam Bahasa Indonesia (bukan lewat i18n) karena ini KONTEN dokumen
// yang akan diedit user, bukan teks UI — beda kelas dari string interface biasa.
//
// Tiap template diisi teks contoh nyata (bukan paragraf kosong) supaya dokumen baru terasa
// "siap pakai" — user tinggal menimpa contoh, bukan menatap halaman kosong. Blok `quote`
// dipakai sebagai kotak tip kecil di section yang paling sering butuh arahan, dan blok
// `list` (Fase 7 — butuh @lexical/list, lihat Editor.tsx/ToolbarPlugin.tsx) memberi agenda
// dan action item bentuk bullet/numbered, bukan paragraf datar.
export const TEMPLATES: Record<TemplateId, { labelKey: string; blocks: TemplateBlock[] }> = {
  'meeting-notes': {
    labelKey: 'templateMeetingNotes',
    blocks: [
      { type: 'heading', tag: 'h1', text: 'Catatan Rapat' },
      { type: 'heading', tag: 'h2', text: 'Peserta' },
      {
        type: 'list',
        ordered: false,
        items: ['Nama peserta — jabatan/peran', 'Nama peserta — jabatan/peran'],
      },
      { type: 'heading', tag: 'h2', text: 'Agenda' },
      {
        type: 'list',
        ordered: false,
        items: ['Topik pertama yang dibahas', 'Topik kedua yang dibahas'],
      },
      { type: 'quote', text: 'Tip: tulis agenda sebelum rapat dimulai supaya diskusi tetap fokus dan tidak melebar.' },
      { type: 'heading', tag: 'h2', text: 'Keputusan' },
      { type: 'paragraph', text: 'Rangkum keputusan penting yang diambil di rapat ini.' },
      { type: 'heading', tag: 'h2', text: 'Tindak lanjut' },
      {
        type: 'list',
        ordered: true,
        items: ['Nama penanggung jawab — tugas — tenggat waktu'],
      },
    ],
  },
  'project-brief': {
    labelKey: 'templateProjectBrief',
    blocks: [
      { type: 'heading', tag: 'h1', text: 'Brief Proyek' },
      { type: 'heading', tag: 'h2', text: 'Latar belakang' },
      { type: 'paragraph', text: 'Jelaskan masalah atau peluang yang melatarbelakangi proyek ini.' },
      { type: 'heading', tag: 'h2', text: 'Tujuan' },
      {
        type: 'list',
        ordered: false,
        items: ['Tujuan utama yang ingin dicapai', 'Metrik keberhasilan (KPI)'],
      },
      { type: 'quote', text: 'Tip: tulis tujuan yang terukur, supaya semua orang tahu proyek ini berhasil kalau apa.' },
      { type: 'heading', tag: 'h2', text: 'Ruang lingkup' },
      { type: 'paragraph', text: 'Apa saja yang termasuk — dan tidak termasuk — dalam proyek ini?' },
      { type: 'heading', tag: 'h2', text: 'Linimasa' },
      {
        type: 'list',
        ordered: true,
        items: ['Milestone pertama — tanggal target', 'Milestone kedua — tanggal target'],
      },
    ],
  },
  'weekly-report': {
    labelKey: 'templateWeeklyReport',
    blocks: [
      { type: 'heading', tag: 'h1', text: 'Laporan Mingguan' },
      { type: 'heading', tag: 'h2', text: 'Ringkasan' },
      { type: 'paragraph', text: 'Ringkasan singkat progres minggu ini dalam 2–3 kalimat.' },
      { type: 'heading', tag: 'h2', text: 'Progres minggu ini' },
      {
        type: 'list',
        ordered: false,
        items: ['Hal yang sudah selesai dikerjakan', 'Hal yang masih berjalan'],
      },
      { type: 'heading', tag: 'h2', text: 'Kendala' },
      { type: 'quote', text: 'Tip: sebutkan kendala sedini mungkin supaya tim bisa bantu cari solusi lebih cepat.' },
      { type: 'paragraph', text: 'Kendala atau hambatan yang dihadapi minggu ini.' },
      { type: 'heading', tag: 'h2', text: 'Rencana minggu depan' },
      {
        type: 'list',
        ordered: true,
        items: ['Prioritas pertama untuk minggu depan', 'Prioritas kedua untuk minggu depan'],
      },
    ],
  },
};

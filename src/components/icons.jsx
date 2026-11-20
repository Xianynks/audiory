// Ikon navigasi. Semua memakai currentColor, jadi warnanya mengikuti teks
// (abu-abu saat tidak aktif, biru saat aktif).
//
// - IconTuning : dari file Tunings.svg milik Anda.
// - Ikon lain  : pengganti sederhana, karena Catalogs.svg dan Trash.svg
//                hasil trace-nya terpecah, About.svg kosong, dan Genres.svg
//                terlalu detail untuk ukuran 24 px. Ganti isinya kapan saja
//                dengan versi final Anda.

const base = {
  width: 24,
  height: 24,
  fill: "currentColor",
  "aria-hidden": true,
  focusable: "false"
};

export function IconCatalog() {
  return (
    <svg viewBox="0 0 24 24" {...base}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}

export function IconTuning() {
  return (
    <svg viewBox="110 109 860 860" {...base}>
      <g transform="translate(0,1080) scale(0.1,-0.1)">
        <path d="M2750 9464 c-62 -22 -93 -42 -117 -77 l-28 -40 -5 -1034 -5 -1034 -83 -28 c-201 -70 -364 -214 -457 -406 -57 -118 -75 -187 -82 -321 -19 -368 207 -698 559 -813 l68 -23 2 -2117 3 -2117 25 -37 c77 -113 251 -104 309 16 l21 43 0 2106 0 2106 68 22 c257 84 450 282 533 550 21 65 24 96 24 225 0 130 -3 160 -24 225 -83 264 -263 454 -514 541 l-82 28 -5 1033 -5 1033 -24 38 c-33 54 -132 98 -181 81z" />
        <path d="M5360 9461 c-53 -17 -89 -42 -112 -78 l-23 -38 -5 -2389 -5 -2389 -65 -22 c-244 -83 -432 -266 -514 -501 -38 -107 -49 -195 -43 -319 13 -249 132 -467 334 -611 67 -48 183 -105 251 -123 l42 -12 0 -751 c0 -743 0 -752 21 -795 62 -127 256 -127 318 0 21 43 21 52 21 795 l0 751 43 12 c122 32 271 124 368 225 205 216 274 541 174 826 -82 235 -263 414 -505 499 l-75 27 -5 2389 -5 2389 -25 38 c-39 59 -130 96 -190 77z" />
        <path d="M7968 9456 c-60 -22 -84 -42 -107 -89 -21 -43 -21 -53 -21 -614 l0 -571 -32 -7 c-18 -4 -64 -20 -102 -36 -184 -78 -350 -241 -429 -421 -52 -119 -62 -173 -61 -338 0 -142 3 -162 28 -235 53 -155 135 -276 260 -382 69 -60 206 -133 284 -153 l52 -14 0 -2560 0 -2560 21 -43 c58 -120 232 -129 309 -16 l25 37 3 2570 2 2571 76 24 c209 66 410 254 495 462 75 184 78 408 9 593 -89 236 -301 432 -537 495 l-43 12 -2 583 -3 582 -25 37 c-45 66 -134 98 -202 73z" />
      </g>
    </svg>
  );
}

export function IconGenre() {
  return (
    <svg viewBox="0 0 24 24" {...base}>
      <path d="M19 3 9 5v10.3A3.2 3.2 0 1 0 11 18V8.6l6-1.2v5.9a3.2 3.2 0 1 0 2 2.9V3z" />
    </svg>
  );
}

export function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" {...base}>
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 11a1.6 1.6 0 0 1-1.6 1.5H8.6A1.6 1.6 0 0 1 7 20L6 9z" />
    </svg>
  );
}

export function IconAbout() {
  return (
    <svg viewBox="0 0 24 24" {...base}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      />
    </svg>
  );
}

// Ikon pengganti sederhana (gelembung percakapan) untuk menu Diskusi
export function IconDiscussion() {
  return (
    <svg viewBox="0 0 24 24" {...base}>
      <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

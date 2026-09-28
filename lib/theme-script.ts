// Sengaja di file terpisah (bukan di components/theme-provider.tsx yang "use client"):
// server component hanya bisa membaca nilai ekspor dari modul non-client sebagai string.
export const THEME_STORAGE_KEY = "theme";
export const THEME_DARK_QUERY = "(prefers-color-scheme: dark)";

/** Dijalankan inline di <head> sebelum paint: set data-theme + color-scheme (cegah kedip tema). */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var r=t==="light"||t==="dark"?t:(window.matchMedia("${THEME_DARK_QUERY}").matches?"dark":"light");var d=document.documentElement;d.setAttribute("data-theme",r);d.style.colorScheme=r;}catch(e){}})();`;

"use client";

import { createContext, useContext } from "react";

/**
 * Kata kunci pencarian dokumen (sudah di-trim & lowercase). Disimpan di sisi
 * client supaya mengetik TIDAK memicu request ke server; filter dilakukan di
 * memori terhadap daftar dokumen yang sudah dimuat.
 */
export const DocumentSearchContext = createContext("");

export function useDocumentSearch(): string {
  return useContext(DocumentSearchContext);
}

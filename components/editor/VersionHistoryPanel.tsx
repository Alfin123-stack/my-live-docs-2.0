'use client';

import { useState } from 'react';
import { useHistoryVersions } from '@liveblocks/react/suspense';
import { useRestoreToStorageVersion } from '@liveblocks/react';
import { HistoryVersionSummary, HistoryVersionSummaryList } from '@liveblocks/react-ui';
import { History, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Riwayat versi native Liveblocks — TIDAK ada dependency baru, TIDAK ada snapshot manual
// yang perlu disimpan sendiri di MongoDB. Liveblocks yang mengelola snapshot storage
// secara otomatis di balik layar.
//
// CATATAN: retensi versi di plan Free Liveblocks cuma 24 jam. Kalau butuh riwayat lebih
// panjang, itu keputusan billing Liveblocks (upgrade plan), bukan sesuatu yang bisa
// diubah dari sini.
export default function VersionHistoryPanel() {
  const t = useTranslations('Editor');
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { versions } = useHistoryVersions();
  const restore = useRestoreToStorageVersion(selectedId ?? '');

  const handleRestore = async () => {
    if (!selectedId) return;
    try {
      await restore();
      toast.success(t('versionRestored'));
      setOpen(false);
      setSelectedId(null);
    } catch {
      toast.error(t('versionRestoreError'));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('versionHistoryTitle')}
        title={t('versionHistoryTitle')}
        className="icon-btn"
      >
        <History className="size-4" aria-hidden />
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelectedId(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('versionHistoryTitle')}</DialogTitle>
          </DialogHeader>

          <p className="mb-2 text-xs text-muted">{t('versionHistoryNote')}</p>

          <div className="max-h-80 overflow-y-auto">
            {versions.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">{t('versionHistoryEmpty')}</p>
            )}
            {versions.length > 0 && (
              <HistoryVersionSummaryList>
                {versions.map((version) => (
                  <HistoryVersionSummary
                    key={version.id}
                    version={version}
                    onClick={() => setSelectedId(version.id)}
                    className={
                      selectedId === version.id
                        ? 'w-full rounded-control border border-violet/40 bg-recessed px-2 py-1.5 text-left'
                        : 'w-full rounded-control border border-transparent px-2 py-1.5 text-left hover:bg-recessed'
                    }
                  />
                ))}
              </HistoryVersionSummaryList>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={handleRestore}
              disabled={!selectedId}
              className="w-full"
            >
              <RotateCcw aria-hidden /> {t('versionRestore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from '@/i18n/navigation';
import { createDocument } from '@/lib/actions/room.actions';
import { useActionErrorMessage } from '@/components/hooks/use-action-error';

type DocumentItem = { id: string; title: string };

// Command palette (Fase 2 #10) — pencarian client-side atas daftar dokumen yang SUDAH
// dimuat dashboard (sama seperti kotak pencarian biasa), bukan panggilan API terpisah.
export default function CommandPaletteClient({ documents }: { documents: DocumentItem[] }) {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const errorMessage = useActionErrorMessage();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? documents.filter((d) => d.title.toLowerCase().includes(q)) : documents;
    return pool.slice(0, 8);
  }, [documents, query]);

  const handleCreate = async () => {
    setCreating(true);
    const result = await createDocument();
    setCreating(false);
    if (result.ok) {
      setOpen(false);
      router.push(`/documents/${result.data.id}`);
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery('');
      }}
    >
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-transparent text-sm text-ink-soft outline-none placeholder:text-muted"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-1">
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-violet-ink transition hover:bg-recessed disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden /> {t('newDocument')}
          </button>

          {results.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/documents/${doc.id}`);
              }}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-recessed"
            >
              <FileText className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="truncate">{doc.title || 'Untitled'}</span>
            </button>
          ))}

          {results.length === 0 && query && (
            <p className="px-3 py-4 text-center text-sm text-muted">{t('searchEmpty')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

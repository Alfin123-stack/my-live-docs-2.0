'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense';

import { Editor } from '@/components/editor/Editor';
import Header from '@/components/Header';
import { UserMenu } from '@/components/UserMenu';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Link } from '@/i18n/navigation';
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import { updateDocument } from '@/lib/actions/room.actions';
import { useActionErrorMessage } from '@/components/hooks/use-action-error';
import Loader from './Loader';
import ShareModal from './ShareModal';

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType, isOwner, publicAccess }: CollaborativeRoomProps) => {
  const t = useTranslations('Editor');
  const errorMessage = useActionErrorMessage();
  // Deep-link dari menu ⋯ di dashboard ("Bagikan" → /documents/[id]?share=1).
  const searchParams = useSearchParams();
  const shareOnMount = searchParams.get('share') === '1';

  const [savedTitle, setSavedTitle] = useState(roomMetadata.title);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canEdit = currentUserType === 'editor';

  const cancelEditing = useCallback(() => {
    setDocumentTitle(savedTitle);
    setEditing(false);
  }, [savedTitle]);

  const saveTitle = useCallback(async () => {
    const next = documentTitle.trim();

    // Tidak ada perubahan / kosong → tidak perlu memanggil server sama sekali.
    if (!next || next === savedTitle) {
      cancelEditing();
      return;
    }

    setLoading(true);
    const result = await updateDocument({ roomId, title: next });
    setLoading(false);

    if (result.ok) {
      setSavedTitle(result.data.title);
      setDocumentTitle(result.data.title);
      setEditing(false);
    } else {
      toast.error(errorMessage(result.error));
      cancelEditing();
    }
  }, [cancelEditing, documentTitle, errorMessage, roomId, savedTitle]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void saveTitle();
    if (e.key === 'Escape') cancelEditing();
  };

  // Listener klik-di-luar HANYA aktif saat mode edit. Dulu terpasang terus dan
  // memanggil server (API Liveblocks + revalidate) pada setiap klik di halaman,
  // termasuk oleh viewer.
  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        void saveTitle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing, saveTitle]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header
            hideLogoOnMobile
            leading={
              <Link
                href="/documents"
                aria-label={t('backToDocuments')}
                title={t('backToDocuments')}
                className="icon-btn icon-btn-sm"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            }
          >
            <div ref={containerRef} className="flex min-w-0 flex-1 items-center gap-2 sm:justify-center">
              {editing ? (
                <Input
                  type="text"
                  value={documentTitle}
                  ref={inputRef}
                  maxLength={120}
                  aria-label={t('enterTitle')}
                  placeholder={t('enterTitle')}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={loading}
                  className="document-title-input"
                />
              ) : (
                <p className="document-title truncate">{documentTitle}</p>
              )}

              {canEdit && !editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={t('editTitle')}
                  className="icon-btn icon-btn-sm border-transparent bg-transparent"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
              )}

              {!canEdit && <p className="view-only-tag">{t('viewOnly')}</p>}
              {loading && <p className="text-sm text-muted">{t('saving')}</p>}
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-1 sm:justify-end sm:gap-3">
              <ActiveCollaborators />

              <ShareModal
                roomId={roomId}
                collaborators={users}
                ownerEmail={roomMetadata.email}
                currentUserType={currentUserType}
                defaultOpen={shareOnMount}
                isOwner={isOwner}
                publicAccess={publicAccess}
              />

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
                <LocaleSwitcher />
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType} isOwner={isOwner} title={documentTitle} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;

'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import UserTypeSelector from './UserTypeSelector';
import Collaborator from './Collaborator';
import { updateDocumentAccess, setPublicAccess } from '@/lib/actions/room.actions';
import { emailSchema } from '@/lib/auth/schemas';
import { useActionErrorMessage } from '@/components/hooks/use-action-error';
import { Globe2, Lock, Share2 } from 'lucide-react';

const ShareModal = ({
  roomId,
  collaborators,
  ownerEmail,
  currentUserType,
  defaultOpen = false,
  isOwner,
  publicAccess,
}: ShareDocumentDialogProps) => {
  const t = useTranslations('Share');
  const errorMessage = useActionErrorMessage();

  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>('viewer');
  const [isPublic, setIsPublic] = useState(publicAccess);
  const [togglingPublic, setTogglingPublic] = useState(false);

  const togglePublicAccess = async () => {
    const next = !isPublic;
    setTogglingPublic(true);
    const result = await setPublicAccess({ roomId, enabled: next });
    setTogglingPublic(false);
    if (result.ok) {
      setIsPublic(next);
      toast.success(next ? t('publicOn') : t('publicOff'));
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const shareDocumentHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);

    // Normalisasi (trim + huruf kecil) + validasi sebelum dikirim.
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(t('emailInvalid'));
      return;
    }

    setLoading(true);
    const result = await updateDocumentAccess({
      roomId,
      email: parsed.data,
      userType: userType === 'editor' ? 'editor' : 'viewer',
    });
    setLoading(false);

    if (result.ok) {
      toast.success(t('invited', { email: parsed.data }));
      setEmail('');
    } else {
      setEmailError(errorMessage(result.error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-8 gap-1.5 px-3 sm:h-9 sm:px-4"
          disabled={currentUserType !== 'editor'}
          aria-label={t('trigger')}
        >
          <Share2 aria-hidden />
          <span>{t('trigger')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={shareDocumentHandler} noValidate>
          <Label htmlFor="share-email" className="mt-2 block sm:mt-4">
            {t('emailLabel')}
          </Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex flex-1 items-center rounded-field border border-hairline bg-canvas focus-within:border-violet focus-within:ring-2 focus-within:ring-violet/30">
              <Input
                id="share-email"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'share-email-error' : undefined}
                className="share-input border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <UserTypeSelector userType={userType} setUserType={setUserType} disabled={loading} />
            </div>
            <Button type="submit" size="lg" className="h-10 text-sm sm:h-11" disabled={loading}>
              {loading ? t('inviting') : t('invite')}
            </Button>
          </div>
          {emailError && (
            <p id="share-email-error" role="alert" className="mt-2 text-sm font-medium text-danger">
              {emailError}
            </p>
          )}
        </form>

        {isOwner && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-panel border border-hairline bg-recessed p-2.5 sm:mt-4 sm:p-3">
            <div className="flex items-start gap-2">
              {isPublic ? (
                <Globe2 className="mt-0.5 size-4 shrink-0 text-violet-ink" aria-hidden />
              ) : (
                <Lock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              )}
              <div>
                <p className="text-[13px] font-medium text-ink sm:text-sm">{t('publicAccessTitle')}</p>
                <p className="text-[11px] leading-snug text-muted sm:text-xs">{t('publicAccessDescription')}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              aria-label={t('publicAccessTitle')}
              disabled={togglingPublic}
              onClick={togglePublicAccess}
              className={`relative h-5 w-9 shrink-0 rounded-full sm:h-6 sm:w-11 transition ${
                isPublic ? 'bg-action' : 'bg-strong'
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-paper shadow-sm transition sm:size-5 ${
                  isPublic ? 'left-4 sm:left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        )}

        <div className="my-2 space-y-2">
          <ul className="flex flex-col">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.email}
                roomId={roomId}
                ownerEmail={ownerEmail}
                email={collaborator.email}
                collaborator={collaborator}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

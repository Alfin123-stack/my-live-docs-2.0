'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import UserTypeSelector from './UserTypeSelector';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import { removeCollaborator, updateDocumentAccess } from '@/lib/actions/room.actions';
import { useActionErrorMessage } from '@/components/hooks/use-action-error';

const Collaborator = ({ roomId, ownerEmail, collaborator }: CollaboratorProps) => {
  const t = useTranslations('Share');
  const errorMessage = useActionErrorMessage();

  const [userType, setUserType] = useState<UserType>(collaborator.userType || 'viewer');
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    const previous = userType;
    setLoading(true);

    const result = await updateDocumentAccess({
      roomId,
      email: collaborator.email,
      userType: type === 'editor' ? 'editor' : 'viewer',
    });

    setLoading(false);
    if (!result.ok) {
      setUserType(previous); // kembalikan pilihan bila gagal
      toast.error(errorMessage(result.error));
    }
  };

  const removeCollaboratorHandler = async () => {
    setLoading(true);
    const result = await removeCollaborator({ roomId, email: collaborator.email });
    setLoading(false);

    if (result.ok) toast.success(t('removed', { email: collaborator.email }));
    else toast.error(errorMessage(result.error));
  };

  const isOwner = collaborator.email.toLowerCase() === ownerEmail.toLowerCase();

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2 sm:py-3">
      <div className="flex min-w-0 gap-2">
        <UserAvatar name={collaborator.name} email={collaborator.email} color={collaborator.color} size={32} />
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold leading-4 text-ink sm:text-sm">
            {collaborator.name}
            <span className="pl-2 text-xs font-normal text-muted" aria-live="polite">
              {loading && t('updating')}
            </span>
          </p>
          <p className="truncate text-xs font-light text-muted sm:text-sm">{collaborator.email}</p>
        </div>
      </div>

      {isOwner ? (
        <p className="text-xs text-muted sm:text-sm">{t('owner')}</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            userType={userType}
            setUserType={setUserType}
            onClickHandler={shareDocumentHandler}
            disabled={loading}
          />
          <Button type="button" variant="ghost-danger" size="sm" onClick={removeCollaboratorHandler} disabled={loading}>
            {t('remove')}
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;

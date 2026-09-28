'use client';

import { useOthers } from '@liveblocks/react/suspense';
import { useTranslations } from 'next-intl';

import { UserAvatar } from './UserAvatar';

const ActiveCollaborators = () => {
  const t = useTranslations('Editor');
  const others = useOthers();

  return (
    <ul className="collaborators-list" aria-label={t('activeCollaborators')}>
      {others.map((other) => {
        const { name, email, color } = other.info;
        return (
          // `connectionId` unik per koneksi (dulu `info.id` yang tidak pernah diisi → key undefined).
          <li key={other.connectionId} title={name}>
            <UserAvatar
              name={name}
              email={email}
              color={color}
              size={32}
              className="ring-2 ring-card"
            />
            <span className="sr-only">{name}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default ActiveCollaborators;

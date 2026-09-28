'use client';

import { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { ClientSideSuspense, LiveblocksProvider } from '@liveblocks/react/suspense';

import Loader from '@/components/Loader';
import { getUsersByEmails, getDocumentUsers } from '@/lib/actions/user.actions';

// `MotionConfig` di sini berlaku untuk seluruh /documents (dashboard + editor), sama
// seperti `LandingRoot.tsx` untuk landing page: satu titik, semua animasi framer-motion
// di bawahnya otomatis pakai easing yang sama dan otomatis mati untuk
// `prefers-reduced-motion` (reducedMotion="user") — tidak perlu diulang per komponen.
const ease = [0.22, 1, 0.36, 1] as const;

const Provider = ({ children }: { children: ReactNode }) => {
  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => getUsersByEmails({ userIds })}
      resolveMentionSuggestions={async ({ text, roomId }) => getDocumentUsers({ roomId, text })}
    >
      <ClientSideSuspense fallback={<Loader />}>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease }}>
          {children}
        </MotionConfig>
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default Provider;

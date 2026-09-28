'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowLeft, LogOut, Save, ShieldAlert, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useActionErrorMessage } from '@/components/hooks/use-action-error';
import { Link } from '@/i18n/navigation';
import {
  changePassword,
  deleteAccount,
  logoutAllDevices,
  updateProfileName,
} from '@/lib/actions/account.actions';

export default function AccountSettingsClient({ name, email }: { name: string; email: string }) {
  const t = useTranslations('Account');
  const locale = useLocale();
  const errorMessage = useActionErrorMessage();
  const reduceMotion = useReducedMotion();

  // --- Profil ---
  const [profileName, setProfileName] = useState(name);
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    const next = profileName.trim();
    if (!next || next === name) return;
    setSavingProfile(true);
    const result = await updateProfileName({ name: next });
    setSavingProfile(false);
    if (result.ok) toast.success(t('profileSaved'));
    else toast.error(errorMessage(result.error));
  };

  // --- Ganti password ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const submitChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setChangingPassword(true);
    const result = await changePassword({ currentPassword, newPassword, locale });
    setChangingPassword(false);
    if (result.ok) {
      toast.success(t('passwordChanged'));
      await signOut({ callbackUrl: '/sign-in' });
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  // --- Keluar dari semua perangkat ---
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const submitLogoutAll = async () => {
    setLoggingOutAll(true);
    const result = await logoutAllDevices();
    setLoggingOutAll(false);
    if (result.ok) {
      await signOut({ callbackUrl: '/sign-in' });
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  // --- Hapus akun ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const submitDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleting(true);
    const result = await deleteAccount({ password: deletePassword });
    setDeleting(false);
    if (result.ok) {
      await signOut({ callbackUrl: '/' });
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-xl flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/documents"
          aria-label={t('backToDocuments')}
          title={t('backToDocuments')}
          className="icon-btn icon-btn-sm shrink-0"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="min-w-0 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">{t('title')}</h1>
      </div>

      {/* Profil */}
      <section className="surface-panel p-5 sm:p-6">
        <h2 className="mb-1 font-display text-base font-bold tracking-[-0.02em] text-ink">{t('profileTitle')}</h2>
        <p className="mb-4 text-xs text-muted">{email}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            maxLength={80}
            className="bg-recessed"
          />
          <Button
            onClick={saveProfile}
            disabled={savingProfile || !profileName.trim() || profileName.trim() === name}
            className="h-11 shrink-0"
          >
            <Save aria-hidden /> {t('save')}
          </Button>
        </div>
      </section>

      {/* Ganti password */}
      <section className="surface-panel p-5 sm:p-6">
        <h2 className="mb-1 font-display text-base font-bold tracking-[-0.02em] text-ink">{t('passwordTitle')}</h2>
        <p className="mb-4 text-xs text-muted">{t('passwordNote')}</p>
        <div className="flex flex-col gap-3">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('currentPassword')}
            autoComplete="current-password"
            className="bg-recessed"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('newPassword')}
            autoComplete="new-password"
            className="bg-recessed"
          />
          <Button
            onClick={submitChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword}
            className="w-fit"
          >
            {t('changePassword')}
          </Button>
        </div>
      </section>

      {/* Keluar dari semua perangkat */}
      <section className="surface-panel p-5 sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold tracking-[-0.02em] text-ink">
          <LogOut className="size-4" aria-hidden /> {t('logoutAllTitle')}
        </h2>
        <p className="mb-4 text-xs text-muted">{t('logoutAllNote')}</p>
        <Button
          onClick={submitLogoutAll}
          disabled={loggingOutAll}
          variant="outline" className="w-fit"
        >
          {t('logoutAllButton')}
        </Button>
      </section>

      {/* Hapus akun */}
      <section className="rounded-panel border border-danger/30 bg-card p-5 shadow-adora sm:p-6">
        <h2 className="mb-1 flex items-center gap-2 font-display text-base font-bold tracking-[-0.02em] text-danger">
          <ShieldAlert className="size-4" aria-hidden /> {t('deleteTitle')}
        </h2>
        <p className="mb-4 text-xs text-muted">{t('deleteNote')}</p>
        <Button
          onClick={() => setDeleteOpen(true)}
          variant="outline" className="w-fit border-danger/40 text-danger hover:bg-danger-soft"
        >
          <Trash2 aria-hidden /> {t('deleteButton')}
        </Button>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted">{t('deleteConfirmBody')}</p>
          <Input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t('currentPassword')}
            autoComplete="current-password"
            className="mt-3 bg-recessed"
          />
          <DialogFooter className="mt-4 flex gap-2">
            <Button
              onClick={() => setDeleteOpen(false)}
              variant="outline" className="flex-1"
            >
              {t('deleteCancel')}
            </Button>
            <Button
              onClick={submitDeleteAccount}
              disabled={deleting || !deletePassword}
              variant="destructive" className="flex-1"
            >
              {t('deleteConfirmButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

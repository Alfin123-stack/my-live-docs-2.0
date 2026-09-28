'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const UserTypeSelector = ({ userType, setUserType, onClickHandler, disabled }: UserTypeSelectorParams) => {
  const t = useTranslations('Share');

  const accessChangeHandler = (type: UserType) => {
    setUserType(type);
    onClickHandler?.(type);
  };

  return (
    <Select value={userType} onValueChange={(type: UserType) => accessChangeHandler(type)} disabled={disabled}>
      <SelectTrigger className="shad-select h-10 text-[13px] sm:h-11 sm:text-sm" aria-label={t('accessLevel')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-none bg-card">
        <SelectItem value="viewer" className="shad-select-item">{t('canView')}</SelectItem>
        <SelectItem value="editor" className="shad-select-item">{t('canEdit')}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserTypeSelector;

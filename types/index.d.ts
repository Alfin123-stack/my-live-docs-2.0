/* eslint-disable no-unused-vars */
declare type SearchParamProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type RoomAccesses = Record<string, AccessType>;

declare type UserType = "creator" | "editor" | "viewer";

declare type RoomMetadata = {
  creatorId: string;
  email: string;
  title: string;
  /** Emoji pilihan user untuk dokumen ini; kosong = pakai thumbnail gradien default. */
  icon?: string;
  /** ISO date string — diisi saat dokumen dipindah ke sampah (Fase 5/Fase 3 #11). Kosong = tidak di sampah. */
  deletedAt?: string;
  /** Cuplikan singkat (≤160 char) isi dokumen, diperbarui otomatis saat disimpan (Fase 3 #13). */
  snippet?: string;
};

declare type DocumentRole = "owner" | "editor" | "viewer";

declare type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  userType?: UserType;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
  disabled?: boolean;
};

declare type ShareDocumentDialogProps = {
  roomId: string;
  collaborators: User[];
  /** Email pemilik dokumen (huruf kecil). */
  ownerEmail: string;
  currentUserType: UserType;
  /** Buka dialog otomatis saat mount (deep-link dari menu ⋯ di dashboard, ?share=1). */
  defaultOpen?: boolean;
  isOwner: boolean;
  publicAccess: boolean;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CollaboratorProps = {
  roomId: string;
  email: string;
  ownerEmail: string;
  collaborator: User;
};

declare type CollaborativeRoomProps = {
  roomId: string;
  roomMetadata: RoomMetadata;
  users: User[];
  currentUserType: UserType;
  isOwner: boolean;
  publicAccess: boolean;
};

declare type DeleteModalProps = { roomId: string; redirectOnDelete?: boolean };

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };
import { create } from 'zustand';
import { RAVELRY_USERNAME, RAVELRY_PASSWORD } from '../config/local';

interface SettingsStore {
  ravelryUsername: string;
  ravelryPassword: string;
  freeOnly: boolean;
  setFreeOnly: (freeOnly: boolean) => void;
  hasRavelryCredentials: () => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ravelryUsername: RAVELRY_USERNAME,
  ravelryPassword: RAVELRY_PASSWORD,
  freeOnly: true,

  setFreeOnly: (freeOnly) => set({ freeOnly }),

  hasRavelryCredentials: () => {
    const { ravelryUsername, ravelryPassword } = get();
    return ravelryUsername.length > 0 && ravelryPassword.length > 0;
  },
}));

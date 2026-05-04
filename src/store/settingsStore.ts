import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const RAVELRY_USERNAME_KEY = 'ravelry_username';
const RAVELRY_PASSWORD_KEY = 'ravelry_password';

interface SettingsStore {
  ravelryUsername: string;
  ravelryPassword: string;
  freeOnly: boolean;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setRavelryCredentials: (username: string, password: string) => Promise<void>;
  setFreeOnly: (freeOnly: boolean) => void;
  hasRavelryCredentials: () => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ravelryUsername: '',
  ravelryPassword: '',
  freeOnly: true,
  isLoaded: false,

  loadSettings: async () => {
    const username = await SecureStore.getItemAsync(RAVELRY_USERNAME_KEY) ?? '';
    const password = await SecureStore.getItemAsync(RAVELRY_PASSWORD_KEY) ?? '';
    set({ ravelryUsername: username, ravelryPassword: password, isLoaded: true });
  },

  setRavelryCredentials: async (username, password) => {
    await SecureStore.setItemAsync(RAVELRY_USERNAME_KEY, username);
    await SecureStore.setItemAsync(RAVELRY_PASSWORD_KEY, password);
    set({ ravelryUsername: username, ravelryPassword: password });
  },

  setFreeOnly: (freeOnly) => set({ freeOnly }),

  hasRavelryCredentials: () => {
    const { ravelryUsername, ravelryPassword } = get();
    return ravelryUsername.length > 0 && ravelryPassword.length > 0;
  },
}));

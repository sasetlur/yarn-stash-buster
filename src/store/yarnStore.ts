import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { YarnEntry, ColorFamily, YarnWeight, FiberType } from '../types/yarn';

const STORAGE_KEY = '@yarn_stash';

interface YarnStore {
  yarns: YarnEntry[];
  isLoaded: boolean;
  loadYarns: () => Promise<void>;
  addYarn: (yarn: Omit<YarnEntry, 'id' | 'addedAt'>) => Promise<void>;
  updateYarn: (id: string, updates: Partial<YarnEntry>) => Promise<void>;
  deleteYarn: (id: string) => Promise<void>;
}

const persistYarns = async (yarns: YarnEntry[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(yarns));
};

export const useYarnStore = create<YarnStore>((set, get) => ({
  yarns: [],
  isLoaded: false,

  loadYarns: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ yarns: JSON.parse(stored), isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  addYarn: async (yarn) => {
    const newYarn: YarnEntry = {
      ...yarn,
      id: uuidv4(),
      addedAt: Date.now(),
    };
    const updated = [...get().yarns, newYarn];
    set({ yarns: updated });
    await persistYarns(updated);
  },

  updateYarn: async (id, updates) => {
    const updated = get().yarns.map((y) =>
      y.id === id ? { ...y, ...updates } : y
    );
    set({ yarns: updated });
    await persistYarns(updated);
  },

  deleteYarn: async (id) => {
    const updated = get().yarns.filter((y) => y.id !== id);
    set({ yarns: updated });
    await persistYarns(updated);
  },
}));

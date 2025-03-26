import { create } from 'zustand';

interface ColorPickerStoreProps {
  theme?: any;
  saved?: any;
  color?: any;
  setColor?: any;
}

export const useColorPickerStore = create<ColorPickerStoreProps>()(set => ({
  theme: [],
  saved: [],
  color: '',
  setColor: async color => set(state => ({ color })),
  setStateItem: (item: { [key: string]: any }) => set((state: any) => ({ ...item })),
}));

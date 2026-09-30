import { create } from "zustand";
import { Address } from "../types/models";

interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  setAddresses: (addresses: Address[]) => void;
  selectAddress: (id: string) => void;
  getSelectedAddress: () => Address | null;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  selectedAddressId: null,

  setAddresses: (addresses: Address[]) => {
    const defaultAddr = addresses.find((a) => a.is_default);
    const selected = get().selectedAddressId;

    set({
      addresses,
      selectedAddressId: selected
        ? selected
        : defaultAddr
        ? defaultAddr.id
        : addresses[0]?.id || null,
    });
  },

  selectAddress: (id: string) => {
    set({ selectedAddressId: id });
  },

  getSelectedAddress: () => {
    const { addresses, selectedAddressId } = get();
    if (!selectedAddressId) return addresses[0] || null;
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  },
}));

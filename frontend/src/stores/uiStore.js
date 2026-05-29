import { create } from "zustand";

export const useUIStore = create((set) => ({
  isSidebarOpen: true,
  isModalOpen: false,
  modalType: null,
  notification: null,

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  openModal: (type) => set({ isModalOpen: true, modalType: type }),
  closeModal: () => set({ isModalOpen: false, modalType: null }),

  showNotification: (message, type = "info", duration = 3000) => {
    set({
      notification: { message, type, id: Date.now() },
    });

    setTimeout(() => {
      set({ notification: null });
    }, duration);
  },

  clearNotification: () => set({ notification: null }),
}));

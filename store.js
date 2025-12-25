import { create } from "zustand";

const useStore = create((set) => ({
  userEmail: null,
  userName: null,
  userImage: null,
  totalUploadedFileSize: null,
  totalFileSizeUploadLimit: null,
  totalUploadedFile: 0,
  isFirebaseGoogleAuthUser: false,
  userRegisteredTime: null,
  setUserEmail: (value) => set(() => ({ userEmail: value })),
  setUserRegisteredTime: (value) => set(() => ({ userRegisteredTime: value })),
  setIsFirebaseGoogleAuthUser: (value) => set(() => ({ isFirebaseGoogleAuthUser: value })),
  setUserName: (value) => set(() => ({ userName: value })),
  setUserImage: (value) => set(() => ({ userImage: value })),
  setTotalUploadedFileSize: (value) => set(() => ({ totalUploadedFileSize: value })),
  setTotalFileSizeUploadLimit: (value) => set(() => ({ totalFileSizeUploadLimit: value })),
  setTotalUploadedFile: (value) => set(() => ({ totalUploadedFile: value })),
  isDarkMode: localStorage.getItem("isDarkModeTheme") === "true",
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      localStorage.setItem("isDarkModeTheme", next);
      return { isDarkMode: next };
    }),
  setDarkMode: (value) => {
    localStorage.setItem("isDarkModeTheme", value);
    set({ isDarkMode: value });
  },
}))

export default useStore
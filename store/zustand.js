import create from "zustand";

export const useStore = create(set => ({
  isUser: false,
  setIsUser: newIsUser => set({ isUser: newIsUser }),
  userId: "",
  setUserId: newUserId => set({ userId: newUserId }),
  user_nick_name: "",
  setUserNickName: newNickName => set({ user_nick_name: newNickName }),
  user_blance: "",
  setUserBalance: newBalance => set({ user_balance: newBalance }),
}));

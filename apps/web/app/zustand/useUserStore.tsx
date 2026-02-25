"use client";

import { UUID } from "crypto";
import { toast } from "sonner";
import { create } from "zustand";

export type BalanceEntry = {
  asset: string;
  quantity: string;
  locked: string;
};

export type User = {
  username: string;
  password?: string;
  balance: BalanceEntry[]; // from API
};

type CreateUserResponse = {
  userId: UUID;
  user: User;
  token: string;
};

interface UserState {
  token: string | null;
  user: Map<UUID, User>;
  setUser: (userResponse: CreateUserResponse) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,

  user: new Map<UUID, User>(),

  setUser: (userResponse: CreateUserResponse) => {
    const userMap = new Map(get().user);
    userMap.set(userResponse.userId, userResponse.user);

    localStorage.setItem("token", userResponse.token);

    set({
      user: userMap,
      token: userResponse.token,
    });

    toast.success("Signed in successfully");
  },

  logout: () => {
    localStorage.removeItem("token");
    set({
      token: null,
      user: new Map<UUID, User>(),
    });

    toast.success("Logged out successfully");
  },
}));

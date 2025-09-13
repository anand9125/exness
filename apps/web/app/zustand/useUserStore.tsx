"use-client";
import { UUID } from "crypto";
import Decimal from "decimal.js";
import { toast } from "sonner";
import { create } from "zustand";
export type User = {
  username:string;
  password: string;
  balance: Map<string, Balance>; // key = asset symbol value = balance
};
type CreateUserResponse= {
  userId: UUID;
  user: User;
  token: string;
}
export type Balance = {
  asset: string;
  quantity: Decimal;
  locked: Decimal;
};


interface UserState {
  token: string | null;
  user: Map<UUID, User>;
  setUser: (userResponse: CreateUserResponse) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null, // Safe SSR handling

  user: new Map<UUID, User>(),

  setUser: (userResponse: CreateUserResponse) => {
    console.log(userResponse, "this is user response");

    const userMap = new Map(get().user); // Clone existing Map
    userMap.set(userResponse.userId, userResponse.user);

    // Save token in store + localStorage
    localStorage.setItem("token", userResponse.token);

    set({
      user: userMap,
      token: userResponse.token,
    });

    toast.success("User created successfully");
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

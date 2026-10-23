import { api } from "./api";
import { User } from "@/src/types/user";

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
  },
};

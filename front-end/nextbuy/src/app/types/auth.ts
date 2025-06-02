import { User } from "./user";

export interface LoginResponse {
  accessToken: string;
  user: User; // it's the interface of the user the type
}
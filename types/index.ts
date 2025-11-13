export interface CreateUserParams {
  userId: string;
  email: string;
  name: string;
  role: "client" | "agent" | "admin";
  isApproved: boolean;
  orders: string[];
}
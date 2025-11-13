"use server";

import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import { CreateUserParams } from "@/types";

export async function createCustomers(user: CreateUserParams) {
  try {
    await connectDB();

    const newUser = await Customer.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}
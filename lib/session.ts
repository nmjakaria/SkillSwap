"use server"
import { headers } from "next/headers";
import { auth } from "./auth";
import { unstable_noStore } from "next/cache";

export const getUserToken = async (): Promise<string | null> => {
    unstable_noStore();
    try {
        const { token } = await auth.api.getToken({ headers: await headers() });
        return token || null;
    } catch {
        return null;
    }
};
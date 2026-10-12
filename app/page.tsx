import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SIGN_IN_URL } from "@/lib/auth-routes";

export default async function Home() {
  const { userId } = await auth();
  redirect(userId ? "/editor" : SIGN_IN_URL);
}

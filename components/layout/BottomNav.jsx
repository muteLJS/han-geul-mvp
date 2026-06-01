import { auth } from "@/lib/auth";
import BottomNavClient from "./BottomNavClient";

export default async function BottomNav() {
  const session = await auth();
  return <BottomNavClient isLoggedIn={!!session} />;
}

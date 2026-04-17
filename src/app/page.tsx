import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { LandingPageServer } from "@/components/landing/LandingPageServer";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sk_token")?.value;

  if (!token) {
    return <LandingPageServer />;
  }

  const user = await getCurrentUser();
  if (user) {
    if (user.role === "admin") redirect("/admin");
    redirect(user.role === "instructor" ? "/instructor" : "/dashboard");
  }
  return <LandingPageServer />;
}

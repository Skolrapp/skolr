import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { LandingPageServer } from "@/components/landing/LandingPageServer";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Premium Form Four exam preparation in Tanzania",
  description:
    "Skolr is a premium Form Four exam-preparation platform for Tanzania with structured lessons, subject-by-subject revision, parent progress visibility, and mobile-friendly access.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Skolr | Premium Form Four exam preparation",
    description:
      "Structured Form Four lessons, exam-ready study paths, and parent-friendly progress visibility for Tanzania families.",
    url: siteUrl,
  },
  twitter: {
    title: "Skolr | Premium Form Four exam preparation",
    description:
      "Structured Form Four lessons, exam-ready study paths, and parent-friendly progress visibility for Tanzania families.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Skolr",
  url: siteUrl,
  logo: `${siteUrl}/icons/icon-192.png`,
  description:
    "Premium Form Four exam-preparation platform for Tanzania families.",
  areaServed: "TZ",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Skolr",
  url: siteUrl,
  description:
    "Structured Form Four exam-preparation platform for Tanzania.",
  inLanguage: "en-TZ",
};

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sk_token")?.value;

  if (!token) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <LandingPageServer />
      </>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    if (user.role === "admin") redirect("/admin");
    redirect(user.role === "instructor" ? "/instructor" : "/dashboard");
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <LandingPageServer />
    </>
  );
}

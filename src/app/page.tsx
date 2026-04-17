import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { LandingPageServer } from "@/components/landing/LandingPageServer";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Online learning in Tanzania for Primary to University",
  description:
    "Skolr is Tanzania's online learning platform for Primary, Secondary, High School, and University learners with structured lessons, NECTA-aligned study paths, and parent-friendly progress tracking.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Skolr | Online learning in Tanzania for Primary to University",
    description:
      "Structured lessons, exam-ready learning paths, and parent-friendly progress tracking for learners across Tanzania.",
    url: siteUrl,
  },
  twitter: {
    title: "Skolr | Online learning in Tanzania for Primary to University",
    description:
      "Structured lessons, exam-ready learning paths, and parent-friendly progress tracking for learners across Tanzania.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Skolr",
  url: siteUrl,
  logo: `${siteUrl}/icons/icon-192.png`,
  description:
    "Tanzania online learning platform for Primary, Secondary, High School, and University learners.",
  areaServed: "TZ",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Skolr",
  url: siteUrl,
  description:
    "Structured online learning platform for Tanzania learners from Primary to University.",
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

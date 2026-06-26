import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  HardHat,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Star,
  TrafficCone,
  Wrench,
} from "lucide-react";
import SuppliedItemsSlider from "./SuppliedItemsSlider";

export const metadata: Metadata = {
  title: "SAFETYPLUS SUPPLIES | Safety & Security Products",
  description:
    "Safety wear, fire protection, physical security, electronic security, signage, and workplace safety supplies.",
};

const categories = [
  {
    title: "Safety Wear & PPE",
    description:
      "Helmets, gloves, boots, eye protection, respiratory protection, high visibility wear, and body protection.",
    icon: HardHat,
    image: "https://cdn.pixabay.com/photo/2015/09/24/23/36/construction-worker-956496_1280.jpg",
    imageAlt: "Worker wearing helmet and high visibility vest on site",
    items: ["Head protection", "Hand and foot protection", "High visibility wear"],
  },
  {
    title: "Fire Protection",
    description:
      "Fire extinguishers, detection equipment, suppression support, cabinets, signage, and inspection-ready accessories.",
    icon: Flame,
    image: "https://cdn.pixabay.com/photo/2012/02/26/11/06/extinguisher-17149_1280.jpg",
    imageAlt: "Fire extinguishers ready for supply and servicing",
    items: ["Extinguishers", "Detection systems", "Fire safety signage"],
  },
  {
    title: "Electronic Security",
    description:
      "CCTV, access control, alarms, gate automation, screening systems, time attendance, and vehicle tracking.",
    icon: Camera,
    image: "https://cdn.pixabay.com/photo/2021/01/28/13/02/camera-5957961_640.jpg",
    imageAlt: "CCTV camera installed for surveillance",
    items: ["Video surveillance", "Access control", "Intruder alarms"],
  },
  {
    title: "Physical Security",
    description:
      "Security doors, locks, handles, safes, cabinets, teller windows, seals, and secure storage solutions.",
    icon: LockKeyhole,
    image: "https://cdn.pixabay.com/photo/2018/02/20/22/20/lock-3169026_1280.jpg",
    imageAlt: "Secure metal lock for physical security",
    items: ["Security doors", "Locks and handles", "Safes and cabinets"],
  },
  {
    title: "Road & Site Safety",
    description:
      "Traffic cones, barriers, warning boards, reflective products, spill containment, and site control equipment.",
    icon: TrafficCone,
    image: "https://cdn.pixabay.com/photo/2012/02/19/10/49/traffic-14934_1280.jpg",
    imageAlt: "Traffic cones used for road and site safety",
    items: ["Road safety gear", "Safety barriers", "Spill control"],
  },
  {
    title: "Workplace Safety Systems",
    description:
      "Lockout tagout, safety signage, fixed line systems, fall protection, detection equipment, and audit support.",
    icon: ClipboardCheck,
    image: "https://cdn.pixabay.com/photo/2015/05/31/11/52/signs-791333_1280.jpg",
    imageAlt: "Safety warning labels and workplace safety markings",
    items: ["Lockout tagout", "Fall protection", "Workplace signage"],
  },
];

const sectors = [
  "Construction and engineering",
  "Factories and warehouses",
  "Retail and commercial buildings",
  "Hospitals and institutions",
  "Hotels and residential estates",
  "Transport and logistics sites",
];

const values = [
  "Product sourcing for mixed safety and security needs",
  "Bulk supply support for teams, sites, and branches",
  "Guidance on practical product selection",
  "Branding and customization options where available",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-800 selection:bg-[#0f6db7]/20">
      <header className="sticky top-0 z-50 border-b border-[#d9e8f5] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center">
            <Image
              src="/brand/safetyplus-logo.jpg"
              alt="SafetyPlus Supplies"
              width={230}
              height={90}
              priority
              className="h-12 w-auto object-contain object-left"
            />
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#products" className="font-medium text-slate-600 transition hover:text-[#0f6db7]">
              Products
            </a>
            <a href="#solutions" className="font-medium text-slate-600 transition hover:text-[#0f6db7]">
              Solutions
            </a>
            <a href="#services" className="font-medium text-slate-600 transition hover:text-[#0f6db7]">
              Services
            </a>
            <a
              href="#quote"
              className="rounded-md bg-[#f49a22] px-5 py-2.5 font-semibold text-white shadow-sm shadow-[#f49a22]/20 transition hover:bg-[#df8510]"
            >
              Request Quote
            </a>
          </nav>
          <a
            href="#quote"
            className="md:hidden rounded-md bg-[#f49a22] px-4 py-2 text-sm font-semibold text-white"
          >
            Quote
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#052d59] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(15,109,183,0.85),transparent_32%),linear-gradient(135deg,rgba(5,45,89,1),rgba(7,59,115,0.96)_52%,rgba(15,109,183,0.88))]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#d7ecfb]">
                <PackageCheck className="h-4 w-4 text-[#f7a833]" />
                Safety and security supplies for demanding worksites
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
                Protective equipment, fire safety, and security products supplied with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d7ecfb] md:text-xl">
                SAFETYPLUS SUPPLIES helps businesses source practical safety wear, fire protection,
                physical security, electronic security, road safety, and workplace safety essentials.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f49a22] px-7 py-4 text-base font-bold text-white shadow-lg shadow-[#f49a22]/25 transition hover:bg-[#df8510]"
                >
                  Explore Products
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#quote"
                  className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/20"
                >
                  Request a Supply Quote
                </a>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-[#d7ecfb] sm:grid-cols-3">
                {["PPE", "Fire safety", "Security products"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#f7a833]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white p-6 shadow-2xl shadow-[#021f3d]/40 sm:p-8">
                <div className="flex min-h-[360px] flex-col justify-between rounded-lg border border-[#d9e8f5] bg-[#f6f9fc] p-6 sm:p-8">
                  <div className="inline-flex w-fit rounded-md bg-white px-3 py-2 shadow-sm">
                    <Image
                      src="/brand/safetyplus-logo.jpg"
                      alt="SafetyPlus Supplies"
                      width={260}
                      height={100}
                      className="h-14 w-auto object-contain"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Safety Wear", "Fire Protection", "Physical Security", "Electronic Security"].map((item) => (
                      <div key={item} className="rounded-lg border border-[#d9e8f5] bg-white p-4">
                        <CheckCircle2 className="mb-3 h-5 w-5 text-[#f49a22]" />
                        <p className="font-bold text-[#073b73]">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-base font-semibold leading-7 text-[#073b73]">
                    Supplying the equipment teams need before they step onto site.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-extrabold text-[#f7a833]">6+</p>
                  <p className="mt-1 text-sm text-[#d7ecfb]">Core supply categories</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-extrabold text-[#f7a833]">37+</p>
                  <p className="mt-1 text-sm text-[#d7ecfb]">Listed supply lines</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#d9e8f5] bg-white py-8">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {values.map((value) => (
              <div key={value} className="flex items-center justify-center gap-2 text-sm font-semibold text-[#073b73]">
                <Star className="h-4 w-4 fill-[#f7a833] text-[#f7a833]" />
                {value}
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="bg-[#f6f9fc] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-[#0f6db7]">Product Categories</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#073b73] md:text-4xl">
                One supplier for workplace safety and site security needs.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                From PPE to surveillance and fire safety, the page now reflects a product supply
                business rather than a home monitoring app.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <article
                    key={category.title}
                    className="overflow-hidden rounded-lg border border-[#d9e8f5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0f6db7]/10"
                  >
                    <div className="relative">
                      <img
                        src={category.image}
                        alt={category.imageAlt}
                        className="h-52 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#052d59]/65 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white text-[#0f6db7] shadow-lg">
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#073b73]">{category.title}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{category.description}</p>
                      <ul className="mt-5 space-y-2">
                        {category.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-[#f49a22]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <SuppliedItemsSlider />

        <section id="solutions" className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#0f6db7]">Who We Supply</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#073b73] md:text-4xl">
                Built for procurement teams, site managers, and facility operators.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                SafetyPlus should speak directly to buyers who need reliable products, fast guidance,
                and a clean quote process for multiple safety and security categories.
              </p>
              <a
                href="#quote"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#073b73] px-6 py-3 font-bold text-white transition hover:bg-[#0f6db7]"
              >
                Start a Supply Request
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sectors.map((sector) => (
                <div key={sector} className="rounded-lg border border-[#d9e8f5] bg-[#f6f9fc] p-5">
                  <ShieldCheck className="mb-4 h-7 w-7 text-[#f49a22]" />
                  <p className="font-bold text-[#073b73]">{sector}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="bg-[#052d59] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#f7a833]">Supply Support</p>
                <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
                  More useful than a product list alone.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#d7ecfb]">
                  The landing page now emphasizes the kind of help a buyer expects: quote preparation,
                  product matching, installation coordination where needed, and after-sales support.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    title: "Product Matching",
                    text: "Help buyers choose appropriate products for site risks, teams, and budgets.",
                    icon: ClipboardCheck,
                  },
                  {
                    title: "Delivery Planning",
                    text: "Support bulk orders, branch supply, project timelines, and urgent replenishment.",
                    icon: PackageCheck,
                  },
                  {
                    title: "Technical Support",
                    text: "Coordinate product setup for electronic, physical, and fire safety systems.",
                    icon: Wrench,
                  },
                ].map((service) => {
                  const Icon = service.icon;

                  return (
                    <div key={service.title} className="rounded-lg border border-white/15 bg-white/10 p-6">
                      <Icon className="mb-5 h-8 w-8 text-[#f7a833]" />
                      <h3 className="text-lg font-bold">{service.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#d7ecfb]">{service.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="quote" className="relative overflow-hidden bg-[#0f6db7] py-20">
          <div className="absolute inset-0 bg-[#052d59]/50" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-[#f6f9fc] p-8 md:p-10">
                <Image
                  src="/brand/safetyplus-logo.jpg"
                  alt="SafetyPlus Supplies"
                  width={260}
                  height={100}
                  className="h-16 w-auto object-contain object-left"
                />
                <h2 className="mt-8 text-3xl font-extrabold text-[#073b73]">
                  Request products, pricing, or a callback.
                </h2>
                <p className="mt-4 leading-7 text-slate-600">
                  Tell SafetyPlus what you need supplied and the team can respond with availability,
                  product options, and next steps.
                </p>
                <div className="mt-8 space-y-4 text-sm text-slate-700">
                  <p className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#f49a22]" />
                    Add phone number here
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#f49a22]" />
                    Add email address here
                  </p>
                  <p className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#f49a22]" />
                    Dar es Salaam, Tanzania
                  </p>
                </div>
              </div>

              <form className="space-y-4 p-8 md:p-10">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="sr-only">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Full Name"
                      className="w-full rounded-lg border border-[#b9d5ec] px-4 py-3 outline-none transition focus:border-[#0f6db7] focus:ring-2 focus:ring-[#0f6db7]"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="sr-only">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      placeholder="Company / Site"
                      className="w-full rounded-lg border border-[#b9d5ec] px-4 py-3 outline-none transition focus:border-[#0f6db7] focus:ring-2 focus:ring-[#0f6db7]"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="sr-only">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="Phone / WhatsApp"
                      className="w-full rounded-lg border border-[#b9d5ec] px-4 py-3 outline-none transition focus:border-[#0f6db7] focus:ring-2 focus:ring-[#0f6db7]"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="sr-only">
                      Product Category
                    </label>
                    <select
                      id="category"
                      className="w-full rounded-lg border border-[#b9d5ec] px-4 py-3 text-slate-600 outline-none transition focus:border-[#0f6db7] focus:ring-2 focus:ring-[#0f6db7]"
                    >
                      <option value="">Select product category</option>
                      {categories.map((category) => (
                        <option key={category.title} value={category.title}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">
                    Product Details
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Share product names, quantities, sizes, delivery location, or project details."
                    className="w-full rounded-lg border border-[#b9d5ec] px-4 py-3 outline-none transition focus:border-[#0f6db7] focus:ring-2 focus:ring-[#0f6db7]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#f49a22] py-4 text-lg font-bold text-white shadow-lg shadow-[#f49a22]/20 transition hover:-translate-y-0.5 hover:bg-[#df8510]"
                >
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#073b73] bg-[#052d59] py-10 text-[#b9d5ec]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="rounded-md bg-white px-3 py-2">
            <Image
              src="/brand/safetyplus-logo.jpg"
              alt="SafetyPlus Supplies"
              width={190}
              height={74}
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} SAFETYPLUS SUPPLIES. Safety and security products for better protected workplaces.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck } from "lucide-react";

const suppliedGroups = [
  {
    title: "Safety Wear",
    eyebrow: "PPE, workwear, signage, and site protection",
    items: [
      "Head Protection",
      "Eye/Face Protection",
      "Hearing Protection",
      "Respiratory Protection",
      "Hand Protection",
      "Body Protection",
      "High Visibility",
      "Customization & Branding",
      "Custom Tailored Workwear",
      "Foot Protection",
      "Fall Protection",
      "Fixed Line Systems",
      "Road Safety",
      "Workplace Safety",
      "Detection Systems",
      "Lock-Out Tag-Out Systems",
      "Safety Signage",
      "Fire Extinguisher Solutions",
    ],
  },
  {
    title: "Physical Security",
    eyebrow: "Doors, locks, safes, gates, and secure access hardware",
    items: [
      "Mul-T-Lock",
      "Security Doors",
      "Maxidor Gates",
      "Fire Doors",
      "Safes & Cabinets",
      "Locks & Handles",
      "Cash Trays & Teller Windows",
      "Security Seals",
    ],
  },
  {
    title: "Electronic Security",
    eyebrow: "Electronic systems for facilities, gates, assets, and access",
    items: [
      "Access Control/Time and Attendance",
      "Video Surveillance",
      "Intruder Alarm",
      "Gate Automation",
      "Traffic Barrier",
      "Fire Detection and Suppression Systems",
      "Vehicle Tracking Systems",
      "Screening/Detection Systems",
    ],
  },
];

const companyLinks = ["Our Services", "Our Brands", "Our Clients", "SAS Value-Added Services"];

export default function SuppliedItemsSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeGroup = suppliedGroups[activeIndex];

  const slideCountLabel = useMemo(
    () => `${activeIndex + 1} / ${suppliedGroups.length}`,
    [activeIndex]
  );

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? suppliedGroups.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === suppliedGroups.length - 1 ? 0 : current + 1));
  };

  return (
    <section id="items-supplied" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wider text-[#0f6db7]">Items Supplied</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#073b73] md:text-4xl">
              Browse the catalogue by supply area.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 md:text-lg">
              Swipe or use the controls to move through Safety Wear, Physical Security, and Electronic Security.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#f6f9fc] px-3 py-1 text-sm font-bold text-[#073b73]">
              {slideCountLabel}
            </span>
            <button
              type="button"
              aria-label="Previous supplied item category"
              onClick={goToPrevious}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d9e8f5] bg-white text-[#073b73] transition hover:border-[#0f6db7] hover:text-[#0f6db7]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next supplied item category"
              onClick={goToNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f49a22] text-white transition hover:bg-[#df8510]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#d9e8f5] bg-[#f6f9fc] shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-[#052d59] p-6 text-white sm:p-8 lg:p-10">
              <p className="text-sm font-bold uppercase tracking-wider text-[#f7a833]">
                {activeGroup.eyebrow}
              </p>
              <h3 className="mt-4 text-3xl font-extrabold md:text-4xl">{activeGroup.title}</h3>
              <p className="mt-5 max-w-md leading-7 text-[#d7ecfb]">
                This slide keeps the product line scannable without turning the page into a long static index.
              </p>

              <div className="mt-8 flex gap-2">
                {suppliedGroups.map((group, index) => (
                  <button
                    key={group.title}
                    type="button"
                    aria-label={`Show ${group.title}`}
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition ${
                      activeIndex === index ? "w-10 bg-[#f49a22]" : "w-2.5 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {activeGroup.items.map((item) => (
                  <div
                    key={item}
                    className="flex min-h-[52px] items-center gap-3 rounded-lg border border-[#d9e8f5] bg-white px-4 py-3 text-sm font-semibold leading-5 text-slate-700"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-none text-[#f49a22]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {companyLinks.map((link) => (
            <div key={link} className="rounded-lg border border-[#d9e8f5] bg-white p-5">
              <ShieldCheck className="mb-3 h-6 w-6 text-[#0f6db7]" />
              <p className="font-bold text-[#073b73]">{link}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

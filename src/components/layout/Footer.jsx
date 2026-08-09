// src/components/layout/Footer.jsx
"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { getGroupTheme } from "@/components/dashboard/groupTheme";

export default function DashboardFooter({
  collegeName = "Your College Name",
  address = "College Address, City, State",
  phone = "+91-0000-000000",
  email = "info@college.com",
  facebookUrl = "https://facebook.com",
  instagramUrl = "https://instagram.com",
  twitterUrl = "https://x.com",
  youtubeUrl = "https://youtube.com",
  groupName,
}) {
  const year = new Date().getFullYear();
  const theme = getGroupTheme(groupName);

  const socialLinks = [
    { label: "Facebook", icon: FaFacebook, url: facebookUrl },
    { label: "Instagram", icon: FaInstagram, url: instagramUrl },
    { label: "X", icon: FaXTwitter, url: twitterUrl },
    { label: "YouTube", icon: FaYoutube, url: youtubeUrl },
  ];

  return (
    <footer className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
      {/* Brand / Contact */}
      <div className={`bg-linear-to-r ${theme.header} px-3 py-3 text-white sm:px-4 sm:py-3.5`}>
        <div className="grid gap-2.5 lg:grid-cols-[1.15fr_1.85fr] lg:items-center lg:gap-4">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/65">
              Campus Connect
            </p>

            <h3 className="mt-0.5 truncate text-base font-black tracking-tight sm:text-lg">
              {collegeName}
            </h3>

            
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            <FooterBadge
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Address"
              value={address}
            />

            <FooterBadge
              icon={<Phone className="h-3.5 w-3.5" />}
              label="Phone"
              value={phone}
            />

            <FooterBadge
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email"
              value={email}
            />
          </div>
        </div>
      </div>

      {/* Copyright / Social */}
      <div className="flex flex-col gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[10px] leading-relaxed text-slate-500 sm:text-[11px]">
          Copyright {year}{" "}
          <span className="font-bold text-slate-800">{collegeName}</span>.
          {" "}All rights reserved.
        </p>

        <div className="flex items-center gap-1.5">
          {socialLinks.map(({ label, icon: Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`flex h-7 w-7 items-center justify-center rounded-md border ${theme.softBorder} bg-slate-50 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 sm:h-8 sm:w-8`}
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterBadge({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 text-white/85">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-white/55">
          {label}
        </p>
        <p className="truncate text-[10px] font-semibold text-white/90 sm:text-[11px]">
          {value}
        </p>
      </div>
    </div>
  );
}
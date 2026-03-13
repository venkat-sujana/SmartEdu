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
    <footer className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-linear-to-r ${theme.header} px-5 py-6 text-white`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Campus Connect
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">{collegeName}</h3>
            <p className="mt-2 text-sm text-white/80">
              A single place to monitor attendance operations, faculty activity, and daily reporting.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FooterBadge icon={<MapPin className="h-4 w-4" />} label="Address" value={address} />
            <FooterBadge icon={<Phone className="h-4 w-4" />} label="Phone" value={phone} />
            <FooterBadge icon={<Mail className="h-4 w-4" />} label="Email" value={email} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-slate-500">
          Copyright {year} <span className="font-semibold text-slate-800">{collegeName}</span>. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {socialLinks.map(({ label, icon: Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.softBorder} bg-slate-50 text-slate-600 transition hover:-translate-y-0.5 hover:bg-white`}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterBadge({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-white/90">{value}</p>
    </div>
  );
}

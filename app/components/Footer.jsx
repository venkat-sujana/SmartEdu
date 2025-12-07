"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

export default function DashboardFooter({
  collegeName = "Your College Name",
  address = "College Address, City, State",
  phone = "+91-0000-000000",
  email = "info@college.com",
  facebookUrl = "https://facebook.com",
  instagramUrl = "https://instagram.com",
  twitterUrl = "https://x.com",
  youtubeUrl = "https://youtube.com",
}) {
  const year = new Date().getFullYear();

  const socialLinks = [
    { label: "Facebook", icon: FaFacebook, url: facebookUrl },
    { label: "Instagram", icon: FaInstagram, url: instagramUrl },
    { label: "X", icon: FaXTwitter, url: twitterUrl },
    { label: "YouTube", icon: FaYoutube, url: youtubeUrl },
  ];

  return (
    <footer className="mt-10 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 text-sm text-gray-600">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left */}
          <div className="text-center sm:text-left">
            <p className="font-semibold text-gray-800">{collegeName}</p>
            <p className="flex items-center justify-center sm:justify-start gap-1">
              <MapPin size={14} className="text-green-600" />
              <span>{address}</span>
            </p>
          </div>

          {/* Middle */}
          <div className="text-center text-xs text-gray-500">
            <p>© {year} {collegeName}. All rights reserved.</p>
          </div>

          {/* Right: Contact */}
          <div className="flex flex-col items-center sm:items-end text-xs gap-1">
            <p className="flex items-center gap-1">
              <Phone size={14} className="text-green-600" />
              <span>{phone}</span>
            </p>
            <p className="flex items-center gap-1">
              <Mail size={14} className="text-green-600" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        {/* Bottom Row: Social icons */}
        <div className="flex items-center justify-center sm:justify-end gap-3">
          {socialLinks.map(({ label, icon: Icon, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-green-600 hover:text-white transition"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

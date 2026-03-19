"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { getGroupTheme } from "@/components/dashboard/groupTheme";

export default function LecturerInfoCard({ user, groupName }) {
  const theme = getGroupTheme(groupName);
  const { data: session } = useSession();
  const isLecturer = session?.user?.role === "lecturer";
  const [profile, setProfile] = useState(user || {});
  const [isUploading, setIsUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    setProfile(user || {});
  }, [user]);

  useEffect(() => {
    if (!isLecturer) return;

    let isMounted = true;
    fetch("/api/lecturers/profile")
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted || !result?.data) return;
        setProfile((prev) => ({ ...prev, ...result.data }));
      })
      .catch((err) => {
        console.error("Failed to load lecturer profile:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [isLecturer]);

  const infoItems = useMemo(
    () => [
      {
        label: "Email",
        value: profile?.email || "lecturer@example.com",
        icon: <EnvelopeIcon className="h-4 w-4" />,
        tone: "bg-sky-100 text-sky-700",
      },
      {
        label: "Subject",
        value: profile?.subject || "Subject",
        icon: <AcademicCapIcon className="h-4 w-4" />,
        tone: "bg-violet-100 text-violet-700",
      },
      {
        label: "College",
        value: profile?.collegeName || "College Name",
        icon: <BuildingOffice2Icon className="h-4 w-4" />,
        tone: "bg-emerald-100 text-emerald-700",
      },
    ],
    [profile]
  );

  const uploadToCloudinary = async (file) => {
    const payload = new FormData();
    payload.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: payload,
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || "Photo upload failed");
    }

    return result.url;
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setPhotoMessage("");
    setPhotoError("");

    try {
      const photoUrl = await uploadToCloudinary(file);
      const res = await fetch("/api/lecturers/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: photoUrl }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to save lecturer photo");
      }

      setProfile((prev) => ({ ...prev, ...(result.data || {}), photo: photoUrl }));
      setPhotoMessage("Photo updated successfully");
    } catch (err) {
      console.error(err);
      setPhotoError(err.message || "Photo upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.section
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className={`bg-linear-to-r ${theme.header} px-5 py-6 text-white`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-3xl bg-white/10 shadow-inner">
              {profile?.photo ? (
                <img src={profile.photo} alt={profile?.name || "Lecturer"} className="h-full w-full object-cover" />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Lecturer Profile
              </p>
              <h2 className="mt-2 truncate text-lg font-black tracking-tight md:text-xl">
                {profile?.name || "Lecturer Name"}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${theme.badge}`}>
              Junior Lecturer
            </span>
            {isLecturer && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/15">
                <ArrowUpTrayIcon className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:p-5">
        {(photoMessage || photoError) && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${photoError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {photoError || photoMessage}
          </div>
        )}

        {infoItems.map(item => (
          <div
            key={item.label}
            className={`flex flex-col gap-3 rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 sm:flex-row sm:items-center`}
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

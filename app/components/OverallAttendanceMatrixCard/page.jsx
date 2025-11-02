"use client";
import React from 'react';
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const groupNames = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const years = ["First Year", "Second Year"];
const sessions = ["FN", "AN", "EN"];
const sessionLabels = { FN: "FN", AN: "AN", EN: "EN" };

const fetcher = url => fetch(url).then(res => res.json());

export default function OverallAttendanceMatrixCard() {
  const { data: absApiData } = useSWR("/api/attendance/today-absentees", fetcher);
  const sessionWisePresent = absApiData?.sessionWisePresent || {};
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {};

  function stats(group, year, session) {
    const present = sessionWisePresent[session]?.filter(
      s => s.group === group && s.yearOfStudy === year
    ).length || 0;
    const absent = sessionWiseAbsentees[session]?.filter(
      s => s.group === group && s.yearOfStudy === year
    ).length || 0;
    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percent };
  }

  const yearTotals = years.map(year => {
    let totalPresent = 0;
    let totalAbsent = 0;
    sessions.forEach(session => {
      groupNames.forEach(group => {
        const { present, absent } = stats(group, year, session);
        totalPresent += present;
        totalAbsent += absent;
      });
    });
    const total = totalPresent + totalAbsent;
    const percent = total > 0 ? Math.round((totalPresent / total) * 100) : 0;
    return { present: totalPresent, percent };
  });

  const allPresent = yearTotals.reduce((sum, year) => sum + year.present, 0);
  const allPercent = yearTotals.reduce((sum, year) => sum + year.percent, 0) / years.length;

  return (
    <Card className="mb-10 rounded-2xl border-2 border-blue-300 shadow-xl bg-white overflow-x-auto">
      <CardHeader className="bg-blue-600 text-white text-center py-4 mb-2">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-wide">Overall Attendance (Group × Year × Session)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <table className="min-w-full table border border-blue-200 text-center text-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-2">Group</th>
              <th className="p-2">Year</th>
              {sessions.map(session => (
                <th key={session} colSpan={4} className="px-2">{sessionLabels[session]}</th>
              ))}
            </tr>
            <tr className="bg-blue-200 text-blue-900">
              <th></th>
              <th></th>
              {sessions.map(session => (
                <React.Fragment key={session}>
                  <th className="px-2">Present</th>
                  <th className="px-2">Absent</th>
                  <th className="px-2">Total</th>
                  <th className="px-2">%</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupNames.map(group =>
              years.map(year => (
                <tr key={group + year} className="border-t">
                  <td className="font-bold text-blue-700">{group}</td>
                  <td className="font-semibold text-green-800">{year}</td>
                  {sessions.map(session => {
                    const { present, absent, total, percent } = stats(group, year, session);
                    return (
                      <React.Fragment key={session}>
                        <td className="text-green-700 font-bold">{present}</td>
                        <td className="text-red-500 font-bold">{absent}</td>
                        <td className="font-bold">{total}</td>
                        <td className="font-bold text-blue-700">{percent}%</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 font-bold border-t-2 border-blue-400">
              <td colSpan={2} className="text-right py-2">First Year Present</td>
              <td colSpan={4} className="text-green-700">{yearTotals[0].present}</td>
              <td colSpan={4} className="text-blue-700 text-left">%</td>
              <td colSpan={4} className="text-blue-700">{yearTotals[0].percent}%</td>
            </tr>
            <tr className="bg-blue-50 font-bold">
              <td colSpan={2} className="text-right py-2">Second Year Present</td>
              <td colSpan={4} className="text-green-700">{yearTotals[1].present}</td>
              <td colSpan={4} className="text-blue-700 text-left">%</td>
              <td colSpan={4} className="text-blue-700">{yearTotals[1].percent}%</td>
            </tr>
            <tr className="bg-blue-100 font-black">
              <td colSpan={2} className="text-right py-2 text-lg">Total Present</td>
              <td colSpan={4} className="text-green-700 text-xl">{allPresent}</td>
              <td colSpan={4} className="text-blue-700 text-left text-lg">Total %</td>
              <td colSpan={4} className="text-purple-700 text-xl">{allPercent}%</td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
}

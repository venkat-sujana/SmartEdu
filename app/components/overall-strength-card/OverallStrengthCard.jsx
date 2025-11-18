// app/components/overall-strength-card/OverallStrengthCard.jsx
'use client'
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

export default function OverallStrengthCard({ sessionWisePresent, sessionWiseAbsentees }) {
  // Helper function for calculation
  function sessionStats(session) {
    const present = sessionWisePresent[session]?.length || 0
    const absent = sessionWiseAbsentees[session]?.length || 0
    const strength = present + absent
    const percent = strength > 0 ? Math.round((present / strength) * 100) : 0
    return { present, absent, strength, percent }
  }
  const fnStats = sessionStats('FN')
  const anStats = sessionStats('AN')

  return (
    <Card className="mx-auto mb-6 max-w-3xl overflow-x-auto rounded-xl border-2 border-indigo-300 bg-white shadow-xl">
      <CardHeader className="mb-2 flex items-center justify-center rounded-t-xl bg-indigo-600 py-4 text-white">
        <UserGroupIcon className="h-7 w-7 mr-2" />
        <CardTitle className="text-lg font-bold tracking-wide md:text-xl">
          Overall Strength by Session
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-6">
          {/* FN SESSION COLUMN */}
          <div className="border rounded-lg px-4 py-3 bg-blue-50">
            <div className="font-bold text-blue-700 text-lg mb-2">FN Session</div>
            <div className="flex items-center space-x-2 mb-1">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              <span>Strength: <b>{fnStats.strength}</b></span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span>Present: <b>{fnStats.present}</b></span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              <span>Absent: <b>{fnStats.absent}</b></span>
            </div>
            <div className="mt-1 font-bold text-blue-700">Attendance %: {fnStats.percent}%</div>
          </div>
          {/* AN SESSION COLUMN */}
          <div className="border rounded-lg px-4 py-3 bg-purple-50">
            <div className="font-bold text-purple-700 text-lg mb-2">AN Session</div>
            <div className="flex items-center space-x-2 mb-1">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              <span>Strength: <b>{anStats.strength}</b></span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span>Present: <b>{anStats.present}</b></span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              <span>Absent: <b>{anStats.absent}</b></span>
            </div>
            <div className="mt-1 font-bold text-purple-700">Attendance %: {anStats.percent}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

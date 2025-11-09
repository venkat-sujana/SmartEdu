//app/components/attendance-shortage-summary/page.jsx

"use client"
import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"


export const dynamic = "force-dynamic"

export default function AttendanceShortageSummary() {
  const { data: session, status } = useSession()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!session?.user?.collegeId) return
    const fetchShortage = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/attendance/shortage-summary?collegeId=${session.user.collegeId}`)
        if (!res.ok) throw new Error("Failed to fetch shortage summary")
        const data = await res.json()
        setStudents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchShortage()
  }, [session])

  if (loading)
    return <div className="p-4 text-center text-gray-500">Loading...</div>
  if (error)
    return <div className="p-4 text-center text-red-600">{error}</div>
  if (!students.length)
    return <div className="p-4 text-center text-gray-500">No students with &lt;75% attendance</div>

  // Group-wise, year-wise split
  const groupedByYear = students.reduce((acc, curr) => {
    const group = curr.group
    const year = curr.yearOfStudy
    if (!acc[group]) acc[group] = { "First Year": [], "Second Year": [] }
    acc[group][year] = acc[group][year] || []
    acc[group][year].push(curr)
    return acc
  }, {})

  // Year-wise counts summary
  const yearCounts = students.reduce((acc, curr) => {
    const year = curr.yearOfStudy
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})

  return (
    <div className="rounded-2xl shadow-2xl p-2 sm:p-4 bg-gradient-to-br from-green-50 via-white to-blue-50 w-full max-w-4xl mx-auto my-4 border border-green-100">
  {/* Title/Badge */}
  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center tracking-wide bg-gradient-to-r from-emerald-600 via-green-600 to-blue-400 bg-clip-text text-transparent">
      Attendance Shortage Summary (&lt;75%)
    </h3>
  </div>
  {/* Year counts row */}
  <div className="flex flex-wrap justify-center gap-3 my-4 font-bold text-green-800 text-sm">
    <div className="flex items-center gap-1"><span className="bg-green-100 px-2 py-1 rounded-full text-green-800">First Year</span><span className="text-red-600 text-base">{yearCounts["First Year"] || 0}</span></div>
    <div className="flex items-center gap-1"><span className="bg-blue-100 px-2 py-1 rounded-full text-blue-800">Second Year</span><span className="text-red-600 text-base">{yearCounts["Second Year"] || 0}</span></div>
    <div className="flex items-center gap-1"><span className="bg-purple-100 px-2 py-1 rounded-full text-purple-800">Total</span>
      <span className="text-blue-700 text-base">{(yearCounts["First Year"] || 0) + (yearCounts["Second Year"] || 0)}</span></div>
  </div>
  {/* Group-wise tables by year */}
  <div className="space-y-7">
    {Object.entries(groupedByYear).map(([group, years]) => (
      <div key={group} className="bg-white rounded-2xl shadow-lg p-2 sm:p-4 mb-4 border border-blue-100 w-full">
        <h4 className="font-semibold text-base sm:text-lg mb-2 text-blue-800">{group}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* First Year Table */}
          <div>
            <h5 className="text-green-600 font-bold mb-1 text-center">First Year</h5>
            <div className="overflow-x-auto">
              <table className="min-w-[180px] w-full border border-green-200 rounded-lg bg-green-50 text-xs sm:text-sm">
                <thead className="bg-green-200 text-green-900">
                  <tr>
                    <th className="p-1 w-10">S.No</th>
                    <th className="p-1">Name</th>
                    <th className="p-1 w-10">%</th>
                  </tr>
                </thead>
                <tbody>
                  {(years["First Year"] || []).length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-center text-gray-400 italic">No shortage</td></tr>
                  )}
                  {(years["First Year"] || []).map((student, idx) => (
                    <tr key={student._id || idx} className="even:bg-green-100 hover:bg-green-200 transition">
                      <td className="text-center">{idx + 1}</td>
                      <td className="font-medium truncate max-w-[90px]">{student.name}</td>
                      <td className="text-center text-red-600 font-bold">{student.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Second Year Table */}
          <div>
            <h5 className="text-blue-600 font-bold mb-1 text-center">Second Year</h5>
            <div className="overflow-x-auto">
              <table className="min-w-[180px] w-full border border-blue-200 rounded-lg bg-blue-50 text-xs sm:text-sm">
                <thead className="bg-blue-200 text-blue-900">
                  <tr>
                    <th className="p-1 w-10">S.No</th>
                    <th className="p-1">Name</th>
                    <th className="p-1 w-10">%</th>
                  </tr>
                </thead>
                <tbody>
                  {(years["Second Year"] || []).length === 0 && (
                    <tr><td colSpan={3} className="py-3 text-center text-gray-400 italic">No shortage</td></tr>
                  )}
                  {(years["Second Year"] || []).map((student, idx) => (
                    <tr key={student._id || idx} className="even:bg-blue-100 hover:bg-blue-200 transition">
                      <td className="text-center">{idx + 1}</td>
                      <td className="font-medium truncate max-w-[90px]">{student.name}</td>
                      <td className="text-center text-red-600 font-bold">{student.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

  )
}

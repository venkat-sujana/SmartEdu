// app/dashboards/mpc/page.jsx
"use client"
import { useState } from 'react';  // Import useState
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';
import AttendanceForm from '@/app/components/AttendanceForm';
import DashboardTogglePanel from '@/app/components/DashboardTogglePanel';
import GroupShortageSummary from '@/app/components/GroupShortageSummary';
import DashboardFooter from "@/app/components/Footer";

export default function MPCDashboard() {
 const { data: session } = useSession();
     const user = session?.user;
     const [showAttendance, setShowAttendance] = useState(false);
     const [studentTable, setStudentTable] = useState(false);
     const [showTodayAbsentees, setShowTodayAbsentees] = useState(false);
     const [monthlyAttendance, setMonthlyAttendance] = useState(false);
   
     const collegeName = user?.collegeName || 'College';
     const years = ['First Year', 'Second Year'];

return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
                      <LecturerInfoCard user={user} />
                
                      <h2 className="text-3xl font-extrabold tracking-tight mt-2 text-blue-800">
                        SCIENCE Group Dashboard
                      </h2>
                
                      <GroupAttendanceCard groupName="MPC" />
                      
                      <DashboardTogglePanel
                        // state flags
                        showAttendance={showAttendance}
                        studentTable={studentTable}
                        showTodayAbsentees={showTodayAbsentees}
                        monthlyAttendance={monthlyAttendance}
                
                        // handlers
                        onToggleAttendance={() => setShowAttendance((v) => !v)}
                        onToggleStudentTable={() => setStudentTable((v) => !v)}
                        onToggleTodayAbsentees={() => setShowTodayAbsentees((v) => !v)}
                        onToggleMonthlyAttendance={() => setMonthlyAttendance((v) => !v)}
                
                        // content (JSX)
                        attendanceContent={
                          <AttendanceForm defaultGroup="MPC" returnUrl="/dashboards/mpc" />
                        }
                
                        studentTableContent={
                          <GroupStudentTable groupName="MPC" />
                        }
                
                        todayAbsenteesContent={
                          <TodayAbsenteesTable groupFilter="MPC" header={false} />
                        }
                
                
                
                        groupMonthlyAttendanceContent={
                          <div className="mx-auto mt-10 max-w-7xl p-4 md:p-6 space-y-8">
                            <h1 className="text-2xl font-bold text-center mb-4">
                              {collegeName} - MPC Attendance
                            </h1>
                            {years.map((year) => (
                              <GroupAttendanceSummary
                                key={year}
                                group="MPC"
                                yearOfStudy={year}
                                collegeName={collegeName}
                              />
                            ))}
                
                
                            <div className="p-6 space-y-8">
                              {/* First Year Shortage */}
                              <GroupShortageSummary
                                group="MPC"
                                year="First Year"
                                collegeId={session?.user?.collegeId}
                                collegeName={session?.user?.collegeName}
                              />
                
                              {/* Second Year Shortage */}
                              <GroupShortageSummary
                                group="MPC"
                                year="Second Year"
                                collegeId={session?.user?.collegeId}
                                collegeName={session?.user?.collegeName}
                              />
                            </div>
                          </div>
                        }
                      />

                      <div className="flex flex-col sm:flex-row gap-4 mb-12">
           <Link href="/exams-form">
              <button className="w-full sm:w-auto cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-purple-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
                Exams-Form
              </button>
            </Link>

            <Link href="/exam-report">
              <button className="w-full sm:w-auto cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-purple-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
                Exams-Report
              </button>
            </Link>
      </div>

                      <DashboardFooter
        collegeName={collegeName}
        // address={address}
        // phone={phone}
        // email={email}
        facebookUrl="https://facebook.com/yourcollege"
        instagramUrl="https://instagram.com/yourcollege"
        twitterUrl="https://x.com/yourcollege"
        youtubeUrl="https://youtube.com/@yourcollege"
      />
        </div>
  )
}



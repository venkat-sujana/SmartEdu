import { NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Attendance from '@/models/Attendance'

export async function GET() {
  await connectMongoDB()

  try {
    const today = new Date()

    const start = new Date(today)
    start.setHours(0, 0, 0, 0)

    const end = new Date(today)
    end.setHours(23, 59, 59, 999)

    const records = await Attendance.find({
      date: {
        $gte: start,
        $lte: end,
      },
    }).lean()

    const groupMap = {}

    for (const record of records) {
      const group = record.group || 'Unknown'

      if (!groupMap[group]) {
        groupMap[group] = {
          present: 0,
          absent: 0,
        }
      }

      if (record.status === 'Present') {
        groupMap[group].present++
      }

      if (record.status === 'Absent') {
        groupMap[group].absent++
      }
    }

    const result = Object.entries(groupMap).map(
      ([group, stats]) => {
        const total =
          stats.present + stats.absent

        const percentage =
          total > 0
            ? Math.round(
                (stats.present / total) * 100
              )
            : 0

        return {
          name: group,
          percentage,
          present: stats.present,
          absent: stats.absent,
          total,
        }
      }
    )

    result.sort(
      (a, b) => b.percentage - a.percentage
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error(
      'Group Performance API Error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to fetch group performance',
      },
      {
        status: 500,
      }
    )
  }
}
//src/app/api/invigilation/duties/auto-assign/route.js

import { NextResponse } from 'next/server'

import { connectInvigilationDB }
from '@/lib/mongodb-invigilation'

import DutyAssignment
from '@/models/DutyAssignment'

import ExamSchedule
from '@/models/ExamSchedule'

import User
from '@/models/User'

import LecturerAvailability
from '@/models/LecturerAvailability'

import {
  requireInvigilationAuth,
} from '@/lib/invigilation-api-guard'



function toDateKey(value) {
  return new Date(value)
    .toISOString()
    .slice(0, 10)
}



function hasDateClash(
  existingSlots,
  exam,
  sameDayNoRepeat
) {

  const examDateKey =
    toDateKey(exam.date)

  const examSlotKey =
    `${examDateKey}|${exam.session}`

  if (sameDayNoRepeat) {
    return existingSlots?.has(
      examDateKey
    )
  }

  return existingSlots?.has(
    examSlotKey
  )
}



export async function POST(req) {

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ['admin']
    )

  if (error) return error

  try {

    await connectInvigilationDB()

    const body =
      await req.json()
        .catch(() => ({}))

    const date =
      body?.date || ''

    const fromDate =
      body?.fromDate || ''

    const toDate =
      body?.toDate || ''

    const session =
      body?.session || ''

    const examType =
      body?.examType || ''

    const maxDutiesPerLecturer =
      Number(
        body?.maxDutiesPerLecturer || 0
      )

    const sameDayNoRepeat =
      body?.sameDayNoRepeat !== false



    const examFilter = {}

    if (user.collegeId) {
      examFilter.collegeId =
        user.collegeId
    }

    if (date) {

      const start =
        new Date(date)

      const end =
        new Date(date)

      end.setDate(
        end.getDate() + 1
      )

      examFilter.date = {
        $gte: start,
        $lt: end,
      }
    }

    if (
      !date &&
      fromDate &&
      toDate
    ) {

      const start =
        new Date(fromDate)

      start.setHours(
        0,
        0,
        0,
        0
      )

      const end =
        new Date(toDate)

      end.setHours(
        23,
        59,
        59,
        999
      )

      examFilter.date = {
        $gte: start,
        $lte: end,
      }
    }

    if (session) {
      examFilter.session =
        session
    }

    if (examType) {
      examFilter.examType =
        examType
    }



    const [
      allExams,
      lecturers,
      existingDuties,
      availabilityList,
    ] = await Promise.all([

      ExamSchedule.find(examFilter)
        .sort({
          date: 1,
          session: 1,
        })
        .lean(),

      User.find({
        role: 'lecturer',

        ...(user.collegeId
          ? {
              collegeId:
                user.collegeId,
            }
          : {}),
      })
        .select('_id name')
        .lean(),

      DutyAssignment.find({
        ...(user.collegeId
          ? {
              collegeId:
                user.collegeId,
            }
          : {}),
      })
        .populate(
          'examScheduleId',
          'date session'
        )
        .select(
          'examScheduleId lecturerId'
        )
        .lean(),

      LecturerAvailability.find({
        status: 'NOT_AVAILABLE',

        ...(user.collegeId
          ? {
              collegeId:
                user.collegeId,
            }
          : {}),
      }).lean(),
    ])



    if (lecturers.length === 0) {

      return NextResponse.json({
        message:
          'No lecturers available',

        assigned: 0,
        skipped: 0,
      })
    }



    const assignedExamIds =
      new Set(
        existingDuties.map(
          (d) =>
            String(
              d.examScheduleId?._id
            )
        )
      )



    const targetExams =
      allExams.filter(
        (exam) =>
          !assignedExamIds.has(
            String(exam._id)
          )
      )



    const loadByLecturer =
      new Map(
        lecturers.map((l) => [
          String(l._id),
          0,
        ])
      )



    const clashMap =
      new Map()



    const availabilityMap =
      new Map()



    for (const item of availabilityList) {

      const lecturerId =
        String(item.lecturerId)

      const dateKey =
        toDateKey(item.date)

      const slotKey =
        `${dateKey}|${item.session}`

      if (
        !availabilityMap.has(
          lecturerId
        )
      ) {
        availabilityMap.set(
          lecturerId,
          new Set()
        )
      }

      availabilityMap
        .get(lecturerId)
        .add(slotKey)

      if (
        item.session ===
        'FULLDAY'
      ) {

        availabilityMap
          .get(lecturerId)
          .add(`${dateKey}|FN`)

        availabilityMap
          .get(lecturerId)
          .add(`${dateKey}|AN`)

        availabilityMap
          .get(lecturerId)
          .add(`${dateKey}|EN`)
      }
    }



    for (const d of existingDuties) {

      const lId =
        String(d.lecturerId)

      const exam =
        d.examScheduleId

      if (
        !exam?.date ||
        !exam?.session
      ) {
        continue
      }

      loadByLecturer.set(
        lId,
        (
          loadByLecturer.get(lId) || 0
        ) + 1
      )

      const key =
        sameDayNoRepeat
          ? toDateKey(exam.date)
          : `${toDateKey(exam.date)}|${exam.session}`

      if (
        !clashMap.has(lId)
      ) {
        clashMap.set(
          lId,
          new Set()
        )
      }

      clashMap
        .get(lId)
        .add(key)
    }



    const createdAssignments =
      []

    const skippedExams =
      []



    for (const exam of targetExams) {

      const examDateKey =
        toDateKey(exam.date)

      const slotKey =
        `${examDateKey}|${exam.session}`



      const candidates =
        lecturers.filter((l) => {

          const lecturerId =
            String(l._id)

          const currentLoad =
            loadByLecturer.get(
              lecturerId
            ) || 0

          if (
            maxDutiesPerLecturer > 0 &&
            currentLoad >=
              maxDutiesPerLecturer
          ) {
            return false
          }

          // availability check
          const unavailableSlots =
            availabilityMap.get(
              lecturerId
            )

          const examSlot =
            `${examDateKey}|${exam.session}`

          if (
            unavailableSlots?.has(
              examSlot
            )
          ) {
            return false
          }

          return !hasDateClash(
            clashMap.get(
              lecturerId
            ),
            exam,
            sameDayNoRepeat
          )
        })



      if (candidates.length === 0) {

        skippedExams.push({
          examScheduleId:
            exam._id,

          reason:
            sameDayNoRepeat
              ? 'No free lecturer available for this date'
              : 'No free lecturer for this date/session',
        })

        continue
      }



      candidates.sort((a, b) => {

        const la =
          loadByLecturer.get(
            String(a._id)
          ) || 0

        const lb =
          loadByLecturer.get(
            String(b._id)
          ) || 0

        if (la !== lb) {
          return la - lb
        }

        return String(a._id)
          .localeCompare(
            String(b._id)
          )
      })



      const selected =
        candidates[0]



      const created =
        await DutyAssignment.create({

          examScheduleId:
            exam._id,

          lecturerId:
            selected._id,

          assignedBy:
            user._id,

          availability:
            'Pending',
        })



      createdAssignments
        .push(created)



      const selectedId =
        String(selected._id)



      loadByLecturer.set(
        selectedId,

        (
          loadByLecturer.get(
            selectedId
          ) || 0
        ) + 1
      )



      if (
        !clashMap.has(
          selectedId
        )
      ) {
        clashMap.set(
          selectedId,
          new Set()
        )
      }



      clashMap
        .get(selectedId)
        .add(
          sameDayNoRepeat
            ? examDateKey
            : slotKey
        )
    }



    return NextResponse.json({

      message:
        'Auto allocation completed',

      assigned:
        createdAssignments.length,

      skipped:
        skippedExams.length,

      skippedExams,

      rules: {
        sameDayNoRepeat,
        maxDutiesPerLecturer,
      },
    })

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          'Auto allocation failed',
      },

      {
        status: 500,
      }
    )
  }
}
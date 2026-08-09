import {
  CalendarCheck2,
  ChartColumn,
  CreditCard,
  FilePenLine,
  LayoutDashboard,
  TableProperties,
  UsersRound,
} from 'lucide-react'
import { getLecturerGroupFromSubject } from '@/lib/lecturerGroupAccess'

export const SECTION_DEFINITIONS = [
  {
    key: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    key: 'attendance',
    label: 'Take daily attendance',
    icon: CalendarCheck2,
  },
  {
    key: 'students',
    label: 'Student Records',
    icon: TableProperties,
  },
  {
    key: 'absentees',
    label: 'Today\'s Absentees List',
    icon: UsersRound,
  },
  {
    key: 'monthly',
    label: 'Monthly Attendance Report',
    icon: LayoutDashboard,
  },
  {
    key: 'exams',
    label: 'Exam Rports',
    icon: ChartColumn,
  },
  {
    key: 'fees',
    label: 'Fee Collection',
    icon: CreditCard,
  },
  {
    key: 'edit',
    label: 'Edit Attendance Entries',
    icon: FilePenLine,
    requiresEditAttendance: true,
  },
]

const DASHBOARD_CONFIGS = {
  mpc: {
    groupName: 'MPC',
    routeSegment: 'mpc',
    includeEditAttendance: true,
  },
  mandat: {
    groupName: 'M&AT',
    routeSegment: 'mandat',
    deskLabel: 'MandAT Desk',
    includeEditAttendance: true,
    statusDescription:
      'Use quick actions below to mark attendance, edit entries, and open monthly analytics.',
    overviewDescription:
      'Monitor attendance, update records, and review shortage summaries for both academic years.',
  },
  cet: {
    groupName: 'CET',
    routeSegment: 'cet',
    includeExternalLinks: true,
    includeEditAttendance: true,
  },
  mlt: {
    groupName: 'MLT',
    routeSegment: 'mlt',
    includeExternalLinks: true,
    includeEditAttendance: true,
  },
  bipc: {
    groupName: 'BiPC',
    routeSegment: 'bipc',
    includeEditAttendance: true,
  },
  cec: {
    groupName: 'CEC',
    routeSegment: 'cec',
    includeEditAttendance: true,
  },
  hec: {
    groupName: 'HEC',
    routeSegment: 'hec',
    includeEditAttendance: true,
  },
  gfc: {
    groupName: 'GFC',
    routeSegment: 'gfc',
  },
}

const DEFAULT_SEGMENT = 'mpc'

export function getDashboardConfigBySegment(segment) {
  return DASHBOARD_CONFIGS[segment] || DASHBOARD_CONFIGS[DEFAULT_SEGMENT]
}

export function getDashboardConfigByGroup(groupName) {
  return (
    Object.values(DASHBOARD_CONFIGS).find(config => config.groupName === groupName) ||
    DASHBOARD_CONFIGS[DEFAULT_SEGMENT]
  )
}

export function getDashboardConfigFromSubject(subject) {
  const groupName = getLecturerGroupFromSubject(subject)
  return getDashboardConfigByGroup(groupName)
}

export function getVisibleSections(includeEditAttendance) {
  return SECTION_DEFINITIONS.filter(
    section => !section.requiresEditAttendance || includeEditAttendance
  )
}

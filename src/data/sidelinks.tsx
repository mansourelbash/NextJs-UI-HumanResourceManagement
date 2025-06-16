
import {
  IconCashRegister,
  IconLayoutDashboard,
  IconCalendarTime,
  IconSettings,
  IconAddressBook,
  IconFileText,
  IconContract,
  IconBusinessplan,
  IconBuilding
} from '@tabler/icons-react'
import { Role } from './schema/auth.schema'



export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element,
  roles?: Role[],
  //Những roles trong này thì không được có hiện
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/dashboard',
    icon: <IconLayoutDashboard size={18} />,
    roles: [Role.Admin]
  },  {
    title: 'Company',
    label: '',
    href: '',
    icon: <IconBuilding size={18} />,
    roles: [Role.Admin],
    sub: [
      {
        title: 'Employee List',
        label: '',
        href: '/company/employee-list',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Department List',
        label: '',
        href: '/company/department',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Position List',
        label: '',
        href: '/company/position',
        icon: <IconFileText size={18} />,
      }
    ],
  },  {
    title: 'Contract',
    label: '',
    href: '',
    icon: <IconContract size={18} />,
    roles: [Role.Admin],
    sub: [
      {
        title: 'Contract List',
        label: '',
        href: '/contract/contract-list',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Contract Approval',
        label: '',
        href: '/contract/contract-approval',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Salary Rules',
        label: '',
        href: '/contract/contract-salary',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Allowances',
        label: '',
        href: '/contract/allowance',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Insurance',
        label: '',
        href: '/contract/insurance',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Contract Types',
        label: '',
        href: '/contract/contract-type',
        icon: <IconFileText size={18} />,
      },
    ],
  },  {
    title: 'Time Tracking',
    label: '',
    href: '/time-keeping',
    icon: <IconCalendarTime size={18} />,
    sub: [
      {
        title: 'Register Work Shift',
        label: '',
        href: '/time-keeping/register-shift',
        icon: <IconFileText size={18} />,
        roles: [Role.Partime],
      },
      {
        title: 'Partime Plan',
        label: '',
        href: '/time-keeping/partime-plan',
        icon: <IconFileText size={18} />,
        roles: [Role.Admin, Role.Partime],
      },
      {
        title: 'Work Schedule',
        label: '',
        href: '/time-keeping/work-shift',
        icon: <IconFileText size={18} />,
        roles: [Role.Admin],
      },
      {
        title: 'Leave Application',
        label: '',
        href: '/time-keeping/leave-application',
        icon: <IconFileText size={18} />,
      },
    ]
  },  {
    title: 'Attendance History',
    label: '',
    href: '/history',
    icon: <IconCalendarTime size={18} />,
    sub: [
      {
        title: 'History Attendance',
        label: '',
        href: '/history/attendance-tracking',
        icon: <IconFileText size={18} />,
        roles: [Role.Partime],
      },
      {
        title: 'Fulltime Attendance',
        label: '',
        href: '/history/fulltime-attendance',
        icon: <IconFileText size={18} />,
        roles: [Role.Fulltime],
      },
      {
        title: 'Face Recognition Registration',
        label: '',
        href: '/history/face-regconition',
        icon: <IconFileText size={18} />,
      }
    ]
  },  {
    title: 'Payroll',
    label: '',
    href: '',
    icon: <IconCashRegister size={18} />,

    sub: [
      {
        title: 'Salary Summary',
        label: '',
        href: '/payroll/salary-summary',
        icon: <IconFileText size={18} />,
        roles: [Role.Admin],
      },
      {
        title: 'Summary History',
        label: '',
        href: '/payroll/salary-history',
        icon: <IconFileText size={18} />,
        roles: [Role.Admin],
      },
      {
        title: 'Salary Advance',
        label: '',
        href: '/payroll/salary-advance',
        icon: <IconFileText size={18} />,
        roles: [Role.Admin,Role.Partime, Role.Fulltime],
      }
    ],
  },  {
    title: 'Salary Components',
    label: '',
    href: '',
    icon: <IconBusinessplan size={18} />,
    roles: [Role.Admin],
    sub: [
      {
        title: 'Salary Formula',
        label: '',
        href: '/salary-components/formula',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Non-taxable Deductions',
        label: '',
        href: '/salary-components/deduction',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Bonuses',
        label: '',
        href: '/salary-components/bonus',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Tax Rate',
        label: '',
        href: '/salary-components/tax-rate',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Tax Deduction',
        label: '',
        href: '/salary-components/tax-deduction',
        icon: <IconFileText size={18} />,
      }
    ],
  },  {
    title: 'Recruitment',
    label: '3',
    href: '',
    icon: <IconAddressBook size={18} />,
    roles: [Role.Admin],
    sub: [
      {
        title: 'Candidate Profiles',
        label: '',
        href: '/recruitment/applicant',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Recruitment Website',
        label: '',
        href: '/recruitment/web',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Interview Tests',
        label: '',
        href: '/recruitment/interview-test',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Test Questions',
        label: '',
        href: '/recruitment/interview-question',
        icon: <IconFileText size={18} />,
      },
      {
        title: 'Job Postings',
        label: '',
        href: '/recruitment/job-posting',
        icon: <IconFileText size={18} />,
      },
    ],
  },
  {
    title: 'Settings',
    label: '',
    href: '/settings',
    icon: <IconSettings size={18} />,
  },
]

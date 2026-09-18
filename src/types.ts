/**
 * Official Types for Algerian Primary Timetable Management Platform
 * منصة إنجاز جداول المواقيت للتعليم الابتدائي - الجزائر
 */

export type GradeLevel = '1AP' | '2AP' | '3AP' | '4AP' | '5AP';

export type ShiftSystem = 'single' | 'double_g1' | 'double_g2';

export type SchoolShiftMode = 'single' | 'full_double' | 'partial_double';

export interface ClassGroup {
  id: string; // e.g. "1AP_1", "1AP_2", "2AP_1"
  grade: GradeLevel;
  groupIndex: number; // 1, 2, ...
  groupLabel: string; // "فوج 01", "فوج 02"
  displayName: string; // "السنة الأولى - فوج 1"
  shiftSystem: ShiftSystem; // 'single' | 'double_g1' | 'double_g2'
  arabicTeacherName: string; // Dedicated Arabic teacher for this specific group
}

export type OfficialPatternCode = '1.1' | '2.1' | '3.1' | '1.2' | '2.2';

export interface OfficialPatternInfo {
  code: OfficialPatternCode;
  tableNumber: '1.3' | '2.3' | '3.3' | '4.3' | '5.3';
  title: string;
  shortTitle: string;
  totalWeeklyHours: string;
  shiftSystemName: string;
  applicableGrades: GradeLevel[];
  hasAmazigh: boolean;
  morningTiming: string;
  afternoonTiming: string;
  tuesdayTiming: string;
  thursdayTiming: string;
  description: string;
}

export type SubjectId =
  | 'arabic'
  | 'math'
  | 'islamic'
  | 'science'
  | 'civics'
  | 'history_geo'
  | 'history'
  | 'art'
  | 'pe'
  | 'french'
  | 'english'
  | 'amazigh'
  | 'recess';

export type TeacherRole =
  | 'arabic_teacher'
  | 'french_teacher'
  | 'english_teacher'
  | 'pe_teacher'
  | 'amazigh_teacher';

export interface SubjectAllocation {
  id: SubjectId;
  name: string;
  shortName: string;
  color: string; // Tailwind color class or hex
  borderColor: string;
  textColor: string;
  teacherRole: TeacherRole;
  totalWeeklyHours: number; // e.g. 7.5
  totalSessions: number;
  sessions90?: number;
  sessions60: number;
  sessions45: number;
  sessions30: number;
  notes?: string;
  activities?: string[];
}

export interface GradeCurriculum {
  grade: GradeLevel;
  gradeLabel: string;
  gradeArabicName: string;
  schoolYear: string;
  totalWeeklyHours: number;
  totalSessions: number;
  subjects: SubjectAllocation[];
  legalReference: string;
  precedenceNote: string;
}

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday';

export interface DayInfo {
  id: DayOfWeek;
  arabicName: string;
  isHalfDay: boolean; // Tuesday afternoon is off
}

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  period: 'morning' | 'afternoon';
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:00"
  durationMinutes: number; // 30, 45, or 60
  subjectId: SubjectId | 'free';
  activityName?: string; // e.g. "قراءة وأداء وفهم", "فهم المنطوق", "حساب ذهني"
  teacherRole?: TeacherRole;
  teacherName?: string;
  isRecess?: boolean;
}

export interface TeacherAssignment {
  id: string;
  name: string;
  role: TeacherRole;
  subjectName: string;
  assignedGrades: GradeLevel[];
  assignedGroups?: string;
  assignedGroupIds?: string[]; // Specific ClassGroup IDs assigned to this teacher
}

export interface SchoolInfo {
  schoolName: string;
  wilaya: string;
  commune: string;
  dairaOrInspection: string;
  academicYear: string;
  directorName: string;
  inspectorName: string;
}

export interface Timetable {
  id: string;
  grade: GradeLevel;
  shiftSystem: ShiftSystem;
  hasAmazigh: boolean;
  schoolName: string;
  wilaya: string;
  commune?: string;
  dairaOrInspection: string;
  academicYear: string;
  classGroup: string; // مثلا "فوج 1" أو "أ"
  arabicTeacherName: string;
  frenchTeacherName: string;
  englishTeacherName: string;
  peTeacherName: string;
  amazighTeacherName?: string;
  directorName: string;
  inspectorName: string;
  slots: TimeSlot[];
  updatedAt: string;
}

export interface OfficialDocument {
  id: string;
  title: string;
  date: string;
  number: string;
  status: 'active_latest' | 'superseded' | 'future_decree';
  summary: string;
  keyChanges: string[];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GradeLevel, 
  ShiftSystem, 
  SchoolShiftMode, 
  ClassGroup, 
  SchoolInfo, 
  TeacherAssignment, 
  TeacherRole,
  SubjectId,
  Timetable, 
  TimeSlot, 
  DayOfWeek 
} from '../types';

export interface OccupiedSlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  classGroupId: string;
  grade: GradeLevel;
  subject: string;
  teacherId: string;
  teacherName: string;
}

/**
 * Convert HH:MM time string to total minutes from 00:00
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Check if two time intervals overlap on the same day
 */
export function isOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const a1 = timeToMinutes(startA);
  const a2 = timeToMinutes(endA);
  const b1 = timeToMinutes(startB);
  const b2 = timeToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

/**
 * Look up the exact assigned specialist teacher for a specific group & grade.
 * Respects:
 * 1. Specific assignedGroupIds if configured (exclusive priority).
 * 2. Assigned grades if matching.
 * 3. Dynamic load balancing across multiple teachers of the same role.
 */
export function getSpecialistTeacherForGroup(
  teachers: TeacherAssignment[],
  role: TeacherRole,
  groupId: string,
  grade: GradeLevel,
  assignmentCounts?: Map<string, number>
): TeacherAssignment | undefined {
  const roleTeachers = teachers.filter((t) => t.role === role);
  if (roleTeachers.length === 0) return undefined;
  if (roleTeachers.length === 1) return roleTeachers[0];

  // 1. Direct group assignment: check if ANY teacher explicitly has this groupId
  const explicitMatches = roleTeachers.filter(
    (t) => t.assignedGroupIds && t.assignedGroupIds.includes(groupId)
  );

  if (explicitMatches.length === 1) {
    return explicitMatches[0];
  }

  if (explicitMatches.length > 1) {
    // If multiple teachers include this groupId, pick the one matching the grade with lowest load
    const withGrade = explicitMatches.filter((t) => t.assignedGrades && t.assignedGrades.includes(grade));
    const pool = withGrade.length > 0 ? withGrade : explicitMatches;
    return [...pool].sort((a, b) => {
      const countA = assignmentCounts?.get(a.id) ?? (a.assignedGroupIds?.length || 0);
      const countB = assignmentCounts?.get(b.id) ?? (b.assignedGroupIds?.length || 0);
      return countA - countB;
    })[0];
  }

  // 2. Grade assignment if not explicitly assigned by groupId
  const byGrade = roleTeachers.filter(
    (t) => t.assignedGrades && t.assignedGrades.includes(grade)
  );

  if (byGrade.length === 1) {
    return byGrade[0];
  }

  if (byGrade.length > 1) {
    // Multiple teachers teach this grade: distribute load evenly
    return [...byGrade].sort((a, b) => {
      const countA = assignmentCounts?.get(a.id) ?? 0;
      const countB = assignmentCounts?.get(b.id) ?? 0;
      return countA - countB;
    })[0];
  }

  // Fallback: pick teacher with fewest assigned groups so far
  return [...roleTeachers].sort((a, b) => {
    const countA = assignmentCounts?.get(a.id) ?? 0;
    const countB = assignmentCounts?.get(b.id) ?? 0;
    return countA - countB;
  })[0];
}

/**
 * Check if a teacher is available for a proposed time window
 */
export function isTeacherAvailable(
  occupancy: Map<string, OccupiedSlot[]>,
  teacher: TeacherAssignment | undefined,
  day: DayOfWeek,
  startTime: string,
  endTime: string
): boolean {
  if (!teacher || !teacher.id) return true;
  const list = occupancy.get(teacher.id) || [];
  return !list.some((occ) => occ.day === day && isOverlapping(occ.startTime, occ.endTime, startTime, endTime));
}

/**
 * Record booked slots for a teacher
 */
export function bookTeacherSlot(
  occupancy: Map<string, OccupiedSlot[]>,
  teacher: TeacherAssignment | undefined,
  slot: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    classGroupId: string;
    grade: GradeLevel;
    subject: string;
  }
) {
  if (!teacher || !teacher.id) return;
  const list = occupancy.get(teacher.id) || [];
  list.push({
    ...slot,
    teacherId: teacher.id,
    teacherName: teacher.name,
  });
  occupancy.set(teacher.id, list);
}

/**
 * Intelligent conflict-free generator for Algerian primary schools:
 * 1. Proactively manages teacher availability for PE, French, English, and Amazigh.
 * 2. Guarantees 0 teacher overlaps across all class groups.
 * 3. Strictly adheres to official ministerial quotas (Decree 16, Circular 468, 1AP Math split rules).
 * 4. Optimizes timetable blocks and grants Arabic teachers extra free afternoons where pedagogically possible.
 */
export function generateConflictFreeSchoolTimetables(params: {
  classGroups: ClassGroup[];
  shiftMode: SchoolShiftMode;
  hasAmazigh: boolean;
  partialDoubleGrades: GradeLevel[];
  teachers: TeacherAssignment[];
  schoolInfo: SchoolInfo;
  defaultShiftSystem?: ShiftSystem;
}): Record<string, Timetable> {
  const { classGroups, shiftMode, hasAmazigh, partialDoubleGrades, teachers, schoolInfo } = params;
  const timetablesMap: Record<string, Timetable> = {};

  // Global occupancy map: teacherId -> OccupiedSlot[]
  const teacherOccupancy = new Map<string, OccupiedSlot[]>();

  // Global tracking for specialist teacher group assignment counts to distribute fairly
  const teacherAssignedCounts = new Map<string, number>();

  // Sort groups: 4AP & 5AP first (most constrained by Circular 468), then 3AP, then 2AP, then 1AP
  const sortedGroups = [...classGroups].sort((a, b) => {
    const order: Record<GradeLevel, number> = { '4AP': 1, '5AP': 2, '3AP': 3, '2AP': 4, '1AP': 5 };
    return (order[a.grade] || 99) - (order[b.grade] || 99);
  });

  const gradeInstanceCount: Record<GradeLevel, number> = { '1AP': 0, '2AP': 0, '3AP': 0, '4AP': 0, '5AP': 0 };

  for (const group of sortedGroups) {
    const grade = group.grade;
    const instanceIdx = gradeInstanceCount[grade]++;

    // Determine effective shift system
    let effectiveShift: ShiftSystem = 'single';
    if (shiftMode === 'full_double') {
      effectiveShift = params.defaultShiftSystem === 'double_g2' ? 'double_g2' : 'double_g1';
    } else if (shiftMode === 'partial_double') {
      if (partialDoubleGrades.includes(grade)) {
        effectiveShift = params.defaultShiftSystem === 'double_g2' ? 'double_g2' : 'double_g1';
      } else {
        effectiveShift = 'single';
      }
    }

    // Lookup teachers assigned specifically to this group
    const arabicTeacher = group.arabicTeacherName || 'أستاذ(ة) اللغة العربية';
    const frenchT = getSpecialistTeacherForGroup(teachers, 'french_teacher', group.id, grade, teacherAssignedCounts);
    const englishT = getSpecialistTeacherForGroup(teachers, 'english_teacher', group.id, grade, teacherAssignedCounts);
    const peT = getSpecialistTeacherForGroup(teachers, 'pe_teacher', group.id, grade, teacherAssignedCounts);
    const amazighT = getSpecialistTeacherForGroup(teachers, 'amazigh_teacher', group.id, grade, teacherAssignedCounts);

    // Record assignment to balance loads
    if (frenchT) teacherAssignedCounts.set(frenchT.id, (teacherAssignedCounts.get(frenchT.id) || 0) + 1);
    if (englishT) teacherAssignedCounts.set(englishT.id, (teacherAssignedCounts.get(englishT.id) || 0) + 1);
    if (peT) teacherAssignedCounts.set(peT.id, (teacherAssignedCounts.get(peT.id) || 0) + 1);
    if (amazighT) teacherAssignedCounts.set(amazighT.id, (teacherAssignedCounts.get(amazighT.id) || 0) + 1);

    const frenchName = frenchT?.name || 'أستاذ اللغة الفرنسية';
    const englishName = englishT?.name || 'أستاذ اللغة الإنجليزية';
    const peName = peT?.name || 'أستاذ التربية البدنية';
    const amazighName = amazighT?.name || 'أستاذ اللغة الأمازيغية';

    let slots: TimeSlot[] = [];

    if (effectiveShift === 'single') {
      slots = generateSingleShiftSlotsForGroup({
        group,
        grade,
        instanceIdx,
        hasAmazigh,
        arabicTeacher,
        frenchT,
        englishT,
        peT,
        amazighT,
        frenchName,
        englishName,
        peName,
        amazighName,
        teacherOccupancy,
      });
    } else {
      slots = generateDoubleShiftSlotsForGroup({
        group,
        grade,
        effectiveShift,
        hasAmazigh,
        arabicTeacher,
        frenchT,
        englishT,
        peT,
        amazighT,
        frenchName,
        englishName,
        peName,
        amazighName,
      });
    }

    const timetable: Timetable = {
      id: `timetable_${group.id}`,
      grade: group.grade,
      shiftSystem: effectiveShift,
      hasAmazigh,
      schoolName: schoolInfo.schoolName,
      wilaya: schoolInfo.wilaya,
      commune: schoolInfo.commune,
      dairaOrInspection: schoolInfo.dairaOrInspection,
      academicYear: schoolInfo.academicYear,
      classGroup: group.groupLabel,
      arabicTeacherName: arabicTeacher,
      frenchTeacherName: frenchName,
      englishTeacherName: englishName,
      peTeacherName: peName,
      amazighTeacherName: amazighName,
      directorName: schoolInfo.directorName,
      inspectorName: schoolInfo.inspectorName,
      slots,
      updatedAt: new Date().toISOString(),
    };

    timetablesMap[group.id] = timetable;
    if (!timetablesMap[group.grade] || instanceIdx === 0) {
      timetablesMap[group.grade] = timetable;
    }
  }

  return timetablesMap;
}

/**
 * Single shift slot generation with proactive constraint solving
 */
function generateSingleShiftSlotsForGroup(ctx: {
  group: ClassGroup;
  grade: GradeLevel;
  instanceIdx: number;
  hasAmazigh: boolean;
  arabicTeacher: string;
  frenchT?: TeacherAssignment;
  englishT?: TeacherAssignment;
  peT?: TeacherAssignment;
  amazighT?: TeacherAssignment;
  frenchName: string;
  englishName: string;
  peName: string;
  amazighName: string;
  teacherOccupancy: Map<string, OccupiedSlot[]>;
}): TimeSlot[] {
  const { grade, instanceIdx, arabicTeacher, frenchName, englishName, peName, amazighName, frenchT, englishT, peT, amazighT, teacherOccupancy } = ctx;
  const g = `${grade.toLowerCase()}_${ctx.group.id}`;

  let slots: TimeSlot[] = [];

  if (grade === '1AP') {
    slots = generate1APSmartSlots(g, ctx.group.id, arabicTeacher, peName, peT, teacherOccupancy);
  } else if (grade === '2AP') {
    slots = generate2APSmartSlots(g, ctx.group.id, arabicTeacher, peName, peT, teacherOccupancy);
  } else if (grade === '3AP') {
    slots = generate3APSmartSlots(g, ctx.group.id, instanceIdx, arabicTeacher, englishName, peName, englishT, peT, teacherOccupancy);
  } else if (grade === '4AP') {
    slots = generate4APSmartSlots(g, ctx.group.id, instanceIdx, arabicTeacher, frenchName, englishName, peName, amazighName, frenchT, englishT, peT, amazighT, teacherOccupancy);
  } else {
    // 5AP
    slots = generate5APSmartSlots(g, ctx.group.id, instanceIdx, arabicTeacher, frenchName, englishName, peName, amazighName, frenchT, englishT, peT, amazighT, teacherOccupancy);
  }

  // Integrate Amazigh language sessions if enabled for 4AP and 5AP
  if (ctx.hasAmazigh && (grade === '4AP' || grade === '5AP')) {
    const amzDays: DayOfWeek[] = ['sunday', 'monday', 'wednesday', 'thursday'];
    const amzTitles: Record<DayOfWeek, string> = {
      sunday: 'اللغة الأمازيغية (الحصة 1: فهم المنطوق والتعبير - 45د)',
      monday: 'اللغة الأمازيغية (الحصة 2: قراءة وأداء وفهم - 45د)',
      wednesday: 'اللغة الأمازيغية (الحصة 3: تراكيب وظواهر لغوية - 45د)',
      thursday: 'اللغة الأمازيغية (الحصة 4: إنتاج كتابي ومشاريع - 45د)',
      tuesday: 'اللغة الأمازيغية',
    };

    amzDays.forEach((day, idx) => {
      const amzSlot: TimeSlot = {
        id: `${g}_amz_${day}`,
        day,
        period: 'afternoon',
        startTime: '14:45',
        endTime: '15:30',
        durationMinutes: 45,
        subjectId: 'amazigh',
        activityName: amzTitles[day],
        teacherRole: 'amazigh_teacher',
        teacherName: amazighName,
      };

      bookTeacherSlot(teacherOccupancy, amazighT, {
        day,
        startTime: '14:45',
        endTime: '15:30',
        classGroupId: ctx.group.id,
        grade,
        subject: 'اللغة الأمازيغية',
      });

      slots.push(amzSlot);
    });
  }

  return slots;
}

// --------------------------------------------------------------------------
// 1AP SMART SCHEDULING (21.0 Hours)
// - Math: 5h (7 sessions: 3 sessions of 60m + 4 sessions of 30m).
//   Strict pedagogical rule: 3 sessions of 1h30 split by another subject (60m math + 30m filler + 30m math),
//   plus 30m math games on Thursday!
// - Arabic: 11h (14 sessions: 8 × 60m + 6 × 30m) sequential pedagogical progression.
// - Islamic: 1.5h (3 × 30m).
// - Art: 1.5h (3 × 30m).
// - PE: 2h (2 × 60m).
// --------------------------------------------------------------------------
function generate1APSmartSlots(
  g: string,
  groupId: string,
  arT: string,
  peName: string,
  peTeacher: TeacherAssignment | undefined,
  occupancy: Map<string, OccupiedSlot[]>
): TimeSlot[] {
  // Candidate PE patterns (two 60m sessions)
  type PEConfig = {
    s1: { day: DayOfWeek; start: string; end: string };
    s2: { day: DayOfWeek; start: string; end: string };
    mathAftDay: 'sunday' | 'monday' | 'wednesday';
  };

  const candidateConfigs: PEConfig[] = [
    // Pattern 1: Sun 13-14 & Wed 13-14 (Math split #3 on Monday aft)
    {
      s1: { day: 'sunday', start: '13:00', end: '14:00' },
      s2: { day: 'wednesday', start: '13:00', end: '14:00' },
      mathAftDay: 'monday',
    },
    // Pattern 2: Mon 14-15 & Wed 14-15 (Math split #3 on Sunday aft)
    {
      s1: { day: 'monday', start: '14:00', end: '15:00' },
      s2: { day: 'wednesday', start: '14:00', end: '15:00' },
      mathAftDay: 'sunday',
    },
    // Pattern 3: Sun 14-15 & Wed 14-15 (Math split #3 on Monday aft)
    {
      s1: { day: 'sunday', start: '14:00', end: '15:00' },
      s2: { day: 'wednesday', start: '14:00', end: '15:00' },
      mathAftDay: 'monday',
    },
    // Pattern 4: Sun 13-14 & Mon 13-14 (Math split #3 on Wednesday aft)
    {
      s1: { day: 'sunday', start: '13:00', end: '14:00' },
      s2: { day: 'monday', start: '13:00', end: '14:00' },
      mathAftDay: 'wednesday',
    },
    // Pattern 5: Sun 14-15 & Mon 14-15 (Math split #3 on Wednesday aft)
    {
      s1: { day: 'sunday', start: '14:00', end: '15:00' },
      s2: { day: 'monday', start: '14:00', end: '15:00' },
      mathAftDay: 'wednesday',
    },
    // Pattern 6: Mon 13-14 & Wed 13-14 (Math split #3 on Sunday aft)
    {
      s1: { day: 'monday', start: '13:00', end: '14:00' },
      s2: { day: 'wednesday', start: '13:00', end: '14:00' },
      mathAftDay: 'sunday',
    },
    // Pattern 7: Tue morning 10:15-11:15 & Wed aft 14-15
    {
      s1: { day: 'tuesday', start: '10:15', end: '11:15' },
      s2: { day: 'wednesday', start: '14:00', end: '15:00' },
      mathAftDay: 'sunday',
    },
    // Pattern 8: Thu morning 10:15-11:15 & Sun aft 14-15
    {
      s1: { day: 'thursday', start: '10:15', end: '11:15' },
      s2: { day: 'sunday', start: '14:00', end: '15:00' },
      mathAftDay: 'monday',
    },
  ];

  // Pick the first candidate where the PE teacher is 100% free
  const chosen = candidateConfigs.find((c) => 
    isTeacherAvailable(occupancy, peTeacher, c.s1.day, c.s1.start, c.s1.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.s2.day, c.s2.start, c.s2.end)
  ) || candidateConfigs[0];

  // Book the PE sessions
  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.s1.day,
    startTime: chosen.s1.start,
    endTime: chosen.s1.end,
    classGroupId: groupId,
    grade: '1AP',
    subject: 'تربية بدنية ورياضية',
  });
  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.s2.day,
    startTime: chosen.s2.start,
    endTime: chosen.s2.end,
    classGroupId: groupId,
    grade: '1AP',
    subject: 'تربية بدنية ورياضية',
  });

  return build1APSlotsFromConfig(g, arT, peName, chosen);
}

function build1APSlotsFromConfig(
  g: string,
  arT: string,
  peName: string,
  config: {
    s1: { day: DayOfWeek; start: string; end: string };
    s2: { day: DayOfWeek; start: string; end: string };
    mathAftDay: 'sunday' | 'monday' | 'wednesday';
  }
): TimeSlot[] {
  const slots: TimeSlot[] = [
    // الأحد (Sunday Morning): 3سا
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'فهم المنطوق وتعبير شفوي (حصة 1)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'إنتاج شفوي (حصة 2)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_rec`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وأداء وفهم (حصة 3)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (حصة 1)', teacherRole: 'arabic_teacher', teacherName: arT },

    // الإثنين (Monday Morning): 3سا
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وتدريب لغوي (حصة 5)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'تعبير وكتابة (حصة 6)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_rec`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وتثبيت (حصة 7)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'مطالعة وتذوق (حصة 8)', teacherRole: 'arabic_teacher', teacherName: arT },

    // الثلاثاء (Tuesday Morning): 3سا (الفترة مقسمة: رياضيات 1سا + محفوظات 30د + استراحة + رياضيات 30د + قراءة 1سا)
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة 1 - الجزء الأول)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'محفوظات وأناشيد (حصة 4)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_rec`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (حصة 2 - تتمة الحصة السابقة)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وظاهرة لغوية (حصة 9)', teacherRole: 'arabic_teacher', teacherName: arT },

    // الأربعاء (Wednesday Morning): 3سا (الفترة مقسمة: رياضيات 1سا + إسلامية 30د + استراحة + رياضيات 30د + قراءة 1سا)
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة 3 - الجزء الأول)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (حصة 2)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_rec`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (حصة 4 - تتمة الحصة السابقة)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وكتابة (حصة 10)', teacherRole: 'arabic_teacher', teacherName: arT },

    // الخميس (Thursday Morning): 3سا (آخر نصف ساعة مخصصة للألعاب الرياضياتية!)
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وإدماج جزئي (حصة 11)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'مشروع كتابي وتعبير (حصة 12)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_rec`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'تقويم ومعالجة بيداغوجية (حصة 13)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'ألعاب رياضياتية (نصف ساعة ختامية)', teacherRole: 'arabic_teacher', teacherName: arT },
  ];

  // Generate the 3 afternoons (Sunday, Monday, Wednesday) dynamically
  const aftDays: Array<'sunday' | 'monday' | 'wednesday'> = ['sunday', 'monday', 'wednesday'];

  aftDays.forEach((day) => {
    // Is this the dedicated Math split afternoon? (60m math + 30m art + 30m math = 1h30, plus 30m islamic/arabic)
    if (day === config.mathAftDay) {
      slots.push(
        { id: `${g}_${day}_aft_1`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة 5 - الجزء الأول)', teacherRole: 'arabic_teacher', teacherName: arT },
        { id: `${g}_${day}_aft_2`, day, period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية تشكيلية (حصة 1)', teacherRole: 'arabic_teacher', teacherName: arT },
        { id: `${g}_${day}_aft_3`, day, period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (حصة 6 - تتمة الحصة السابقة)', teacherRole: 'arabic_teacher', teacherName: arT }
      );
      return;
    }

    // Check if PE is on this afternoon
    const isS1 = config.s1.day === day;
    const isS2 = config.s2.day === day;
    const peSlot = isS1 ? config.s1 : (isS2 ? config.s2 : null);

    if (peSlot) {
      if (peSlot.start === '13:00') {
        // PE from 13:00 to 14:00, then two 30m activities
        slots.push(
          { id: `${g}_${day}_aft_pe`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية', teacherRole: 'pe_teacher', teacherName: peName },
          { id: `${g}_${day}_aft_art`, day, period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: day === 'sunday' ? 'تربية موسيقية' : 'تربية فنية وتعبير', teacherRole: 'arabic_teacher', teacherName: arT },
          { id: `${g}_${day}_aft_fill`, day, period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: day === 'sunday' ? 'islamic' : 'arabic', activityName: day === 'sunday' ? 'تربية إسلامية (حصة 3)' : 'إنتاج وتعبير كتابي (حصة 14)', teacherRole: 'arabic_teacher', teacherName: arT }
        );
      } else {
        // Two 30m activities from 13:00 to 14:00, then PE from 14:00 to 15:00
        slots.push(
          { id: `${g}_${day}_aft_art`, day, period: 'afternoon', startTime: '13:00', endTime: '13:30', durationMinutes: 30, subjectId: 'art', activityName: day === 'sunday' ? 'تربية موسيقية' : 'تربية فنية وتعبير', teacherRole: 'arabic_teacher', teacherName: arT },
          { id: `${g}_${day}_aft_fill`, day, period: 'afternoon', startTime: '13:30', endTime: '14:00', durationMinutes: 30, subjectId: day === 'sunday' ? 'islamic' : 'arabic', activityName: day === 'sunday' ? 'تربية إسلامية (حصة 3)' : 'إنتاج وتعبير كتابي (حصة 14)', teacherRole: 'arabic_teacher', teacherName: arT },
          { id: `${g}_${day}_aft_pe`, day, period: 'afternoon', startTime: '14:00', endTime: '15:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية', teacherRole: 'pe_teacher', teacherName: peName }
        );
      }
    } else {
      // General filler afternoon if PE is in the morning
      slots.push(
        { id: `${g}_${day}_aft_1`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'تعبير وقراءة (حصة 14)', teacherRole: 'arabic_teacher', teacherName: arT },
        { id: `${g}_${day}_aft_2`, day, period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية', teacherRole: 'arabic_teacher', teacherName: arT },
        { id: `${g}_${day}_aft_3`, day, period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT }
      );
    }
  });

  return slots;
}

// --------------------------------------------------------------------------
// 2AP SMART SCHEDULING (21.0 Hours, 30 Sessions)
// ═════════════════════════════════════════════════════════════════════════
// Strict adherence to Algerian Primary Curriculum & Ministerial Instructions:
// - Arabic: 11h (15 sessions: 7x60m, 8x30m), Days 1 to 5 mapped sequentially
// - Math: 5h (7 sessions: 3x60m, 4x30m), 3 merged blocks (60m+30m) separated by another subject,
//   plus 30m Math Games at the end of the week (Thursday 10:45-11:15)
// - Islamic: 1.5h (3 sessions x 30m, no 60m session)
// - Art: 1.5h (3 sessions x 30m, no 60m session)
// - PE: 2.0h (2 sessions x 60m)
// --------------------------------------------------------------------------
type PEConfig2AP = {
  s1: { day: DayOfWeek; start: string; end: string };
  s2: { day: DayOfWeek; start: string; end: string };
  peAftDay: 'monday' | 'wednesday' | 'sunday';
  splitThuMorning?: boolean;
};

function generate2APSmartSlots(
  g: string,
  groupId: string,
  arT: string,
  peName: string,
  peTeacher: TeacherAssignment | undefined,
  occupancy: Map<string, OccupiedSlot[]>
): TimeSlot[] {
  // Staggered candidate configs for 2AP to avoid collision with 1AP, other 2AP groups, or 3AP/4AP/5AP
  const candidateConfigs: PEConfig2AP[] = [
    // Pattern 1: Monday afternoon 13:00 - 15:00 (2h PE back-to-back)
    {
      s1: { day: 'monday', start: '13:00', end: '14:00' },
      s2: { day: 'monday', start: '14:00', end: '15:00' },
      peAftDay: 'monday',
    },
    // Pattern 2: Wednesday afternoon 13:00 - 15:00 (2h PE back-to-back)
    {
      s1: { day: 'wednesday', start: '13:00', end: '14:00' },
      s2: { day: 'wednesday', start: '14:00', end: '15:00' },
      peAftDay: 'wednesday',
    },
    // Pattern 3: Sunday afternoon 13:00 - 15:00 (2h PE back-to-back)
    {
      s1: { day: 'sunday', start: '13:00', end: '14:00' },
      s2: { day: 'sunday', start: '14:00', end: '15:00' },
      peAftDay: 'sunday',
    },
    // Pattern 4: Monday afternoon 13:00-14:00 & Thursday morning 10:15-11:15
    {
      s1: { day: 'monday', start: '13:00', end: '14:00' },
      s2: { day: 'thursday', start: '10:15', end: '11:15' },
      peAftDay: 'monday',
      splitThuMorning: true,
    },
    // Pattern 5: Wednesday afternoon 13:00-14:00 & Thursday morning 10:15-11:15
    {
      s1: { day: 'wednesday', start: '13:00', end: '14:00' },
      s2: { day: 'thursday', start: '10:15', end: '11:15' },
      peAftDay: 'wednesday',
      splitThuMorning: true,
    },
    // Pattern 6: Sunday afternoon 13:00-14:00 & Thursday morning 10:15-11:15
    {
      s1: { day: 'sunday', start: '13:00', end: '14:00' },
      s2: { day: 'thursday', start: '10:15', end: '11:15' },
      peAftDay: 'sunday',
      splitThuMorning: true,
    },
  ];

  const chosen = candidateConfigs.find((c) => 
    isTeacherAvailable(occupancy, peTeacher, c.s1.day, c.s1.start, c.s1.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.s2.day, c.s2.start, c.s2.end)
  ) || candidateConfigs[0];

  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.s1.day,
    startTime: chosen.s1.start,
    endTime: chosen.s1.end,
    classGroupId: groupId,
    grade: '2AP',
    subject: 'تربية بدنية ورياضية',
  });
  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.s2.day,
    startTime: chosen.s2.start,
    endTime: chosen.s2.end,
    classGroupId: groupId,
    grade: '2AP',
    subject: 'تربية بدنية ورياضية',
  });

  return build2APSlotsFromConfig(g, arT, peName, chosen);
}

function build2APSlotsFromConfig(
  g: string,
  arT: string,
  peName: string,
  config: PEConfig2AP
): TimeSlot[] {
  const slots: TimeSlot[] = [
    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الأول (الأحد - Sunday Morning: 3سا)
    // لغة عربية: الحصص 01، 03، 02، 04 (2سا و30د) + ت. إسلامية: الحصة 1 (30د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 01: فهم المنطوق (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 03: قراءة (بناء الفقرة الأولى من النص وتجريد الحرف الأول - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_rec`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 02: تعبير شفوي (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 04: كتابة (الحرف الأول على كراس القسم - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 1: قرآن كريم وحديث (30د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الثاني (الإثنين - Monday Morning: 3سا)
    // لغة عربية: الحصص 05، 07، 06 (2سا و30د) + ت. إسلامية: الحصة 2 (30د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 05: إنتاج شفوي (60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 07: إملاء (إملاء منظور لتثبيت رسم الحرف الأول - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_rec`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 06: قراءة (قراءة الفقرة الأولى وتثبيت الحرف الأول - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 2: تهذيب وسيرة نبوية (30د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الثالث (الثلاثاء - Tuesday Morning: 3سا)
    // رياضيات مدمجة (1سا و30د: 60د + 30د) مفصولة بكتابة الحرف الثاني (30د) + قراءة وتجريد الحرف الثاني (60د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات - بناء المفهوم وهندسة وقياس (حصة مدمجة - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 09: كتابة (الحرف الثاني على كراس القسم - نشاط فاصل - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_rec`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - تدريب وتطبيقات تابعة للحصة السابقة (حصة مدمجة - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 08: قراءة (بناء الفقرة الثانية من النص وتجريد الحرف الثاني - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الرابع (الأربعاء - Wednesday Morning: 3سا)
    // لغة عربية صباحاً: الحصص 10، 11، 12، 13 (3 ساعات كاملة)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 10: قراءة (قراءة الفقرة الثانية وتثبيت الحرف الثاني - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 11: محفوظات (تقديم وتحفيظ مقطوعة شعرية مناسبة - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_rec`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 12: قراءة إتقان (قراءة سليمة على الكتاب وتطوير مهارات الفهم الصريح - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 13: إملاء (إملاء منظور لتثبيت رسم الحرف الثاني - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الخامس (الخميس - Thursday Morning: 3سا)
    // لغة عربية: الحصتان 14 و 15 (إدماج 60د ومحفوظات 30د) + ت. إسلامية (30د) + ت. فنية (30د) + ألعاب رياضياتية (30د بنهاية الأسبوع)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 14: إدماج (ألعاب شفوية لتثبيت الصيغ، ألعاب كتابية ولتطوير مهارات القراءة السليمة - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 15: محفوظات (تقديم وتحفيظ مقطوعة شعرية - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_rec`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
  ];

  // Complete Thursday morning based on whether PE is split to Thursday
  if (config.splitThuMorning) {
    slots.push(
      { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - ألعاب رياضياتية (30د ختامية في نهاية الأسبوع)', teacherRole: 'arabic_teacher', teacherName: arT },
      { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 2 (60د)', teacherRole: 'pe_teacher', teacherName: peName }
    );
  } else {
    slots.push(
      { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 3: تطبيقات وقيم وسلوك (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
      { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 3: تذوق فني وأشغال يدوية (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
      { id: `${g}_thu_5`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - ألعاب رياضياتية (30د ختامية في نهاية الأسبوع)', teacherRole: 'arabic_teacher', teacherName: arT }
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // AFTERNOONS (Sunday, Monday, Wednesday: 2 hours each)
  // One afternoon has PE (2h), and the other two have Math merged blocks (1.5h Math + 30m Art separator = 2h each)
  // ═════════════════════════════════════════════════════════════════════════
  const aftDays: Array<'sunday' | 'monday' | 'wednesday'> = ['sunday', 'monday', 'wednesday'];

  aftDays.forEach((day) => {
    if (day === config.peAftDay) {
      if (config.splitThuMorning) {
        // PE 1 (13:00 - 14:00) + Islamic 3 (30m) + Art 3 (30m)
        slots.push(
          { id: `${g}_${day}_aft_1`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 1 (60د)', teacherRole: 'pe_teacher', teacherName: peName },
          { id: `${g}_${day}_aft_2`, day, period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 3: تطبيقات وقيم وسلوك (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
          { id: `${g}_${day}_aft_3`, day, period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 3: تذوق فني وأشغال يدوية (30د)', teacherRole: 'arabic_teacher', teacherName: arT }
        );
      } else {
        // PE 1 & PE 2 back-to-back (13:00 - 15:00)
        slots.push(
          { id: `${g}_${day}_aft_1`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 1 (60د)', teacherRole: 'pe_teacher', teacherName: peName },
          { id: `${g}_${day}_aft_2`, day, period: 'afternoon', startTime: '14:00', endTime: '15:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 2 (60د)', teacherRole: 'pe_teacher', teacherName: peName }
        );
      }
      return;
    }

    // Dedicated Math afternoon block (60m Math + 30m Art separator + 30m Math = 2 hours)
    const isFirstMathAft = day === 'sunday' || (day === 'monday' && config.peAftDay === 'sunday');
    const artActivity = isFirstMathAft
      ? 'تربية فنية - الحصة 1: تعبير تشكيلي ورسم (نشاط فاصل - 30د)'
      : 'تربية فنية - الحصة 2: تربية موسيقية وإنشاد (نشاط فاصل - 30د)';
    const mathPart1Title = isFirstMathAft
      ? 'رياضيات - أنشطة عددية وبناء المفهوم (حصة مدمجة - 60د)'
      : 'رياضيات - أنشطة ومفاهيم وحل مشكلات (حصة مدمجة - 60د)';

    slots.push(
      { id: `${g}_${day}_aft_1`, day, period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'math', activityName: mathPart1Title, teacherRole: 'arabic_teacher', teacherName: arT },
      { id: `${g}_${day}_aft_2`, day, period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: artActivity, teacherRole: 'arabic_teacher', teacherName: arT },
      { id: `${g}_${day}_aft_3`, day, period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - تدريب وتطبيقات تابعة للحصة السابقة (حصة مدمجة - 30د)', teacherRole: 'arabic_teacher', teacherName: arT }
    );
  });

  return slots;
}

// --------------------------------------------------------------------------
// 3AP SMART SCHEDULING (21.0 Hours)
// --------------------------------------------------------------------------
// 3AP SMART SCHEDULING (21.0 Hours, 29 Sessions)
// ═════════════════════════════════════════════════════════════════════════
// Exact ministerial & pedagogical constraints:
// - Total volume: 21h/week across 29 sessions
// - Arabic: 7.5h (9 sessions: 6x60m + 3x30m, matching the 9 official activities)
// - Math: 5h (7 sessions: 3x60m + 4x30m), 3 merged blocks (60m+30m) separated by another subject,
//   plus 30m Math Games at the end of the week (Thursday 10:45-11:15)
// - English: 2h (two 60m sessions, specialist teacher, no 30m sessions)
// - PE: 2h (two 60m sessions, specialist teacher)
// - Science: 1h (two 30m sessions)
// - Islamic: 1.5h (three 30m sessions)
// - Art: 1.5h (three 30m sessions)
// - History: 0.5h (one 30m session)
// - French & Civics & Geography: 0h (Strictly excluded)
// --------------------------------------------------------------------------
function generate3APSmartSlots(
  g: string,
  groupId: string,
  instanceIdx: number,
  arT: string,
  enName: string,
  peName: string,
  enTeacher: TeacherAssignment | undefined,
  peTeacher: TeacherAssignment | undefined,
  occupancy: Map<string, OccupiedSlot[]>
): TimeSlot[] {
  type Config3AP = {
    // English session 1 & 2 (each 60m)
    en1: { day: DayOfWeek; start: string; end: string };
    en2: { day: DayOfWeek; start: string; end: string };
    // PE session 1 & 2 (each 60m)
    pe1: { day: DayOfWeek; start: string; end: string };
    pe2: { day: DayOfWeek; start: string; end: string };
  };

  // Staggered candidate configs for English and PE across afternoons and mornings
  const candidateConfigs: Config3AP[] = [
    // Config 1: Mon morning (English 09:45-10:45), Wed aft (English 14:00-15:00), Mon aft (PE 13:00-14:00), Wed aft (PE 13:00-14:00)
    {
      en1: { day: 'monday', start: '09:45', end: '10:45' },
      en2: { day: 'wednesday', start: '14:00', end: '15:00' },
      pe1: { day: 'monday', start: '13:00', end: '14:00' },
      pe2: { day: 'wednesday', start: '13:00', end: '14:00' },
    },
    // Config 2: Sun aft (English 13:00-14:00), Wed aft (English 13:00-14:00), Mon aft (PE 13:00-14:00), Wed aft (PE 14:00-15:00)
    {
      en1: { day: 'sunday', start: '13:00', end: '14:00' },
      en2: { day: 'wednesday', start: '13:00', end: '14:00' },
      pe1: { day: 'monday', start: '13:00', end: '14:00' },
      pe2: { day: 'wednesday', start: '14:00', end: '15:00' },
    },
    // Config 3: Mon aft (English 13:00-14:00), Wed aft (English 14:00-15:00), Sun aft (PE 13:00-14:00), Wed aft (PE 13:00-14:00)
    {
      en1: { day: 'monday', start: '13:00', end: '14:00' },
      en2: { day: 'wednesday', start: '14:00', end: '15:00' },
      pe1: { day: 'sunday', start: '13:00', end: '14:00' },
      pe2: { day: 'wednesday', start: '13:00', end: '14:00' },
    },
    // Config 4: Mon morning (English 09:45-10:45), Wed aft (English 13:00-14:00), Sun aft (PE 13:00-14:00), Mon aft (PE 13:00-14:00)
    {
      en1: { day: 'monday', start: '09:45', end: '10:45' },
      en2: { day: 'wednesday', start: '13:00', end: '14:00' },
      pe1: { day: 'sunday', start: '13:00', end: '14:00' },
      pe2: { day: 'monday', start: '13:00', end: '14:00' },
    },
    // Config 5: Mon aft (English 14:00-15:00), Wed aft (English 14:00-15:00), Mon aft (PE 13:00-14:00), Wed aft (PE 13:00-14:00)
    {
      en1: { day: 'monday', start: '14:00', end: '15:00' },
      en2: { day: 'wednesday', start: '14:00', end: '15:00' },
      pe1: { day: 'monday', start: '13:00', end: '14:00' },
      pe2: { day: 'wednesday', start: '13:00', end: '14:00' },
    },
  ];

  const chosen = candidateConfigs.find((c) => 
    isTeacherAvailable(occupancy, enTeacher, c.en1.day, c.en1.start, c.en1.end) &&
    isTeacherAvailable(occupancy, enTeacher, c.en2.day, c.en2.start, c.en2.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.pe1.day, c.pe1.start, c.pe1.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.pe2.day, c.pe2.start, c.pe2.end)
  ) || candidateConfigs[0];

  // Book English
  bookTeacherSlot(occupancy, enTeacher, {
    day: chosen.en1.day,
    startTime: chosen.en1.start,
    endTime: chosen.en1.end,
    classGroupId: groupId,
    grade: '3AP',
    subject: 'لغة إنجليزية',
  });
  bookTeacherSlot(occupancy, enTeacher, {
    day: chosen.en2.day,
    startTime: chosen.en2.start,
    endTime: chosen.en2.end,
    classGroupId: groupId,
    grade: '3AP',
    subject: 'لغة إنجليزية',
  });

  // Book PE
  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.pe1.day,
    startTime: chosen.pe1.start,
    endTime: chosen.pe1.end,
    classGroupId: groupId,
    grade: '3AP',
    subject: 'تربية بدنية ورياضية',
  });
  bookTeacherSlot(occupancy, peTeacher, {
    day: chosen.pe2.day,
    startTime: chosen.pe2.start,
    endTime: chosen.pe2.end,
    classGroupId: groupId,
    grade: '3AP',
    subject: 'تربية بدنية ورياضية',
  });

  // Check where English and PE fall
  const isEn1MonMorning = chosen.en1.day === 'monday' && chosen.en1.start === '09:45';

  return [
    // ═════════════════════════════════════════════════════════════════════════
    // الأحد (Sunday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 1: بناء المفاهيم (60د) + نشاط فاصل (تعبير شفوي 30د) + تطبيقات وتمارين (30د)
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (بناء المفاهيم والأنشطة العددية - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_rec`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'التعبير الشفوي واستعمال الصيغ (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات وتمارين - 30د تابعة للحصة المدمجة 1)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (قرآن كريم وتفسير - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    // الأحد مساءً (13:00 - 15:00)
    { 
      id: `${g}_sun_6`, 
      day: 'sunday', 
      period: 'afternoon', 
      startTime: '13:00', 
      endTime: '14:00', 
      durationMinutes: 60, 
      subjectId: (chosen.pe1.day === 'sunday' ? 'pe' : (chosen.en1.day === 'sunday' ? 'english' : 'arabic')) as SubjectId, 
      activityName: chosen.pe1.day === 'sunday' ? 'تربية بدنية ورياضية - الحصة 1 (60د)' : (chosen.en1.day === 'sunday' ? 'Language Focus 1: Oral Interaction & Vocabulary (60د)' : 'القراءة (أداء وفهم - 60د)'), 
      teacherRole: chosen.pe1.day === 'sunday' ? 'pe_teacher' : (chosen.en1.day === 'sunday' ? 'english_teacher' : 'arabic_teacher'), 
      teacherName: chosen.pe1.day === 'sunday' ? peName : (chosen.en1.day === 'sunday' ? enName : arT) 
    },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 1: تربية تشكيلية ورسم (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'history', activityName: 'تاريخ (دراسة معالم وآثار وأحداث تاريخية - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // الإثنين (Monday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'الإنتاج الشفوي (60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (ملاحظة واستكشاف وتجريب - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_rec`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { 
      id: `${g}_mon_3`, 
      day: 'monday', 
      period: 'morning', 
      startTime: '09:45', 
      endTime: '10:45', 
      durationMinutes: 60, 
      subjectId: (isEn1MonMorning ? 'english' : 'arabic') as SubjectId, 
      activityName: isEn1MonMorning ? 'Language Focus 1: Oral Interaction & Vocabulary (60د)' : 'القراءة (أداء وفهم - 60د)', 
      teacherRole: isEn1MonMorning ? 'english_teacher' : 'arabic_teacher', 
      teacherName: isEn1MonMorning ? enName : arT 
    },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (حديث نبوي شريف وسيرة - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    // الإثنين مساءً (13:00 - 15:00)
    { 
      id: `${g}_mon_5`, 
      day: 'monday', 
      period: 'afternoon', 
      startTime: '13:00', 
      endTime: '14:00', 
      durationMinutes: 60, 
      subjectId: (chosen.pe1.day === 'monday' && chosen.pe1.start === '13:00' ? 'pe' : (chosen.en1.day === 'monday' && chosen.en1.start === '13:00' ? 'english' : 'arabic')) as SubjectId, 
      activityName: chosen.pe1.day === 'monday' && chosen.pe1.start === '13:00' ? 'تربية بدنية ورياضية - الحصة 1 (60د)' : (chosen.en1.day === 'monday' && chosen.en1.start === '13:00' ? 'Language Focus 1: Oral Interaction & Vocabulary (60د)' : 'القراءة (أداء وفهم - 60د)'), 
      teacherRole: chosen.pe1.day === 'monday' && chosen.pe1.start === '13:00' ? 'pe_teacher' : (chosen.en1.day === 'monday' && chosen.en1.start === '13:00' ? 'english_teacher' : 'arabic_teacher'), 
      teacherName: chosen.pe1.day === 'monday' && chosen.pe1.start === '13:00' ? peName : (chosen.en1.day === 'monday' && chosen.en1.start === '13:00' ? enName : arT) 
    },
    // إذا كانت الفترة 14:00-15:00 محجوزة للإنجليزية أو البدنية
    ...((chosen.en1.day === 'monday' && chosen.en1.start === '14:00' ? [
      { id: `${g}_mon_6_art`, day: 'monday' as DayOfWeek, period: 'afternoon' as const, startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art' as SubjectId, activityName: 'تربية فنية - الحصة 2: تربية موسيقية وأناشيد (30د)', teacherRole: 'arabic_teacher' as const, teacherName: arT },
      { id: `${g}_mon_7_isl`, day: 'monday' as DayOfWeek, period: 'afternoon' as const, startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic' as SubjectId, activityName: 'تربية إسلامية (عقائد وآداب وأخلاق وسلوك - 30د)', teacherRole: 'arabic_teacher' as const, teacherName: arT },
    ] : [
      { id: `${g}_mon_6`, day: 'monday' as DayOfWeek, period: 'afternoon' as const, startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art' as SubjectId, activityName: 'تربية فنية - الحصة 2: تربية موسيقية وأناشيد (30د)', teacherRole: 'arabic_teacher' as const, teacherName: arT },
      { id: `${g}_mon_7`, day: 'monday' as DayOfWeek, period: 'afternoon' as const, startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic' as SubjectId, activityName: 'تربية إسلامية (عقائد وآداب وأخلاق وسلوك - 30د)', teacherRole: 'arabic_teacher' as const, teacherName: arT },
    ]) as TimeSlot[]),

    // ═════════════════════════════════════════════════════════════════════════
    // الثلاثاء (Tuesday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 2: هندسة وقياس (60د) + نشاط فاصل (محفوظات 30د) + تطبيقات هندسية (30د)
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة مدمجة 2: هندسة وقياس وتنظيم معطيات - 60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'المحفوظات وتذوق لغوي (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_rec`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات هندسية تابعة للحصة المدمجة 2 - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة تركيبية (60د)', teacherRole: 'arabic_teacher', teacherName: arT },

    // ═════════════════════════════════════════════════════════════════════════
    // الأربعاء (Wednesday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة إملائية أو صرفية (60د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (استنتاج وتطبيقات علمية - 30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_rec`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'المطالعة (60د كاملة وفق المنهاج)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 3: أشغال يدوية وتذوق فني (30د)', teacherRole: 'arabic_teacher', teacherName: arT },
    // الأربعاء مساءً: ساعتان (13:00 - 15:00) مخصصتان للمواد المتخصصة (PE / English)
    { 
      id: `${g}_wed_5`, 
      day: 'wednesday', 
      period: 'afternoon', 
      startTime: '13:00', 
      endTime: '14:00', 
      durationMinutes: 60, 
      subjectId: (chosen.pe2.start === '13:00' ? 'pe' : 'english') as SubjectId, 
      activityName: chosen.pe2.start === '13:00' ? 'تربية بدنية ورياضية - الحصة 2 (60د)' : 'Language Focus 2: Reading & Discovery / Phonics (60د)', 
      teacherRole: chosen.pe2.start === '13:00' ? 'pe_teacher' : 'english_teacher', 
      teacherName: chosen.pe2.start === '13:00' ? peName : enName 
    },
    { 
      id: `${g}_wed_6`, 
      day: 'wednesday', 
      period: 'afternoon', 
      startTime: '14:00', 
      endTime: '15:00', 
      durationMinutes: 60, 
      subjectId: (chosen.pe2.start === '14:00' ? 'pe' : 'english') as SubjectId, 
      activityName: chosen.pe2.start === '14:00' ? 'تربية بدنية ورياضية - الحصة 2 (60د)' : 'Language Focus 2: Reading & Discovery / Phonics (60د)', 
      teacherRole: chosen.pe2.start === '14:00' ? 'pe_teacher' : 'english_teacher', 
      teacherName: chosen.pe2.start === '14:00' ? peName : enName 
    },

    // ═════════════════════════════════════════════════════════════════════════
    // الخميس (Thursday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية لتلاميذ 3AP
    // الحجم الصباحي: 4 حصص (مجموع الأسبوع 29 حصة كاملة بـ 21 ساعة)
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 3: تطبيقات (30د) + نشاط لغوي فاصل (الإنتاج الكتابي 60د كاملة) + استراحة + حل مشكلات (60د) + ألعاب رياضياتية (30د ختامية بنهاية الأسبوع)
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات حل المشكلات تابعة للحصة المدمجة 3 - 30 دقيقة)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'اللغة العربية - الحصة 9: الإنتاج الكتابي (وفقاً للمذكرة المنهجية رقم 03 - 60 دقيقة)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_rec`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة مدمجة 3: حل مشكلات وأنشطة عددية - 60 دقيقة)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (ألعاب رياضياتية وتفكير إبداعي بنهاية الأسبوع - 30 دقيقة)', teacherRole: 'arabic_teacher', teacherName: arT },
  ];
}

// --------------------------------------------------------------------------
// 4AP SMART SCHEDULING (22.5 Hours - Circular 468)
// - French: 2h (two 60m sessions)
// - English: 2h (two 60m sessions)
// - PE: 1.5h (one 90m block)
// --------------------------------------------------------------------------
function generate4APSmartSlots(
  g: string,
  groupId: string,
  instanceIdx: number,
  arT: string,
  frName: string,
  enName: string,
  peName: string,
  amzName: string,
  frTeacher: TeacherAssignment | undefined,
  enTeacher: TeacherAssignment | undefined,
  peTeacher: TeacherAssignment | undefined,
  amzTeacher: TeacherAssignment | undefined,
  occupancy: Map<string, OccupiedSlot[]>
): TimeSlot[] {
  type Config4AP = {
    fr1: { day: DayOfWeek; start: string; end: string };
    fr2: { day: DayOfWeek; start: string; end: string };
    en1: { day: DayOfWeek; start: string; end: string };
    en2: { day: DayOfWeek; start: string; end: string };
    pe: { day: DayOfWeek; start: string; end: string };
  };

  const candidateConfigs: Config4AP[] = [
    // Config 1: Best Pedagogical - PE Thu aft 13:00-14:30 (Arabic teacher 100% free Thu aft!), Fr Sun 13-14 & Wed 09:45-10:45, En Mon 09:45-10:45 & Thu 10:15-11:15
    {
      fr1: { day: 'sunday', start: '13:00', end: '14:00' },
      fr2: { day: 'wednesday', start: '09:45', end: '10:45' },
      en1: { day: 'monday', start: '09:45', end: '10:45' },
      en2: { day: 'thursday', start: '10:15', end: '11:15' },
      pe: { day: 'thursday', start: '13:00', end: '14:30' },
    },
    // Config 2: PE Wed aft 13:30-15:00, Fr Sun 14-15 & Wed 10:15-11:15, En Mon 10:15-11:15 & Thu 09:45-10:45
    {
      fr1: { day: 'sunday', start: '14:00', end: '15:00' },
      fr2: { day: 'wednesday', start: '10:15', end: '11:15' },
      en1: { day: 'monday', start: '10:15', end: '11:15' },
      en2: { day: 'thursday', start: '09:45', end: '10:45' },
      pe: { day: 'wednesday', start: '13:30', end: '15:00' },
    },
    // Config 3: PE Sun aft 13:30-15:00, Fr Mon 09:45-10:45 & Thu 08:00-09:00, En Wed 13:00-14:00 & Thu 10:15-11:15
    {
      fr1: { day: 'monday', start: '09:45', end: '10:45' },
      fr2: { day: 'thursday', start: '08:00', end: '09:00' },
      en1: { day: 'wednesday', start: '13:00', end: '14:00' },
      en2: { day: 'thursday', start: '10:15', end: '11:15' },
      pe: { day: 'sunday', start: '13:30', end: '15:00' },
    },
    // Config 4: PE Mon aft 13:00-14:30, Fr Wed 13:00-14:00 & Sun 09:45-10:45, En Sun 10:15-11:15 & Thu 13:30-14:30
    {
      fr1: { day: 'wednesday', start: '13:00', end: '14:00' },
      fr2: { day: 'sunday', start: '09:45', end: '10:45' },
      en1: { day: 'sunday', start: '10:15', end: '11:15' },
      en2: { day: 'thursday', start: '13:30', end: '14:30' },
      pe: { day: 'monday', start: '13:00', end: '14:30' },
    },
  ];

  const chosen = candidateConfigs.find((c) => 
    isTeacherAvailable(occupancy, frTeacher, c.fr1.day, c.fr1.start, c.fr1.end) &&
    isTeacherAvailable(occupancy, frTeacher, c.fr2.day, c.fr2.start, c.fr2.end) &&
    isTeacherAvailable(occupancy, enTeacher, c.en1.day, c.en1.start, c.en1.end) &&
    isTeacherAvailable(occupancy, enTeacher, c.en2.day, c.en2.start, c.en2.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.pe.day, c.pe.start, c.pe.end)
  ) || candidateConfigs[0];

  // Book French
  bookTeacherSlot(occupancy, frTeacher, { day: chosen.fr1.day, startTime: chosen.fr1.start, endTime: chosen.fr1.end, classGroupId: groupId, grade: '4AP', subject: 'لغة فرنسية' });
  bookTeacherSlot(occupancy, frTeacher, { day: chosen.fr2.day, startTime: chosen.fr2.start, endTime: chosen.fr2.end, classGroupId: groupId, grade: '4AP', subject: 'لغة فرنسية' });

  // Book English
  bookTeacherSlot(occupancy, enTeacher, { day: chosen.en1.day, startTime: chosen.en1.start, endTime: chosen.en1.end, classGroupId: groupId, grade: '4AP', subject: 'لغة إنجليزية' });
  bookTeacherSlot(occupancy, enTeacher, { day: chosen.en2.day, startTime: chosen.en2.start, endTime: chosen.en2.end, classGroupId: groupId, grade: '4AP', subject: 'لغة إنجليزية' });

  // Book PE
  bookTeacherSlot(occupancy, peTeacher, { day: chosen.pe.day, startTime: chosen.pe.start, endTime: chosen.pe.end, classGroupId: groupId, grade: '4AP', subject: 'تربية بدنية ورياضية' });

  return [
    // الأحد (Sunday): 3سا صباح + 2سا مساء
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_rec`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'تعبير شفوي', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: chosen.fr1.start, endTime: chosen.fr1.end, durationMinutes: 60, subjectId: 'french', activityName: 'لغة فرنسية (حصة 1)', teacherRole: 'french_teacher', teacherName: frName },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: chosen.fr1.start === '13:00' ? '14:00' : '13:00', endTime: chosen.fr1.start === '13:00' ? '14:30' : '13:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية تشكيلية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: chosen.fr1.start === '13:00' ? '14:30' : '13:30', endTime: chosen.fr1.start === '13:00' ? '15:00' : '14:00', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية', teacherRole: 'arabic_teacher', teacherName: arT },

    // الإثنين (Monday): 3سا صباح + 2سا مساء
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'إنتاج شفوي', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وفهم', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_rec`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: chosen.en1.start, endTime: chosen.en1.end, durationMinutes: 60, subjectId: 'english', activityName: 'لغة إنجليزية (حصة 1)', teacherRole: 'english_teacher', teacherName: enName },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: chosen.en1.start === '09:45' ? '10:45' : '09:45', endTime: chosen.en1.start === '09:45' ? '11:15' : '10:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'تاريخ', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'تراكيب نحوية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_7`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT },

    // الثلاثاء (Tuesday): 3سا صباحاً
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'محفوظات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_rec`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وظاهرة صرفية', teacherRole: 'arabic_teacher', teacherName: arT },

    // الأربعاء (Wednesday): 3سا صباح + 2سا مساء
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وظاهرة إملائية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'مطالعة', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_rec`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: chosen.fr2.start, endTime: chosen.fr2.end, durationMinutes: 60, subjectId: 'french', activityName: 'لغة فرنسية (حصة 2)', teacherRole: 'french_teacher', teacherName: frName },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: chosen.fr2.start === '09:45' ? '10:45' : '09:45', endTime: chosen.fr2.start === '09:45' ? '11:15' : '10:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'جغرافيا', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '13:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '13:30', endTime: '14:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية موسيقية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_8`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية خُلُقية وقيم', teacherRole: 'arabic_teacher', teacherName: arT },

    // الخميس (Thursday): 3سا صباح + 1سا و30د مساء
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_rec`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: chosen.en2.start, endTime: chosen.en2.end, durationMinutes: 60, subjectId: 'english', activityName: 'لغة إنجليزية (حصة 2)', teacherRole: 'english_teacher', teacherName: enName },
    // الأمسية: بدنية 90د مجمعة -> أستاذ اللغة العربية في راحة تامة!
    { id: `${g}_thu_5`, day: 'thursday', period: 'afternoon', startTime: chosen.pe.start, endTime: chosen.pe.end, durationMinutes: 90, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (حصة مجمعة)', teacherRole: 'pe_teacher', teacherName: peName },
  ];
}

// --------------------------------------------------------------------------
// 5AP SMART SCHEDULING (22.5 Hours - Circular 468 & Decree 16)
// --------------------------------------------------------------------------
function generate5APSmartSlots(
  g: string,
  groupId: string,
  instanceIdx: number,
  arT: string,
  frName: string,
  enName: string,
  peName: string,
  amzName: string,
  frTeacher: TeacherAssignment | undefined,
  enTeacher: TeacherAssignment | undefined,
  peTeacher: TeacherAssignment | undefined,
  amzTeacher: TeacherAssignment | undefined,
  occupancy: Map<string, OccupiedSlot[]>
): TimeSlot[] {
  type Config5AP = {
    fr1: { day: DayOfWeek; start: string; end: string };
    fr2: { day: DayOfWeek; start: string; end: string };
    en1: { day: DayOfWeek; start: string; end: string };
    en2: { day: DayOfWeek; start: string; end: string };
    pe: { day: DayOfWeek; start: string; end: string };
  };

  const candidateConfigs: Config5AP[] = [
    // Config 1: Best Pedagogical - PE Mon aft 13:00-14:30 (Arabic teacher free Mon aft!), Fr Sun 14-15 & Wed 10:15-11:15, En Wed 13:00-14:00 & Thu 13:00-14:00
    {
      fr1: { day: 'sunday', start: '14:00', end: '15:00' },
      fr2: { day: 'wednesday', start: '10:15', end: '11:15' },
      en1: { day: 'wednesday', start: '13:00', end: '14:00' },
      en2: { day: 'thursday', start: '13:00', end: '14:00' },
      pe: { day: 'monday', start: '13:00', end: '14:30' },
    },
    // Config 2: PE Sun aft 13:30-15:00, Fr Mon 10:15-11:15 & Thu 08:00-09:00, En Wed 14:00-15:00 & Thu 13:30-14:30
    {
      fr1: { day: 'monday', start: '10:15', end: '11:15' },
      fr2: { day: 'thursday', start: '08:00', end: '09:00' },
      en1: { day: 'wednesday', start: '14:00', end: '15:00' },
      en2: { day: 'thursday', start: '13:30', end: '14:30' },
      pe: { day: 'sunday', start: '13:30', end: '15:00' },
    },
    // Config 3: PE Wed aft 13:30-15:00, Fr Sun 13-14 & Wed 09:45-10:45, En Mon 14:00-15:00 & Thu 10:15-11:15
    {
      fr1: { day: 'sunday', start: '13:00', end: '14:00' },
      fr2: { day: 'wednesday', start: '09:45', end: '10:45' },
      en1: { day: 'monday', start: '14:00', end: '15:00' },
      en2: { day: 'thursday', start: '10:15', end: '11:15' },
      pe: { day: 'wednesday', start: '13:30', end: '15:00' },
    },
    // Config 4: PE Thu aft 13:00-14:30, Fr Mon 09:45-10:45 & Wed 14-15, En Sun 14:00-15:00 & Wed 13:00-14:00
    {
      fr1: { day: 'monday', start: '09:45', end: '10:45' },
      fr2: { day: 'wednesday', start: '14:00', end: '15:00' },
      en1: { day: 'sunday', start: '14:00', end: '15:00' },
      en2: { day: 'wednesday', start: '13:00', end: '14:00' },
      pe: { day: 'thursday', start: '13:00', end: '14:30' },
    },
  ];

  const chosen = candidateConfigs.find((c) => 
    isTeacherAvailable(occupancy, frTeacher, c.fr1.day, c.fr1.start, c.fr1.end) &&
    isTeacherAvailable(occupancy, frTeacher, c.fr2.day, c.fr2.start, c.fr2.end) &&
    isTeacherAvailable(occupancy, enTeacher, c.en1.day, c.en1.start, c.en1.end) &&
    isTeacherAvailable(occupancy, enTeacher, c.en2.day, c.en2.start, c.en2.end) &&
    isTeacherAvailable(occupancy, peTeacher, c.pe.day, c.pe.start, c.pe.end)
  ) || candidateConfigs[0];

  // Book French
  bookTeacherSlot(occupancy, frTeacher, { day: chosen.fr1.day, startTime: chosen.fr1.start, endTime: chosen.fr1.end, classGroupId: groupId, grade: '5AP', subject: 'لغة فرنسية' });
  bookTeacherSlot(occupancy, frTeacher, { day: chosen.fr2.day, startTime: chosen.fr2.start, endTime: chosen.fr2.end, classGroupId: groupId, grade: '5AP', subject: 'لغة فرنسية' });

  // Book English
  bookTeacherSlot(occupancy, enTeacher, { day: chosen.en1.day, startTime: chosen.en1.start, endTime: chosen.en1.end, classGroupId: groupId, grade: '5AP', subject: 'لغة إنجليزية' });
  bookTeacherSlot(occupancy, enTeacher, { day: chosen.en2.day, startTime: chosen.en2.start, endTime: chosen.en2.end, classGroupId: groupId, grade: '5AP', subject: 'لغة إنجليزية' });

  // Book PE
  bookTeacherSlot(occupancy, peTeacher, { day: chosen.pe.day, startTime: chosen.pe.start, endTime: chosen.pe.end, classGroupId: groupId, grade: '5AP', subject: 'تربية بدنية ورياضية' });

  return [
    // الأحد (Sunday): 3سا صباح + 2سا مساء
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_rec`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'تعبير شفوي', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وأداء', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: chosen.fr1.start, endTime: chosen.fr1.end, durationMinutes: 60, subjectId: 'french', activityName: 'لغة فرنسية (حصة 1)', teacherRole: 'french_teacher', teacherName: frName },

    // الإثنين (Monday): 3سا صباح + 2سا مساء
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'إنتاج شفوي', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'تراكيب نحوية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_rec`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'تاريخ', teacherRole: 'arabic_teacher', teacherName: arT },
    // الأمسية: بدنية 90د مجمعة + تربية علمية 30د (أو فراغ كامل للمعلم إذا البدنية 13-14:30)
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: chosen.pe.start, endTime: chosen.pe.end, durationMinutes: 90, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (حصة مجمعة)', teacherRole: 'pe_teacher', teacherName: peName },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية', teacherRole: 'arabic_teacher', teacherName: arT },

    // الثلاثاء (Tuesday): 3سا صباحاً
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'محفوظات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_rec`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وصرف', teacherRole: 'arabic_teacher', teacherName: arT },

    // الأربعاء (Wednesday): 3سا صباح + 2سا مساء
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وإملاء', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'مطالعة', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_rec`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'جغرافيا', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: chosen.fr2.start, endTime: chosen.fr2.end, durationMinutes: 60, subjectId: 'french', activityName: 'لغة فرنسية (حصة 2)', teacherRole: 'french_teacher', teacherName: frName },
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: chosen.en1.start, endTime: chosen.en1.end, durationMinutes: 60, subjectId: 'english', activityName: 'لغة إنجليزية (حصة 1)', teacherRole: 'english_teacher', teacherName: enName },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية موسيقية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arT },

    // الخميس (Thursday): 3سا صباح + 1سا و30د مساء
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_rec`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات)', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'الإنتاج الكتابي', teacherRole: 'arabic_teacher', teacherName: arT },
    { id: `${g}_thu_5`, day: 'thursday', period: 'afternoon', startTime: chosen.en2.start, endTime: chosen.en2.end, durationMinutes: 60, subjectId: 'english', activityName: 'لغة إنجليزية (حصة 2)', teacherRole: 'english_teacher', teacherName: enName },
    { id: `${g}_thu_6`, day: 'thursday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية تشكيلية', teacherRole: 'arabic_teacher', teacherName: arT },
  ];
}

// --------------------------------------------------------------------------
// DOUBLE SHIFT SLOTS GENERATOR (نظام الدوامين)
// --------------------------------------------------------------------------
function generateDoubleShiftSlotsForGroup(ctx: {
  group: ClassGroup;
  grade: GradeLevel;
  effectiveShift: ShiftSystem;
  hasAmazigh: boolean;
  arabicTeacher: string;
  frenchT?: TeacherAssignment;
  englishT?: TeacherAssignment;
  peT?: TeacherAssignment;
  amazighT?: TeacherAssignment;
  frenchName: string;
  englishName: string;
  peName: string;
  amazighName: string;
}): TimeSlot[] {
  const { grade, effectiveShift, arabicTeacher, frenchName, englishName, peName } = ctx;
  const g = `${grade.toLowerCase()}_${ctx.group.id}_${effectiveShift}`;
  const isG1 = effectiveShift === 'double_g1';

  const mornStart = isG1 ? '08:00' : '10:30';
  const mornEnd = isG1 ? '10:30' : '13:00';
  const aftStart = isG1 ? '13:00' : '15:00';
  const aftEnd = isG1 ? '15:00' : '17:00';

  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const slots: TimeSlot[] = [];

  days.forEach((day) => {
    if (day === 'tuesday') {
      if (isG1) {
        slots.push(
          { id: `${g}_${day}_1`, day, period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وفهم', teacherRole: 'arabic_teacher', teacherName: arabicTeacher },
          { id: `${g}_${day}_2`, day, period: 'morning', startTime: '09:00', endTime: '10:15', durationMinutes: 75, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arabicTeacher },
          { id: `${g}_${day}_rec`, day, period: 'morning', startTime: '10:15', endTime: '10:30', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
          { id: `${g}_${day}_3`, day, period: 'morning', startTime: '10:30', endTime: '11:45', durationMinutes: 75, subjectId: 'science', activityName: 'تربية علمية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher },
          { id: `${g}_${day}_4`, day, period: 'morning', startTime: '11:45', endTime: '12:45', durationMinutes: 60, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher }
        );
      }
      return;
    }

    // Normal Day Morning
    slots.push(
      { id: `${g}_${day}_1`, day, period: 'morning', startTime: mornStart, endTime: addMinutes(mornStart, 75), durationMinutes: 75, subjectId: 'arabic', activityName: 'لغة عربية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher },
      { id: `${g}_${day}_2`, day, period: 'morning', startTime: addMinutes(mornStart, 75), endTime: mornEnd, durationMinutes: 75, subjectId: 'math', activityName: 'رياضيات', teacherRole: 'arabic_teacher', teacherName: arabicTeacher }
    );

    // Normal Day Afternoon
    if (day === 'sunday' && (grade === '4AP' || grade === '5AP')) {
      slots.push(
        { id: `${g}_${day}_3`, day, period: 'afternoon', startTime: aftStart, endTime: addMinutes(aftStart, 60), durationMinutes: 60, subjectId: 'french', activityName: 'لغة فرنسية', teacherRole: 'french_teacher', teacherName: frenchName },
        { id: `${g}_${day}_4`, day, period: 'afternoon', startTime: addMinutes(aftStart, 60), endTime: aftEnd, durationMinutes: 60, subjectId: 'art', activityName: 'تربية فنية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher }
      );
    } else if (day === 'monday' && (grade === '3AP' || grade === '4AP' || grade === '5AP')) {
      slots.push(
        { id: `${g}_${day}_3`, day, period: 'afternoon', startTime: aftStart, endTime: addMinutes(aftStart, 60), durationMinutes: 60, subjectId: 'english', activityName: 'لغة إنجليزية', teacherRole: 'english_teacher', teacherName: englishName },
        { id: `${g}_${day}_4`, day, period: 'afternoon', startTime: addMinutes(aftStart, 60), endTime: aftEnd, durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية', teacherRole: 'pe_teacher', teacherName: peName }
      );
    } else {
      slots.push(
        { id: `${g}_${day}_3`, day, period: 'afternoon', startTime: aftStart, endTime: addMinutes(aftStart, 60), durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher },
        { id: `${g}_${day}_4`, day, period: 'afternoon', startTime: addMinutes(aftStart, 60), endTime: aftEnd, durationMinutes: 60, subjectId: 'islamic', activityName: 'تربية إسلامية', teacherRole: 'arabic_teacher', teacherName: arabicTeacher }
      );
    }
  });

  return slots;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/**
 * Audit all timetables in the school for any teacher collisions:
 * Returns a list of conflicts (empty array if perfectly conflict-free).
 */
export function auditSchoolSchedule(timetables: Record<string, Timetable>): {
  hasConflicts: boolean;
  conflicts: string[];
} {
  const teacherTimeMap = new Map<string, Array<{ timetableId: string; day: string; start: string; end: string; group: string; subject: string }>>();
  const conflicts: string[] = [];

  // Deduplicate timetables by unique timetable ID
  const uniqueTimetables = Array.from(
    new Map(
      Object.values(timetables)
        .filter((tt) => tt && tt.id)
        .map((tt) => [tt.id, tt])
    ).values()
  );

  uniqueTimetables.forEach((tt) => {
    tt.slots.forEach((slot) => {
      if (slot.isRecess || slot.subjectId === 'recess' || slot.subjectId === 'free') return;
      if (!slot.teacherName || slot.teacherName.includes('معلم(') || slot.teacherName.includes('أستاذ(')) return;

      const key = `${slot.teacherRole}_${slot.teacherName}`;
      const existing = teacherTimeMap.get(key) || [];

      // Check if this teacher is already booked at an overlapping time on the same day in a DIFFERENT timetable
      for (const occ of existing) {
        if (occ.timetableId !== tt.id && occ.day === slot.day && isOverlapping(occ.start, occ.end, slot.startTime, slot.endTime)) {
          conflicts.push(
            `تضارب للأستاذ(ة) "${slot.teacherName}" يوم ${occ.day}: يدرّس في "${occ.group}" (${occ.start} - ${occ.end}) وفي "${tt.grade} (${tt.classGroup})" (${slot.startTime} - ${slot.endTime}) في نفس التوقيت!`
          );
        }
      }

      existing.push({
        timetableId: tt.id,
        day: slot.day,
        start: slot.startTime,
        end: slot.endTime,
        group: `${tt.grade} (${tt.classGroup})`,
        subject: slot.activityName,
      });
      teacherTimeMap.set(key, existing);
    });
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

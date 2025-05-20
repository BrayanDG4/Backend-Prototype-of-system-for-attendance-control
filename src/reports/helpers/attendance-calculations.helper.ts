// src/reports/helpers/attendance-calculations.helper.ts
export const calculateAttendanceStats = (attendances: any[]) => {
  const studentsMap = new Map();

  attendances.forEach((attendance) => {
    const studentId = attendance.user.id;
    if (!studentsMap.has(studentId)) {
      studentsMap.set(studentId, {
        name: attendance.user.name,
        present: 0,
        absent: 0,
      });
    }

    if (attendance.status === 'Present') {
      studentsMap.get(studentId).present++;
    } else {
      studentsMap.get(studentId).absent++;
    }
  });

  return Array.from(studentsMap.values());
};

export const generateWeeklyTrend = (attendances: any[]) => {
  const weeklyData = attendances.reduce((acc, attendance) => {
    if (!attendance.attendedAt) return acc;

    const date = new Date(attendance.attendedAt);
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

    acc[weekKey] = acc[weekKey] || { present: 0, total: 0 };
    acc[weekKey].total++;
    if (attendance.status === 'Present') acc[weekKey].present++;

    return acc;
  }, {});

  const labels = Object.keys(weeklyData).map((week) =>
    week.replace('W', 'Semana '),
  );

  const values = Object.values(weeklyData).map((week: any) =>
    week.total > 0 ? Math.round((week.present / week.total) * 100) : 0,
  );

  return { labels, values };
};

export const calculateGenderDistribution = (students: any[]) => {
  const genderCounts = students.reduce((acc, student) => {
    const gender = student.gender || 'other';
    acc[gender.toLowerCase()] = (acc[gender.toLowerCase()] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(genderCounts).map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1),
    ),
    values: Object.values(genderCounts),
    colors: ['#3498db', '#e74c3c', '#2ecc71'], // Azul, Rojo, Verde
  };
};

export const generateAttendanceComparison = (attendanceData: any[]) => {
  return {
    labels: attendanceData.map((student) => student.name),
    present: attendanceData.map((student) => student.present),
    absent: attendanceData.map((student) => student.absent),
  };
};

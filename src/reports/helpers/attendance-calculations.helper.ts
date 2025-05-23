// Calcula cuántas veces asistió y faltó cada estudiante
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

// Genera la tendencia semanal de % de asistencia por semana
export const generateWeeklyTrend = (attendances: any[]) => {
  const weeklyData: Record<string, { present: number; total: number }> = {};

  attendances.forEach((attendance) => {
    if (!attendance.attendedAt) return;

    const date = new Date(attendance.attendedAt);
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { present: 0, total: 0 };
    }

    weeklyData[weekKey].total++;
    if (attendance.status === 'Present') {
      weeklyData[weekKey].present++;
    }
  });

  const labels = Object.keys(weeklyData).map((week) =>
    week.replace('W', 'Semana '),
  );

  const values = Object.values(weeklyData).map((week) =>
    week.total > 0 ? Math.round((week.present / week.total) * 100) : 0,
  );

  return { labels, values };
};

// Calcula la distribución de género de los estudiantes
export const calculateGenderDistribution = (students: any[]) => {
  const genderCounts = students.reduce(
    (acc, student) => {
      const gender = student.gender?.toLowerCase() || 'other';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    labels: Object.keys(genderCounts).map(
      (g) => g.charAt(0).toUpperCase() + g.slice(1),
    ),
    values: Object.values(genderCounts),
    colors: ['#3498db', '#e74c3c', '#2ecc71'], // Hombre, Mujer, Otro
  };
};

// Prepara los datos para la gráfica comparativa por estudiante
export const generateAttendanceComparison = (attendanceData: any[]) => {
  return {
    labels: attendanceData.map((student) => student.name),
    present: attendanceData.map((student) => student.present),
    absent: attendanceData.map((student) => student.absent),
  };
};

// Obtiene el top 10 de días con mayor cantidad de inasistencias
export const generateHighAbsenceDaysChartData = (attendances: any[]) => {
  const absenceCounts: Record<string, number> = {};

  attendances.forEach((a) => {
    if (a.status === 'Absent' && a.attendedAt) {
      const dateKey = new Date(a.attendedAt).toISOString().split('T')[0];
      absenceCounts[dateKey] = (absenceCounts[dateKey] || 0) + 1;
    }
  });

  const sorted = Object.entries(absenceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    labels: sorted.map(([date]) => date),
    values: sorted.map(([, count]) => count),
  };
};

import { todayISO } from "./format";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

export function monthsInclusive(startISO, endISO = todayISO()) {
  if (!startISO) return 1;
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const raw = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, raw + 1);
}

export function sumAmounts(items, key = "amount") {
  return items.reduce((sum, item) => sum + Number(item[key] || 0), 0);
}

export function getLastDaysCount(dateISO, dayCount) {
  if (!dateISO) return false;
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (today.getTime() - date.getTime()) / ONE_DAY_MS <= dayCount;
}

export function getMonthKey(dateISO) {
  if (!dateISO) return "";
  return dateISO.slice(0, 7);
}

function buildMaps(db) {
  return {
    subjects: new Map(db.subjects.map((item) => [item.id, item])),
    teachers: new Map(db.teachers.map((item) => [item.id, item])),
    groups: new Map(db.groups.map((item) => [item.id, item])),
  };
}

export function getStudentGroup(db, studentId) {
  const enrollment = db.studentGroups.find((item) => item.studentId === studentId && item.active);
  if (!enrollment) return null;
  return db.groups.find((group) => group.id === enrollment.groupId) || null;
}

function resolveStudentSubject(student, db, maps) {
  const direct = maps.subjects.get(student.subjectId);
  if (direct) return direct;
  const group = getStudentGroup(db, student.id);
  if (!group) return null;
  return maps.subjects.get(group.subjectId) || null;
}

export function getStudentFinance(db, student) {
  const maps = buildMaps(db);
  const subject = resolveStudentSubject(student, db, maps);
  const monthlyPrice = Number(subject?.monthlyPrice || 0);
  const expected = monthlyPrice * monthsInclusive(student.registeredAt);
  const paid = db.payments
    .filter((payment) => payment.studentId === student.id)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const debt = Math.max(expected - paid, 0);
  const lastPayment = db.payments
    .filter((payment) => payment.studentId === student.id)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))[0];

  return {
    subject,
    expected,
    paid,
    debt,
    lastPaymentAt: lastPayment?.paidAt || "",
  };
}

export function getDebtors(db) {
  return db.students
    .map((student) => {
      const group = getStudentGroup(db, student.id);
      const finance = getStudentFinance(db, student);
      return {
        studentId: student.id,
        fullName: student.fullName,
        phone: student.phone,
        groupName: group?.name || "-",
        debt: finance.debt,
        lastPaymentAt: finance.lastPaymentAt,
      };
    })
    .filter((item) => item.debt > 0)
    .sort((a, b) => b.debt - a.debt);
}

function lastNMonthKeys(count) {
  const keys = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    keys.push(`${date.getFullYear()}-${month}`);
  }
  return keys;
}

export function getMonthlyIncomeSeries(db, count = 6) {
  const keys = lastNMonthKeys(count);
  return keys.map((month) => {
    const total = db.payments
      .filter((payment) => getMonthKey(payment.paidAt) === month)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    return { month, total };
  });
}

export function getStudentGrowthSeries(db, count = 6) {
  const keys = lastNMonthKeys(count);
  return keys.map((month) => {
    const total = db.students.filter((student) => getMonthKey(student.registeredAt) <= month).length;
    return { month, total };
  });
}

export function getDashboardMetrics(db) {
  const today = todayISO();
  const month = today.slice(0, 7);
  const activeStudents = db.students.filter((student) => student.status === "aktiv").length;
  const debtorsCount = getDebtors(db).length;
  const todayIncome = db.payments
    .filter((payment) => payment.paidAt === today)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const monthlyIncome = db.payments
    .filter((payment) => getMonthKey(payment.paidAt) === month)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const monthlyExpenses = db.expenses
    .filter((expense) => getMonthKey(expense.date) === month)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return {
    totalStudents: db.students.length,
    activeStudents,
    newStudents: db.students.filter((student) => getLastDaysCount(student.registeredAt, 30)).length,
    groupsCount: db.groups.length,
    activeGroups: db.groups.filter((group) => group.status === "aktiv").length,
    todayIncome,
    monthlyIncome,
    monthlyExpenses,
    debtorsCount,
  };
}

export function getPeriodTotals(db, days) {
  const now = new Date();
  const periodMs = days * ONE_DAY_MS;
  const income = db.payments
    .filter((payment) => now.getTime() - new Date(payment.paidAt).getTime() <= periodMs)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const expenses = db.expenses
    .filter((expense) => now.getTime() - new Date(expense.date).getTime() <= periodMs)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  return { income, expenses, profit: income - expenses };
}

export function getSubjectStudentCounts(db) {
  const counts = new Map();
  db.students.forEach((student) => {
    counts.set(student.subjectId, (counts.get(student.subjectId) || 0) + 1);
  });
  return db.subjects.map((subject) => ({
    subjectName: subject.name,
    total: counts.get(subject.id) || 0,
  }));
}

export function getGroupStudentCounts(db) {
  const activeByGroup = new Map();
  db.studentGroups
    .filter((item) => item.active)
    .forEach((item) => {
      activeByGroup.set(item.groupId, (activeByGroup.get(item.groupId) || 0) + 1);
    });

  return db.groups.map((group) => ({
    groupName: group.name,
    total: activeByGroup.get(group.id) || 0,
  }));
}

export function getMonthlyPaymentSummary(db) {
  const keys = lastNMonthKeys(6);
  return keys.map((month) => ({
    month,
    total: db.payments
      .filter((payment) => getMonthKey(payment.paidAt) === month)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
  }));
}

export function getMonthlyExpenseSummary(db) {
  const keys = lastNMonthKeys(6);
  return keys.map((month) => ({
    month,
    total: db.expenses
      .filter((expense) => getMonthKey(expense.date) === month)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
  }));
}

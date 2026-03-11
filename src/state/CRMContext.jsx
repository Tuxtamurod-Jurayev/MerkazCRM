import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { GROUP_STATUSES, STUDENT_STATUSES, initialDb } from "../data/seedData";
import { makeId } from "../utils/crmMath";
import { isSupabaseEnabled, loadRemoteDbSnapshot, saveRemoteDbSnapshot } from "../services/crmSnapshotService";

const CRMContext = createContext(null);

function ensureDbShape(value) {
  return {
    subjects: value?.subjects || [],
    teachers: value?.teachers || [],
    students: value?.students || [],
    groups: value?.groups || [],
    studentGroups: value?.studentGroups || [],
    payments: value?.payments || [],
    expenses: value?.expenses || [],
  };
}

export function CRMProvider({ children }) {
  const [db, setDb] = useLocalStorageState("crm_db_v3", initialDb);
  const [isRemoteHydrated, setIsRemoteHydrated] = useState(!isSupabaseEnabled);

  const safeDb = ensureDbShape(db);

  useEffect(() => {
    let active = true;

    async function hydrateFromRemote() {
      if (!isSupabaseEnabled) return;

      const remotePayload = await loadRemoteDbSnapshot();
      if (!active) return;

      if (remotePayload) {
        setDb(ensureDbShape(remotePayload));
      } else {
        await saveRemoteDbSnapshot(safeDb);
      }

      if (active) {
        setIsRemoteHydrated(true);
      }
    }

    hydrateFromRemote();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled || !isRemoteHydrated) return;

    const timer = setTimeout(() => {
      saveRemoteDbSnapshot(safeDb);
    }, 300);

    return () => clearTimeout(timer);
  }, [safeDb, isRemoteHydrated]);

  const updateDb = (updater) => {
    setDb((prev) => ensureDbShape(updater(ensureDbShape(prev))));
  };

  const addSubject = (payload) => {
    updateDb((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { id: makeId("sub"), ...payload }],
    }));
    return { ok: true };
  };

  const updateSubject = (id, payload) => {
    updateDb((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) => (subject.id === id ? { ...subject, ...payload } : subject)),
    }));
    return { ok: true };
  };

  const deleteSubject = (id) => {
    if (safeDb.teachers.some((teacher) => teacher.subjectIds.includes(id))) {
      return { ok: false, message: "Bu fan o'qituvchiga biriktirilgan." };
    }
    if (safeDb.students.some((student) => student.subjectId === id)) {
      return { ok: false, message: "Bu fan o'quvchilarga biriktirilgan." };
    }
    if (safeDb.groups.some((group) => group.subjectId === id)) {
      return { ok: false, message: "Bu fan guruhlarda ishlatilmoqda." };
    }

    updateDb((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject.id !== id),
    }));
    return { ok: true };
  };

  const addTeacher = (payload) => {
    updateDb((prev) => ({
      ...prev,
      teachers: [...prev.teachers, { id: makeId("teacher"), ...payload }],
    }));
    return { ok: true };
  };

  const updateTeacher = (id, payload) => {
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.map((teacher) => (teacher.id === id ? { ...teacher, ...payload } : teacher)),
    }));
    return { ok: true };
  };

  const deleteTeacher = (id) => {
    if (safeDb.groups.some((group) => group.teacherId === id)) {
      return { ok: false, message: "Bu o'qituvchi guruhlarga biriktirilgan." };
    }
    updateDb((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((teacher) => teacher.id !== id),
    }));
    return { ok: true };
  };

  const addStudent = (payload) => {
    const status = STUDENT_STATUSES.includes(payload.status) ? payload.status : "yangi";
    updateDb((prev) => ({
      ...prev,
      students: [...prev.students, { id: makeId("student"), ...payload, status }],
    }));
    return { ok: true };
  };

  const updateStudent = (id, payload) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.map((student) => (student.id === id ? { ...student, ...payload } : student)),
    }));
    return { ok: true };
  };

  const deleteStudent = (id) => {
    updateDb((prev) => ({
      ...prev,
      students: prev.students.filter((student) => student.id !== id),
      studentGroups: prev.studentGroups.filter((item) => item.studentId !== id),
      payments: prev.payments.filter((payment) => payment.studentId !== id),
    }));
    return { ok: true };
  };

  const addGroup = (payload) => {
    const status = GROUP_STATUSES.includes(payload.status) ? payload.status : "rejalashtirilgan";
    updateDb((prev) => ({
      ...prev,
      groups: [...prev.groups, { id: makeId("group"), ...payload, status }],
    }));
    return { ok: true };
  };

  const updateGroup = (id, payload) => {
    updateDb((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => (group.id === id ? { ...group, ...payload } : group)),
    }));
    return { ok: true };
  };

  const deleteGroup = (id) => {
    if (safeDb.studentGroups.some((item) => item.groupId === id && item.active)) {
      return { ok: false, message: "Guruhda aktiv o'quvchilar bor." };
    }
    updateDb((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== id),
      studentGroups: prev.studentGroups.filter((item) => item.groupId !== id),
      payments: prev.payments.filter((payment) => payment.groupId !== id),
    }));
    return { ok: true };
  };

  const addEnrollment = ({ studentId, groupId, joinedAt }) => {
    const isAlreadyActive = safeDb.studentGroups.some(
      (item) => item.studentId === studentId && item.groupId === groupId && item.active,
    );
    if (isAlreadyActive) {
      return { ok: false, message: "O'quvchi bu guruhga allaqachon biriktirilgan." };
    }

    const group = safeDb.groups.find((item) => item.id === groupId);
    if (!group) return { ok: false, message: "Guruh topilmadi." };

    const currentCount = safeDb.studentGroups.filter((item) => item.groupId === groupId && item.active).length;
    if (currentCount >= Number(group.capacity || 0)) {
      return { ok: false, message: "Guruh sig'imi to'lgan." };
    }

    updateDb((prev) => ({
      ...prev,
      studentGroups: [...prev.studentGroups, { id: makeId("enroll"), studentId, groupId, joinedAt, active: true }],
    }));
    return { ok: true };
  };

  const removeEnrollment = (id) => {
    updateDb((prev) => ({
      ...prev,
      studentGroups: prev.studentGroups.map((item) => (item.id === id ? { ...item, active: false } : item)),
    }));
    return { ok: true };
  };

  const addPayment = (payload) => {
    updateDb((prev) => ({
      ...prev,
      payments: [...prev.payments, { id: makeId("payment"), ...payload }],
    }));
    return { ok: true };
  };

  const deletePayment = (id) => {
    updateDb((prev) => ({
      ...prev,
      payments: prev.payments.filter((payment) => payment.id !== id),
    }));
    return { ok: true };
  };

  const addExpense = (payload) => {
    updateDb((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id: makeId("expense"), ...payload }],
    }));
    return { ok: true };
  };

  const deleteExpense = (id) => {
    updateDb((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((expense) => expense.id !== id),
    }));
    return { ok: true };
  };

  const resetDb = () => {
    setDb(initialDb);
  };

  const value = useMemo(
    () => ({
      db: safeDb,
      addSubject,
      updateSubject,
      deleteSubject,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addStudent,
      updateStudent,
      deleteStudent,
      addGroup,
      updateGroup,
      deleteGroup,
      addEnrollment,
      removeEnrollment,
      addPayment,
      deletePayment,
      addExpense,
      deleteExpense,
      resetDb,
    }),
    [safeDb],
  );

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within CRMProvider");
  }
  return context;
}

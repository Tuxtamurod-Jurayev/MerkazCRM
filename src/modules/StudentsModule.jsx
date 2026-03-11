import { useMemo, useState } from "react";
import { STUDENT_STATUSES } from "../data/seedData";
import { useCRM } from "../state/CRMContext";
import { formatDate, todayISO } from "../utils/format";
import { getStudentGroup } from "../utils/crmMath";

const emptyForm = {
  fullName: "",
  birthDate: "",
  phone: "",
  parentPhone: "",
  subjectId: "",
  registeredAt: todayISO(),
  status: "yangi",
};

export function StudentsModule({ readOnly = false }) {
  const { db, addStudent, updateStudent, deleteStudent } = useCRM();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const subjectMap = useMemo(() => new Map(db.subjects.map((subject) => [subject.id, subject.name])), [db.subjects]);
  const filteredStudents = useMemo(() => {
    if (!query.trim()) return db.students;
    const lower = query.toLowerCase();
    return db.students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(lower) ||
        student.phone.includes(query) ||
        (subjectMap.get(student.subjectId) || "").toLowerCase().includes(lower),
    );
  }, [db.students, query, subjectMap]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (readOnly) return;
    const payload = {
      fullName: form.fullName.trim(),
      birthDate: form.birthDate,
      phone: form.phone.trim(),
      parentPhone: form.parentPhone.trim(),
      subjectId: currentFormSubject,
      registeredAt: form.registeredAt,
      status: form.status,
    };

    if (!payload.fullName || !payload.subjectId) {
      setMessage("F.I.O va fan tanlash majburiy.");
      return;
    }

    if (editingId) {
      updateStudent(editingId, payload);
      setMessage("O'quvchi yangilandi.");
    } else {
      addStudent(payload);
      setMessage("O'quvchi qo'shildi.");
    }
    setForm({ ...emptyForm, subjectId: db.subjects[0]?.id || "" });
    setEditingId("");
  };

  const onEdit = (student) => {
    setEditingId(student.id);
    setForm({
      fullName: student.fullName,
      birthDate: student.birthDate,
      phone: student.phone,
      parentPhone: student.parentPhone,
      subjectId: student.subjectId,
      registeredAt: student.registeredAt,
      status: student.status,
    });
  };

  const onDelete = (studentId) => {
    deleteStudent(studentId);
    setMessage("O'quvchi o'chirildi.");
  };

  const initialSubjectId = db.subjects[0]?.id || "";
  const currentFormSubject = form.subjectId || initialSubjectId;

  return (
    <section className="module-stack">
      <div>
        <h1>O'quvchilar boshqaruvi</h1>
        <p className="muted">Ro'yxatga olish, yangilash va ro'yxatdan chiqarish.</p>
      </div>

      {!readOnly ? (
        <article className="card">
          <form className="form-grid form-cols-2" onSubmit={onSubmit}>
            <label>
              F.I.O
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </label>
            <label>
              Tug'ilgan sana
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
              />
            </label>
            <label>
              Telefon
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
              />
            </label>
            <label>
              Ota-ona telefoni
              <input
                value={form.parentPhone}
                onChange={(event) => setForm((prev) => ({ ...prev, parentPhone: event.target.value }))}
              />
            </label>
            <label>
              Tanlangan fan
              <select
                value={currentFormSubject}
                onChange={(event) => setForm((prev) => ({ ...prev, subjectId: event.target.value }))}
              >
                {db.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ro'yxatdan o'tgan sana
              <input
                type="date"
                value={form.registeredAt}
                onChange={(event) => setForm((prev) => ({ ...prev, registeredAt: event.target.value }))}
              />
            </label>
            <label>
              Holat
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                {STUDENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <div className="full row-actions">
              <button type="submit">{editingId ? "Saqlash" : "O'quvchi qo'shish"}</button>
              {editingId ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setEditingId("");
                    setForm({ ...emptyForm, subjectId: initialSubjectId });
                  }}
                >
                  Bekor qilish
                </button>
              ) : null}
            </div>
          </form>
          {message ? <p className="notice">{message}</p> : null}
        </article>
      ) : null}

      <article className="card table-card">
        <div className="table-actions">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ism, telefon yoki fan bo'yicha qidirish"
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>F.I.O</th>
                <th>Telefon</th>
                <th>Fan</th>
                <th>Guruh</th>
                <th>Status</th>
                <th>Ro'yxat sanasi</th>
                {!readOnly ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const group = getStudentGroup(db, student.id);
                return (
                  <tr key={student.id}>
                    <td>{student.fullName}</td>
                    <td>{student.phone}</td>
                    <td>{subjectMap.get(student.subjectId) || "-"}</td>
                    <td>{group?.name || "-"}</td>
                    <td>{student.status}</td>
                    <td>{formatDate(student.registeredAt)}</td>
                    {!readOnly ? (
                      <td className="td-actions">
                        <button type="button" className="mini-btn" onClick={() => onEdit(student)}>
                          Tahrirlash
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => onDelete(student.id)}>
                          O'chirish
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

import { useMemo, useState } from "react";
import { useCRM } from "../state/CRMContext";
import { formatDate, formatMoney, todayISO } from "../utils/format";

const emptyForm = {
  fullName: "",
  phone: "",
  specialization: "",
  subjectIds: [],
  startedAt: todayISO(),
  salary: "",
};

export function TeachersModule() {
  const { db, addTeacher, updateTeacher, deleteTeacher } = useCRM();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const subjectMap = useMemo(() => new Map(db.subjects.map((item) => [item.id, item.name])), [db.subjects]);

  const toggleSubject = (subjectId) => {
    setForm((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((item) => item !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      specialization: form.specialization.trim(),
      subjectIds: form.subjectIds,
      startedAt: form.startedAt,
      salary: Number(form.salary) || 0,
    };

    if (!payload.fullName || payload.subjectIds.length === 0) {
      setMessage("F.I.O va kamida bitta fan majburiy.");
      return;
    }

    if (editingId) {
      updateTeacher(editingId, payload);
      setMessage("O'qituvchi yangilandi.");
    } else {
      addTeacher(payload);
      setMessage("O'qituvchi qo'shildi.");
    }
    setForm(emptyForm);
    setEditingId("");
  };

  const onEdit = (teacher) => {
    setEditingId(teacher.id);
    setForm({
      fullName: teacher.fullName,
      phone: teacher.phone,
      specialization: teacher.specialization,
      subjectIds: teacher.subjectIds,
      startedAt: teacher.startedAt,
      salary: teacher.salary,
    });
  };

  const onDelete = (teacherId) => {
    const result = deleteTeacher(teacherId);
    setMessage(result.ok ? "O'qituvchi o'chirildi." : result.message);
  };

  return (
    <section className="module-stack">
      <div>
        <h1>O'qituvchilar boshqaruvi</h1>
        <p className="muted">O'qituvchi qo'shish, tahrirlash, o'chirish.</p>
      </div>

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
            Telefon
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            Mutaxassisligi
            <input
              value={form.specialization}
              onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))}
            />
          </label>
          <label>
            Ish boshlagan sana
            <input
              type="date"
              value={form.startedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, startedAt: event.target.value }))}
            />
          </label>
          <label>
            Oylik maosh (so'm)
            <input
              type="number"
              min={0}
              value={form.salary}
              onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
              required
            />
          </label>
          <fieldset className="subject-checks full">
            <legend>Qaysi fanlarni o'qitadi</legend>
            <div className="check-grid">
              {db.subjects.map((subject) => (
                <label key={subject.id} className="check-row">
                  <input
                    type="checkbox"
                    checked={form.subjectIds.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                  />
                  <span>{subject.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="full row-actions">
            <button type="submit">{editingId ? "Saqlash" : "O'qituvchi qo'shish"}</button>
            {editingId ? (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                }}
              >
                Bekor qilish
              </button>
            ) : null}
          </div>
        </form>
        {message ? <p className="notice">{message}</p> : null}
      </article>

      <article className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>F.I.O</th>
                <th>Telefon</th>
                <th>Mutaxassislik</th>
                <th>Fanlar</th>
                <th>Ish boshlagan</th>
                <th>Maosh</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {db.teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.specialization || "-"}</td>
                  <td>{teacher.subjectIds.map((id) => subjectMap.get(id) || id).join(", ")}</td>
                  <td>{formatDate(teacher.startedAt)}</td>
                  <td>{formatMoney(teacher.salary)}</td>
                  <td className="td-actions">
                    <button type="button" className="mini-btn" onClick={() => onEdit(teacher)}>
                      Tahrirlash
                    </button>
                    <button type="button" className="mini-btn danger" onClick={() => onDelete(teacher.id)}>
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

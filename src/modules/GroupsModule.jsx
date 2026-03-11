import { useMemo, useState } from "react";
import { GROUP_STATUSES } from "../data/seedData";
import { useCRM } from "../state/CRMContext";
import { formatDate, todayISO } from "../utils/format";

const emptyForm = {
  name: "",
  subjectId: "",
  teacherId: "",
  startDate: todayISO(),
  days: "Du-Chor-Ju",
  time: "09:00",
  capacity: 12,
  status: "rejalashtirilgan",
};

export function GroupsModule({ readOnly = false }) {
  const { db, addGroup, updateGroup, deleteGroup } = useCRM();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const subjectMap = useMemo(() => new Map(db.subjects.map((item) => [item.id, item.name])), [db.subjects]);
  const teacherMap = useMemo(() => new Map(db.teachers.map((item) => [item.id, item.fullName])), [db.teachers]);
  const activeCountMap = useMemo(() => {
    const map = new Map();
    db.studentGroups
      .filter((item) => item.active)
      .forEach((item) => {
        map.set(item.groupId, (map.get(item.groupId) || 0) + 1);
      });
    return map;
  }, [db.studentGroups]);

  const initialSubjectId = db.subjects[0]?.id || "";
  const initialTeacherId = db.teachers[0]?.id || "";
  const currentSubject = form.subjectId || initialSubjectId;
  const currentTeacher = form.teacherId || initialTeacherId;

  const onSubmit = (event) => {
    event.preventDefault();
    if (readOnly) return;
    const payload = {
      name: form.name.trim(),
      subjectId: currentSubject,
      teacherId: currentTeacher,
      startDate: form.startDate,
      days: form.days.trim(),
      time: form.time,
      capacity: Number(form.capacity) || 0,
      status: form.status,
    };
    if (!payload.name || !payload.subjectId || !payload.teacherId) {
      setMessage("Guruh nomi, fan va o'qituvchi majburiy.");
      return;
    }

    if (editingId) {
      updateGroup(editingId, payload);
      setMessage("Guruh yangilandi.");
    } else {
      addGroup(payload);
      setMessage("Guruh qo'shildi.");
    }
    setEditingId("");
    setForm({
      ...emptyForm,
      subjectId: initialSubjectId,
      teacherId: initialTeacherId,
      startDate: todayISO(),
    });
  };

  const onEdit = (group) => {
    setEditingId(group.id);
    setForm({
      name: group.name,
      subjectId: group.subjectId,
      teacherId: group.teacherId,
      startDate: group.startDate,
      days: group.days,
      time: group.time,
      capacity: group.capacity,
      status: group.status,
    });
  };

  const onDelete = (groupId) => {
    const result = deleteGroup(groupId);
    setMessage(result.ok ? "Guruh o'chirildi." : result.message);
  };

  return (
    <section className="module-stack">
      <div>
        <h1>Guruhlar boshqaruvi</h1>
        <p className="muted">Guruh qo'shish, tahrirlash, o'chirish va sig'im nazorati.</p>
      </div>

      {!readOnly ? (
        <article className="card">
          <form className="form-grid form-cols-2" onSubmit={onSubmit}>
            <label>
              Guruh nomi
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Fan
              <select
                value={currentSubject}
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
              O'qituvchi
              <select
                value={currentTeacher}
                onChange={(event) => setForm((prev) => ({ ...prev, teacherId: event.target.value }))}
              >
                {db.teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Boshlanish sanasi
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </label>
            <label>
              Dars kunlari
              <input
                value={form.days}
                onChange={(event) => setForm((prev) => ({ ...prev, days: event.target.value }))}
                placeholder="Du-Chor-Ju"
              />
            </label>
            <label>
              Dars vaqti
              <input
                type="time"
                value={form.time}
                onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
              />
            </label>
            <label>
              Guruh sig'imi
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                {GROUP_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <div className="full row-actions">
              <button type="submit">{editingId ? "Saqlash" : "Guruh qo'shish"}</button>
              {editingId ? (
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setEditingId("");
                    setForm({
                      ...emptyForm,
                      subjectId: initialSubjectId,
                      teacherId: initialTeacherId,
                    });
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
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Guruh</th>
                <th>Fan</th>
                <th>O'qituvchi</th>
                <th>Boshlanish</th>
                <th>Dars jadvali</th>
                <th>Sig'im</th>
                <th>Status</th>
                {!readOnly ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {db.groups.map((group) => {
                const activeCount = activeCountMap.get(group.id) || 0;
                return (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{subjectMap.get(group.subjectId) || "-"}</td>
                    <td>{teacherMap.get(group.teacherId) || "-"}</td>
                    <td>{formatDate(group.startDate)}</td>
                    <td>
                      {group.days} / {group.time}
                    </td>
                    <td>
                      {activeCount}/{group.capacity}
                    </td>
                    <td>{group.status}</td>
                    {!readOnly ? (
                      <td className="td-actions">
                        <button type="button" className="mini-btn" onClick={() => onEdit(group)}>
                          Tahrirlash
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => onDelete(group.id)}>
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

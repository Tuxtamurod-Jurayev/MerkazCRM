import { useMemo, useState } from "react";
import { useCRM } from "../state/CRMContext";
import { formatDate, todayISO } from "../utils/format";

export function EnrollmentModule() {
  const { db, addEnrollment, removeEnrollment } = useCRM();
  const [form, setForm] = useState({
    studentId: "",
    groupId: "",
    joinedAt: todayISO(),
  });
  const [message, setMessage] = useState("");

  const studentMap = useMemo(() => new Map(db.students.map((student) => [student.id, student])), [db.students]);
  const groupMap = useMemo(() => new Map(db.groups.map((group) => [group.id, group])), [db.groups]);
  const activeCountMap = useMemo(() => {
    const map = new Map();
    db.studentGroups
      .filter((item) => item.active)
      .forEach((item) => {
        map.set(item.groupId, (map.get(item.groupId) || 0) + 1);
      });
    return map;
  }, [db.studentGroups]);

  const initialStudent = db.students[0]?.id || "";
  const initialGroup = db.groups[0]?.id || "";
  const selectedStudent = form.studentId || initialStudent;
  const selectedGroup = form.groupId || initialGroup;

  const activeEnrollments = useMemo(
    () =>
      db.studentGroups
        .filter((item) => item.active)
        .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)),
    [db.studentGroups],
  );

  const onSubmit = (event) => {
    event.preventDefault();
    if (!selectedStudent || !selectedGroup) {
      setMessage("O'quvchi va guruh tanlang.");
      return;
    }
    const result = addEnrollment({
      studentId: selectedStudent,
      groupId: selectedGroup,
      joinedAt: form.joinedAt,
    });
    setMessage(result.ok ? "O'quvchi guruhga qo'shildi." : result.message);
  };

  return (
    <section className="module-stack">
      <div>
        <h1>O'quvchini guruhga qo'shish</h1>
        <p className="muted">Mavjud o'quvchilarni guruhlarga biriktirish.</p>
      </div>

      <article className="card">
        <form className="form-grid form-cols-3" onSubmit={onSubmit}>
          <label>
            O'quvchi
            <select
              value={selectedStudent}
              onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
            >
              {db.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Guruh
            <select
              value={selectedGroup}
              onChange={(event) => setForm((prev) => ({ ...prev, groupId: event.target.value }))}
            >
              {db.groups.map((group) => {
                const count = activeCountMap.get(group.id) || 0;
                return (
                  <option key={group.id} value={group.id}>
                    {group.name} ({count}/{group.capacity})
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            Qo'shilgan sana
            <input
              type="date"
              value={form.joinedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, joinedAt: event.target.value }))}
            />
          </label>
          <div className="full row-actions">
            <button type="submit">Biriktirish</button>
          </div>
        </form>
        {message ? <p className="notice">{message}</p> : null}
      </article>

      <article className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>O'quvchi</th>
                <th>Guruh</th>
                <th>Qo'shilgan sana</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {activeEnrollments.map((row) => (
                <tr key={row.id}>
                  <td>{studentMap.get(row.studentId)?.fullName || "-"}</td>
                  <td>{groupMap.get(row.groupId)?.name || "-"}</td>
                  <td>{formatDate(row.joinedAt)}</td>
                  <td className="td-actions">
                    <button type="button" className="mini-btn danger" onClick={() => removeEnrollment(row.id)}>
                      Ajratish
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

import { useMemo, useState } from "react";
import { PAYMENT_TYPES } from "../data/seedData";
import { useCRM } from "../state/CRMContext";
import { formatDate, formatMoney, todayISO } from "../utils/format";

const initialForm = {
  studentId: "",
  groupId: "",
  amount: "",
  paymentType: "naqd",
  paidAt: todayISO(),
  note: "",
};

export function PaymentsModule({ readOnly = false }) {
  const { db, addPayment, deletePayment } = useCRM();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [monthFilter, setMonthFilter] = useState(todayISO().slice(0, 7));

  const studentMap = useMemo(() => new Map(db.students.map((student) => [student.id, student])), [db.students]);
  const groupMap = useMemo(() => new Map(db.groups.map((group) => [group.id, group])), [db.groups]);

  const firstStudentId = db.students[0]?.id || "";
  const selectedStudent = form.studentId || firstStudentId;

  const studentGroups = useMemo(() => {
    if (!selectedStudent) return [];
    return db.studentGroups
      .filter((item) => item.studentId === selectedStudent && item.active)
      .map((item) => groupMap.get(item.groupId))
      .filter(Boolean);
  }, [db.studentGroups, groupMap, selectedStudent]);

  const defaultGroupId = studentGroups[0]?.id || db.groups[0]?.id || "";
  const selectedGroup = form.groupId || defaultGroupId;

  const visiblePayments = useMemo(() => {
    return db.payments
      .filter((payment) => (monthFilter ? payment.paidAt.startsWith(monthFilter) : true))
      .sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  }, [db.payments, monthFilter]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (readOnly) return;
    const payload = {
      studentId: selectedStudent,
      groupId: selectedGroup,
      amount: Number(form.amount) || 0,
      paymentType: form.paymentType,
      paidAt: form.paidAt,
      note: form.note.trim(),
    };
    if (!payload.studentId || !payload.groupId || payload.amount <= 0) {
      setMessage("O'quvchi, guruh va to'lov miqdorini to'g'ri kiriting.");
      return;
    }
    addPayment(payload);
    setMessage("To'lov qabul qilindi.");
    setForm({
      ...initialForm,
      studentId: selectedStudent,
      groupId: selectedGroup,
    });
  };

  const totalVisible = visiblePayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <section className="module-stack">
      <div>
        <h1>To'lov tizimi</h1>
        <p className="muted">To'lov qabul qilish va tarixni ko'rish.</p>
      </div>

      {!readOnly ? (
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
                {[...new Map(studentGroups.map((group) => [group.id, group])).values()].map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
                {studentGroups.length === 0 &&
                  db.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              To'lov miqdori (so'm)
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
            </label>
            <label>
              To'lov turi
              <select
                value={form.paymentType}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentType: event.target.value }))}
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              To'lov sanasi
              <input
                type="date"
                value={form.paidAt}
                onChange={(event) => setForm((prev) => ({ ...prev, paidAt: event.target.value }))}
              />
            </label>
            <label>
              Izoh
              <input
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </label>
            <div className="full row-actions">
              <button type="submit">To'lovni saqlash</button>
            </div>
          </form>
          {message ? <p className="notice">{message}</p> : null}
        </article>
      ) : null}

      <article className="card table-card">
        <div className="table-actions">
          <label className="inline-field">
            Oy bo'yicha filter
            <input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
          </label>
          <p className="summary-value">
            Jami: <strong>{formatMoney(totalVisible)} so'm</strong>
          </p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>O'quvchi</th>
                <th>Guruh</th>
                <th>Miqdor</th>
                <th>Turi</th>
                <th>Sana</th>
                <th>Izoh</th>
                {!readOnly ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{studentMap.get(payment.studentId)?.fullName || "-"}</td>
                  <td>{groupMap.get(payment.groupId)?.name || "-"}</td>
                  <td>{formatMoney(payment.amount)}</td>
                  <td>{payment.paymentType}</td>
                  <td>{formatDate(payment.paidAt)}</td>
                  <td>{payment.note || "-"}</td>
                  {!readOnly ? (
                    <td className="td-actions">
                      <button type="button" className="mini-btn danger" onClick={() => deletePayment(payment.id)}>
                        O'chirish
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

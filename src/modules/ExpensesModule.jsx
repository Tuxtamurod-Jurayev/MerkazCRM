import { useMemo, useState } from "react";
import { EXPENSE_CATEGORIES } from "../data/seedData";
import { useCRM } from "../state/CRMContext";
import { formatDate, formatMoney, todayISO } from "../utils/format";

const initialForm = {
  name: "",
  amount: "",
  date: todayISO(),
  category: "boshqa",
  note: "",
};

export function ExpensesModule() {
  const { db, addExpense, deleteExpense } = useCRM();
  const [form, setForm] = useState(initialForm);
  const [monthFilter, setMonthFilter] = useState(todayISO().slice(0, 7));
  const [message, setMessage] = useState("");

  const visibleExpenses = useMemo(() => {
    return db.expenses
      .filter((expense) => (monthFilter ? expense.date.startsWith(monthFilter) : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [db.expenses, monthFilter]);

  const onSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      amount: Number(form.amount) || 0,
      date: form.date,
      category: form.category,
      note: form.note.trim(),
    };
    if (!payload.name || payload.amount <= 0) {
      setMessage("Xarajat nomi va summasi majburiy.");
      return;
    }
    addExpense(payload);
    setMessage("Xarajat kiritildi.");
    setForm(initialForm);
  };

  const totalVisible = visibleExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return (
    <section className="module-stack">
      <div>
        <h1>Xarajatlar moduli</h1>
        <p className="muted">Markaz xarajatlarini kiritish va nazorat qilish.</p>
      </div>

      <article className="card">
        <form className="form-grid form-cols-3" onSubmit={onSubmit}>
          <label>
            Xarajat nomi
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Summa (so'm)
            <input
              type="number"
              min={0}
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              required
            />
          </label>
          <label>
            Sana
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            />
          </label>
          <label>
            Kategoriya
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            Izoh
            <input
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </label>
          <div className="full row-actions">
            <button type="submit">Xarajat qo'shish</button>
          </div>
        </form>
        {message ? <p className="notice">{message}</p> : null}
      </article>

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
                <th>Nomi</th>
                <th>Kategoriya</th>
                <th>Summa</th>
                <th>Sana</th>
                <th>Izoh</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.name}</td>
                  <td>{expense.category}</td>
                  <td>{formatMoney(expense.amount)}</td>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.note || "-"}</td>
                  <td className="td-actions">
                    <button type="button" className="mini-btn danger" onClick={() => deleteExpense(expense.id)}>
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

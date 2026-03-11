import { useMemo, useState } from "react";
import { useCRM } from "../state/CRMContext";
import { formatMoney } from "../utils/format";

const emptyForm = {
  name: "",
  description: "",
  monthlyPrice: "",
  durationMonths: "",
};

export function SubjectsModule() {
  const { db, addSubject, updateSubject, deleteSubject } = useCRM();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const sortedSubjects = useMemo(
    () => [...db.subjects].sort((a, b) => a.name.localeCompare(b.name)),
    [db.subjects],
  );

  const onSubmit = (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      monthlyPrice: Number(form.monthlyPrice) || 0,
      durationMonths: Number(form.durationMonths) || 0,
    };

    if (!payload.name) return;

    if (editingId) {
      updateSubject(editingId, payload);
      setMessage("Fan yangilandi.");
    } else {
      addSubject(payload);
      setMessage("Fan qo'shildi.");
    }

    setForm(emptyForm);
    setEditingId("");
  };

  const onEdit = (subject) => {
    setEditingId(subject.id);
    setForm({
      name: subject.name,
      description: subject.description,
      monthlyPrice: subject.monthlyPrice,
      durationMonths: subject.durationMonths,
    });
  };

  const onDelete = (subjectId) => {
    const result = deleteSubject(subjectId);
    setMessage(result.ok ? "Fan o'chirildi." : result.message);
  };

  return (
    <section className="module-stack">
      <div>
        <h1>Fanlar boshqaruvi</h1>
        <p className="muted">Fan qo'shish, tahrirlash va o'chirish.</p>
      </div>

      <article className="card">
        <form className="form-grid form-cols-2" onSubmit={onSubmit}>
          <label>
            Fan nomi
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Oylik narxi (so'm)
            <input
              type="number"
              min={0}
              value={form.monthlyPrice}
              onChange={(event) => setForm((prev) => ({ ...prev, monthlyPrice: event.target.value }))}
              required
            />
          </label>
          <label className="full">
            Fan tavsifi
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={2}
            />
          </label>
          <label>
            Davomiyligi (oy)
            <input
              type="number"
              min={1}
              value={form.durationMonths}
              onChange={(event) => setForm((prev) => ({ ...prev, durationMonths: event.target.value }))}
              required
            />
          </label>
          <div className="full row-actions">
            <button type="submit">{editingId ? "Saqlash" : "Fan qo'shish"}</button>
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
                <th>Fan</th>
                <th>Tavsif</th>
                <th>Oylik narx</th>
                <th>Davomiylik</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>{subject.description || "-"}</td>
                  <td>{formatMoney(subject.monthlyPrice)}</td>
                  <td>{subject.durationMonths} oy</td>
                  <td className="td-actions">
                    <button type="button" className="mini-btn" onClick={() => onEdit(subject)}>
                      Tahrirlash
                    </button>
                    <button type="button" className="mini-btn danger" onClick={() => onDelete(subject.id)}>
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

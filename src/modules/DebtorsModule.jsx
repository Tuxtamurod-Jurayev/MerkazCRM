import { useMemo } from "react";
import { useCRM } from "../state/CRMContext";
import { getDebtors } from "../utils/crmMath";
import { formatDate, formatMoney } from "../utils/format";

export function DebtorsModule() {
  const { db } = useCRM();
  const debtors = useMemo(() => getDebtors(db), [db]);

  return (
    <section className="module-stack">
      <div>
        <h1>Qarzdorlar moduli</h1>
        <p className="muted">To'lov qilmagan yoki qisman to'lov qilgan o'quvchilar ro'yxati.</p>
      </div>

      <article className="card table-card">
        <div className="summary-row">
          <span>Qarzdorlar soni: {debtors.length}</span>
          <span>
            Jami qarz: <strong>{formatMoney(debtors.reduce((sum, row) => sum + row.debt, 0))} so'm</strong>
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>F.I.O</th>
                <th>Guruh</th>
                <th>Telefon</th>
                <th>Qarz summasi</th>
                <th>Oxirgi to'lov</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((row) => (
                <tr key={row.studentId}>
                  <td>{row.fullName}</td>
                  <td>{row.groupName}</td>
                  <td>{row.phone}</td>
                  <td>{formatMoney(row.debt)}</td>
                  <td>{formatDate(row.lastPaymentAt)}</td>
                </tr>
              ))}
              {debtors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="center muted">
                    Qarzdorlar mavjud emas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

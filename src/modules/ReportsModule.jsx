import { useMemo } from "react";
import { useCRM } from "../state/CRMContext";
import {
  getDebtors,
  getGroupStudentCounts,
  getMonthlyExpenseSummary,
  getMonthlyPaymentSummary,
  getPeriodTotals,
  getSubjectStudentCounts,
} from "../utils/crmMath";
import { formatMoney } from "../utils/format";

function ReportCard({ title, value, subtitle }) {
  return (
    <article className="metric-card">
      <p>{title}</p>
      <h3>{value}</h3>
      {subtitle ? <small className="muted">{subtitle}</small> : null}
    </article>
  );
}

export function ReportsModule() {
  const { db } = useCRM();

  const bySubject = useMemo(() => getSubjectStudentCounts(db), [db]);
  const byGroup = useMemo(() => getGroupStudentCounts(db), [db]);
  const debtors = useMemo(() => getDebtors(db), [db]);
  const monthPayments = useMemo(() => getMonthlyPaymentSummary(db), [db]);
  const monthExpenses = useMemo(() => getMonthlyExpenseSummary(db), [db]);
  const dayTotals = useMemo(() => getPeriodTotals(db, 1), [db]);
  const weekTotals = useMemo(() => getPeriodTotals(db, 7), [db]);
  const monthTotals = useMemo(() => getPeriodTotals(db, 30), [db]);
  const yearTotals = useMemo(() => getPeriodTotals(db, 365), [db]);
  const allIncome = db.payments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const allExpense = db.expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <section className="module-stack">
      <div>
        <h1>Hisobotlar moduli</h1>
        <p className="muted">O'quvchilar, to'lovlar va moliyaviy hisobotlar.</p>
      </div>

      <article className="card">
        <h3>Moliyaviy KPI</h3>
        <div className="metric-grid">
          <ReportCard title="Jami daromad" value={`${formatMoney(allIncome)} so'm`} />
          <ReportCard title="Jami xarajat" value={`${formatMoney(allExpense)} so'm`} />
          <ReportCard title="Sof foyda" value={`${formatMoney(allIncome - allExpense)} so'm`} />
          <ReportCard title="Qarzdorlar soni" value={debtors.length} />
        </div>
      </article>

      <article className="card">
        <h3>Daromad / Xarajat / Foyda</h3>
        <div className="metric-grid">
          <ReportCard
            title="Kunlik"
            value={`${formatMoney(dayTotals.profit)} so'm`}
            subtitle={`Daromad: ${formatMoney(dayTotals.income)} / Xarajat: ${formatMoney(dayTotals.expenses)}`}
          />
          <ReportCard
            title="Haftalik"
            value={`${formatMoney(weekTotals.profit)} so'm`}
            subtitle={`Daromad: ${formatMoney(weekTotals.income)} / Xarajat: ${formatMoney(weekTotals.expenses)}`}
          />
          <ReportCard
            title="Oylik"
            value={`${formatMoney(monthTotals.profit)} so'm`}
            subtitle={`Daromad: ${formatMoney(monthTotals.income)} / Xarajat: ${formatMoney(monthTotals.expenses)}`}
          />
          <ReportCard
            title="Yillik"
            value={`${formatMoney(yearTotals.profit)} so'm`}
            subtitle={`Daromad: ${formatMoney(yearTotals.income)} / Xarajat: ${formatMoney(yearTotals.expenses)}`}
          />
        </div>
      </article>

      <div className="chart-grid">
        <article className="card table-card">
          <h3>O'quvchilar hisobotlari</h3>
          <p className="muted">Fan bo'yicha o'quvchilar soni</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fan</th>
                  <th>O'quvchilar</th>
                </tr>
              </thead>
              <tbody>
                {bySubject.map((row) => (
                  <tr key={row.subjectName}>
                    <td>{row.subjectName}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">Guruh bo'yicha o'quvchilar soni</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Guruh</th>
                  <th>O'quvchilar</th>
                </tr>
              </thead>
              <tbody>
                {byGroup.map((row) => (
                  <tr key={row.groupName}>
                    <td>{row.groupName}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card table-card">
          <h3>To'lov hisobotlari</h3>
          <p className="muted">So'nggi 6 oy bo'yicha daromadlar</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Oy</th>
                  <th>To'lovlar</th>
                </tr>
              </thead>
              <tbody>
                {monthPayments.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">So'nggi 6 oy bo'yicha xarajatlar</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Oy</th>
                  <th>Xarajatlar</th>
                </tr>
              </thead>
              <tbody>
                {monthExpenses.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    <td>{formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

import { useMemo } from "react";
import { useCRM } from "../state/CRMContext";
import { formatMoney } from "../utils/format";
import { getDashboardMetrics, getMonthlyExpenseSummary, getMonthlyIncomeSeries, getStudentGrowthSeries } from "../utils/crmMath";

function BarChart({ points }) {
  const max = Math.max(...points.map((point) => point.total), 1);

  return (
    <div className="bar-chart">
      {points.map((point) => (
        <div key={point.month} className="bar-col">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${Math.max((point.total / max) * 100, 3)}%` }}
              title={`${point.month}: ${formatMoney(point.total)} so'm`}
            />
          </div>
          <span>{point.month.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function buildLinePoints(points, width, height, padding) {
  if (!points.length) return "";
  const values = points.map((point) => point.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yRange = max - min || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * usableWidth;
      const y = padding + (1 - (point.total - min) / yRange) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function LineChart({ points }) {
  const width = 360;
  const height = 190;
  const padding = 18;
  const polylinePoints = buildLinePoints(points, width, height, padding);

  return (
    <div className="svg-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <polyline points={polylinePoints} fill="none" stroke="var(--chart-line)" strokeWidth="3" />
      </svg>
      <div className="axis-labels">
        {points.map((point) => (
          <span key={point.month}>{point.month.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

function AreaChart({ points }) {
  const width = 360;
  const height = 190;
  const padding = 18;
  const polylinePoints = buildLinePoints(points, width, height, padding);
  const valuePairs = polylinePoints.split(" ");

  if (!valuePairs.length) return null;

  const areaPath = `M ${valuePairs[0]} L ${valuePairs.join(" L ")} L ${width - padding},${height - padding} L ${padding},${
    height - padding
  } Z`;

  return (
    <div className="svg-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <path d={areaPath} fill="var(--chart-area)" />
        <polyline points={polylinePoints} fill="none" stroke="var(--chart-area-line)" strokeWidth="2.5" />
      </svg>
      <div className="axis-labels">
        {points.map((point) => (
          <span key={point.month}>{point.month.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ segments }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1,
  );
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" className="donut-chart">
        <g transform="translate(90,90) rotate(-90)">
          <circle cx="0" cy="0" r={radius} fill="none" stroke="var(--line)" strokeWidth="20" />
          {segments.map((segment) => {
            const dash = (segment.value / total) * circumference;
            const node = (
              <circle
                key={segment.label}
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dash;
            return node;
          })}
        </g>
        <text x="90" y="90" textAnchor="middle" dominantBaseline="middle" className="donut-total">
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((segment) => (
          <div key={segment.label} className="legend-row">
            <span className="legend-dot" style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeChart({ rate, label }) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const half = circumference / 2;
  const progress = Math.min(Math.max(rate, 0), 1);

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 220 140" className="gauge-chart">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth="16"
          transform="rotate(180 110 110)"
          strokeDasharray={`${half} ${circumference}`}
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="var(--chart-gauge)"
          strokeWidth="16"
          strokeLinecap="round"
          transform="rotate(180 110 110)"
          strokeDasharray={`${half * progress} ${circumference}`}
        />
      </svg>
      <p className="gauge-value">{Math.round(progress * 100)}%</p>
      <p className="muted">{label}</p>
    </div>
  );
}

export function DashboardModule() {
  const { db } = useCRM();
  const metrics = useMemo(() => getDashboardMetrics(db), [db]);
  const incomeSeries = useMemo(() => getMonthlyIncomeSeries(db), [db]);
  const expenseSeries = useMemo(() => getMonthlyExpenseSummary(db), [db]);
  const growthSeries = useMemo(() => getStudentGrowthSeries(db), [db]);

  const areaSeries = useMemo(
    () =>
      incomeSeries.map((incomeRow) => {
        const expenseRow = expenseSeries.find((expense) => expense.month === incomeRow.month);
        return {
          month: incomeRow.month,
          total: Math.max(incomeRow.total - Number(expenseRow?.total || 0), 0),
        };
      }),
    [incomeSeries, expenseSeries],
  );

  const donutSegments = useMemo(() => {
    const active = db.students.filter((student) => student.status === "aktiv").length;
    const fresh = db.students.filter((student) => student.status === "yangi").length;
    const other = Math.max(db.students.length - active - fresh, 0);
    return [
      { label: "Aktiv", value: active, color: "#2f8dff" },
      { label: "Yangi", value: fresh, color: "#06b6d4" },
      { label: "Qolgan", value: other, color: "#22c55e" },
    ];
  }, [db.students]);

  const collectionRate = useMemo(() => {
    const subjects = new Map(db.subjects.map((subject) => [subject.id, subject]));
    const monthlyTarget = db.students.reduce((sum, student) => {
      const subject = subjects.get(student.subjectId);
      return sum + Number(subject?.monthlyPrice || 0);
    }, 0);
    if (monthlyTarget <= 0) return 0;
    return metrics.monthlyIncome / monthlyTarget;
  }, [db.students, db.subjects, metrics.monthlyIncome]);

  return (
    <section className="module-stack">
      <div className="chart-grid chart-grid-5">
        <article className="card chart-card">
          <h3>Oylik Daromad</h3>
          <BarChart points={incomeSeries} />
        </article>

        <article className="card chart-card">
          <h3>O'quvchilar O'sishi</h3>
          <LineChart points={growthSeries} />
        </article>

        <article className="card chart-card">
          <h3>Statuslar Taqsimoti</h3>
          <DonutChart segments={donutSegments} />
        </article>

        <article className="card chart-card">
          <h3>Sof Foyda Dinamikasi</h3>
          <AreaChart points={areaSeries} />
        </article>

        <article className="card chart-card">
          <h3>To'lov Bajarilishi</h3>
          <GaugeChart rate={collectionRate} label="Oylik to'lov bajarilishi" />
        </article>
      </div>
    </section>
  );
}

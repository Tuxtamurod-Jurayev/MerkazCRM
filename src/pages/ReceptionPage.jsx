import { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { getActiveTab, receptionTabs } from "../config/panelTabs";

const DashboardModule = lazy(() => import("../modules/DashboardModule").then((mod) => ({ default: mod.DashboardModule })));
const StudentsModule = lazy(() => import("../modules/StudentsModule").then((mod) => ({ default: mod.StudentsModule })));
const GroupsModule = lazy(() => import("../modules/GroupsModule").then((mod) => ({ default: mod.GroupsModule })));
const EnrollmentModule = lazy(() =>
  import("../modules/EnrollmentModule").then((mod) => ({ default: mod.EnrollmentModule })),
);
const PaymentsModule = lazy(() => import("../modules/PaymentsModule").then((mod) => ({ default: mod.PaymentsModule })));
const ExpensesModule = lazy(() => import("../modules/ExpensesModule").then((mod) => ({ default: mod.ExpensesModule })));
const ReportsModule = lazy(() => import("../modules/ReportsModule").then((mod) => ({ default: mod.ReportsModule })));

export function ReceptionPage() {
  const [searchParams] = useSearchParams();
  const activeTab = getActiveTab(receptionTabs, searchParams.get("tab"));

  return (
    <section className="module-stack">
      <Suspense fallback={<section className="card muted">Modul yuklanmoqda...</section>}>
        {activeTab === "dashboard" ? <DashboardModule /> : null}
        {activeTab === "students" ? <StudentsModule /> : null}
        {activeTab === "groups" ? <GroupsModule /> : null}
        {activeTab === "enrollment" ? <EnrollmentModule /> : null}
        {activeTab === "payments" ? <PaymentsModule /> : null}
        {activeTab === "expenses" ? <ExpensesModule /> : null}
        {activeTab === "reports" ? <ReportsModule /> : null}
      </Suspense>
    </section>
  );
}

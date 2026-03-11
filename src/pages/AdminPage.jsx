import { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { adminTabs, getActiveTab } from "../config/panelTabs";

const DashboardModule = lazy(() => import("../modules/DashboardModule").then((mod) => ({ default: mod.DashboardModule })));
const SubjectsModule = lazy(() => import("../modules/SubjectsModule").then((mod) => ({ default: mod.SubjectsModule })));
const TeachersModule = lazy(() => import("../modules/TeachersModule").then((mod) => ({ default: mod.TeachersModule })));
const StudentsModule = lazy(() => import("../modules/StudentsModule").then((mod) => ({ default: mod.StudentsModule })));
const GroupsModule = lazy(() => import("../modules/GroupsModule").then((mod) => ({ default: mod.GroupsModule })));
const PaymentsModule = lazy(() => import("../modules/PaymentsModule").then((mod) => ({ default: mod.PaymentsModule })));
const DebtorsModule = lazy(() => import("../modules/DebtorsModule").then((mod) => ({ default: mod.DebtorsModule })));
const ReportsModule = lazy(() => import("../modules/ReportsModule").then((mod) => ({ default: mod.ReportsModule })));

export function AdminPage() {
  const [searchParams] = useSearchParams();
  const activeTab = getActiveTab(adminTabs, searchParams.get("tab"));

  return (
    <section className="module-stack">
      <Suspense fallback={<section className="card muted">Modul yuklanmoqda...</section>}>
        {activeTab === "dashboard" ? <DashboardModule /> : null}
        {activeTab === "subjects" ? <SubjectsModule /> : null}
        {activeTab === "teachers" ? <TeachersModule /> : null}
        {activeTab === "students" ? <StudentsModule readOnly /> : null}
        {activeTab === "groups" ? <GroupsModule readOnly /> : null}
        {activeTab === "payments" ? <PaymentsModule readOnly /> : null}
        {activeTab === "debtors" ? <DebtorsModule /> : null}
        {activeTab === "reports" ? <ReportsModule /> : null}
      </Suspense>
    </section>
  );
}

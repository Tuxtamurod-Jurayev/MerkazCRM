import { Icon } from "./Icon";

export function ModuleTabs({ tabs, activeTab, setActiveTab, variant = "default" }) {
  const rootClass =
    variant === "topbar"
      ? "module-tabs topbar-tabs"
      : variant === "mobile"
        ? "module-tabs mobile-tabs"
        : "module-tabs";

  return (
    <div className={rootClass} role="tablist" aria-label="CRM modules">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === activeTab ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab(tab.id)}
        >
          <Icon name={tab.icon || "dashboard"} size={16} className="tab-icon" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

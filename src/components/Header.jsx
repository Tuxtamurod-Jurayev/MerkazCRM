import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext";
import { useTheme } from "../state/ThemeContext";
import { Icon } from "./Icon";
import { ModuleTabs } from "./ModuleTabs";
import { adminTabs, getActiveTab, receptionTabs } from "../config/panelTabs";

export function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");
  const isReceptionPage = location.pathname.startsWith("/qabulxona");
  const tabs = isAdminPage ? adminTabs : isReceptionPage ? receptionTabs : [];
  const activeTab = getActiveTab(tabs, searchParams.get("tab"));

  const setActiveTab = (tabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="logo">
          MarkazCRM
        </Link>

        {user ? (
          <>
            <div className="topbar-right">
              <nav className="nav">
                <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="admin" size={15} />
                  Admin
                </NavLink>
                <NavLink to="/qabulxona" className={({ isActive }) => (isActive ? "active" : "")}>
                  <Icon name="reception" size={15} />
                  Qabulxona
                </NavLink>
              </nav>
              <div className="toolbar-actions">
                <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Theme almashtirish">
                  <Icon name={isDark ? "sun" : "moon"} size={17} />
                </button>
                <button type="button" onClick={logout} className="danger-link">
                  <Icon name="logout" size={15} />
                  Chiqish
                </button>
              </div>
            </div>

            <div className="mobile-actions">
              <button type="button" onClick={logout} className="danger-link">
                <Icon name="logout" size={15} />
                Chiqish
              </button>
              <button
                type="button"
                className="icon-btn menu-toggle"
                aria-label="Toggle Navigation Menu"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                <Icon name={mobileMenuOpen ? "close" : "menu"} size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="guest-tools">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Theme almashtirish">
              <Icon name={isDark ? "sun" : "moon"} size={17} />
            </button>
            <Link to="/login" className="login-link">
              Kirish
            </Link>
          </div>
        )}
      </div>

      {user && tabs.length > 0 ? (
        <div className="container topbar-bottom">
          <ModuleTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} variant="topbar" />
        </div>
      ) : null}

      {user && tabs.length > 0 ? (
        <div className={mobileMenuOpen ? "container mobile-drawer open" : "container mobile-drawer"}>
          <nav className="mobile-nav">
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon name="admin" size={15} />
              Admin
            </NavLink>
            <NavLink to="/qabulxona" className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon name="reception" size={15} />
              Qabulxona
            </NavLink>
          </nav>
          <ModuleTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} variant="mobile" />
          <div className="mobile-bottom-tools">
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Theme almashtirish">
              <Icon name={isDark ? "sun" : "moon"} size={17} />
            </button>
            <button type="button" onClick={logout} className="danger-link">
              <Icon name="logout" size={15} />
              Chiqish
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

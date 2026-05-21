"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Tab = "categories" | "providers" | "users";

const navItems: { id: Tab; label: string; icon: string }[] = [
  { id: "categories", label: "Categories", icon: "🗂️" },
  { id: "providers", label: "Providers", icon: "🏪" },
  { id: "users", label: "Users", icon: "👥" },
];

export default function AdminLayout({
  children,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/auth/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f13", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "#17171f",
          borderBottom: "1px solid #2a2a3a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 40,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 24,
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            ☰
          </button>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}>✂️</div>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}>SalonAdmin</div>
              <div style={{
                fontSize: 10,
                color: "#6b7280",
              }}>Control Panel</div>
            </div>
          </div>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#f59e0b,#ef4444)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
          }}>A</div>
        </div>
      )}

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 45,
        }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? 280 : 240,
        background: "#17171f",
        borderRight: "1px solid #2a2a3a",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform 0.3s ease-in-out",
      }}>
        {/* Close button for mobile */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "#9ca3af",
            fontSize: 20,
            cursor: "pointer",
            padding: "8px",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
          }}>
            ✕
          </button>
        )}

        {/* Logo */}
        <div style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #2a2a3a",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}>✂️</div>
            <div>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}>SalonAdmin</div>
              <div style={{
                fontSize: 11,
                color: "#6b7280",
              }}>Control Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          padding: "16px 12px",
          flex: 1,
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#4b5563",
            letterSpacing: "0.08em",
            padding: "0 12px 10px",
          }}>
            NAVIGATION
          </div>
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "rgba(245,158,11,0.12)" : "transparent",
                  color: active ? "#f59e0b" : "#9ca3af",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: 4,
                  textAlign: "left",
                  transition: "all 0.15s",
                  borderLeft: active ? "3px solid #f59e0b" : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: "16px 12px",
          borderTop: "1px solid #2a2a3a",
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #3f3f52",
              background: "transparent",
              color: "#ef4444",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: isMobile ? 0 : 240,
        flex: 1,
        padding: isMobile ? "76px 16px 16px 16px" : "32px 36px",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease-in-out",
      }}>
        {/* Desktop Top bar */}
        {!isMobile && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}>
            <div>
              <h1 style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                letterSpacing: "-0.03em",
              }}>
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
              <p style={{
                fontSize: 13,
                color: "#6b7280",
                margin: "4px 0 0",
              }}>
                Manage your salon platform
              </p>
            </div>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
            }}>A</div>
          </div>
        )}

        {/* Mobile Page Header */}
        {isMobile && (
          <div style={{
            marginBottom: 24,
          }}>
            <h1 style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.03em",
            }}>
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            <p style={{
              fontSize: 12,
              color: "#6b7280",
              margin: "4px 0 0",
            }}>
              Manage your salon platform
            </p>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string | null;
  mobile: string | null;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ page: p }),
      });
      setUsers(res.message || res || []);
    } catch (e: any) {
      if(e.status == 401) {
        router.push("/admin/auth/login");
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(page); }, [page]);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = (role: string) => (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: role === "customer" ? "rgba(99,102,241,0.12)" : "rgba(245,158,11,0.12)",
      color: role === "customer" ? "#818cf8" : "#f59e0b",
    }}>
      {role}
    </span>
  );

  const avatarColor = (name: string) => {
    const colors = ["#f59e0b", "#10b981", "#818cf8", "#ef4444", "#06b6d4"];
    return colors[name?.charCodeAt(0) % colors.length] || "#f59e0b";
  };

  // Mobile Card View
  const MobileUserCard = ({ user }: { user: User }) => (
    <div style={mobileCard}>
      <div style={mobileCardHeader}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: avatarColor(user.name) + "22",
          border: `2px solid ${avatarColor(user.name)}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: avatarColor(user.name),
          flexShrink: 0,
        }}>
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div style={mobileCardTitleSection}>
          <div style={mobileCardName}>{user.name}</div>
          <div style={mobileCardRole}>{roleBadge(user.role)}</div>
        </div>
      </div>
      
      <div style={mobileCardDetails}>
        <div style={mobileDetailRow}>
          <span style={mobileDetailLabel}>📧 Email:</span>
          <span style={mobileDetailValue}>{user.email}</span>
        </div>
        <div style={mobileDetailRow}>
          <span style={mobileDetailLabel}>📱 Mobile:</span>
          <span style={mobileDetailValue}>{user.mobile || "—"}</span>
        </div>
        <div style={mobileDetailRow}>
          <span style={mobileDetailLabel}>📍 Address:</span>
          <span style={mobileDetailValue}>{user.address || "—"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Stats - Responsive Grid */}
      <div style={statsGrid}>
        {[
          { label: "Total Users", value: users.length, icon: "👥" },
          { label: "Customers", value: users.filter((u) => u.role === "customer").length, icon: "🛍️" },
          { label: "With Mobile", value: users.filter((u) => u.mobile).length, icon: "📱" },
        ].map((s) => (
          <div key={s.label} style={statCard}>
            <div style={statIcon}>{s.icon}</div>
            <div style={statValue}>{s.value}</div>
            <div style={statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      {!isMobile && (
        <div style={tableWrap}>
          <div style={tableHeader}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>All Users</div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                    {["User", "Email", "Mobile", "Address", "Role"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid #1e1e2a", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1e1e2a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: avatarColor(u.name) + "22",
                            border: `1.5px solid ${avatarColor(u.name)}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: avatarColor(u.name),
                          }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{u.name}</span>
                        </div>
                       </td>
                      <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{u.email}</span></td>
                      <td style={td}><span style={{ fontSize: 13, color: "#9ca3af" }}>{u.mobile || "—"}</span></td>
                      <td style={td}><span style={{ fontSize: 12, color: "#6b7280" }}>{u.address || "—"}</span></td>
                      <td style={td}>{roleBadge(u.role)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div style={paginationContainer}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
            <span style={{ padding: "6px 14px", fontSize: 13, color: "#9ca3af" }}>Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} style={pageBtn}>Next →</button>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <div style={mobileContainer}>
          <div style={mobileHeader}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>All Users</div>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={mobileSearchInput}
            />
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading...</div>
          ) : (
            <>
              <div style={mobileCardsContainer}>
                {filtered.map((u) => (
                  <MobileUserCard key={u.id} user={u} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center", color: "#6b7280", fontSize: 13 }}>
                    No users found
                  </div>
                )}
              </div>
              {/* Pagination for Mobile */}
              <div style={paginationContainer}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>← Prev</button>
                <span style={{ padding: "6px 14px", fontSize: 13, color: "#9ca3af" }}>Page {page}</span>
                <button onClick={() => setPage((p) => p + 1)} style={pageBtn}>Next →</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Responsive Styles
const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 28,
};

const statCard: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  padding: "20px 24px",
};

const statIcon: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 8,
};

const statValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#fff",
  letterSpacing: "-0.03em",
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 2,
};

const tableWrap: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderBottom: "1px solid #2a2a3a",
  flexWrap: "wrap",
  gap: 12,
};

const searchInput: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "#0f0f13",
  color: "#e5e7eb",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  width: 240,
};

const th: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: 11,
  fontWeight: 600,
  color: "#6b7280",
  textAlign: "left",
  letterSpacing: "0.05em",
};

const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};

const paginationContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  padding: "16px 20px",
  borderTop: "1px solid #2a2a3a",
};

const pageBtn: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "transparent",
  color: "#9ca3af",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
};

// Mobile Styles
const mobileContainer: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  overflow: "hidden",
};

const mobileHeader: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: "16px",
  borderBottom: "1px solid #2a2a3a",
};

const mobileSearchInput: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "#0f0f13",
  color: "#e5e7eb",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
};

const mobileCardsContainer: React.CSSProperties = {
  padding: "12px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const mobileCard: React.CSSProperties = {
  background: "#0f0f13",
  border: "1px solid #2a2a3a",
  borderRadius: 12,
  padding: "16px",
  transition: "all 0.2s",
};

const mobileCardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const mobileCardTitleSection: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const mobileCardName: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#e5e7eb",
  marginBottom: 6,
  wordBreak: "break-word",
};

const mobileCardRole: React.CSSProperties = {
  display: "inline-block",
};

const mobileCardDetails: React.CSSProperties = {
  borderTop: "1px solid #2a2a3a",
  paddingTop: 12,
};

const mobileDetailRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 10,
  flexWrap: "wrap",
};

const mobileDetailLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  minWidth: 70,
};

const mobileDetailValue: React.CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
  flex: 1,
  wordBreak: "break-word",
};
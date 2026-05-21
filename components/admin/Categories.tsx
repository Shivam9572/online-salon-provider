"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

interface Service {
  name: string;
  description: string;
  default_price: string;
  default_duration: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  Services: Service[];
}

const chip = (color: string) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  background: color === "amber" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)",
  color: color === "amber" ? "#f59e0b" : "#818cf8",
} as React.CSSProperties);

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddService, setShowAddService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/admin/category", { method: "GET" });
      console.log(res.message);
      setCategories(res.message || []);
    } catch (err: any) {
      if (err.status == 401) {
        router.push("/admin/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeleting(name);
    try {
      console.log(id);
      await apiFetch(`/category/remove/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      if (err.status == 401) {
        router.push("/admin/auth/login");
      }
      alert("delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const toggleServices = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name || !description) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/category", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });

      if (res.success) {
        await fetchCategories();
        setShowAddCategory(false);
        alert("Category added successfully!");
      } else {
        alert(res.message || "Failed to add category");
      }
    } catch (err: any) {
      if (err.status == 401) {
        router.push("/admin/auth/login");
      }
      alert("Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddService = async (categoryId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const default_price = formData.get("default_price") as string;
    const default_duration = parseInt(formData.get("default_duration") as string);

    if (!name || !description || !default_price || !default_duration) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/service", {
        method: "POST",
        body: JSON.stringify({
          category_id: categoryId,
          name,
          description,
          default_price,
          default_duration,
        }),
      });

      if (res.success) {
        await fetchCategories();
        setShowAddService(null);
        alert("Service added successfully!");
      } else {
        alert(res.message || "Failed to add service");
      }
    } catch (err: any) {
      if (err.status == 401) {
        router.push("/admin/auth/login");
      }
      alert("Failed to add service");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={container}>
      {/* Add Category Button */}
      <div style={headerSection}>
        <button onClick={() => setShowAddCategory(true)} style={btnPrimary}>
          + Add New Category
        </button>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div style={modalOverlay} onClick={() => setShowAddCategory(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitle}>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                name="name"
                placeholder="Category Name"
                required
                style={inputStyle}
              />
              <textarea
                name="description"
                placeholder="Category Description"
                required
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
              <div style={modalButtons}>
                <button type="button" onClick={() => setShowAddCategory(false)} style={btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={btnPrimary}>
                  {submitting ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats - Responsive Grid */}
      <div style={statsGrid}>
        {[
          { label: "Total Categories", value: categories.length, icon: "🗂️" },
          { label: "Total Services", value: categories.reduce((a, c) => a + c.Services.length, 0), icon: "✂️" },
          { label: "Avg Services/Category", value: categories.length ? Math.round(categories.reduce((a, c) => a + c.Services.length, 0) / categories.length) : 0, icon: "📊" },
        ].map((s) => (
          <div key={s.label} style={statCard}>
            <div style={statIcon}>{s.icon}</div>
            <div style={statValue}>{s.value}</div>
            <div style={statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div style={categoriesContainer}>
        {categories.map((cat) => {
          const isOpen = expanded === cat.name;
          const isMobileMenuOpen = mobileMenuOpen === cat.id;
          
          return (
            <div key={cat.id} style={card}>
              {/* Card Header */}
              <div style={cardHeader}>
                <div style={cardHeaderLeft}>
                  <div style={cardIcon}>🏷️</div>
                  <div>
                    <div style={cardTitle}>{cat.name}</div>
                    <div style={cardDescription}>{cat.description}</div>
                  </div>
                </div>

                {/* Desktop Actions - only show on desktop */}
                {!isMobile && (
                  <div style={desktopActions}>
                    <span style={chip("indigo")}>{cat.Services.length} services</span>
                    <button onClick={() => setShowAddService(cat.id)} style={btnSuccess}>
                      + Service
                    </button>
                    <button
                      onClick={() => toggleServices(cat.name)}
                      style={{
                        ...btnOutline,
                        color: isOpen ? "#f59e0b" : "#9ca3af",
                        borderColor: isOpen ? "rgba(245,158,11,0.4)" : "#3f3f52",
                        background: isOpen ? "rgba(245,158,11,0.08)" : "transparent",
                      }}
                    >
                      {isOpen ? "Hide ▲" : "Show ▼"}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={deleting === cat.name}
                      style={{ ...btnDanger, opacity: deleting === cat.name ? 0.5 : 1 }}
                    >
                      {deleting === cat.name ? "..." : "Delete"}
                    </button>
                  </div>
                )}

                {/* Mobile Menu Button - only show on mobile */}
                {isMobile && (
                  <button 
                    style={mobileMenuButton}
                    onClick={() => setMobileMenuOpen(isMobileMenuOpen ? null : cat.id)}
                  >
                    ⋮
                  </button>
                )}
              </div>

              {/* Mobile Actions Menu */}
              {isMobile && isMobileMenuOpen && (
                <div style={mobileMenu}>
                  <div style={mobileMenuItem}>
                    <span style={chip("indigo")}>{cat.Services.length} services</span>
                  </div>
                  <button onClick={() => {
                    setShowAddService(cat.id);
                    setMobileMenuOpen(null);
                  }} style={{ ...btnSuccess, width: "100%", marginBottom: 8 }}>
                    + Add Service
                  </button>
                  <button
                    onClick={() => {
                      toggleServices(cat.name);
                      setMobileMenuOpen(null);
                    }}
                    style={{ ...btnOutline, width: "100%", marginBottom: 8 }}
                  >
                    {isOpen ? "Hide Services" : "Show Services"}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(cat.id, cat.name);
                      setMobileMenuOpen(null);
                    }}
                    disabled={deleting === cat.name}
                    style={{ ...btnDanger, width: "100%" }}
                  >
                    {deleting === cat.name ? "..." : "Delete Category"}
                  </button>
                </div>
              )}

              {/* Add Service Modal */}
              {showAddService === cat.id && (
                <div style={modalOverlay} onClick={() => setShowAddService(null)}>
                  <div style={modalContent} onClick={(e) => e.stopPropagation()}>
                    <h3 style={modalTitle}>Add Service to {cat.name}</h3>
                    <form onSubmit={(e) => handleAddService(cat.id, e)}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Service Name"
                        required
                        style={inputStyle}
                      />
                      <textarea
                        name="description"
                        placeholder="Service Description"
                        required
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                      <div style={serviceFormRow}>
                        <input
                          type="number"
                          name="default_price"
                          placeholder="Price (₹)"
                          required
                          step="0.01"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <input
                          type="number"
                          name="default_duration"
                          placeholder="Duration (min)"
                          required
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      </div>
                      <div style={modalButtons}>
                        <button type="button" onClick={() => setShowAddService(null)} style={btnSecondary}>
                          Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={btnPrimary}>
                          {submitting ? "Adding..." : "Add Service"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Services Slide-in */}
              <div style={{
                maxHeight: isOpen ? (isMobile ? 800 : 600) : 0,
                overflow: "hidden",
                transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}>
                <div style={servicesContainer}>
                  <div style={servicesHeader}>
                    SERVICES IN THIS CATEGORY
                  </div>
                  {cat.Services.length === 0 ? (
                    <div style={emptyState}>
                      No services yet. Click "+ Service" to add one.
                    </div>
                  ) : (
                    cat.Services.map((svc, index) => (
                      <div key={index} style={serviceRow}>
                        <div style={serviceInfo}>
                          <div style={serviceName}>{svc.name}</div>
                          <div style={serviceDescription}>{svc.description}</div>
                        </div>
                        <div style={servicePrice}>
                          <div style={priceAmount}>₹{svc.default_price}</div>
                          <div style={priceDuration}>{svc.default_duration} min</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={categoriesContainer}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ ...card, height: 80, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

// Styles
const container: React.CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const headerSection: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 20,
  padding: "0 4px",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  marginBottom: 28,
};

const categoriesContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 14,
  overflow: "hidden",
  transition: "border-color 0.2s",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px 20px",
  flexWrap: "wrap",
  gap: 12,
};

const cardHeaderLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flex: 1,
  minWidth: 0,
};

const cardIcon: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(239,68,68,0.2))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  flexShrink: 0,
};

const cardTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  wordBreak: "break-word",
};

const cardDescription: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 2,
  wordBreak: "break-word",
};

const desktopActions: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const mobileMenuButton: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#9ca3af",
  fontSize: 24,
  cursor: "pointer",
  padding: "4px 8px",
};

const mobileMenu: React.CSSProperties = {
  padding: "12px 20px",
  borderTop: "1px solid #2a2a3a",
  background: "#0f0f13",
};

const mobileMenuItem: React.CSSProperties = {
  marginBottom: 12,
};

const servicesContainer: React.CSSProperties = {
  borderTop: "1px solid #2a2a3a",
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const servicesHeader: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b7280",
  letterSpacing: "0.06em",
  marginBottom: 4,
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "20px",
  color: "#6b7280",
  fontSize: 13,
};

const serviceRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  background: "#0f0f13",
  borderRadius: 10,
  border: "1px solid #2a2a3a",
  flexWrap: "wrap",
  gap: 12,
};

const serviceInfo: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const serviceName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#e5e7eb",
  wordBreak: "break-word",
};

const serviceDescription: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 2,
  wordBreak: "break-word",
};

const servicePrice: React.CSSProperties = {
  textAlign: "right",
  flexShrink: 0,
};

const priceAmount: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#f59e0b",
};

const priceDuration: React.CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
};

const serviceFormRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 12,
  flexWrap: "wrap",
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

const btnOutline: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "transparent",
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

const btnDanger: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.3)",
  background: "rgba(239,68,68,0.08)",
  color: "#ef4444",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 8,
  border: "none",
  background: "#f59e0b",
  color: "#000",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 8,
  border: "1px solid #3f3f52",
  background: "transparent",
  color: "#9ca3af",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s",
};

const btnSuccess: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid rgba(34,197,94,0.3)",
  background: "rgba(34,197,94,0.1)",
  color: "#22c55e",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "all 0.15s",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "16px",
};

const modalContent: React.CSSProperties = {
  background: "#17171f",
  border: "1px solid #2a2a3a",
  borderRadius: 16,
  padding: 24,
  width: "90%",
  maxWidth: 500,
  boxShadow: "0 20px 35px -10px rgba(0,0,0,0.5)",
};

const modalTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "#fff",
  marginBottom: 16,
};

const modalButtons: React.CSSProperties = {
  display: "flex",
  gap: 12,
  justifyContent: "flex-end",
  marginTop: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  background: "#0f0f13",
  border: "1px solid #2a2a3a",
  borderRadius: 8,
  color: "#fff",
  fontSize: 14,
  fontFamily: "inherit",
};

// Add animation keyframes
if (typeof document !== "undefined") {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}
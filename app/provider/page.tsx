"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import StaffPanel, { StaffMember } from "../../components/provider/StaffPanel";
import CategoryPanel from "../../components/provider/CategoryPanel";
import ServicePanel from "../../components/provider/servicePannel";
import { Service } from "../../components/provider/servicePannel";
import ProviderProfile, { ProviderProfileType } from "../../components/provider/profile";
import dynamic from "next/dynamic";
import AppointmentHistory from "../../components/provider/appointments";

const MapModal = dynamic(
  () => import("@/components/provider/mapModal"),
  { ssr: false }
);
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket';

// Type definitions
interface Category {
  id: number;
  name: string;
}

interface ProviderCategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Chair {
  number: number;
}



interface TabType {
  id: "staff" | "categories" | "services" | "appointments" | "profile";
  label: string;
  icon: string;
}

export default function ProviderHomePage() {
  return (
    <AuthProvider>
      <ProviderHomeContent />
    </AuthProvider>
  );
}

function ProviderHomeContent() {
  const router = useRouter();
  const { logout } = useAuth();

  // State management with proper types
  const [showMap, setShowMap] = useState<boolean>(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providerCategories, setProviderCategories] = useState<ProviderCategory[]>([]);
  const [profile, setProfile] = useState<ProviderProfileType | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"staff" | "categories" | "services" | "profile" | "appointments">("staff");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chairCount, setChairCount] = useState<number>(0);
  const [chairLoading, setChairLoading] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Tab configuration
  const tabs: TabType[] = [
    { id: "staff", label: "👥 Staff", icon: "👥" },
    { id: "categories", label: "🗂 Categories", icon: "🗂" },
    { id: "services", label: "💼 Services", icon: "💼" },
    { id: "appointments", label: "📅 Appointments", icon: "📅" },
    { id: "profile", label: "👤 Profile", icon: "👤" }
  ];

  // Data loading
  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await apiFetch("/verifyAuth", { method: "GET" });
        if (!res || res.role !== "provider") {
          handleLogout();
          router.push("/provider/auth/login");
        }
        const s = await apiFetch(`/staff/`, { method: "GET" });
        setStaff(s?.staff ?? s ?? []);
      } catch (err: any) {
        if (err.status === 401) {
          handleLogout();
          router.push("/provider/auth/login");
          return;
        }
        let msg = err?.message || String(err);
        try { msg = JSON.parse(msg)?.message || msg; } catch { }
        if (msg.includes("Provider not approved")) { setError(msg); return; }
        setError("Failed to load staff");
      }

      try {
        const c = await apiFetch(`/category`, { method: "GET" });
        setCategories(c?.categories ?? c ?? []);
      } catch (err: any) {
        let msg = err?.message || String(err);
        try { msg = JSON.parse(msg)?.message || msg; } catch { }
        if (msg.includes("Provider not approved")) { setError(msg); return; }
        setError((prev) => prev ? `${prev}; failed to load categories` : "Failed to load categories");
      }

      try {
        const s = await apiFetch(`/provider/services`, { method: "GET" });
        setServices(s?.services ?? s ?? []);
      } catch (err: any) {
        console.error("Failed to load services", err);
      }

      try {
        const res = await apiFetch("/provider/profile", { method: "GET" });
        if (!res) {
          alert("Failed to load profile");
          return;
        }
        setProfile(res);
        setChairCount(res?.Chair?.number ?? 0);
      } catch (error) {
        console.log("Failed to load profile", error);
        alert("Failed to load profile");
      }

      await loadProviderCategories();
    }
    load();
  }, []);

  async function loadProviderCategories(): Promise<void> {
    try {
      const res = await apiFetch(`/provider/categories`, { method: "GET" });
      setProviderCategories(res?.categories ?? res ?? []);
    } catch (err) {
      console.error("Failed to load provider categories", err);
    }
  }

  async function handleChairUpdate(newCount: number): Promise<void> {
    if (newCount < 0) return;
    setChairCount(newCount);
    setChairLoading(true);
    try {
      await apiFetch('/provider/chair', {
        method: 'PUT',
        body: JSON.stringify({ number: newCount }),
      });
    } catch (err: any) {
      setChairCount(chairCount);
      if (err.status === 401) return handleLogout();
      alert('Failed to update chairs');
    } finally {
      setChairLoading(false);
    }
  }

  function handleToggleSocket(checked: boolean): void {
    console.log(checked);
    if (checked) {
      const s = connectSocket();
      console.log(s);
      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));
      s.on('connect_error', (e: any) => {
        setIsConnected(false);
        if (e === "Error:Invalid token") {
          alert("Invalid token");
          handleLogout();
        }
      });
    } else {
      disconnectSocket();
      setIsConnected(false);
    }
  }

  function handleAppendStaff(member: StaffMember): void {
    setStaff((prev) => [...prev, member]);
  }

  function handleAppendService(service: Service): void {
    setServices((prev) => [...prev, service]);
  }

  function handleLogout(): void {
    logout();
    disconnectSocket();
    router.push(`/provider/auth/login`);
  }

  async function onDeleteService(id: string): Promise<void> {
    try {
      let res = await apiFetch(`/provider/services/${id}`, { method: "DELETE" });
      if (!res) {
        setError("Something went wrong");
        return;
      }
      alert(res.message);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      if (err.status === 401) {
        handleLogout();
        return;
      }
      alert(err);
    }
  }

  function deleteStaff(phone: string): void {
    setServices((prev) => prev.filter(e => e.staffPhone !== phone));
    setStaff((prev) => prev.filter(e => e.phone !== phone));
  }

  async function onUpdateProfile(data: Partial<ProviderProfileType>): Promise<void> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== "")
      );
      const res = await apiFetch("/provider/profile", { method: "PUT", body: JSON.stringify(cleanData) });
      if (!res) {
        alert("Something went wrong");
        return;
      }
      alert("Successfully updated");
      setProfile((prev) => {
        if (!prev) return data as ProviderProfileType;
        return { ...prev, ...data };
      });
    } catch (error: any) {
      if (error.status === 401) {
        return handleLogout();
      }
      alert(error ? error : "Something went wrong");
    }
  }

  // Handle error alert
  if (error !== null) {
    const msg = (() => { 
      try { return JSON.parse(error)?.message || error; } 
      catch { return error; } 
    })();
    alert(msg);
    setError(null);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Mobile Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              padding: 8,
              display: "flex",
              alignItems: "center"
            }}
            aria-label="Menu"
          >
            ☰
          </button>
          
          <h1 style={{
            margin: 0,
            fontSize: "clamp(16px, 5vw, 20px)",
            fontWeight: 600,
            color: "#1f2937"
          }}>
            Provider Dashboard
          </h1>

          <button
            onClick={handleLogout}
            style={{
              background: "#f59e0b",
              border: "none",
              padding: "6px 12px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "clamp(12px, 4vw, 14px)"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999
            }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "80%",
            maxWidth: 280,
            background: "white",
            zIndex: 1000,
            boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
            overflowY: "auto",
            padding: 20
          }}>
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  float: "right"
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ clear: "both" }} />
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  background: activeTab === tab.id ? "#fef3c7" : "none",
                  border: "none",
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "#d97706" : "#4b5563",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "clamp(12px, 4vw, 24px)",
        paddingBottom: 80
      }}>
        {/* Action Bar */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(8px, 3vw, 12px)",
          marginBottom: 24,
          background: "white",
          padding: "clamp(12px, 4vw, 16px)",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          {/* Connect Toggle */}
          <div style={{ flex: "1 1 auto", minWidth: 150 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap"
            }}>
              <span style={{
                fontSize: "clamp(12px, 4vw, 14px)",
                fontWeight: 600,
                color: isConnected ? "#10b981" : "#6b7280"
              }}>
                {isConnected ? "🟢 Connected" : "⚫ Connect System"}
              </span>
              <div
                onClick={() => handleToggleSocket(!isConnected)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: isConnected ? "#10b981" : "#d1d5db",
                  position: "relative",
                  transition: "background 0.2s",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 3,
                  left: isConnected ? 23 : 3,
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }} />
              </div>
            </div>
          </div>

          {/* Chair Counter */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "4px 12px"
          }}>
            <span style={{ fontSize: "clamp(14px, 4vw, 16px)" }}>💺</span>
            <button
              onClick={() => handleChairUpdate(chairCount - 1)}
              disabled={chairLoading || chairCount <= 0}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: chairCount <= 0 ? "#f3f4f6" : "white",
                cursor: chairCount <= 0 ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              −
            </button>

            <span style={{
              minWidth: 30,
              textAlign: "center",
              fontSize: "clamp(16px, 5vw, 18px)",
              fontWeight: 700,
              color: "#111827"
            }}>
              {chairCount}
            </span>

            <button
              onClick={() => handleChairUpdate(chairCount + 1)}
              disabled={chairLoading}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              +
            </button>
          </div>

          {/* Location Button */}
          <button
            onClick={() => setShowMap(true)}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "clamp(6px, 3vw, 8px) clamp(12px, 4vw, 14px)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "clamp(12px, 4vw, 14px)",
              fontWeight: 500,
              flex: "1 1 auto"
            }}
          >
            📍 Set Location
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin"
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "clamp(8px, 3vw, 10px) clamp(12px, 4vw, 20px)",
                border: "none",
                background: activeTab === tab.id ? "white" : "transparent",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "clamp(12px, 4vw, 14px)",
                color: activeTab === tab.id ? "#f59e0b" : "#6b7280",
                borderBottom: activeTab === tab.id ? "2px solid #f59e0b" : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "all 0.15s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: "clamp(12px, 4vw, 20px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          {activeTab === "staff" && (
            <StaffPanel
              staff={staff}
              onAdd={handleAppendStaff}
              onUnauthorized={handleLogout}
              deleteStaff={deleteStaff}
              isProviderConnected={isConnected}
              socket={getSocket()}
            />
          )}

          {activeTab === "categories" && (
            <CategoryPanel
              categories={categories}
              providerCategories={providerCategories}
              onCategoryAdded={loadProviderCategories}
              onError={(msg: string) => setError(msg)}
            />
          )}

          {activeTab === "services" && (
            <ServicePanel 
              services={services} 
              onService={handleAppendService} 
              categories={categories} 
              staff={staff} 
              onUnauthorized={handleLogout} 
              onDelete={onDeleteService} 
            />
          )}

          {activeTab === "profile" && profile && (
            <ProviderProfile
              data={profile}
              onUpdate={onUpdateProfile}
              onUnauthorized={handleLogout}
            />
          )}

          {activeTab === "appointments" && (
            <AppointmentHistory onUnauthorized={handleLogout} />
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          initialCoords={
            profile?.latitude && profile?.longitude
              ? {
                  lat: profile.latitude,
                  lng: profile.longitude,
                }
              : undefined
          }
          onSelect={({ latitude, longitude, address }: { latitude: number; longitude: number; address: string }) => {
            onUpdateProfile({
              latitude,
              longitude,
              salonAddress: address,
            });
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 12px",
        zIndex: 90,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)"
      }}>
        {tabs.slice(0, 4).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "8px 4px",
              cursor: "pointer",
              fontSize: "clamp(20px, 6vw, 24px)",
              opacity: activeTab === tab.id ? 1 : 0.5,
              transition: "opacity 0.2s"
            }}
            aria-label={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
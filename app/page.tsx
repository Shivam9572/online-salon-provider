"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Calendar, Users, ShoppingBag, BarChart3, Star, Menu, X } from "lucide-react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { icon: Calendar, title: "Smart Scheduling", desc: "Intelligent booking with real-time availability and conflict prevention" },
    { icon: Users, title: "Staff Management", desc: "Assign staff to services based on verified skill qualifications" },
    { icon: ShoppingBag, title: "Service Catalog", desc: "Hierarchical categories with provider-level customization" },
    { icon: BarChart3, title: "Analytics", desc: "Revenue tracking, booking trends, and performance insights" },
  ];

  const appointments = [
    { time: "10:00", service: "Balayage", client: "Meera J.", staff: "Priya S.", status: "confirmed" },
    { time: "11:30", service: "Hydra Facial", client: "Sneha K.", staff: "Kavya R.", status: "confirmed" },
    { time: "14:00", service: "Classic Haircut", client: "Ritu V.", staff: "Priya S.", status: "pending" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── NAV ── */}
      <nav style={{
        padding: "1.125rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: 30, height: 30, background: "var(--gold)", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600 }}>Lumière</span>
        </div>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.4rem 0.75rem" }}>Providers</Link>
          <Link href="/book" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.4rem 0.75rem" }}>Book</Link>
          <Link href="/dashboard" className="btn-gold">Dashboard <ArrowRight size={14} /></Link>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "none" }}
        >
          {menuOpen ? <X size={22} color="var(--charcoal)" /> : <Menu size={22} color="var(--charcoal)" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "0.75rem 1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}>
          <Link href="/" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }} onClick={() => setMenuOpen(false)}>Providers</Link>
          <Link href="/book" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", textDecoration: "none", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }} onClick={() => setMenuOpen(false)}>Book</Link>
          <Link href="/dashboard" className="btn-gold" style={{ alignSelf: "flex-start", marginTop: "0.5rem" }} onClick={() => setMenuOpen(false)}>
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        padding: "5rem 2rem 4rem",
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
      }}>
        {/* Left copy */}
        <div>
          <div className="tag tag-gold" style={{ marginBottom: "1.5rem" }}>✨ Salon Management Platform</div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
            fontWeight: 400,
            lineHeight: 1.05,
            marginBottom: "1.25rem",
          }}>
            Appointments,{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold-dark)" }}>beautifully</em>{" "}
            managed.
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: "1.75rem" }}>
            A complete platform for salons — admins govern the catalog, providers customize offerings, customers book with ease.
          </p>
          <div className="hero-cta" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/dashboard" className="btn-gold" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9375rem" }}>
              Open Dashboard <ArrowRight size={15} />
            </Link>
            <Link href="/book" className="btn-outline" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9375rem" }}>
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Right card */}
        <div className="hero-card-wrap" style={{ position: "relative" }}>
          <div style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Today · Aura Beauty Studio
            </div>
            {appointments.map((appt, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr auto",
                gap: "0.75rem",
                alignItems: "center",
                padding: "0.7rem 0",
                borderBottom: i < appointments.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gold-dark)" }}>{appt.time}</div>
                  <div style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>60m</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{appt.client}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{appt.service} · {appt.staff}</div>
                </div>
                <span style={{
                  background: appt.status === "confirmed" ? "#EFF7F2" : "#FDF8EC",
                  color: appt.status === "confirmed" ? "#2D7A4F" : "#9B7B2E",
                  fontSize: "0.5625rem",
                  fontWeight: 600,
                  padding: "0.175rem 0.5rem",
                  borderRadius: "2px",
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}>
                  {appt.status}
                </span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "1rem", marginTop: "0.25rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Today&apos;s Revenue</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gold-dark)" }}>₹9,750</div>
            </div>
          </div>

          {/* Floating review badge */}
          <div className="float-badge" style={{
            position: "absolute",
            bottom: "-1.25rem",
            left: "-1.25rem",
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.75rem 1rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <div style={{ display: "flex", gap: "1px" }}>
              {[1, 2, 3, 4, 5].map(n => <Star key={n} size={13} fill="var(--gold)" color="var(--gold)" />)}
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>4.8</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>312 reviews</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 400, marginBottom: "0.5rem" }}>
            Everything your salon needs
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>Multi-role architecture for admins, providers, and customers</p>
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover feature-card" style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "4px", background: "#FDF8EC", border: "1px solid var(--gold-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", flexShrink: 0 }}>
                <Icon size={20} color="var(--gold)" />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "0.4rem" }}>{title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTALS ── */}
      <section className="portals-section" style={{ padding: "3rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
        {[
          { role: "Admin", desc: "Govern the platform — manage categories, services, and providers.", href: "/admin/auth/login", icon: "⚙️", bg: "#F0F4FF", border: "#C5D0EF", linkColor: "#3B5AA0" },
          { role: "Provider", desc: "Manage your salon — customize services, staff, and bookings.", href: "/provider/auth/login", icon: "✂️", bg: "#FDF8EC", border: "var(--gold-light)", linkColor: "var(--gold-dark)" },
        ].map(({ role, desc, href, icon, bg, border, linkColor }) => (
          <Link key={role} href={href} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "4px", padding: "1.75rem", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.875rem", lineHeight: 1 }}>{icon}</div>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 500, color: "var(--charcoal)", marginBottom: "0.4rem" }}>{role}</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>{desc}</p>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: linkColor, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
              Enter as {role} <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "white", padding: "1.25rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={14} color="var(--gold)" />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.0625rem", fontWeight: 600 }}>Lumière</span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Built with Next.js · Salon Appointment System</div>
      </footer>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../lib/api";
export interface ProviderProfileType {
  email: string;
  salonName: string;
  salonAddress: string;
  salonContact: string;
  status: string;
  servicesOffered: string;
  role: string;
  longitude: number;
  latitude: number;
  opening_time?: string;
  closing_time?: string;
  image?: string; // Cloudinary URL
}

interface ProviderProfileProps {
  data: ProviderProfileType;
  onUpdate: (data: Partial<ProviderProfileType>) => void;
  onUnauthorized: () => void;
}

export default function ProviderProfile({
  data,
  onUpdate,
  onUnauthorized,
}: ProviderProfileProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ProviderProfileType>({ ...data });
  const [profile, setProfile] = useState<ProviderProfileType>({ ...data });
  
  // Image upload states
  const [imagePreview, setImagePreview] = useState<string | null>(data.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when external data changes
  useEffect(() => {
    if (data) {
      setProfile({ ...data });
      setFormData({ ...data });
      setImagePreview(data.image || null);
    }
  }, [data]);

  // ─────────────────────────────────────────────────────────────────────
  // 1. IMAGE UPLOAD (Separate, immediate save - no edit mode needed)
  // ─────────────────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Quick local preview
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("media", file);

      const response = await apiFetch("/provider/profile/upload", {
        method: "PUT",
        body: uploadFormData,
      
      });

      

      alert(" successfull upload");
      // Expected response: { url: "cloudinary_url", public_id, type, size }
      const newImageUrl = response.url;

      // Update local state with the permanent URL
      setImagePreview(newImageUrl);
      
      // Immediately update parent component
      
      
      // Update local profile state
      setProfile(prev => ({ ...prev, image: newImageUrl }));
     
      
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload image. Please try again.");
      setUploadError("Failed to upload image. Please try again.");
      // Revert preview to previous image
      setImagePreview(profile.image || null);
    } finally {
      setIsUploading(false);
      // Clean up local object URL
      URL.revokeObjectURL(localPreview);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ─────────────────────────────────────────────────────────────────────
  // 2. TEXT PROFILE EDIT (Separate Edit mode)
  // ─────────────────────────────────────────────────────────────────────
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTextChanges = () => {
    const changedFields: Partial<ProviderProfileType> = {};
    
    // Compare and collect only changed fields
    if (formData.salonName !== profile.salonName) changedFields.salonName = formData.salonName;
    if (formData.salonAddress !== profile.salonAddress) changedFields.salonAddress = formData.salonAddress;
    if (formData.salonContact !== profile.salonContact) changedFields.salonContact = formData.salonContact;
    if (formData.servicesOffered !== profile.servicesOffered) changedFields.servicesOffered = formData.servicesOffered;
    if (formData.opening_time !== profile.opening_time) changedFields.opening_time = formData.opening_time;
    if (formData.closing_time !== profile.closing_time) changedFields.closing_time = formData.closing_time;
    
    if (Object.keys(changedFields).length === 0) {
      setEditMode(false);
      return;
    }
    
    // Update parent component
    onUpdate(changedFields);
    
    // Update local profile state
    setProfile(prev => ({ ...prev, ...changedFields }));
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    // Reset form data to current profile data
    setFormData({ ...profile });
    setEditMode(false);
  };

  // Helper to get initials for avatar fallback
  const getInitials = () => {
    return profile.salonName
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SP";
  };

  const isActive = profile.status?.toLowerCase() === "active";
  const isApproved = profile.status?.toLowerCase() === "approved";
  const isStatusPositive = isActive || isApproved;

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .profile-container {
          max-width: 720px;
          margin: 2rem auto;
          background: #ffffff;
          border-radius: 2rem;
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          transition: all 0.2s ease;
          border: 1px solid rgba(226, 232, 240, 0.6);
        }
        
        .cover-gradient {
          height: 110px;
          background: linear-gradient(145deg, #1e1b4b 0%, #3b2b6b 40%, #6d28d9 80%, #8b5cf6 100%);
          position: relative;
        }
        
        .avatar-section {
          padding: 0 2rem;
          margin-top: -52px;
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        
        .avatar-wrapper {
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        
        .avatar-wrapper:hover {
          transform: scale(1.02);
        }
        
        .avatar-ring {
          background: linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4);
          padding: 3px;
          border-radius: 9999px;
          display: inline-block;
        }
        
        .avatar-inner {
          background: white;
          border-radius: 9999px;
          padding: 2px;
        }
        
        .avatar-image {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        
        .avatar-placeholder {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: #6b21a8;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .upload-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .avatar-wrapper:hover .upload-overlay {
          opacity: 1;
        }
        
        .info-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.9rem;
          border-radius: 100px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .field-group {
          margin-bottom: 1.25rem;
        }
        
        .field-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.4rem;
        }
        
        .field-value {
          background: #f8fafc;
          border: 1px solid #eef2f6;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #0f172a;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        
        .field-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        textarea.field-input {
          resize: vertical;
          min-height: 80px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px -6px rgba(99, 102, 241, 0.4);
        }
        
        .btn-secondary {
          background: white;
          border: 1.5px solid #e2e8f0;
          padding: 0.6rem 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
        }
        
        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .fade-slide {
          animation: fadeSlide 0.3s ease;
        }
        
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .grid-2cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 560px) {
          .avatar-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .grid-2cols {
            grid-template-columns: 1fr;
          }
          .profile-container {
            margin: 1rem;
            border-radius: 1.5rem;
          }
        }
      `}</style>

      <div className="profile-container fade-slide">
        {/* Cover bar */}
        <div className="cover-gradient" />
        
        {/* Avatar + Name Section */}
        <div className="avatar-section">
          <div className="avatar-wrapper" onClick={triggerFileInput}>
            <div className="avatar-ring">
              <div className="avatar-inner">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Salon profile"
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Upload overlay */}
            <div className="upload-overlay">
              {isUploading ? (
                <div className="spinner" />
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <path d="M12 16V8m0 0-3 3m3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 16.7A4 4 0 0 0 18 9h-1.26A7 7 0 1 0 5 15.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: "0.7rem", color: "white", fontWeight: 500 }}>Change</span>
                </>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
          
          <div style={{ flex: 1, paddingBottom: "0.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {profile.salonName}
            </h1>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0.75rem 0" }}>
              {profile.email}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="info-badge" style={{ background: isStatusPositive ? "#dcfce7" : "#fee2e2", color: isStatusPositive ? "#15803d" : "#b91c1c" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isStatusPositive ? "#22c55e" : "#ef4444" }} />
                {profile.status}
              </span>
              <span className="info-badge" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>
        
        {/* Upload error message */}
        {uploadError && (
          <div style={{ margin: "1rem 2rem 0", padding: "0.6rem 1rem", background: "#fef2f2", borderRadius: "14px", fontSize: "0.75rem", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {uploadError}
          </div>
        )}
        
        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          {/* Edit mode indicator for text fields */}
          {editMode && (
            <div style={{ background: "#f5f3ff", borderRadius: "16px", padding: "0.65rem 1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6d28d9" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5L20 7l-9 9-4 1 1-4 9-9z"/></svg>
              Editing profile information — click Save when done.
            </div>
          )}
          
          {/* Email (read-only) */}
          <div className="field-group">
            <label className="field-label">Email address</label>
            <div className="field-value" style={{ color: "#64748b" }}>
              {profile.email}
            </div>
          </div>
          
          {/* 2-column row for Salon Name & Contact */}
          <div className="grid-2cols">
            <div className="field-group">
              <label className="field-label">Salon name</label>
              {editMode ? (
                <input
                  type="text"
                  name="salonName"
                  className="field-input"
                  value={formData.salonName}
                  onChange={handleTextChange}
                />
              ) : (
                <div className="field-value">{profile.salonName || "—"}</div>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">Contact number</label>
              {editMode ? (
                <input
                  type="text"
                  name="salonContact"
                  className="field-input"
                  value={formData.salonContact}
                  onChange={handleTextChange}
                />
              ) : (
                <div className="field-value">{profile.salonContact || "—"}</div>
              )}
            </div>
          </div>
          
          {/* Address */}
          <div className="field-group">
            <label className="field-label">Salon address</label>
            {editMode ? (
              <input
                type="text"
                name="salonAddress"
                className="field-input"
                value={formData.salonAddress}
                onChange={handleTextChange}
              />
            ) : (
              <div className="field-value">{profile.salonAddress || "—"}</div>
            )}
          </div>
          
          {/* Services Offered */}
          <div className="field-group">
            <label className="field-label">Services offered</label>
            {editMode ? (
              <textarea
                name="servicesOffered"
                className="field-input"
                value={formData.servicesOffered}
                onChange={handleTextChange}
                placeholder="Haircut, Styling, Facial, etc."
              />
            ) : (
              <div className="field-value">{profile.servicesOffered || "—"}</div>
            )}
          </div>
          
          {/* Opening & Closing times */}
          <div className="grid-2cols">
            <div className="field-group">
              <label className="field-label">Opening time</label>
              {editMode ? (
                <input
                  type="time"
                  name="opening_time"
                  className="field-input"
                  value={formData.opening_time?.slice(0, 5) || ""}
                  onChange={handleTextChange}
                />
              ) : (
                <div className="field-value">{profile.opening_time?.slice(0, 5) || "—"}</div>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">Closing time</label>
              {editMode ? (
                <input
                  type="time"
                  name="closing_time"
                  className="field-input"
                  value={formData.closing_time?.slice(0, 5) || ""}
                  onChange={handleTextChange}
                />
              ) : (
                <div className="field-value">{profile.closing_time?.slice(0, 5) || "—"}</div>
              )}
            </div>
          </div>
          
          {/* Status & Role (read-only) */}
          <div className="grid-2cols">
            <div className="field-group">
              <label className="field-label">Status</label>
              <div className="field-value">{profile.status || "—"}</div>
            </div>
            <div className="field-group">
              <label className="field-label">Role</label>
              <div className="field-value">{profile.role || "—"}</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ padding: "1rem 2rem 1.8rem", borderTop: "1px solid #f1f5f9", background: "#fefefe", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {!editMode ? (
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3l4 4-7 7-4 1 1-4 6-6z"/><path d="M4 20h16"/></svg>
              Edit Profile Info
            </button>
          ) : (
            <>
              <button className="btn-primary" onClick={handleSaveTextChanges}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
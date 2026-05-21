"use client";
import { useState,useEffect} from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/admin/layout";
import CategoriesTab from "../../components/admin/Categories";
import ProvidersTab from "../../components/admin/Providers";
import UsersTab from "../../components/admin/Users";
import { apiFetch } from "../../lib/api"; 
type Tab = "categories" | "providers" | "users";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const router = useRouter();
  useEffect(()=>{
   async function load(){
    try {
      const res=await apiFetch("/verifyAuth",{
                method:"GET"
              });
              if(!res && res.role!="provider"){
                
                router.push("/admin/auth/login") ;
              }
    } catch (error) {
      router.push("/admin/auth/login") ;
    }
   }
  },[]);
  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "providers" && <ProvidersTab />}
      {activeTab === "users" && <UsersTab />}
    </AdminLayout>
  );
}

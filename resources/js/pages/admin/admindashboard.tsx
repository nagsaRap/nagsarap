import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout'; // Adjust import path if needed

export default function AdminDashboard() {
  return (
    <>
      <Head title="Admin Dashboard" />

      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Hello Admin</h2>
      </div>
    </>
  );
}

// Overrides the global AppSidebarLayout to use AdminLayout exclusively
AdminDashboard.layout = (page: React.ReactNode) => <AdminLayout title="Dashboard">{page}</AdminLayout>;
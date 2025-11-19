import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import AddAgent from "./AddAgent";
import ManageAgent from "./ManageAgent";

export const AdminDashboard = (): JSX.Element => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "add-agent", label: "Add Agent", icon: "➕" },
    { id: "manage-agent", label: "Manage Agent", icon: "⚙️" },
    { id: "feedback", label: "Feedback Page", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Sidebar */}
      <div className="w-72 bg-white/90 backdrop-blur-sm shadow-xl rounded-r-3xl border-r border-orange-200/50">
        <div className="p-8 border-b border-orange-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-900">Admin Panel</h2>
              <p className="text-sm text-orange-600">MYAICOMMUNITY</p>
            </div>
          </div>
        </div>

        <nav className="mt-8 px-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-4 text-left rounded-2xl mb-2 transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-orange-700 hover:bg-orange-50 hover:text-orange-900"
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-4 text-left text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 mt-6"
          >
            <span className="text-xl mr-4">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-orange-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-orange-900">
                {sidebarItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </h1>
              <p className="text-orange-600 mt-1">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-orange-700">{user?.email}</p>
                <p className="text-xs text-orange-500">Administrator</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8">
          {activeTab === "add-agent" ? (
            <AddAgent />
          ) : activeTab === "manage-agent" ? (
            <ManageAgent />
          ) : (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-orange-900 mb-3">
                    Welcome to Admin Dashboard
                  </h2>
                  <p className="text-orange-700 text-lg">
                    Hello, {user?.email}! You are successfully logged in.
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-4xl font-bold mb-2">1,234</p>
                  <p className="text-orange-100 text-sm">
                    +12% from last month
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Active Sessions</h3>
                    <span className="text-2xl">🟢</span>
                  </div>
                  <p className="text-4xl font-bold mb-2">89</p>
                  <p className="text-orange-100 text-sm">Currently online</p>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Revenue</h3>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-4xl font-bold mb-2">$12,345</p>
                  <p className="text-orange-100 text-sm">This month</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-200/50">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button className="p-6 border border-orange-200 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 text-left group hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 text-lg">
                          Manage Users
                        </h3>
                        <p className="text-orange-700">
                          View and manage user accounts
                        </p>
                      </div>
                    </div>
                  </button>
                  <button className="p-6 border border-orange-200 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 text-left group hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 text-lg">
                          Analytics
                        </h3>
                        <p className="text-orange-700">
                          View detailed analytics and reports
                        </p>
                      </div>
                    </div>
                  </button>
                  <button className="p-6 border border-orange-200 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 text-left group hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 text-lg">
                          Settings
                        </h3>
                        <p className="text-orange-700">
                          Configure system settings
                        </p>
                      </div>
                    </div>
                  </button>
                  <button className="p-6 border border-orange-200 rounded-2xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 text-left group hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <span className="text-2xl">🎧</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 text-lg">
                          Support
                        </h3>
                        <p className="text-orange-700">
                          View support tickets and messages
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gradient-to-r from-orange-50 to-white rounded-3xl p-8 border border-orange-200/50">
                <h3 className="font-bold text-orange-900 text-xl mb-6">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                    <p className="text-sm text-orange-600 mb-1">
                      Email Address
                    </p>
                    <p className="font-semibold text-orange-900">
                      {user?.email}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                    <p className="text-sm text-orange-600 mb-1">Role</p>
                    <p className="font-semibold text-orange-900">
                      {user?.role}
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
                    <p className="text-sm text-orange-600 mb-1">Last Login</p>
                    <p className="font-semibold text-orange-900">
                      {user?.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

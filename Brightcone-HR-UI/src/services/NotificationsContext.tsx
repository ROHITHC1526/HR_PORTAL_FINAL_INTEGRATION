import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: "payroll" | "expense" | "helpdesk" | "system" | "announcement";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    notifOrTitle: Omit<AppNotification, "id" | "createdAt" | "read"> | string,
    message?: string,
    category?: any
  ) => void;
  refreshNotifications: () => Promise<void>;
}

const defaultNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Payroll Ready for Review",
    message: "September 2026 payroll run is at Step 3: Review Variances.",
    category: "payroll",
    read: false,
    createdAt: "10 mins ago",
    actionUrl: "/payroll/admin",
  },
  {
    id: "n-2",
    title: "Expense Claim Approved",
    message: "Your claim of ₹4,200 for Client Lunch was approved by Finance.",
    category: "expense",
    read: false,
    createdAt: "1 hour ago",
    actionUrl: "/payroll/expenses",
  },
  {
    id: "n-3",
    title: "Company All-Hands Meeting",
    message: "Town hall scheduled for Friday at 4:00 PM. RSVP open.",
    category: "announcement",
    read: true,
    createdAt: "Yesterday",
    actionUrl: "/engagement/feed",
  },
  {
    id: "n-4",
    title: "Tax Declaration Window Open",
    message: "FY 2026-27 investment declarations window is now active.",
    category: "payroll",
    read: true,
    createdAt: "2 days ago",
    actionUrl: "/payroll/payslips",
  },
];

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("bc_notifications");
      return saved ? JSON.parse(saved) : defaultNotifications;
    } catch {
      return defaultNotifications;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    try {
      localStorage.setItem("bc_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to persist notifications", e);
    }
  }, [notifications]);

  const refreshNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      if (res.data && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch {
      // Keep existing local state if API is not running
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await axios.post(`/api/notifications/${id}/read`);
    } catch {
      // Handled locally
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axios.post("/api/notifications/mark-all-read");
    } catch {
      // Handled locally
    }
  };

  const addNotification = (
    notifOrTitle: Omit<AppNotification, "id" | "createdAt" | "read"> | string,
    message?: string,
    category?: any
  ) => {
    let item: Omit<AppNotification, "id" | "createdAt" | "read">;
    if (typeof notifOrTitle === "string") {
      item = {
        title: notifOrTitle,
        message: message || "",
        category: (category as any) || "system",
      };
    } else {
      item = notifOrTitle;
    }
    const newNotif: AppNotification = {
      id: "n-" + Date.now(),
      ...item,
      read: false,
      createdAt: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};

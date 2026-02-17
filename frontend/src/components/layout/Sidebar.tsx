'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Box, 
  Layers, 
  Users, 
  Bell, 
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  FolderTree,
  Package,
  ShoppingCart,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api.service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: boolean;
}

const superAdminMenuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/superadmin/dashboard' },
  { name: 'Admins', icon: ShieldCheck, href: '/superadmin/admins' },
  { name: 'Categories', icon: FolderTree, href: '/superadmin/categories' },
  { name: 'Subcategories', icon: Layers, href: '/superadmin/subcategories' },
  { name: 'Products', icon: Package, href: '/superadmin/products' },
  { name: 'Orders', icon: ShoppingCart, href: '/superadmin/orders' },
  { name: 'Users', icon: Users, href: '/superadmin/users' },
  { name: 'Payments', icon: Wallet, href: '/superadmin/payments' },
  { name: 'Reports', icon: BarChart3, href: '/superadmin/reports' },
  { name: 'Notifications', icon: Bell, href: '/superadmin/notifications', badge: true },
  { name: 'Settings', icon: Settings, href: '/superadmin/settings' },
];

const adminMenuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Approvals', icon: ShieldCheck, href: '/admin/approvals' },
  { name: 'Inventory', icon: Box, href: '/admin/categories' },
  { name: 'Low Stock', icon: Package, href: '/admin/low-stock' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
];

export const Sidebar = () => {
  const { sidebarCollapsed: collapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useDashboard();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = user?.role === 'SUPER_ADMIN' ? superAdminMenuItems : adminMenuItems;

  // Re-check unread notifications periodically or on mount
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
      const fetchNotifications = async () => {
        try {
          const response = await apiService.get('/notifications/unread-count');
          if (response.data && typeof response.data.data === 'number') {
            setUnreadCount(response.data.data);
          }
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };
      fetchNotifications();
    }
  }, [user]);

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') return null;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        "pt-8 px-6 pb-6 transition-all duration-300",
        collapsed ? "px-4 flex flex-col items-center" : "px-6"
      )}>
        <div className="flex items-center justify-between mb-4 w-full">
          <div className={cn(
            "flex items-center space-x-2 transition-all duration-300",
            collapsed ? "opacity-0 invisible w-0" : "opacity-100 visible w-auto"
          )}>
            <span className="text-xl font-black text-white tracking-[0.1em]">
               SHIELDER
            </span>
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className={cn(
              "hidden lg:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-300",
              collapsed ? "mx-auto" : ""
            )}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        {!collapsed && <div className="h-[1px] w-full bg-white/10" />}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-shielder-primary flex items-center justify-center text-white font-black text-xs">
            S
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={cn(
        "flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide py-4 transition-all duration-300",
        collapsed ? "px-2" : "px-4"
      )}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center py-3 rounded-md transition-all duration-300 group relative",
                collapsed ? "justify-center px-0" : "px-4",
                isActive 
                  ? "bg-shielder-secondary text-white border-l-4 border-shielder-primary" 
                  : "text-white/70 hover:bg-shielder-primary hover:text-white"
              )}
              title={collapsed ? item.name : ""}
            >
              <item.icon 
                size={20} 
                className={cn(
                  "min-w-[20px] transition-colors", 
                  isActive ? "text-white scale-110" : "text-gray-400 group-hover:text-white"
                )} 
              />
              <span className={cn(
                "ml-4 font-medium transition-all duration-500 whitespace-nowrap",
                isActive ? "text-white font-bold" : "",
                collapsed ? "opacity-0 invisible w-0 ml-0 overflow-hidden" : "opacity-100 visible w-auto"
              )}>
                {item.name}
              </span>
              
              {item.badge && unreadCount > 0 && (
                <span className={cn(
                  "absolute bg-red-500 text-white text-[10px] font-bold rounded-full text-center transition-all duration-300",
                  collapsed 
                    ? "top-2 right-2 w-2 h-2 p-0" 
                    : "right-4 px-1.5 py-0.5 min-w-[20px]"
                )}>
                  {collapsed ? '' : (unreadCount > 99 ? '99+' : unreadCount)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={cn(
        "p-4 bg-black/10 border-t border-white/5 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-md text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group",
            collapsed ? "justify-center px-0 py-3" : "px-4 py-3"
          )}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className={cn(
            "ml-4 font-medium transition-all duration-300",
            collapsed ? "opacity-0 invisible w-0 ml-0" : "opacity-100 visible w-auto"
          )}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-screen bg-shielder-dark text-white z-50 flex-col shadow-[4px_0_10px_rgba(0,0,0,0.1)] transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className={cn(
        "lg:hidden fixed inset-0 z-[60] transition-visibility duration-300",
        isMobileOpen ? "visible" : "invisible"
      )}>
        {/* Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isMobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Drawer */}
        <aside 
          className={cn(
            "absolute left-0 top-0 h-full w-[260px] bg-shielder-dark shadow-2xl transition-transform duration-300",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-8 right-4 text-white hover:rotate-90 transition-transform p-2"
          >
            <X size={24} />
          </button>
          {SidebarContent}
        </aside>
      </div>
    </>
  );
};

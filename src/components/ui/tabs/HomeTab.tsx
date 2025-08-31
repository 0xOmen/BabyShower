"use client";

import { useEffect, useState } from "react";

/**
 * HomeTab component displays the main landing content for the mini app.
 *
 * This is the default tab that users see when they first open the mini app.
 * It provides a simple welcome message and placeholder content that can be
 * customized for specific use cases.
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Mock user data for now to avoid server-side import issues
        const mockUser = {
          username: "jpfraneto",
          pfp_url:
            "https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2_TNGCNidAos9vrXduv40w5n_4CqQh8P9emz6Cxj5Zudl1e5e2SpxJhOeuTw?w=500&auto=format",
        };
        setUser(mockUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] px-6">
      {/* User Profile Section */}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
        <div className="w-1/5 flex justify-center">
          {loading ? (
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user?.pfp_url ? (
            <img
              src={user.pfp_url}
              alt="Profile Picture"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ?
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 ml-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Celebrate {user?.username || "jpfraneto"}&apos;s family!
          </h1>
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            Win Money!
          </h2>
        </div>
      </div>

      {/* Original Content */}
      <div className="flex items-center justify-center flex-1">
        <div className="text-center w-full max-w-md mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Neynar 🪐
          </p>
        </div>
      </div>
    </div>
  );
}

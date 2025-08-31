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
        const response = await fetch("/api/users?fids=16098");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setUser(data.users[0]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Fallback to mock data if API fails
        setUser({
          username: "jpfraneto",
          pfp_url:
            "https://i.seadn.io/gae/2hDpuTi-0AMKvoZJGd-yKWvK4tKdQr_kLIpB_qSeMau2_TNGCNidAos9vrXduv40w5n_4CqQh8P9emz6Cxj5Zudl1e5e2SpxJhOeuTw?w=500&auto=format",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] px-2">
      {/* User Profile Section */}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-2 mb-4 shadow-sm">
        <div className="w-1/5 flex justify-center">
          {loading ? (
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ) : user?.pfp_url ? (
            <img
              src={user.pfp_url}
              alt="Profile Picture"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                ?
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 ml-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Celebrate {user?.username || "jpfraneto"}&apos;s family!
          </h1>
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
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

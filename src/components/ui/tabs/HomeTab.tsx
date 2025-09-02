"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useSendCalls,
  useSwitchChain,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { encodeFunctionData, parseUnits } from "viem";
// import { baseSepolia } from "wagmi/chains";
import { base } from "wagmi/chains";
import { ERC20_ABI } from "../../../lib/ERC20ABI";
import {
  raffleContractABI,
  RAFFLE_CONTRACT_ADDRESS,
} from "../../../lib/raffleContractABI";
import { useMiniApp } from "@neynar/react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEntries, setUserEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [prizePool, setPrizePool] = useState<string>("0");
  const [isLoadingPrizePool, setIsLoadingPrizePool] = useState(false);

  // Wallet connection
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendCalls } = useSendCalls();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Get Farcaster user info from Mini App context
  const { context } = useMiniApp();

  // Get the Farcaster Mini App connector
  const miniAppConnector = connectors.find(
    (connector) => connector.id === "farcasterMiniApp"
  );

  // USDC token address on Base Mainnet
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const ENTRY_FEE = parseUnits("5", 6); // 5 USDC with 6 decimals
  const RAFFLE_NUMBER = 1;

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

  // Fetch prize pool when wallet connects
  useEffect(() => {
    if (isConnected && publicClient) {
      fetchPrizePool();
    }
  }, [isConnected, publicClient]);

  const updateSupabaseDatabase = async (
    timestamp: number,
    userAddress: string,
    fid: number,
    readableTime: string
  ) => {
    try {
      const response = await fetch("/api/guesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp,
          user_address: userAddress,
          fid,
          readable_time: readableTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update database");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating database:", error);
      throw error;
    }
  };

  const fetchUserEntries = async () => {
    if (!context?.user?.fid) {
      alert("Please connect your Farcaster wallet to view your entries.");
      return;
    }

    setIsLoadingEntries(true);
    try {
      const response = await fetch(`/api/guesses?fid=${context.user.fid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user entries");
      }
      const data = await response.json();
      setUserEntries(data.guesses || []);
    } catch (error) {
      console.error("Error fetching user entries:", error);
      alert("Failed to fetch your entries. Please try again.");
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const fetchPrizePool = async () => {
    if (!isConnected || !publicClient) return;

    setIsLoadingPrizePool(true);
    try {
      const result = await publicClient.readContract({
        address: RAFFLE_CONTRACT_ADDRESS as `0x${string}`,
        abi: raffleContractABI,
        functionName: "getPrizePool",
        args: [BigInt(RAFFLE_NUMBER)],
      });

      // Convert from wei to USDC (6 decimals)
      const prizePoolInUSDC = Number(result) / Math.pow(10, 6);
      setPrizePool(prizePoolInUSDC.toFixed(2));
    } catch (error) {
      console.error("Error fetching prize pool:", error);
      setPrizePool("Error");
    } finally {
      setIsLoadingPrizePool(false);
    }
  };

  // Test transaction function for Base mainnet
  const handleRaffleEntry = async () => {
    if (!birthDate || !birthTime) {
      alert("Please select both date and time");
      return;
    }

    if (!isConnected) {
      // Try Farcaster Mini App connector first, fallback to any available connector
      const connector = miniAppConnector || connectors[0];
      if (connector) {
        console.log("Connecting with connector:", connector.id);
        connect({ connector });
      } else {
        console.error("No wallet connectors available");
        alert("Wallet connection not available");
      }
      return;
    }

    // Check if we're on Base mainnet (chainId 8453)
    if (chainId !== 8453) {
      console.log(
        "Wrong chain. Expected Base Mainnet (8453), got:",
        chainId,
        ". Switching automatically..."
      );
      try {
        await switchChain({ chainId: 8453 });
        // Wait a moment for the chain switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Failed to switch chain:", error);
        alert("Please switch to Base mainnet manually");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Convert user's selected date and time to EVM compatible Unix timestamp
      // User is selecting time in Chile Standard Time (UTC-3)
      const dateTimeString = `${birthDate}T${birthTime}`;
      const chileDate = new Date(dateTimeString);

      // Chile Standard Time is UTC-3, so we need to add 3 hours to convert to UTC
      const utcTimestamp = chileDate.getTime() + 3 * 60 * 60 * 1000;
      const unixTimestamp = Math.floor(utcTimestamp / 1000);

      console.log("Timestamp conversion:", {
        birthDate,
        birthTime,
        chileDateTime: dateTimeString,
        unixTimestamp,
        utcTime: new Date(utcTimestamp).toISOString(),
      });

      console.log("Starting transaction on Base mainnet...");
      console.log("Chain and contract info:", {
        chainId,
        expectedChainId: 8453,
        isCorrectChain: chainId === 8453,
        USDC_ADDRESS,
        RAFFLE_CONTRACT_ADDRESS,
      });

      // Step 1: Approve USDC spending
      console.log("Step 1: Approving USDC on Base mainnet...");
      const approvalResult = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [RAFFLE_CONTRACT_ADDRESS, 100000n],
      });

      console.log("USDC approval transaction submitted:", approvalResult);

      // Wait for USDC approval to be confirmed
      console.log("Waiting for USDC approval confirmation...");
      try {
        // Wait for the transaction to be mined
        const approvalReceipt = await publicClient?.waitForTransactionReceipt({
          hash: approvalResult,
        });
        console.log("USDC approval confirmed:", approvalReceipt);
      } catch (error) {
        console.error("USDC approval failed or was rejected:", error);
        alert("USDC approval failed. Please try again.");
        return;
      }

      // Step 2: Enter raffle with guess
      console.log("Step 2: Entering raffle with guess...");
      try {
        const raffleResult = await writeContractAsync({
          address: RAFFLE_CONTRACT_ADDRESS as `0x${string}`,
          abi: raffleContractABI,
          functionName: "enterRaffleWithGuess",
          args: [BigInt(unixTimestamp), BigInt(RAFFLE_NUMBER)],
        });

        console.log("Raffle entry transaction submitted:", raffleResult);
        alert(
          "Raffle entry transaction submitted! Please confirm in your wallet."
        );

        // Wait for raffle entry to be confirmed
        const raffleReceipt = await publicClient?.waitForTransactionReceipt({
          hash: raffleResult,
        });
        console.log("Raffle entry confirmed:", raffleReceipt);

        // Update Supabase database
        const userFid = context?.user?.fid; // Get FID from Mini App context
        console.log(
          "User FID:",
          userFid,
          "Type:",
          typeof userFid,
          "Context user:",
          context?.user
        );

        // Use the FID from context if available, otherwise use null
        const databaseFid = userFid || 1;

        await updateSupabaseDatabase(
          unixTimestamp,
          address!,
          databaseFid,
          new Date(utcTimestamp).toISOString()
        );

        console.log("Raffle entry completed successfully:", {
          birthDate,
          birthTime,
          chileDateTime: dateTimeString,
          unixTimestamp,
          utcTime: new Date(utcTimestamp).toISOString(),
          userAddress: address,
          raffleNumber: RAFFLE_NUMBER,
        });

        alert(
          `🎉 Congratulations! Your raffle entry has been submitted successfully!\n\nYour guess: ${birthDate} at ${birthTime} (Chile Time)\nRaffle Number: ${RAFFLE_NUMBER}\n\nGood luck!`
        );
      } catch (error) {
        console.error("Raffle entry failed:", error);
        alert("Raffle entry failed. Please try again.");
      }
    } catch (error) {
      console.error("Error in raffle entry process:", error);
      alert(
        "An error occurred during the raffle entry process. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* 50/50 Baby Shower Raffle Section */}
      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          50/50 Baby Shower Raffle
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Be the closest to guess the time of baby&apos;s birth and WIN half the
          prize pool!
        </p>

        {/* Quick Date and Time Selection */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRaffleEntry}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? "Processing..." : "Guess and Gift $5"}
          </button>
          <button
            onClick={() => {
              setIsEntriesModalOpen(true);
              fetchUserEntries();
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            My Entries
          </button>
        </div>
      </div>

      {/* Current Prize Pool Display */}
      <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          🏆 Current Prize Pool
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {isLoadingPrizePool ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                Loading...
              </div>
            ) : (
              `$${prizePool} USDC`
            )}
          </div>
          <button
            onClick={fetchPrizePool}
            disabled={isLoadingPrizePool}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Half goes to JP and the other half goes to the closest guess!
        </p>
      </div>

      {/* Original Content */}
      <div className="flex items-center justify-center flex-1">
        <div className="text-center w-full max-w-md mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Neynar 🪐
          </p>
        </div>
      </div>

      {/* Birth Time Guess Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Guess baby&apos;s birth time:
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time - Chile Std Time
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Entries Modal */}
      {isEntriesModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mx-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                My Raffle Entries
              </h3>
              <button
                onClick={() => setIsEntriesModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {isLoadingEntries ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading your entries...
                </p>
              </div>
            ) : userEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have no raffle entries.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                        Entry #
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">
                        Your Guess
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userEntries.map((entry, index) => (
                      <tr
                        key={entry.id || index}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-2 px-2 text-gray-900 dark:text-white font-medium">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2 text-gray-500 dark:text-gray-400 text-xs">
                          {entry.readable_time
                            ? new Date(entry.readable_time).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsEntriesModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

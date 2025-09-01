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
import { useNeynarUser } from "../../../hooks/useNeynarUser";

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
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wallet connection
  const { isConnected, address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendCalls } = useSendCalls();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Get Farcaster user info
  const { user: neynarUser } = useNeynarUser();

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
        const userFid = neynarUser?.fid || null; // Use connected user's FID or null if not available
        console.log(
          "User FID:",
          userFid,
          "Type:",
          typeof userFid,
          "Full neynarUser:",
          neynarUser
        );

        // Ensure userFid is a valid number or null for the database
        const databaseFid =
          typeof userFid === "number" && userFid > 0 ? userFid : 1;

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
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            My Entries
          </button>
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

            <div className="flex gap-3 mt-6">
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  // COMMENTED OUT ORIGINAL TRANSACTION CODE
                  /*
                  if (!birthDate || !birthTime) {
                    console.log("Please select both date and time");
                    return;
                  }

                  if (!isConnected) {
                    if (miniAppConnector) {
                      connect({ connector: miniAppConnector });
                    } else {
                      console.error("Farcaster Mini App connector not found");
                      alert("Wallet connection not available");
                    }
                    return;
                  }

                  // Check if we're on the correct chain (Base Sepolia)
                  if (chainId !== 84532) {
                    console.log(
                      "Wrong chain. Expected Base Sepolia (84532), got:",
                      chainId,
                      ". Switching automatically..."
                    );
                    try {
                      await switchChain({ chainId: 84532 });
                      // Wait a moment for the chain switch to complete
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                    } catch (error) {
                      console.error("Failed to switch chain:", error);
                      alert("Please switch to Base Sepolia testnet manually");
                      return;
                    }
                  }

                  setIsSubmitting(true);

                  try {
                    // Create a date string in Chile Standard Time
                    const dateTimeString = `${birthDate}T${birthTime}`;
                    const chileDate = new Date(dateTimeString);

                    // Chile Standard Time is UTC-3, convert to UTC
                    const utcTimestamp =
                      chileDate.getTime() + 3 * 60 * 60 * 1000;
                    const unixTimestamp = Math.floor(utcTimestamp / 1000);

                    // Prepare batch transaction calls
                    console.log("Chain and contract info:", {
                      chainId,
                      expectedChainId: 84532,
                      isCorrectChain: chainId === 84532,
                      USDC_ADDRESS,
                      RAFFLE_CONTRACT_ADDRESS,
                      isValidUSDC: /^0x[a-fA-F0-9]{40}$/.test(USDC_ADDRESS),
                      isValidRaffle: /^0x[a-fA-F0-9]{40}$/.test(
                        RAFFLE_CONTRACT_ADDRESS
                      ),
                    });

                    const calls = [
                      // Approve USDC spending
                      {
                        to: USDC_ADDRESS as `0x${string}`,
                        data: encodeFunctionData({
                          abi: ERC20_ABI,
                          functionName: "approve",
                          args: [RAFFLE_CONTRACT_ADDRESS, ENTRY_FEE],
                        }),
                      },
                      // Enter raffle with guess
                      {
                        to: RAFFLE_CONTRACT_ADDRESS as `0x${string}`,
                        data: encodeFunctionData({
                          abi: raffleContractABI,
                          functionName: "enterRaffleWithGuess",
                          args: [BigInt(unixTimestamp), BigInt(RAFFLE_NUMBER)],
                        }),
                      },
                    ];

                    console.log("Prepared calls:", calls);

                    // First, try a single USDC approval to test
                    console.log("Testing single USDC approval...");
                    try {
                      await writeContract({
                        address: USDC_ADDRESS as `0x${string}`,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [RAFFLE_CONTRACT_ADDRESS, ENTRY_FEE],
                      });
                      console.log("Single USDC approval successful");
                    } catch (error) {
                      console.error("Single USDC approval failed:", error);
                    }

                    // Send batch transaction
                    const result = await sendCalls({ calls });
                    console.log("Batch transaction result:", result);

                    // Update Supabase database
                    await updateSupabaseDatabase(
                      unixTimestamp,
                      address!,
                      16098, // Default FID for now
                      new Date(utcTimestamp).toISOString()
                    );

                    console.log("Guess submitted successfully:", {
                      birthDate,
                      birthTime,
                      chileDateTime: dateTimeString,
                      unixTimestamp,
                      utcTime: new Date(utcTimestamp).toISOString(),
                      userAddress: address,
                    });

                    setIsModalOpen(false);
                  } catch (error) {
                    console.error("Error submitting guess:", error);
                    alert("Failed to submit guess. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                  */

                  // TEMPORARY: Just close modal for now
                  setIsModalOpen(false);
                }}
                className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting
                  ? "Processing..."
                  : "Guess and Give $5 (Disabled)"}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

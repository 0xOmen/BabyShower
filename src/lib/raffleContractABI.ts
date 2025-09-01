export const raffleContractABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "uint256", name: "_protocolFee", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AddressNotAuthorized", type: "error" },
  { inputs: [], name: "BeneficiaryCannotBeZeroAddress", type: "error" },
  { inputs: [], name: "EntryFeeTooLow", type: "error" },
  { inputs: [], name: "GuessAlreadyEntered", type: "error" },
  { inputs: [], name: "GuessTimestampTooHigh", type: "error" },
  { inputs: [], name: "GuessTimestampTooLow", type: "error" },
  { inputs: [], name: "NoWinnerFound", type: "error" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "PayoutOverflow", type: "error" },
  { inputs: [], name: "PrizePoolIsZero", type: "error" },
  { inputs: [], name: "RaffleDoesNotExist", type: "error" },
  { inputs: [], name: "RaffleIsClosed", type: "error" },
  { inputs: [], name: "RaffleIsNotClosed", type: "error" },
  { inputs: [], name: "WinningTimestampAlreadySet", type: "error" },
  { inputs: [], name: "WinningTimestampTooHigh", type: "error" },
  { inputs: [], name: "WinningTimestampTooLow", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "BeneficiaryPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
    ],
    name: "RaffleClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
    ],
    name: "RaffleCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "entrant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guess",
        type: "uint256",
      },
    ],
    name: "RaffleEntered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "RaffleWon",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningTimestamp",
        type: "uint256",
      },
    ],
    name: "WinningTimestampSet",
    type: "event",
  },
  {
    inputs: [],
    name: "claimProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "closeRaffle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_beneficiary", type: "address" },
      { internalType: "uint256", name: "_entryFee", type: "uint256" },
    ],
    name: "createRaffle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "distributePrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "guess", type: "uint256" },
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "enterRaffleWithGuess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAccruedProtocolFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getBeneficiary",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getEntryFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
      { internalType: "uint256", name: "_guess", type: "uint256" },
    ],
    name: "getGuesses",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getIsRaffleOpen",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getPrizePool",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProtocolFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRaffleNumber",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getStartTimestamp",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTokenAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getWinner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
    ],
    name: "getWinningTimestamp",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
      { internalType: "uint256", name: "_winningTimestamp", type: "uint256" },
    ],
    name: "manuallyCloseRaffle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }],
    name: "roundDownToMinute",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "newProtocolFee", type: "uint256" },
    ],
    name: "setProtocolFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_raffleNumber", type: "uint256" },
      { internalType: "uint256", name: "_winningTimestamp", type: "uint256" },
    ],
    name: "setWinningTimestamp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Contract address on Base blockchain
export const RAFFLE_CONTRACT_ADDRESS =
  "0x0C8020F0F4D4fb6fe708B0ED91cc3BAd00D419A8" as const;

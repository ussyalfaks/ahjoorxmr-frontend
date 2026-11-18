import { z } from "zod";

const serverEnvSchema = z.object({});
const optionalEnv = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).default("testnet"),
    NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: optionalEnv(z.string().min(1)),
    NEXT_PUBLIC_STELLAR_NETWORK_LABEL: optionalEnv(z.string().min(1)),
    NEXT_PUBLIC_STELLAR_RPC_URL: optionalEnv(z.string().url()),
    NEXT_PUBLIC_STARKNET_RPC_URL: optionalEnv(z.string().url()),
    NEXT_PUBLIC_CIRCLE_CONTRACT_ID: optionalEnv(z.string().regex(/^C[A-Z2-7]{55}$/)),
    NEXT_PUBLIC_API_ADAPTER: z.enum(["mock", "http"]).default("mock"),
    NEXT_PUBLIC_API_URL: optionalEnv(z.string().url()),
    NEXT_PUBLIC_HEARTBEAT_URL: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).default("/")
    ),
    NEXT_PUBLIC_OFFRAMP_ENABLED: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_OFFRAMP_PARTNER: z.string().min(1).default("Bank transfer partner"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  })
  .superRefine((values, context) => {
    if (values.NEXT_PUBLIC_API_ADAPTER === "http" && !values.NEXT_PUBLIC_API_URL) {
      context.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_API_URL"],
        message: "is required when NEXT_PUBLIC_API_ADAPTER is set to http",
      });
    }
  });

const serverResult = serverEnvSchema.safeParse({});
const publicResult = publicEnvSchema.safeParse({
  NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
  NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  NEXT_PUBLIC_STELLAR_NETWORK_LABEL: process.env.NEXT_PUBLIC_STELLAR_NETWORK_LABEL,
  NEXT_PUBLIC_STELLAR_RPC_URL: process.env.NEXT_PUBLIC_STELLAR_RPC_URL,
  NEXT_PUBLIC_STARKNET_RPC_URL: process.env.NEXT_PUBLIC_STARKNET_RPC_URL,
  NEXT_PUBLIC_CIRCLE_CONTRACT_ID: process.env.NEXT_PUBLIC_CIRCLE_CONTRACT_ID,
  NEXT_PUBLIC_API_ADAPTER: process.env.NEXT_PUBLIC_API_ADAPTER,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_HEARTBEAT_URL: process.env.NEXT_PUBLIC_HEARTBEAT_URL,
  NEXT_PUBLIC_OFFRAMP_ENABLED: process.env.NEXT_PUBLIC_OFFRAMP_ENABLED,
  NEXT_PUBLIC_OFFRAMP_PARTNER: process.env.NEXT_PUBLIC_OFFRAMP_PARTNER,
  NODE_ENV: process.env.NODE_ENV,
});

if (!serverResult.success || !publicResult.success) {
  const issues = [
    ...(serverResult.success ? [] : serverResult.error.issues),
    ...(publicResult.success ? [] : publicResult.error.issues),
  ];
  const details = issues
    .map((issue) => `  - ${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const serverEnv = serverResult.data;

const parsedPublicEnv = publicResult.data;
const networkDefaults = {
  testnet: {
    label: "Testnet",
    passphrase: "Test SDF Network ; September 2015",
  },
  mainnet: {
    label: "Mainnet",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
} as const;

export const publicEnv = {
  stellarNetwork: parsedPublicEnv.NEXT_PUBLIC_STELLAR_NETWORK,
  stellarNetworkLabel:
    parsedPublicEnv.NEXT_PUBLIC_STELLAR_NETWORK_LABEL ??
    networkDefaults[parsedPublicEnv.NEXT_PUBLIC_STELLAR_NETWORK].label,
  stellarNetworkPassphrase:
    parsedPublicEnv.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
    networkDefaults[parsedPublicEnv.NEXT_PUBLIC_STELLAR_NETWORK].passphrase,
  stellarRpcUrl: parsedPublicEnv.NEXT_PUBLIC_STELLAR_RPC_URL,
  starknetRpcUrl: parsedPublicEnv.NEXT_PUBLIC_STARKNET_RPC_URL,
  circleContractId:
    parsedPublicEnv.NEXT_PUBLIC_CIRCLE_CONTRACT_ID ??
    "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  apiAdapter: parsedPublicEnv.NEXT_PUBLIC_API_ADAPTER,
  apiUrl: parsedPublicEnv.NEXT_PUBLIC_API_URL,
  heartbeatUrl: parsedPublicEnv.NEXT_PUBLIC_HEARTBEAT_URL,
  offrampEnabled: parsedPublicEnv.NEXT_PUBLIC_OFFRAMP_ENABLED === "true",
  offrampPartner: parsedPublicEnv.NEXT_PUBLIC_OFFRAMP_PARTNER,
};

export const isDevelopment = parsedPublicEnv.NODE_ENV === "development";
export const isProduction = parsedPublicEnv.NODE_ENV === "production";
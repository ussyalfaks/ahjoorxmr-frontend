// @vitest-environment node

import { describe, expect, it } from "vitest";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { publicEnv } from "@/lib/env";
import { mockAdapter } from "../mockAdapter";

describe("mock SEP-10 adapter", () => {
  it("provides a signable Stellar challenge and simulates a session token", async () => {
    const address = Keypair.random().publicKey();
    const challenge = await mockAdapter.getAuthChallenge(address);
    const transaction = TransactionBuilder.fromXDR(
      challenge.transaction,
      publicEnv.stellarNetworkPassphrase
    );

    expect(transaction.operations[0].type).toBe("manageData");

    const tokenResponse = await mockAdapter.exchangeAuthChallenge(challenge.transaction);
    expect(tokenResponse.token).toMatch(/^mock-/);
    expect(tokenResponse.expiresIn).toBe(3600);
  });
});

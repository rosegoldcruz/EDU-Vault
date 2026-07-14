"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: true });

export function AcademyProviders({
  appId,
  children,
}: {
  appId: string | null;
  children: React.ReactNode;
}) {
  if (!appId) return children;
  return (
    <PrivyProvider
      appId={appId}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || undefined}
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#d1ff75",
          walletChainType: "solana-only",
          walletList: [
            "phantom",
            "solflare",
            "backpack",
            "detected_solana_wallets",
            "wallet_connect_qr_solana",
          ],
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}

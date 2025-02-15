import "@/styles/globals.css";

import { SearchCommand } from "@/components/dashboard/search-command";
import { Toaster } from "@/components/ui/sonner";
import { Languages } from "@/lib/languages";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import type { ReactElement, ReactNode } from "react";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { WagmiConfig, createConfig } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const inter = Inter({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
	// session: Session | null;
	theme?: string;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

// 1. 获取 projectId
const projectId = "YOUR_PROJECT_ID"; // 从 WalletConnect 获取

// 2. 创建 wagmi 配置
const config = createConfig({
	chains: [mainnet],
	transports: {
		[mainnet.id]: http(),
	},
	connectors: [
		metaMask(),
		walletConnect({
			projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "", // 可选
		}),
	],
});

const MyApp = ({
	Component,
	pageProps: { ...pageProps },
}: AppPropsWithLayout) => {
	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<>
			<style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
			<Head>
				<title>TOM3 Console</title>
				<meta
					name="description"
					content="TOM3 Console - Your Modern Management Platform"
				/>
				<link rel="icon" href="/TomCoinLogoV2.svg" type="image/svg+xml" />
			</Head>
			{process.env.NEXT_PUBLIC_UMAMI_HOST &&
				process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
					<Script
						src={process.env.NEXT_PUBLIC_UMAMI_HOST}
						data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
					/>
				)}

			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
				forcedTheme={Component.theme}
			>
				<Toaster richColors />
				<SearchCommand />
				<WagmiConfig config={config}>
					{getLayout(<Component {...pageProps} />)}
				</WagmiConfig>
			</ThemeProvider>
		</>
	);
};

export default api.withTRPC(
	appWithTranslation(MyApp, {
		i18n: {
			defaultLocale: "en",
			locales: Object.values(Languages),
			localeDetection: false,
		},
		fallbackLng: "en",
		keySeparator: false,
	}),
);

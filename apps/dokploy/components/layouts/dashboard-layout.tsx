import Head from "next/head";
import { Navbar } from "./navbar";
import { NavigationTabs, type TabState } from "./navigation-tabs";

interface Props {
  children: React.ReactNode;
  tab: TabState;
  metaName?: string;
}

export const DashboardLayout = ({ children, tab, metaName }: Props) => {
  return (
    <>
      <Head>
        <title>
          {metaName ? `${metaName} | TOM3 Network` : "TOM3 Network"}
        </title>
      </Head>
      <div>
        <div
          className="relative flex min-h-screen w-full flex-col bg-gradient-to-b from-background to-background/80"
          id="app-container"
        >
          <Navbar />
          <main className="pt-8 flex w-full flex-col items-center">
            <div className="w-full max-w-8xl px-4 lg:px-8">
              <NavigationTabs tab={tab}>{children}</NavigationTabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

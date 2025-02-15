import { Login2FA } from "@/components/auth/login-2fa";
import { OnboardingLayout } from "@/components/layouts/onboarding-layout";
import { AlertBlock } from "@/components/shared/alert-block";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { IS_CLOUD, isAdminPresent, validateRequest } from "@dokploy/server";
import { zodResolver } from "@hookform/resolvers/zod";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Email must be a valid email",
    }),

  password: z
    .string()
    .min(1, {
      message: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters",
    }),
});

type Login = z.infer<typeof loginSchema>;

type AuthResponse = {
  is2FAEnabled: boolean;
  authId: string;
};

interface Props {
  IS_CLOUD: boolean;
}
export default function Home({ IS_CLOUD }: Props) {
  const [temp, setTemp] = useState<AuthResponse>({
    is2FAEnabled: false,
    authId: "",
  });
  const { mutateAsync, isLoading, error, isError } =
    api.auth.login.useMutation();
  const router = useRouter();
  const form = useForm<Login>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });
  const { connectAsync } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    form.reset();
  }, [form, form.reset, form.formState.isSubmitSuccessful]);

  const handleConnect = async () => {
    try {
      await connectAsync({
        connector: injected(),
      });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleWalletLogin = async () => {
    if (!address) return;

    const walletEmail = `${address.toLowerCase()}@wallet.eth`;
    const walletPassword = address.slice(-8);

    await mutateAsync({
      email: walletEmail,
      password: walletPassword,
    })
      .then((data) => {
        if (data.is2FAEnabled) {
          setTemp(data);
        } else {
          toast.success("Sign in successfully", {
            duration: 2000,
          });
          router.push("/dashboard/projects");
        }
      })
      .catch(() => {
        toast.error("Sign in failed", {
          duration: 2000,
        });
      });
  };

  const onSubmit = async (values: Login) => {
    await mutateAsync({
      email: values.email,
      password: values.password,
    })
      .then((data) => {
        if (data.is2FAEnabled) {
          setTemp(data);
        } else {
          toast.success("Signin succesfully", {
            duration: 2000,
          });
          router.push("/dashboard/projects");
        }
      })
      .catch(() => {
        toast.error("Signin failed", {
          duration: 2000,
        });
      });
  };
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background/70 antialiased">
      <BackgroundBeams />

      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center gap-6 w-full z-10 px-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="flex flex-col items-center gap-2"
        >
          <div className="relative">
            <Image
              src="/TomCoinLogoV2.svg"
              alt="TOM3 Logo"
              width={48}
              height={48}
              priority
              className="drop-shadow-lg"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
            />
          </div>
          <span className="font-medium text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400">
            TOM3 Console
          </span>
        </motion.div>

        <div className="space-y-2 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground max-w-sm mx-auto"
          >
            Your gateway to seamless blockchain interactions and decentralized
            management
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-background/50 border border-primary/10 shadow-lg">
            <CardContent className="pt-6">
              {!temp.is2FAEnabled ? (
                <div className="flex flex-col gap-4">
                  {!isConnected ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleConnect}
                        variant="outline"
                        className="w-full relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Sparkles className="mr-2 h-4 w-4" />
                        Connect Wallet to Sign in
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Connected: {address?.slice(0, 6)}...
                          {address?.slice(-4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnect()}
                        >
                          Disconnect
                        </Button>
                      </div>
                      <Button onClick={handleWalletLogin} className="w-full">
                        Sign in with Wallet
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="grid gap-4"
                      autoComplete="off"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Email"
                                  autoComplete="off"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Password"
                                  autoComplete="new-password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          isLoading={isLoading}
                          className="w-full"
                        >
                          Login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <Login2FA authId={temp.authId} />
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create one now
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

Home.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (IS_CLOUD) {
    try {
      const { user } = await validateRequest(context.req, context.res);

      if (user) {
        return {
          redirect: {
            permanent: true,
            destination: "/dashboard/projects",
          },
        };
      }
    } catch (error) {}

    return {
      props: {
        IS_CLOUD: IS_CLOUD,
      },
    };
  }
  const hasAdmin = await isAdminPresent();

  if (!hasAdmin) {
    return {
      redirect: {
        permanent: true,
        destination: "/register",
      },
    };
  }

  const { user } = await validateRequest(context.req, context.res);

  if (user) {
    return {
      redirect: {
        permanent: true,
        destination: "/dashboard/projects",
      },
    };
  }

  return {
    props: {
      hasAdmin,
    },
  };
}

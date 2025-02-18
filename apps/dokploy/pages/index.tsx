import { Login2FA } from "@/components/auth/login-2fa";
import { OnboardingLayout } from "@/components/layouts/onboarding-layout";
import { AlertBlock } from "@/components/shared/alert-block";
import { Logo } from "@/components/shared/logo";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { FAQSection } from "@/components/ui/faq-section";
import { FeatureCard } from "@/components/ui/feature-card";
import { FloatingElements } from "@/components/ui/floating-elements";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";
import { TextScramble } from "@/components/ui/text-scramble";
import { api } from "@/utils/api";
import { IS_CLOUD, isAdminPresent, validateRequest } from "@dokploy/server";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Shield, Workflow, Zap } from "lucide-react";
import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { z } from "zod";

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
    <div className="relative min-h-screen w-full overflow-hidden bg-background/70 antialiased">
      <BackgroundBeams />
      <FloatingElements />

      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start container mx-auto px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="flex flex-col items-center gap-2 pt-16 mb-8"
        >
          <div className="relative group">
            <Image
              src="/TomCoinLogoV2.svg"
              alt="TOM3 Logo"
              width={64}
              height={64}
              priority
              className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <span className="font-medium text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400">
              TOM3 Network
            </span>
          </motion.div>
        </motion.div>

        <div className="space-y-4 text-center max-w-2xl mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          >
            The Future of Web3
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
          >
            Experience the next generation of blockchain interaction. Seamlessly
            manage your digital assets with enterprise-grade security and
            intuitive controls.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 justify-center pt-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              <span>1000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: 0.5,
                }}
                className="w-2 h-2 rounded-full bg-blue-500"
              />
              <span>99.9% Uptime</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mb-12"
        >
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Enterprise Security"
            description="Bank-grade security protocols and multi-layer protection for your digital assets"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Lightning Fast"
            description="Optimized performance with sub-second transaction processing"
          />
          <FeatureCard
            icon={<Workflow className="w-8 h-8" />}
            title="Smart Automation"
            description="Powerful workflow automation tools to streamline your operations"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-4xl mx-auto px-4 mb-12"
        >
          <p className="text-center text-sm text-muted-foreground mb-6">
            TRUSTED BY INDUSTRY LEADERS
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <div className="h-8 w-24 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-8 w-24 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-8 w-24 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-8 w-24 bg-muted/20 rounded-md animate-pulse" />
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 py-8 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <h3 className="text-4xl font-bold text-primary">5ms</h3>
            <p className="text-sm text-muted-foreground">Response Time</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <h3 className="text-4xl font-bold text-primary">24/7</h3>
            <p className="text-sm text-muted-foreground">Support</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-2"
          >
            <h3 className="text-4xl font-bold text-primary">99.9%</h3>
            <p className="text-sm text-muted-foreground">Uptime</p>
          </motion.div>
        </div>

        {/* Testimonials */}
        <div className="w-full py-16 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-muted-foreground">
              See what our users have to say
            </p>
          </div>
          <TestimonialCarousel />
        </div>

        {/* FAQ Section */}
        <div className="w-full py-16 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about TOM3 Network
            </p>
          </div>
          <FAQSection />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md relative mb-16"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />

          <Card className="relative backdrop-blur-sm bg-background/95 border-0 shadow-2xl">
            <CardContent className="p-6">
              {!temp.is2FAEnabled ? (
                <div className="flex flex-col gap-6">
                  {!isConnected ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      <Button
                        onClick={handleConnect}
                        variant="outline"
                        className="w-full relative h-12 overflow-hidden group bg-background/50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center justify-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="font-medium">
                            Connect Wallet to Sign in
                          </span>
                        </div>
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm font-medium">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnect()}
                          className="h-8 px-3 text-muted-foreground hover:text-foreground"
                        >
                          Disconnect
                        </Button>
                      </div>
                      <Button
                        onClick={handleWalletLogin}
                        className="w-full h-12 font-medium"
                      >
                        Sign in with Wallet
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                      autoComplete="off"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="name@example.com"
                                className="h-12"
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
                            <FormLabel className="text-muted-foreground">
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="h-12"
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
                        className="w-full h-12 font-medium mt-2"
                      >
                        Sign in
                      </Button>
                    </form>
                  </Form>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                      >
                        Create one now
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <Login2FA authId={temp.authId} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
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

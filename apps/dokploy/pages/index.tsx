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
    <div className="flex  h-screen w-full items-center justify-center ">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex flex-row items-center gap-2">
          <Image
            src="/TomCoinLogoV2.svg"
            alt="TOM3 Logo"
            width={32}
            height={32}
            priority
          />
          <span className="font-medium text-sm">TOM3 Console</span>
        </div>
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
        <Card className="mx-auto w-full max-w-lg bg-transparent ">
          <div className="p-3.5" />
          {isError && (
            <AlertBlock type="error" className="mx-4 my-2">
              <span>{error?.message}</span>
            </AlertBlock>
          )}

          <CardContent>
            {!temp.is2FAEnabled ? (
              <div className="flex flex-col gap-4">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    className="w-full"
                  >
                    Connect Wallet to Sign in
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
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
                  >
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email" {...field} />
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

            <div className="flex flex-row justify-between flex-wrap">
              <div className="mt-4 text-center text-sm flex flex-row justify-center gap-2">
                {true && (
                  <Link
                    className="hover:underline text-muted-foreground"
                    href="/register"
                  >
                    Create an account
                  </Link>
                )}
              </div>

              {/* <div className="mt-4 text-sm flex flex-row justify-center gap-2">
								{IS_CLOUD ? (
									<Link
										className="hover:underline text-muted-foreground"
										href="/send-reset-password"
									>
										Lost your password?
									</Link>
								) : (
									<Link
										className="hover:underline text-muted-foreground"
										href="https://docs.dokploy.com/docs/core/reset-password"
										target="_blank"
									>
										Lost your password?
									</Link>
								)}
							</div> */}
            </div>
            <div className="p-2" />
          </CardContent>
        </Card>
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

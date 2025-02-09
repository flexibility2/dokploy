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
import { AlertTriangle } from "lucide-react";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

const registerSchema = z
  .object({
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
      .refine((password) => password === "" || password.length >= 8, {
        message: "Password must be at least 8 characters",
      }),
    confirmPassword: z
      .string()
      .min(1, {
        message: "Password is required",
      })
      .refine(
        (confirmPassword) =>
          confirmPassword === "" || confirmPassword.length >= 8,
        {
          message: "Password must be at least 8 characters",
        }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Register = z.infer<typeof registerSchema>;

interface Props {
  hasAdmin: boolean;
  isCloud: boolean;
}

const Register = ({ isCloud }: Props) => {
  const router = useRouter();
  const { mutateAsync, error, isError, data } =
    api.auth.createAdmin.useMutation();
  const { connectAsync } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const form = useForm<Register>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    form.reset();
  }, [form, form.reset, form.formState.isSubmitSuccessful]);

  const handleWalletRegister = async () => {
    if (!address) return;

    const walletEmail = `${address.toLowerCase()}@wallet.eth`;
    const walletPassword = address.slice(-8);

    await mutateAsync({
      email: walletEmail,
      password: walletPassword,
    })
      .then(() => {
        toast.success("Wallet registration successful", {
          duration: 2000,
        });
        if (!isCloud) {
          router.push("/");
        }
      })
      .catch((e) => e);
  };

  const onSubmit = async (values: Register) => {
    await mutateAsync({
      email: values.email.toLowerCase(),
      password: values.password,
    })
      .then(() => {
        toast.success("User registration succesfuly", {
          duration: 2000,
        });
        if (!isCloud) {
          router.push("/");
        }
      })
      .catch((e) => e);
  };

  const handleConnect = async () => {
    try {
      await connectAsync({
        connector: injected(),
      });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <div>
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

          <CardTitle className="text-2xl font-bold">{"Sign up"}</CardTitle>
          <CardDescription>
            Enter your email and password to {"Sign up"}
          </CardDescription>
          <Card className="mx-auto w-full max-w-lg bg-transparent">
            <div className="p-3" />
            {isError && (
              <div className="mx-5 my-2 flex flex-row items-center gap-2 rounded-lg bg-red-50 p-2 dark:bg-red-950">
                <AlertTriangle className="text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  {error?.message}
                </span>
              </div>
            )}
            {data?.type === "cloud" && (
              <AlertBlock type="success" className="mx-4 my-2">
                <span>
                  Registration succesfuly, Please check your inbox or spam
                  folder to confirm your account.
                </span>
              </AlertBlock>
            )}
            <CardContent>
              <div className="flex flex-col gap-4">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    className="w-full"
                  >
                    Connect Wallet to Register
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
                    <Button onClick={handleWalletRegister} className="w-full">
                      Register with Wallet
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
                              <Input placeholder="email@tom3.com" {...field} />
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

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
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
                        isLoading={form.formState.isSubmitting}
                        className="w-full"
                      >
                        Register
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              <div className="flex flex-row justify-between flex-wrap">
                {true && (
                  <div className="mt-4 text-center text-sm flex gap-2">
                    Already have account?
                    <Link className="underline" href="/">
                      Sign in
                    </Link>
                  </div>
                )}

                {/* <div className="mt-4 text-center text-sm flex flex-row justify-center gap-2">
									Need help?
									<Link
										className="underline"
										href=""
										target="_blank"
									>
										Contact us
									</Link>
								</div> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (true) {
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
        isCloud: IS_CLOUD,
      },
    };
  }
  // const hasAdmin = await isAdminPresent();

  // if (hasAdmin) {
  // 	return {
  // 		redirect: {
  // 			permanent: false,
  // 			destination: "/",
  // 		},
  // 	};
  // }
  // return {
  // 	props: {
  // 		isCloud: false,
  // 	},
  // };
}

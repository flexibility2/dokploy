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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { z } from "zod";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { FloatingElements } from "@/components/ui/floating-elements";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
				},
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

		try {
			await mutateAsync({
				email: walletEmail,
				password: walletPassword,
			});
			
			toast.success("Wallet registration successful", {
				duration: 2000,
			});
			
			if (!isCloud) {
				router.push("/");
			}
		} catch (error: any) {
			toast.error(error?.message || "Wallet registration failed", {
				duration: 2000,
			});
		}
	};

	const onSubmit = async (values: Register) => {
		try {
			await mutateAsync({
				email: values.email.toLowerCase(),
				password: values.password,
			});
			
			toast.success("User registration successful", {
				duration: 2000,
			});
			
			if (!isCloud) {
				router.push("/");
			}
		} catch (error: any) {
			toast.error(error?.message || "Registration failed", {
				duration: 2000,
			});
		}
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

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="text-center space-y-4 mb-12"
				>
					<h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
						Create Your Account
					</h1>
					<p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
						Join thousands of developers and teams building the future of Web3
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="w-full max-w-md relative mb-16"
				>
					<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
					
					<Card className="relative backdrop-blur-sm bg-background/95 border-0 shadow-2xl">
						<CardContent className="p-6">
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
												<span className="font-medium">Connect Wallet to Register</span>
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
										<Button onClick={handleWalletRegister} className="w-full h-12 font-medium">
											Register with Wallet
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

								{isError && (
									<AlertBlock
										type="error"
										className="mx-4 my-2"
									>
										<span>{error?.message || "Failed to register. Please try again."}</span>
									</AlertBlock>
								)}

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
													<FormLabel className="text-muted-foreground">Email</FormLabel>
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
													<FormLabel className="text-muted-foreground">Password</FormLabel>
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
										<FormField
											control={form.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-muted-foreground">Confirm Password</FormLabel>
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
											isLoading={form.formState.isSubmitting}
											className="w-full h-12 font-medium mt-2"
										>
											Create Account
										</Button>
									</form>
								</Form>

								<div className="text-center">
									<p className="text-sm text-muted-foreground">
										Already have an account?{" "}
										<Link
											href="/"
											className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
										>
											Sign in
										</Link>
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
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

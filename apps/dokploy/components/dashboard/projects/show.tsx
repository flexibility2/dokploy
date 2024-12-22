import { DateTooltip } from "@/components/shared/date-tooltip";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import {
	AlertTriangle,
	BookIcon,
	ExternalLink,
	ExternalLinkIcon,
	FolderInput,
	MoreHorizontalIcon,
	TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { toast } from "sonner";
import { ProjectEnviroment } from "./project-enviroment";
import { UpdateProject } from "./update";

export const ShowProjects = () => {
	const utils = api.useUtils();
	const { data } = api.project.all.useQuery();
	const { data: auth } = api.auth.get.useQuery();
	const { data: user } = api.user.byAuthId.useQuery(
		{
			authId: auth?.id || "",
		},
		{
			enabled: !!auth?.id && auth?.rol === "user",
		},
	);
	const { mutateAsync } = api.project.remove.useMutation();

	return (
		<>
			{data?.length === 0 && (
				<div className="mt-6 flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
					<FolderInput className="size-10 md:size-28 text-muted-foreground" />
					<span className="text-center font-medium text-muted-foreground">
						No projects added yet. Click on Create project.
					</span>
				</div>
			)}
			<div className="mt-6 w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
				{data?.map((project) => {
					const emptyServices =
						project?.mariadb.length === 0 &&
						project?.mongo.length === 0 &&
						project?.mysql.length === 0 &&
						project?.postgres.length === 0 &&
						project?.redis.length === 0 &&
						project?.applications.length === 0 &&
						project?.compose.length === 0;

					const totalServices =
						project?.mariadb.length +
						project?.mongo.length +
						project?.mysql.length +
						project?.postgres.length +
						project?.redis.length +
						project?.applications.length +
						project?.compose.length;

					const flattedDomains = [
						...project.applications.flatMap((a) => a.domains),
						...project.compose.flatMap((a) => a.domains),
					];

					const renderDomainsDropdown = (
						item: typeof project.compose | typeof project.applications,
					) =>
						item[0] ? (
							<DropdownMenuGroup>
								<DropdownMenuLabel>
									{"applicationId" in item[0] ? "Applications" : "Compose"}
								</DropdownMenuLabel>
								{item.map((a) => (
									<Fragment
										key={"applicationId" in a ? a.applicationId : a.composeId}
									>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuLabel className="font-normal capitalize text-xs ">
												{a.name}
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											{a.domains.map((domain) => (
												<DropdownMenuItem key={domain.domainId} asChild>
													<Link
														className="space-x-4 text-xs cursor-pointer justify-between"
														target="_blank"
														href={`${domain.https ? "https" : "http"}://${
															domain.host
														}${domain.path}`}
													>
														<span>{domain.host}</span>
														<ExternalLink className="size-4 shrink-0" />
													</Link>
												</DropdownMenuItem>
											))}
										</DropdownMenuGroup>
									</Fragment>
								))}
							</DropdownMenuGroup>
						) : null;

					return (
						<Link
							key={project.projectId}
							href={`/dashboard/project/${project.projectId}`}
							className="group relative cursor-pointer overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-lg hover:-translate-y-1 duration-300 border border-border/50 hover:border-border"
						>
							<Card className="border-0 bg-transparent">
								<CardHeader>
									<CardTitle>
										<div className="flex items-start justify-between gap-4">
											<div className="flex flex-col gap-2.5 min-w-0">
												<div className="flex items-center gap-2">
													<BookIcon className="size-4 text-primary/70" />
													<span className="text-base font-semibold leading-none truncate">
														{project.name}
													</span>
												</div>
												{project.description && (
													<span className="text-sm text-muted-foreground line-clamp-2">
														{project.description}
													</span>
												)}
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<span>
														{totalServices}{" "}
														{totalServices === 1 ? "service" : "services"}
													</span>
													<span>•</span>
													<DateTooltip date={project.createdAt}>
														Created
													</DateTooltip>
												</div>
											</div>

											<div
												onClick={(e) => e.stopPropagation()}
												className="shrink-0"
											>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="size-8 opacity-50 hover:opacity-100"
														>
															<MoreHorizontalIcon className="size-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className="w-[200px] space-y-2">
														<DropdownMenuLabel className="font-normal">
															Actions
														</DropdownMenuLabel>
														<div onClick={(e) => e.stopPropagation()}>
															<ProjectEnviroment
																projectId={project.projectId}
															/>
														</div>
														<div onClick={(e) => e.stopPropagation()}>
															<UpdateProject projectId={project.projectId} />
														</div>
														<div onClick={(e) => e.stopPropagation()}>
															{(auth?.rol === "admin" ||
																user?.canDeleteProjects) && (
																<AlertDialog>
																	<AlertDialogTrigger className="w-full">
																		<DropdownMenuItem
																			className="w-full cursor-pointer  space-x-3"
																			onSelect={(e) => e.preventDefault()}
																		>
																			<TrashIcon className="size-4" />
																			<span>Delete</span>
																		</DropdownMenuItem>
																	</AlertDialogTrigger>
																	<AlertDialogContent>
																		<AlertDialogHeader>
																			<AlertDialogTitle>
																				Are you sure to delete this project?
																			</AlertDialogTitle>
																			{!emptyServices ? (
																				<div className="flex flex-row gap-4 rounded-lg bg-yellow-50 p-2 dark:bg-yellow-950">
																					<AlertTriangle className="text-yellow-600 dark:text-yellow-400" />
																					<span className="text-sm text-yellow-600 dark:text-yellow-400">
																						You have active services, please
																						delete them first
																					</span>
																				</div>
																			) : (
																				<AlertDialogDescription>
																					This action cannot be undone
																				</AlertDialogDescription>
																			)}
																		</AlertDialogHeader>
																		<AlertDialogFooter>
																			<AlertDialogCancel>
																				Cancel
																			</AlertDialogCancel>
																			<AlertDialogAction
																				disabled={!emptyServices}
																				onClick={async () => {
																					await mutateAsync({
																						projectId: project.projectId,
																					})
																						.then(() => {
																							toast.success(
																								"Project delete succesfully",
																							);
																						})
																						.catch(() => {
																							toast.error(
																								"Error to delete this project",
																							);
																						})
																						.finally(() => {
																							utils.project.all.invalidate();
																						});
																				}}
																			>
																				Delete
																			</AlertDialogAction>
																		</AlertDialogFooter>
																	</AlertDialogContent>
																</AlertDialog>
															)}
														</div>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									</CardTitle>
								</CardHeader>

								<div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

								{flattedDomains.length > 0 && (
									<div className="absolute top-2 right-2">
										<div className="size-2 rounded-full bg-primary/50" />
									</div>
								)}
							</Card>
						</Link>
					);
				})}
			</div>
		</>
	);
};

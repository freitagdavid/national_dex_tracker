import { Fragment } from "react";
import { Box } from "@/components/ui/box";
import { Skeleton } from "@/components/ui/skeleton";

const shim = "bg-black/20 dark:bg-white/25";

/** Mirrors loaded modal body layout so height stays stable while the detail query runs. */
export function PokemonInfoModalBodySkeleton({ pillBg }: { pillBg: string }) {
	return (
		<Box className="flex-col gap-4">
			<Box className="flex-col items-center gap-3 sm:flex-row sm:items-start">
				<Skeleton className={`h-36 w-36 shrink-0 rounded-2xl ${shim}`} />
				<Box className="min-w-0 flex-1 gap-2">
					<Box className="flex-row flex-wrap gap-2">
						<Skeleton className={`h-6 w-16 rounded-full ${shim}`} />
						<Skeleton className={`h-6 w-20 rounded-full ${shim}`} />
					</Box>
					<Box className="flex-row flex-wrap gap-x-3 gap-y-2">
						{Array.from({ length: 10 }, (_, i) => (
							<Fragment key={i}>
								<Skeleton className={`h-4 w-24 ${shim}`} />
								<Skeleton className={`h-4 w-12 ${shim}`} />
							</Fragment>
						))}
					</Box>
				</Box>
			</Box>

			<Box
				className="gap-2 rounded-xl px-3 py-3"
				style={{ backgroundColor: pillBg }}
			>
				<Skeleton className={`h-4 w-28 ${shim}`} />
				<Box className="gap-2">
					<Skeleton className={`h-3 w-full ${shim}`} />
					<Skeleton className={`h-3 w-full ${shim}`} />
					<Skeleton className={`h-3 w-[92%] ${shim}`} />
				</Box>
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-14 ${shim}`} />
				<Skeleton className={`h-9 w-full max-w-md rounded-md ${shim}`} />
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-40 ${shim}`} />
				<Box className="flex-row flex-wrap gap-x-3 gap-y-2">
					{Array.from({ length: 3 }, (_, i) => (
						<Fragment key={i}>
							<Skeleton className={`h-4 w-16 ${shim}`} />
							<Skeleton className={`h-4 w-24 ${shim}`} />
						</Fragment>
					))}
				</Box>
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-24 ${shim}`} />
				<Skeleton className={`h-4 w-48 max-w-full ${shim}`} />
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-24 ${shim}`} />
				<Box className="flex-row flex-wrap gap-2">
					<Skeleton className={`h-7 w-20 rounded-full ${shim}`} />
					<Skeleton className={`h-7 w-24 rounded-full ${shim}`} />
					<Skeleton className={`h-7 w-28 rounded-full ${shim}`} />
				</Box>
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-36 ${shim}`} />
				<Box className="gap-2">
					{Array.from({ length: 4 }, (_, i) => (
						<Skeleton key={i} className={`h-4 w-full max-w-lg ${shim}`} />
					))}
				</Box>
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-48 ${shim}`} />
				<Box className="gap-3">
					{Array.from({ length: 3 }, (_, i) => (
						<Box key={i} className="gap-1.5">
							<Skeleton className={`h-3.5 w-48 max-w-full ${shim}`} />
							<Skeleton className={`h-3 w-full max-w-md ${shim}`} />
							<Skeleton className={`h-3 w-[85%] max-w-sm ${shim}`} />
						</Box>
					))}
				</Box>
			</Box>

			<Box className="gap-2">
				<Skeleton className={`h-4 w-24 ${shim}`} />
				<Box className="gap-2">
					{Array.from({ length: 6 }, (_, i) => (
						<Box key={i} className="flex-row items-center gap-2">
							<Skeleton className={`h-4 w-28 shrink-0 ${shim}`} />
							<Skeleton className={`h-2 min-w-0 flex-1 rounded-full ${shim}`} />
							<Skeleton className={`h-4 w-8 shrink-0 ${shim}`} />
						</Box>
					))}
				</Box>
				<Skeleton className={`h-3 w-56 ${shim}`} />
			</Box>

			<Box className="flex-row flex-wrap gap-2 pt-1">
				<Skeleton className={`h-9 w-40 rounded-md ${shim}`} />
			</Box>
		</Box>
	);
}

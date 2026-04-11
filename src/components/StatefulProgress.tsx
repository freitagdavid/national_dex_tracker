import { useSelector } from "@legendapp/state/react";
import { app } from "@/state";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";

export const StatefuleProgress = ({
	numPokemon,
	className,
	fillClassName,
}: {
	numPokemon: number;
	className?: string;
	/** Filled portion */
	fillClassName?: string;
}) => {
	const caught = useSelector(() => app.caughtCount.get());
	const percentCaught = numPokemon > 0 ? (caught / numPokemon) * 100 : 0;

	return (
		<Progress value={percentCaught} className={className ?? "h-8 w-full"}>
			<ProgressFilledTrack
				className={fillClassName ?? "bg-green-500"}
			/>
		</Progress>
	);
};

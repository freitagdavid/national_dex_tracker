import { useSelector } from "@legendapp/state/react";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { app, type Pokemon } from "@/state";
import { PokemonCard } from "./PokemonCard";
import { Box as GBox } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";

export const Box = ({ box, boxNum }: { box: Pokemon[]; boxNum: number }) => {
	const caught = useSelector(() => app.state.ui.boxCaught[boxNum].get() ?? 0);
	const caughtPercent = (caught / 30) * 100;
	const [isOpen, setIsOpen] = useState(true);

	return (
		<Card className="mb-8 mt-8 w-[92%] max-w-[76rem] overflow-hidden p-0 shadow-md">
			<Pressable onPress={() => setIsOpen(!isOpen)}>
				<GBox className="w-full bg-accent pb-0">
					<GBox className="relative flex h-14 w-full flex-row items-center justify-center">
						<Text className="text-center text-base font-medium text-primary">
							Box {boxNum + 1}
						</Text>
						<GBox className="absolute right-2 h-10 w-10 items-center justify-center">
							<MaterialIcons
								name="expand-less"
								size={22}
								color="#333"
								style={{
									transform: [{ rotate: isOpen ? "0deg" : "180deg" }],
								}}
							/>
						</GBox>
					</GBox>
					<GBox className="h-4 w-full p-0">
						<Progress
							value={caughtPercent}
							className="m-0 h-4 w-full rounded-none bg-red-600 p-0"
						>
							<ProgressFilledTrack className="bg-green-500" />
						</Progress>
					</GBox>
				</GBox>
			</Pressable>
			{isOpen ? (
				<GBox className="flex-row flex-wrap justify-evenly py-2">
					{box.map((poke) => (
						<PokemonCard poke={poke} key={poke.id} boxNum={boxNum} />
					))}
				</GBox>
			) : null}
		</Card>
	);
};

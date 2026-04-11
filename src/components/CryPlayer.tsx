import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Platform, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

/** Web: native `<audio controls>`. Native: play / pause via expo-audio. */
export function CryPlayer({ src }: { src: string }) {
	if (Platform.OS === "web") {
		return (
			<audio
				key={src}
				controls
				style={{ height: 36, width: "100%", maxWidth: 448 }}
				src={src}
			/>
		);
	}

	return <CryPlayerNative key={src} src={src} />;
}

function CryPlayerNative({ src }: { src: string }) {
	const player = useAudioPlayer(src);
	const status = useAudioPlayerStatus(player);

	return (
		<View className="flex-row items-center gap-3 py-1">
			<Pressable
				className="rounded-md bg-primary px-4 py-2"
				onPress={() => {
					if (status.playing) player.pause();
					else player.play();
				}}
			>
				<Text className="text-sm text-primary-foreground">
					{status.playing ? "Pause cry" : "Play cry"}
				</Text>
			</Pressable>
		</View>
	);
}

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { GraphqlQuerySync } from "./GraphqlQuerySync";
import { queryClient } from "./queryClient";

export const Provider = ({ children }: { children: ReactNode }) => {
	return (
		<SafeAreaProvider>
			<GluestackUIProvider>
				<QueryClientProvider client={queryClient}>
					<GraphqlQuerySync>{children}</GraphqlQuerySync>
				</QueryClientProvider>
			</GluestackUIProvider>
		</SafeAreaProvider>
	);
};

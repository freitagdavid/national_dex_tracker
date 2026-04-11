import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

type NavDrawerContextValue = {
	open: boolean;
	setOpen: (open: boolean) => void;
	toggle: () => void;
	close: () => void;
};

const NavDrawerContext = createContext<NavDrawerContextValue | null>(null);

export function NavDrawerProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	const toggle = useCallback(() => setOpen((o) => !o), []);

	const value = useMemo(
		() => ({ open, setOpen, toggle, close }),
		[open, close, toggle],
	);

	return (
		<NavDrawerContext.Provider value={value}>{children}</NavDrawerContext.Provider>
	);
}

export function useNavDrawer() {
	const ctx = useContext(NavDrawerContext);
	if (!ctx) {
		throw new Error("useNavDrawer must be used within NavDrawerProvider");
	}
	return ctx;
}

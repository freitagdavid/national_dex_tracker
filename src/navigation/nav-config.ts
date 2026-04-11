export type NavItem = {
	href: string;
	label: string;
};

/** Single source for drawer + desktop navbar links. */
export const NAV_ITEMS: NavItem[] = [
	{ href: "/", label: "Pokédex" },
	{ href: "/moves", label: "Moves" },
	{ href: "/abilities", label: "Abilities" },
	{ href: "/items", label: "Items" },
	{ href: "/locations", label: "Locations" },
];

/** Viewport width (dp / CSS px) at or above this uses the top navbar instead of the hamburger menu. */
export const DESKTOP_BREAKPOINT = 900;

export function pathActive(pathname: string, href: string) {
	if (href === "/") {
		return pathname === "/" || pathname === "";
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}

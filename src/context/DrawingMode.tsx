import { createContext, useContext } from "react";

export const DrawingModeContext = createContext<{ current: boolean } | null>(null);

export function useDrawingModeRef() {
	const ctx = useContext(DrawingModeContext);
	if (!ctx) throw new Error("useDrawingModeRef must be used within provider");
	return ctx;
}

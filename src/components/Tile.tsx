import { memo, useEffect, useRef, useState } from "react";
import { useDrawingModeRef } from "../context/DrawingMode";

function Tile({ x, y, isExplorer }: { x: number; y: number; isExplorer: boolean }) {
	const inDrawingModeRef = useDrawingModeRef();
	const [pressed, setPressed] = useState(false);

	const renderCount = useRef(0);
	renderCount.current += 1;

	useEffect(() => {
		console.log(`Tile (${x}, ${y}) rendered ${renderCount.current} times`);
	});

	return (
		<div
			className={`flex items-center justify-center border border-gray-300 text-xs cursor-pointer select-none ${
				pressed ? "bg-gray-500" : ""
			} ${isExplorer ? "bg-red-500" : ""}`}
			onClick={() => setPressed(true)}
			onMouseEnter={() => {
				if (inDrawingModeRef.current) {
					setPressed((p) => !p);
				}
			}}
		>
			({x},{y})
		</div>
	);
}

export default memo(Tile);

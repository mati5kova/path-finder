import { memo, useEffect, useRef } from "react";

function Tile({
	x,
	y,
	isExplorer,
	pressed,
	inPath,
	toggleCell,
	isDestination,
}: {
	x: number;
	y: number;
	isExplorer: boolean;
	pressed: boolean;
	inPath: boolean;
	toggleCell: (x: number, y: number) => void;
	isDestination: boolean;
}) {
	const renderCount = useRef(0);
	renderCount.current += 1;
	useEffect(() => {
		console.log(`Tile (${x}, ${y}) rendered ${renderCount.current} times`);
	});
	return (
		<div
			className={`flex items-center justify-center text-xs cursor-pointer select-none ${
				pressed ? "bg-gray-500" : ""
			} ${isExplorer ? "bg-red-500" : ""}${inPath ? "bg-green-500" : ""}`}
			style={
				isDestination
					? {
							background: `repeating-conic-gradient(#000000 0 25%, #0000 0 50%) 
                           50% / 20px 20px`,
					  }
					: {
							boxShadow: "inset 0 0 0 1px #d1d5db",
					  }
			}
			onPointerDown={(e) => {
				e.preventDefault();
				toggleCell(x, y);
			}}
			onPointerEnter={(e) => {
				if ((e.buttons & 1) === 1) {
					toggleCell(x, y);
				}
			}}
		></div>
	);
}

export default memo(
	Tile,
	(a, b) =>
		a.inPath === b.inPath &&
		a.pressed === b.pressed &&
		a.isExplorer === b.isExplorer &&
		a.isDestination === b.isDestination
);

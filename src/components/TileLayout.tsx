import { memo, useEffect, useRef, useState } from "react";
import { DrawingModeContext } from "../context/DrawingMode";
import Tile from "./Tile";

function TileLayout({ tileSize }: { tileSize: number }) {
	const [inDrawingMode, setInDrawingMode] = useState(false);
	const inDrawingModeRef = useRef(inDrawingMode);

	useEffect(() => {
		inDrawingModeRef.current = inDrawingMode;
	}, [inDrawingMode]);

	const [dimensions, setDimensions] = useState({ x: 0, y: 0 });
	const [explorer, setExplorer] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleExplorerMove = (e: KeyboardEvent) => {
			if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
				e.preventDefault();
			}
			setExplorer((prev) => {
				if (e.key == "ArrowDown" && prev.y < dimensions.y - 1) {
					return { ...prev, y: prev.y + 1 };
				}
				if (e.key == "ArrowUp" && prev.y > 0) {
					return { ...prev, y: prev.y - 1 };
				}
				if (e.key == "ArrowLeft" && prev.x > 0) {
					return { ...prev, x: prev.x - 1 };
				}
				if (e.key == "ArrowRight" && prev.x < dimensions.x - 1) {
					return { ...prev, x: prev.x + 1 };
				}
				return prev;
			});
		};
		document.addEventListener("keydown", handleExplorerMove);

		return () => {
			document.removeEventListener("keydown", handleExplorerMove);
		};
	}, [dimensions.x, dimensions.y]);

	useEffect(() => {
		const updateDimensions = () => {
			const cols = Math.floor(window.innerWidth / tileSize);
			const rows = Math.floor((window.innerHeight - 40) / tileSize); //-40px zaradi headerja
			setDimensions({ x: cols, y: rows });
		};

		updateDimensions();

		window.addEventListener("resize", updateDimensions);
		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, [tileSize]);

	const tiles = [];
	for (let y = 0; y < dimensions.y; y++) {
		for (let x = 0; x < dimensions.x; x++) {
			tiles.push(<Tile key={`${x}-${y}`} x={x} y={y} isExplorer={x == explorer.x && y == explorer.y} />);
		}
	}

	return (
		<DrawingModeContext.Provider value={inDrawingModeRef}>
			<div
				className="grid h-screen w-screen overflow-hidden"
				style={{
					gridTemplateColumns: `repeat(${dimensions.x}, ${tileSize}px)`,
					gridTemplateRows: `repeat(${dimensions.y}, ${tileSize}px)`,
					height: "100vh",
					width: "100vw",
				}}
				onClick={() => setInDrawingMode((prev) => !prev)}
			>
				{tiles}
			</div>
		</DrawingModeContext.Provider>
	);
}

export default memo(TileLayout);

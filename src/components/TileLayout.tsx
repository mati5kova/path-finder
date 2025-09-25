import { memo, useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Tile from "./Tile";

type Point = { x: number; y: number };

const keyOf = (p: Point) => `${p.x},${p.y}`;
const inBounds = (p: Point, cols: number, rows: number) => {
	return p.x >= 0 && p.x < cols && p.y >= 0 && p.y < rows;
};
const isBlocked = (p: Point, listOfBlockedTiles: boolean[][]) => {
	return !!listOfBlockedTiles[p.y]?.[p.x];
};

const DIRECTIONS: Point[] = [
	{ x: 0, y: -1 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: -1, y: 0 },
];

function TileLayout({
	tileSize,
	runningSimulation,
	setRunningSimulation,
	batch,
	explorer,
	setExplorer,
	blocked,
	setBlocked,
	pathSet,
	setPathSet,
	runToken,
}: {
	tileSize: number;
	runningSimulation: boolean;
	setRunningSimulation: Dispatch<SetStateAction<boolean>>;
	batch: number;
	explorer: Point;
	setExplorer: Dispatch<SetStateAction<Point>>;
	blocked: boolean[][];
	setBlocked: Dispatch<SetStateAction<boolean[][]>>;
	pathSet: Set<string>;
	setPathSet: Dispatch<SetStateAction<Set<string>>>;
	runToken: number;
}) {
	const [dimensions, setDimensions] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const updateDimensions = () => {
			const cols = Math.floor(window.innerWidth / tileSize);
			const rows = Math.floor((window.innerHeight - 40) / tileSize); // -40px zaradi headerja
			setDimensions({ x: cols, y: rows });

			setBlocked((prev) => {
				const next = Array.from({ length: rows }, (_, y) =>
					Array.from({ length: cols }, (_, x) => prev[y]?.[x] ?? false)
				);
				if (rows > 0 && cols > 0) {
					next[rows - 1][cols - 1] = false; // da goal ni blocked v nobenem primeru
				}
				return next;
			});
			setPathSet(new Set());

			//setExplorer({ x: 0, y: 0 });
			if (explorer.x >= cols || explorer.y >= rows) {
				setExplorer({ x: 0, y: 0 });
			}
		};

		updateDimensions();

		window.addEventListener("resize", updateDimensions);
		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setRunningSimulation, setBlocked, setPathSet, tileSize, window.innerHeight, window.innerWidth]);

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
	}, [dimensions.x, dimensions.y, setExplorer]);

	const toggleCell = useCallback(
		(x: number, y: number) => {
			setRunningSimulation(false);
			setBlocked((prev) => {
				const next = prev.slice();
				next[y] = prev[y].slice();
				next[y][x] = !prev[y][x];
				return next;
			});
			setPathSet(new Set());
		},
		[setBlocked, setPathSet, setRunningSimulation]
	);

	const tiles = [];
	for (let y = 0; y < dimensions.y; y++) {
		for (let x = 0; x < dimensions.x; x++) {
			const isExplorer = x === explorer.x && y === explorer.y;
			const pressed = blocked[y]?.[x] ?? false;
			const inPath = pathSet.has(`${x},${y}`);
			const isDestination = x === dimensions.x - 1 && y === dimensions.y - 1;
			tiles.push(
				<Tile
					key={`${x}-${y}`}
					x={x}
					y={y}
					isExplorer={isExplorer}
					pressed={pressed}
					inPath={inPath}
					toggleCell={toggleCell}
					isDestination={isDestination}
				/>
			);
		}
	}

	useEffect(() => {
		if (!runningSimulation) return;

		const numOfColumns = dimensions.x;
		const numOfRows = dimensions.y;
		const startPositionOfExplorer = explorer;
		const targetDestination: Point = { x: numOfColumns - 1, y: numOfRows - 1 };

		// ko zacnemo novo simulacijo ocistimo polje stare
		setPathSet(new Set());
		console.log(
			"cols, rows",
			numOfColumns,
			numOfRows,
			"start",
			startPositionOfExplorer,
			"goal",
			targetDestination,
			"startBlocked",
			isBlocked(startPositionOfExplorer, blocked),
			"goalBlocked",
			isBlocked(targetDestination, blocked)
		);

		// sanity checks
		if (
			!numOfColumns ||
			!numOfRows ||
			isBlocked(startPositionOfExplorer, blocked) ||
			isBlocked(targetDestination, blocked)
		) {
			setRunningSimulation(false);
			return;
		}

		// uporabljamo queue ker je dostop in pisanje O(1)
		// hitreje kot prejsnja verzija z array.shift...
		const maxNumOfTiles = numOfColumns * numOfRows;
		const qx = new Int32Array(maxNumOfTiles); // dva typed arraya sta dosti bolj efficient kot pa en
		const qy = new Int32Array(maxNumOfTiles); // ki bi hranil Point-e, tako je vsak Point razdeljen v dva arraya
		let qHead = 0; // kaze na zacetek queue-a (naslednji element za dequeue-at)
		let qTail = 0; // kaze na naslednje prazno mesto v queue-ju

		// doda "Point" v queue (na konec ker je queue FIFO)
		const enqueue = (x: number, y: number) => {
			qx[qTail] = x;
			qy[qTail] = y;
			qTail++;
		};

		// vrne prvi element v queue-ju (na zacetku)
		const dequeue = () => {
			const p: Point = { x: qx[qHead], y: qy[qHead] };
			qHead++;
			return p;
		};

		const hasElementsInQueue = () => {
			return qHead < qTail;
		};

		// zacnemo s pozicijo explorerja
		enqueue(startPositionOfExplorer.x, startPositionOfExplorer.y);

		// set obiskanih polj
		const visited = new Set<string>([keyOf(startPositionOfExplorer)]);
		// map za trackanje poti
		const cameFrom = new Map<string, string>(); // childKey -> parentKey

		const revealShortestPath = () => {
			const startKey = keyOf(startPositionOfExplorer);
			const goalKey = keyOf(targetDestination);
			if (startKey === goalKey) {
				setPathSet(new Set([startKey]));
				setRunningSimulation(false);
				return;
			}
			if (!cameFrom.has(goalKey)) {
				// najdena ni nobena pot
				alert("No path found!");
				setPathSet(new Set());
				setRunningSimulation(false);
				return;
			}
			// backtrack goal -> start
			const pathKeys: string[] = [];
			let k: string | undefined = goalKey;
			while (k && k !== startKey) {
				pathKeys.push(k);
				k = cameFrom.get(k);
			}
			if (k === startKey) pathKeys.push(startKey);

			// ohrani samo najkrajsno, reset barve za ostale
			setPathSet(new Set(pathKeys));
			setRunningSimulation(false);
		};

		// request animation frame + batch
		let reqAnimFrame: number | null = null;
		let reachedGoal = false;

		const loop = () => {
			const tilesToColor: string[] = [];
			let processed = 0;

			while (processed < batch && hasElementsInQueue()) {
				const current = dequeue();
				const currentKey = keyOf(current);

				// pobarvamo obdelan tile
				tilesToColor.push(currentKey);

				// dosegli cilj -> pokazi najkrajso pot
				if (current.x === targetDestination.x && current.y === targetDestination.y) {
					reachedGoal = true;
					break;
				}

				// sosede trenutnega tile-a dodamo v queue
				for (const individualDirection of DIRECTIONS) {
					const adjacentTileOfCurrentTile: Point = {
						x: current.x + individualDirection.x,
						y: current.y + individualDirection.y,
					};
					if (
						!inBounds(adjacentTileOfCurrentTile, numOfColumns, numOfRows) ||
						isBlocked(adjacentTileOfCurrentTile, blocked)
					) {
						continue;
					}

					const adjacentKey = keyOf(adjacentTileOfCurrentTile);
					// ce smo ta tile ze obiskali ga preskocimo
					if (visited.has(adjacentKey)) {
						continue;
					}

					visited.add(adjacentKey);
					cameFrom.set(adjacentKey, currentKey);
					enqueue(adjacentTileOfCurrentTile.x, adjacentTileOfCurrentTile.y);
				}

				processed++;
			}

			if (tilesToColor.length) {
				setPathSet((prev) => {
					const next = new Set(prev);
					for (const indTileToColor of tilesToColor) {
						next.add(indTileToColor);
					}
					return next;
				});
			}

			if (reachedGoal || !hasElementsInQueue()) {
				revealShortestPath();
				return;
			}

			reqAnimFrame = window.requestAnimationFrame(loop);
		};

		reqAnimFrame = window.requestAnimationFrame(loop);

		return () => {
			if (reqAnimFrame) {
				window.cancelAnimationFrame(reqAnimFrame);
			}
		};
	}, [
		runningSimulation,
		dimensions.x,
		dimensions.y,
		explorer,
		blocked,
		setRunningSimulation,
		setPathSet,
		batch,
		runToken,
	]);

	return (
		<>
			<button
				// dev
				hidden
				type="button"
				onClick={() => {
					const w = dimensions.x;
					const h = dimensions.y;

					let count = 0;
					for (let y = 0; y < h; y++) {
						const row = blocked[y];
						for (let x = 0; x < w; x++) {
							if (row[x]) count++;
						}
					}

					const blockedX = new Uint32Array(count);
					const blockedY = new Uint32Array(count);

					let i = 0;
					for (let y = 0; y < h; y++) {
						const row = blocked[y];
						for (let x = 0; x < w; x++) {
							if (row[x]) {
								blockedX[i] = x;
								blockedY[i] = y;
								i++;
							}
						}
					}

					const exportedGrid = {
						batch,
						tileSize,
						explorer,
						numOfBlocked: count,
						blockedX: Array.from(blockedX),
						blockedY: Array.from(blockedY),
					};
					console.log(exportedGrid);
				}}
			>
				export grid settings
			</button>
			<div
				className="grid h-screen w-screen overflow-hidden"
				style={{
					gridTemplateColumns: `repeat(${dimensions.x}, ${tileSize}px)`,
					gridTemplateRows: `repeat(${dimensions.y}, ${tileSize}px)`,
					height: "100vh",
					width: "100vw",
				}}
			>
				{tiles}
			</div>
		</>
	);
}

export default memo(TileLayout);

import { useEffect, useRef, useState } from "react";
import Slider from "./components/Slider";
import TileLayout from "./components/TileLayout";

import preExistingGrids from "./predefinedGrids/grid";

const computeDefaultsForTileSize = (ts: number) => ({
	batch: Math.round(-1981.731797 / ts + 1562.452388 / (ts - 5.385) + 9.613661),
	max: Math.round((1 / ts) * 1500 + (ts < 20 ? 250 : 0)),
});

function App() {
	const [tileSize, setTileSize] = useState(25);
	const [batch, setBatch] = useState<number>(1);
	const [maxBatchSize, setMaxBatchSize] = useState<number>(1);
	const [runningSimulation, setRunningSimulation] = useState<boolean>(false);
	const [runToken, setRunToken] = useState(0);

	const [explorer, setExplorer] = useState({ x: 0, y: 0 });
	const [blocked, setBlocked] = useState<boolean[][]>([]);
	const [pathSet, setPathSet] = useState<Set<string>>(new Set());

	const [, setCurrentPredefinedGrid] = useState<number>(0);

	const skipNextAutoBatch = useRef(false);

	useEffect(() => {
		const { batch: autoBatch, max } = computeDefaultsForTileSize(tileSize);
		setMaxBatchSize(max);
		if (skipNextAutoBatch.current) {
			skipNextAutoBatch.current = false;
		} else {
			setBatch(autoBatch);
		}
	}, [tileSize]);

	useEffect(() => {
		const handleRunSimulation = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				setRunningSimulation(true);
			}
		};

		window.addEventListener("keypress", handleRunSimulation);

		return () => {
			window.removeEventListener("keypress", handleRunSimulation);
		};
	}, []);

	const loadExistingGridPattern = (index: number) => {
		setRunningSimulation(false);

		const preset = preExistingGrids[index % preExistingGrids.length];

		skipNextAutoBatch.current = true;

		setTileSize(preset.tileSize);
		setBatch(preset.batch);

		const { max } = computeDefaultsForTileSize(preset.tileSize);
		setMaxBatchSize(max);

		setExplorer(preset.explorer);

		const numberOfColumns = Math.floor(window.innerWidth / preset.tileSize);
		const numberOfRows = Math.floor((window.innerHeight - 40) / preset.tileSize);

		const newBlocked: boolean[][] = Array.from({ length: numberOfRows }, () =>
			Array<boolean>(numberOfColumns).fill(false)
		);

		for (let i = 0; i < preset.numOfBlocked; i++) {
			const y = preset.blockedY[i];
			const x = preset.blockedX[i];
			if (y >= 0 && y < numberOfRows && x >= 0 && x < numberOfColumns) {
				newBlocked[y][x] = true;
			}
		}
		if (numberOfRows > 0 && numberOfColumns > 0) {
			newBlocked[numberOfRows - 1][numberOfColumns - 1] = false; // da goal ni blocked v nobenem primeru
		}
		setBlocked(newBlocked);

		setPathSet(new Set());
	};

	return (
		<main className="overflow-hidden">
			<header className="flex h-10 w-full items-center">
				<div className="w-[60%] flex flex-row justify-between gap-10 flex-nowrap items-center">
					<Slider
						name={"Individual tile size (number of tiles in grid)"}
						val={tileSize}
						setVal={setTileSize}
						min={10}
						max={60}
					/>
					<Slider
						name={"Batch size (animation speed)"}
						val={batch}
						setVal={setBatch}
						min={1}
						max={maxBatchSize}
					/>
					<button
						type="button"
						className="w-72 h-9 outline-1 outline-gray-800 rounded-md hover:bg-gray-100"
						onClick={() => {
							setRunningSimulation(true);
							setRunToken((prev) => prev + 1);
						}}
					>
						RUN BFS
					</button>
				</div>
				<div className="w-[40%] flex items-center justify-between gap-10 px-5 pl-[10%]">
					<button
						type="button"
						className="w-60 h-9  outline-1 outline-gray-800 rounded-md hover:bg-gray-100"
						onClick={() => {
							setCurrentPredefinedGrid((prev) => {
								const next = prev + 1;
								loadExistingGridPattern(next);
								return next;
							});
						}}
					>
						LOAD PREDEFINED GRID
					</button>
					<button
						type="button"
						className="w-30 h-9 outline-1 outline-gray-800 rounded-md hover:bg-gray-100"
						onClick={() => {
							setRunningSimulation(false);

							const cols = Math.floor(window.innerWidth / tileSize);
							const rows = Math.floor((window.innerHeight - 40) / tileSize);
							const cleared = Array.from({ length: rows }, () => Array(cols).fill(false));
							setBlocked(cleared);

							setPathSet(new Set());
						}}
					>
						CLEAR GRID
					</button>
				</div>
			</header>

			<TileLayout
				tileSize={tileSize}
				runningSimulation={runningSimulation}
				setRunningSimulation={setRunningSimulation}
				batch={batch}
				explorer={explorer}
				setExplorer={setExplorer}
				blocked={blocked}
				setBlocked={setBlocked}
				pathSet={pathSet}
				setPathSet={setPathSet}
				runToken={runToken}
			></TileLayout>
		</main>
	);
}

export default App;

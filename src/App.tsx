import { useState } from "react";
import TileLayout from "./components/TileLayout";
import TileSizeSlider from "./components/TileSizeSlider";

function App() {
	const [tileSize, setTileSize] = useState(50);

	return (
		<main className="overflow-hidden">
			<header className="h-10 w-full">
				<TileSizeSlider tileSize={tileSize} setTileSize={setTileSize} />
			</header>

			<TileLayout tileSize={tileSize}></TileLayout>
		</main>
	);
}

export default App;

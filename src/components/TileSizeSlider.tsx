import { memo, type Dispatch, type SetStateAction } from "react";

function TileSizeSlider({
	tileSize,
	setTileSize,
}: {
	tileSize: number;
	setTileSize: Dispatch<SetStateAction<number>>;
}) {
	return (
		<input
			type="range"
			value={tileSize}
			min={20}
			max={60}
			onChange={(e) =>
				setTileSize(() => {
					console.log(e.target.valueAsNumber);
					return e.target.valueAsNumber;
				})
			}
		></input>
	);
}

export default memo(TileSizeSlider);

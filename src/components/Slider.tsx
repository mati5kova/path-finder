import { memo, type Dispatch, type SetStateAction } from "react";

interface SliderInterface {
	name: string;
	val: number;
	setVal: Dispatch<SetStateAction<number>>;
	min: number;
	max: number;
}

function Slider({ name, val, setVal, min, max }: SliderInterface) {
	return (
		<>
			<div className="flex flex-col flex-wrap w-full">
				<span>{name}</span>
				<input
					type="range"
					value={val}
					min={min}
					max={max}
					onChange={(e) =>
						setVal(() => {
							return e.target.valueAsNumber;
						})
					}
				></input>
			</div>
		</>
	);
}

export default memo(Slider);

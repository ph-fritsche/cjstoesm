import {realFileSystem} from "../file-system/file-system";
import {TransformTaskOptions} from "./transform-task-options";
import {createTaskOptions} from "./create-task-options";
import {isAbsolute, join} from "../../transformer/util/path-util";
import {ensureArray} from "../util/util";
import {PartialExcept} from "helpertypes";

export function createTransformTaskOptions({
	fileSystem = realFileSystem,
	write = true,
	input,
	hooks = {},
	outDir,
	...rest
}: PartialExcept<TransformTaskOptions, "input" | "outDir">): TransformTaskOptions {
	if (input == null) {
		throw new ReferenceError(`Missing required argument: 'input'`);
	}

	if (outDir == null) {
		throw new ReferenceError(`Missing required argument: 'outDir'`);
	}

	const taskOptions = createTaskOptions(rest);
	return {
		...taskOptions,
		write,
		fileSystem,
		hooks,
		input: ensureArray(input).map(file => (isAbsolute(file) ? file : join(taskOptions.cwd, file))),
		outDir: isAbsolute(outDir) ? outDir : join(taskOptions.cwd, outDir)
	};
}

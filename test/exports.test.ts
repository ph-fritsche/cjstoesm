import test from "ava";
import {generateTransformerResult} from "./setup/setup-transformer";
import {formatCode} from "./util/format-code";

test("Converts 'exports = ...' syntax into an ExportAssignment. #1", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		exports = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #2", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		module.exports = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #3", async t => {
	const bundle = await generateTransformerResult(`
		exports = function foo () {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {});
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #4", async t => {
	const bundle = await generateTransformerResult(`
		class Baz {}

		module.exports = {
			foo: () => {},
			bar: 2,
			Baz,
			Lolz: Baz
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		class Baz {}
		export const foo = () => {};
		export const bar = 2;
		export {Baz};
		export {Baz as Lolz};
		export default {
			foo,
			bar,
			Baz,
			Lolz: Baz
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #5", async t => {
	const bundle = await generateTransformerResult(`

		module.exports = {
			aMethod () {
				return 2+2;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function aMethod () {
			return 2 + 2;
		}
		export default {
			aMethod
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #6", async t => {
	const bundle = await generateTransformerResult(`
		const foo = "bar";
		module.exports = {
			get something () {
				return foo;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const foo = "bar";
		export default {
			get something () {
				return foo;
			}
		};
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #7", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default {}
		`)
	);
});

test("Converts 'exports = ...' syntax into an ExportAssignment. #8", async t => {
	const bundle = await generateTransformerResult(`
		(module.exports = {});
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #1", async t => {
	const bundle = await generateTransformerResult(`
		exports.foo = 1;
	`);
	const [file] = bundle;

	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 1;
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #2", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		exports.foo = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo};
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #3", async t => {
	const bundle = await generateTransformerResult(`
		exports.foo = function foo () {};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function foo () {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #4", async t => {
	const bundle = await generateTransformerResult(`
		exports.foo = () => {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = () => {}
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #5", async t => {
	const bundle = await generateTransformerResult(`
		exports.f = Object.getOwnPropertySymbols;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const f = Object.getOwnPropertySymbols;
		`)
	);
});

test("Converts 'exports.<something> into ExportDeclarations. #6", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		exports.bar = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo as bar};
		`)
	);
});

test("Converts 'exports.default into a default export. #1", async t => {
	const bundle = await generateTransformerResult(`
		exports.default = function foo () {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {})
		`)
	);
});

test("Converts 'exports.default into a default export. #2", async t => {
	const bundle = await generateTransformerResult(`
		module.exports.default = function foo () {}
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export default (function foo () {})
		`)
	);
});

test("Won't generate duplicate ExportAssignments. #1", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		exports.default = foo;
		module.exports = foo;
		module.exports.default = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export default foo;
		`)
	);
});

test("Won't generate duplicate ExportDeclarations. #1", async t => {
	const bundle = await generateTransformerResult(`
		function foo () {}
		exports.foo = foo;
		module.exports.foo = foo;
		module.exports.default = foo;
		exports.bar = foo;
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		function foo () {}
		export {foo};
		export default foo;
		export {foo as bar};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #1", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: true
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = true;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #2", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: false
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = false;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #3", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: 2
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 2;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #4", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: 2n
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = 2n;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #5", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: /foo/
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = /foo/;
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #6", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo: {
				a: 1,
				b: 2
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export const foo = {
			a: 1,
			b: 2
		};
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #7", async t => {
	const bundle = await generateTransformerResult(`
		module.exports = {
			foo () {
				return 2;
			}
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		export function foo () {
			return 2;
		}
		export default {
			foo
		};
		`)
	);
});

test("Generates named exports for members of an ObjectLiteral that is assigned to 'exports = ...' if possible. #8", async t => {
	const bundle = await generateTransformerResult(`
		const obj = {
			foo: 1,
			bar: 10
		};
		module.exports = {
			...obj,
			bar: 2
		};
	`);
	const [file] = bundle;
	t.deepEqual(
		formatCode(file.text),
		formatCode(`\
		const obj = {
			foo: 1,
			bar: 10
		};
		export const bar = 2;
		export default {
			...obj,
			bar
		};
		`)
	);
});

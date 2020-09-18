import DomUtils from "./adapter.js";
import compileRaw, { compileToken, compileUnsafe as _compileUnsafe } from "./engine/compile";
import { pseudos, filters } from "./engine/pseudos";
import isFunction from "./typechecking/isFunction";
import _Array from "./vars/_Array";
import _isArray from "./vars/_isArray";

function wrapCompile(func) {
	return function addAdapter(selector, options = {}, context) {
		options.adapter = options.adapter || DomUtils;

		return func(selector, options, context);
	};
}

const compile = wrapCompile(compileRaw);
const compileUnsafe = wrapCompile(_compileUnsafe);

function getSelectorFunc(searchFunc) {
	return function select(query, elems, options = {}) {
		options.adapter = options.adapter || DomUtils;

		if (typeof query !== "function") {
			query = compileUnsafe(query, options, elems);
		}
		if (query.shouldTestNextSiblings) {
			elems = appendNextSiblings(
				options.context || elems,
				options.adapter
			);
		}
		if (!Array.isArray(elems)) elems = options.adapter.getChildren(elems);
		else elems = options.adapter.removeSubsets(elems);
		return searchFunc(query, elems, options);
	};
}

function getNextSiblings(elem, adapter) {
	let siblings = adapter.getSiblings(elem);
	if (!Array.isArray(siblings)) return [];
	siblings = siblings.slice(0);
	while (siblings.shift() !== elem);
	return siblings;
}

function appendNextSiblings(elems, adapter) {
	// Order matters because jQuery seems to check the children before the siblings
	if (!Array.isArray(elems)) elems = [elems];
	const newElems = elems.slice(0);

	for (let i = 0, len = elems.length; i < len; i++) {
		const nextSiblings = getNextSiblings(newElems[i], adapter);
		newElems.push.apply(newElems, nextSiblings);
	}
	return newElems;
}

const selectAll = getSelectorFunc((query, elems, options) =>
	query === false || !elems || elems.length === 0
		? []
		: options.adapter.findAll(query, elems)
);

const selectOne = getSelectorFunc((query, elems, options) =>
	query === false || !elems || elems.length === 0
		? null
		: options.adapter.findOne(query, elems)
);

function is(elem, query, options = {}) {
	options.adapter = options.adapter || DomUtils;
	return (typeof query === "function" ? query : compile(query, options))(
		elem
	);
}

/*
	the exported interface
*/
function CSSselect(query, elems, options) {
	return selectAll(query, elems, options);
}

CSSselect.compile = compile;
CSSselect.filters = filters;
CSSselect.pseudos = pseudos;

CSSselect.selectAll = selectAll;
CSSselect.selectOne = selectOne;

CSSselect.is = is;

//legacy methods (might be removed)
CSSselect.parse = compile;
CSSselect.iterate = selectAll;

//hooks
CSSselect._compileUnsafe = compileUnsafe;
CSSselect._compileToken = compileToken;
export default CSSselect;
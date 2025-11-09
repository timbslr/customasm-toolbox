import * as vscode from "vscode";
import { isAbsolute, join, resolve } from "path";
import { readFileSync } from "fs";

/**
 * Extracts the paths where the rules are specified from the config
 * @returns {string[]} An array of absolute paths that contain rule definitions
 */
export function getRuledefPaths() {
	const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	const packagePath = join(workspacePath, "package.json");
	const customasmConfigPath = join(workspacePath, ".customasm.json");
	let paths = [];
	try {
		const packageJSON = JSON.parse(readFileSync(packagePath).toString());
		paths = packageJSON.customasmRuleDefinitions;
		assertArrayOfStrings(paths);
		return toAbsolutePaths(paths, workspacePath.toString());
	} catch (err1) {
		console.log(`package.json not found, trying .customasm.json now`);
		try {
			const customasmConfig = JSON.parse(readFileSync(customasmConfigPath).toString());
			paths = customasmConfig.ruleDefinitions;
			assertArrayOfStrings(paths);
			return toAbsolutePaths(paths, workspacePath.toString());
		} catch (err2) {
			console.error("Couldn't resolve rule definitions - no valid path specified!");
			return [];
		}
	}
}

/**
 * Converts an array of path strings into absolute paths, whether they were originally relative or absolute
 * @param {string[]} paths An array of paths that may contain relative and/or absolute paths
 * @param {string} workspacePath The path to the current workspace
 * @returns {string[]} The same paths, but all are absolute now
 */
function toAbsolutePaths(paths, workspacePath) {
	const absolutePaths = [];

	for (const path of paths) {
		if (isAbsolute(path)) {
			absolutePaths.push(path);
		} else {
			absolutePaths.push(resolve(workspacePath, path));
		}
	}

	return absolutePaths;
}

/**
 * Asserts that a given object is of type `string[]`. If not, a TypeError is thrown.
 * @param {object} value The object that should be checked
 * @returns {boolean} `true` if the input is of type `string[]`
 */
function assertArrayOfStrings(value) {
	if (!Array.isArray(value)) {
		throw new TypeError("Expected an array");
	}

	if (!value.every((item) => typeof item === "string")) {
		throw new TypeError("Expected all elements to be strings");
	}

	return true;
}

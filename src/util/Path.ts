import { isAbsolute, join, resolve } from "path";
import Assert from "./Assert";
import * as vscode from "vscode";
import FileProcessor from "./FileProcessor";
import { existsSync } from "fs";
/**
 * Provides useful methods for Paths
 */
export default class Path {
	/**
	 * Computes the absolute folder path for the first workspace found
	 */
	static get workspacePath(): string | undefined {
		return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	}

	static get customasmConfigPath(): string | undefined {
		return this.workspacePath ? join(this.workspacePath, ".customasm.json") : undefined;
	}

	/**
	 * Converts an array of path strings into absolute paths, whether they were originally relative or absolute
	 * @param paths An array of paths that may contain relative and/or absolute paths
	 * @param absolutePath If a path from `paths` is relative, this is the absolute path used for converting the relative path to an absolute one
	 * @returns The same paths, but all are absolute now
	 */
	static toAbsolutePaths(paths: string[], absolutePath: string): string[] {
		const absolutePaths = [];

		for (const path of paths) {
			if (isAbsolute(path)) {
				absolutePaths.push(path);
			} else {
				absolutePaths.push(resolve(absolutePath, path));
			}
		}

		return absolutePaths;
	}

	/**
	 * Extracts the paths where the rules are specified from the config
	 * @returns An array of absolute paths that contain rule definitions
	 */
	static getRuleDefinitionPaths(): string[] | undefined {
		if (!this.workspacePath) {
			return undefined;
		}

		if (this.customasmConfigPath && existsSync(this.customasmConfigPath)) {
			const pathsFromCustomAsmConfig = FileProcessor.getJSONProperty(this.customasmConfigPath, "ruleDefinitions");
			if (Assert.assertArrayOfStrings(pathsFromCustomAsmConfig)) {
				return Path.toAbsolutePaths(pathsFromCustomAsmConfig, this.workspacePath);
			}
		}

		return undefined;
	}
}

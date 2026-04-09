import { existsSync } from "fs";
import Path from "./Path.js";
import FileProcessor from "./FileProcessor.js";

export default class ClobberedRegistersProvider {
	static getClobberedRegistersList(): Map<string, string[]> {
		const workspacePath = Path.workspacePath;
		if (!workspacePath) {
			return new Map();
		}

		const customasmConfigPath = Path.customasmConfigPath;

		if (!customasmConfigPath || !existsSync(customasmConfigPath)) {
			return new Map();
		}

		const showClobberedRegisters = FileProcessor.getJSONProperty(customasmConfigPath, "showClobberedRegisters");
		if (!showClobberedRegisters) {
			return new Map();
		}

		const clobberedRegistersList = FileProcessor.getJSONProperty(customasmConfigPath, "clobberedRegisterInstructions");
		if (!clobberedRegistersList) {
			return new Map();
		}

		const map = new Map<string, string[]>();
		for (const item of clobberedRegistersList) {
			const mnemonic = item["mnemonic"];
			const clobberedRegisters = item["clobberedRegisters"];
			if (clobberedRegisters.length > 0) {
				map.set(mnemonic, clobberedRegisters);
			}
		}

		return map;
	}
}

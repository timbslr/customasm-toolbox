import * as assert from "assert";
import Path from "./util/Path";
import FileProcessor from "./util/FileProcessor";
import ClobberedRegistersProvider from "./util/ClobberedRegistersProvider.js";

type Mnemonic = string;
export type OperandDefinition = { name: string; type: string | null };
export type Rule = { mnemonic: Mnemonic; operands: OperandDefinition[] };
export type Instruction = { mnemonic: Mnemonic; operands: string[] }; //in contrast to type Rule, the operands are real instances and not abstract types here

/**
 * This class provides all information about the current definitions
 */
export default class CustomAsm {
	/**
	 * Contains a map of mnemonics associated with their possible operands (saved in the set). A mnemonic may have multiple definitions and this may have multiple possible operand combinations
	 */
	static rules: Map<Mnemonic, OperandDefinition[][]>;

	/**
	 * Maps an operand-type to its allowed values
	 */
	static operands: Map<string, string[]>;

	/**
	 * A Map containing all mnemonics (= key) of the instructions that clobber a list of registers (= value)
	 */
	private static clobberedMap: Map<string, string[]>;

	static getClobberedMap() {
		if (!this.clobberedMap) {
			this.clobberedMap = ClobberedRegistersProvider.getClobberedRegistersList();
		}

		return this.clobberedMap;
	}

	/**
	 * @returns An array of strings containing all defined mnemonics
	 */
	static get mnemonics(): Mnemonic[] {
		return Array.from(this.rules.keys());
	}

	/**
	 * @returns All possible values that are defined in any #subruledef block
	 */
	static get operandValues(): string[] {
		return [...this.operands.values()].flat();
	}

	/**
	 * Updates the rules by parsing them from the files the user specified in the config
	 * @returns {void}
	 */
	static updateRules() {
		const newRules: typeof this.rules = new Map();
		const newOperands: typeof this.operands = new Map();

		const ruledefPaths = Path.getRuleDefinitionPaths();
		if (!ruledefPaths) {
			return;
		}

		for (const ruledefPath of ruledefPaths) {
			const content = FileProcessor.readFileSyncWithoutComments(ruledefPath);

			const ruleDefinitions = FileProcessor.extractRuleDefinitions(content);
			ruleDefinitions.forEach((rule) => {
				if (newRules.has(rule.mnemonic)) {
					let value = newRules.get(rule.mnemonic) || [];
					value.push(rule.operands);
					newRules.set(rule.mnemonic, value);
				} else {
					newRules.set(rule.mnemonic, [rule.operands]);
				}
			});

			const operandObjects = FileProcessor.extractOperands(content);
			operandObjects.forEach((operandObject) => {
				let value = newOperands.get(operandObject.type) || [];
				value = value.concat(operandObject.values);
				newOperands.set(operandObject.type, value);
			});
		}

		//only update rules and operandTypes if they have changed
		try {
			assert.deepEqual(this.rules, newRules);
		} catch (notEqual) {
			this.rules = newRules;
		}

		try {
			assert.deepEqual(this.operands, newOperands);
		} catch (notEqual) {
			this.operands = newOperands;
		}
	}
}

import { existsSync, readFileSync } from "fs";
import CustomAsm, { Instruction, OperandDefinition, Rule } from "../CustomAsm";

/**
 * A class that contains useful methods for processing files and extracting content from them
 */
export default class FileProcessor {
	/**
	 *
	 * @param jsonFilePath The path to the json file the property should be extracted from
	 * @param propertyName The name of the property that should be extracted
	 */
	static getJSONProperty(jsonFilePath: string, propertyName: string): any {
		if (!existsSync(jsonFilePath)) {
			return null;
		}
		const fileContent: string = readFileSync(jsonFilePath).toString();
		return JSON.parse(fileContent)?.[propertyName];
	}

	/**
	 *
	 * @param filePath The path to the file that should be read
	 * @return the content of that file without comments
	 */
	static readFileSyncWithoutComments(filePath: string): string {
		const fileContent = readFileSync(filePath).toString();
		return this.removeComments(fileContent);
	}

	/**
	 * //TODO make method working with nested comments
	 * @param text The input string the comments should be removed from
	 * @returns The same content, but with comments removed
	 */
	static removeComments(text: string): string {
		return text.replace(/;\*[\s\S]*?\*;/gm, "").replace(/;.*$/gm, "");
	}

	/**
	 * Extracts all #ruledef blocks inside a given text and parses its rules
	 * @param text The input string to extract the rules from
	 * @returns The parsed rules from the #ruledef blocks
	 */
	static extractRuleDefinitions(text: string): Rule[] {
		const regex = /#ruledef\s*\{([\s\S]*?)\n\}/gm;
		let match;
		let ruledefBlocks = [];

		while ((match = regex.exec(text)) !== null) {
			ruledefBlocks.push(match[1]);
		}

		const ruledefBlock = ruledefBlocks.join("\n"); //TODO join and then split is not pretty

		return ruledefBlock
			.split("\n")
			.map((ruleString) => this.parseRule(ruleString))
			.filter((rule) => rule !== null);
	}

	/**
	 * Extracts all #ruledef blocks inside a given text and parses its rules
	 * @param text The input string to extract the rules from
	 * @returns The parsed rules from the #ruledef blocks
	 */
	static extractOperands(text: string): { type: string; values: string[] }[] {
		const regex = /#subruledef\s*([a-zA-Z0-9_]+)\s*\{([\s\S]*?)\n\}/gm;
		let match;
		let subruledefs = [];

		while ((match = regex.exec(text)) !== null) {
			const operandType = match[1];
			const subruledefBlock = match[2];

			const values = subruledefBlock
				.trim()
				.split("\n")
				.map((entry) => entry.trim().split("=>")[0].trim().split(" ")[0]);
			subruledefs.push({ type: operandType, values: values });
		}

		return subruledefs;
	}

	/**
	 * Parses a rule string into an object
	 * @param ruleString The string representing a rule
	 * @returns The parsed Rule object
	 * @example parseRule("addi {reg: register}, {imm: i8} => 0b01") --> {mnemonic: "addi", operands: [{name: "reg", type: "register"}, {name: "imm", type: "i8"}]}
	 */
	static parseRule(ruleString: string): Rule | null {
		ruleString = ruleString.trim();
		const indexOfAssignOperator = ruleString.indexOf("=>");
		if (indexOfAssignOperator === -1) {
			return null;
		}

		const mnemonic = ruleString.split(" ")[0].trim();
		const operandStrings = ruleString
			.substring(mnemonic.length, indexOfAssignOperator)
			.split(",")
			.map((operand) => operand.trim())
			.filter((operand) => operand !== "");

		const operands: OperandDefinition[] = [];
		operandStrings.forEach((operandString) => {
			const parsedOperand = this.parseOperandDefinition(operandString);
			if (parsedOperand) {
				operands.push(parsedOperand);
			}
		});

		return { mnemonic: mnemonic, operands: operands };
	}

	static parseOperandDefinition(operandDefinitionString: string): OperandDefinition | null {
		if (!operandDefinitionString) {
			return null;
		}

		operandDefinitionString = operandDefinitionString.trim();
		const regex = new RegExp(`\\{\\s*([a-zA-Z0-9_]+)\\s*:\\s*([a-zA-Z0-9_]+)\\s*\\}`, "gm");
		const match = regex.exec(operandDefinitionString);
		if (!match) {
			return { name: operandDefinitionString, type: null };
		}

		return { name: match[1], type: match[2] };
	}

	/**
	 *
	 * @param ruleString
	 * @returns
	 * @example parseInstruction("addi A, 1") --> {mnemonic: "addi", operands: ["A", "1"]}
	 */
	static parseInstruction(ruleString: string): Instruction | null {
		const regex = new RegExp(`^\\s*(${CustomAsm.mnemonics.join("|")})\\s+(.*)$`, "gm");
		const match = regex.exec(ruleString);
		if (!match) {
			return null;
		}

		const mnemonic = match[1];
		const operands = match[2].split(",").map((operand) => operand.trim());
		return { mnemonic: mnemonic, operands: operands };
	}
}

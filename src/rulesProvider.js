import { readFileSync } from "fs";
import { getRuledefPaths } from "./ruledefPathProvider.js";

export let rules = [];

export function getMnemonics() {
	updateRules();
	return rules.map((rule) => rule.mnemonic);
}

/**
 * Updates the rules by parsing them from the files the user specified in the config
 * @returns {{mnemonic: string, operands: {name: string, type: string}[]}[]} An array of objects containing the mnemonic and an array of operands
 */
export function updateRules() {
	rules.length = 0; //clear rules
	const ruledefPaths = getRuledefPaths();
	for (const ruledefPath of ruledefPaths) {
		const content = readFileSync(ruledefPath).toString();
		const ruledefStrings = extractRulesFromString(content);
		ruledefStrings.forEach((rule) => {
			rules.push(parseRuleString(rule));
		});
	}

	return rules;
}

/**
 * Extracts all rules from a given text by searching for #ruledef blocks and returning their rules
 * @param {string} text
 * @returns {string[]} The rules from the #ruledef blocks in string format
 */
function extractRulesFromString(text) {
	const regex = new RegExp("#ruledef\\s*\\{\\s*[\\s\\S]*?^\\s*\\}\\s*$", "gm"); //TODO match whole block, may be that a single line "}" is not the end of the block
	let match;
	let ruledefs = [];
	while ((match = regex.exec(text)) !== null) {
		let matchedString = match[0];
		matchedString = matchedString.replace(/#ruledef\s*\{/, "");

		const newRules = matchedString
			.trim()
			.split("\n")
			.map((entry) => entry.trim());
		newRules.pop(); //remove last entry as this is the "}" in the single line
		ruledefs = ruledefs.concat(newRules);
	}
	return ruledefs;
}

/**
 * Parses a rule string into an object containing the rule's attributes
 * @param {string} rule The rule to be parsed
 * @returns {{mnemonic: string, operands: {name: string, type: string}[]}} The parsed object resulting from the rule string
 */
function parseRuleString(rule) {
	const indexOfAssignOperator = rule.indexOf("=>");
	const mnemonic = rule.split(" ")[0];
	const operandStrings = rule
		.substring(mnemonic.length, indexOfAssignOperator)
		.split(",")
		.map((operand) => operand.trim());

	const operandObjects = [];
	operandStrings.forEach((operandString) => {
		let match;
		const regex = /\{\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)\s*\}/;
		if ((match = regex.exec(operandString))) {
			const name = match[1];
			const type = match[2];
			operandObjects.push({ name: name, type: type });
		}
	});

	return { mnemonic: mnemonic, operands: operandObjects };
}

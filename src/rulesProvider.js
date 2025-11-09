import { readFileSync } from "fs";
import { getRuledefPaths } from "./ruledefPathProvider.js";
import assert from "assert";

export let rules = [];
export let subrules = [];

export function getMnemonics() {
	updateRules();
	return rules.map((rule) => rule.mnemonic);
}

/**
 * This extension treats all subrules to define operands
 */
export function getSubruleOperands() {
	updateRules();
	return subrules.reduce((acc, curr) => acc.concat(curr.operands), []);
}

/**
 * Updates the rules by parsing them from the files the user specified in the config
 * @returns {void}
 */
export function updateRules() {
	const newRules = [];
	const newSubrules = [];

	const ruledefPaths = getRuledefPaths();
	for (const ruledefPath of ruledefPaths) {
		const content = removeComments(readFileSync(ruledefPath).toString());

		const ruledefStrings = extractRulesFromString(content);
		ruledefStrings.forEach((rule) => {
			newRules.push(parseRuleString(rule));
		});

		const subruledefObjects = extractSubrulesFromString(content);
		subruledefObjects.forEach((rule) => {
			newSubrules.push(rule);
		});
	}

	//only update rules and newRules if they have changed
	try {
		assert.deepEqual(rules, newRules);
	} catch (notEqual) {
		rules = newRules;
	}

	try {
		assert.deepEqual(subrules, newSubrules);
	} catch (notEqual) {
		subrules = newSubrules;
	}
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

function extractSubrulesFromString(text) {
	const regex = new RegExp("#subruledef\\s*([a-zA-Z0-9_]+)\\s*\\{\\s*[\\s\\S]*?^\\s*\\}\\s*$", "gm"); //TODO match whole block, may be that a single line "}" is not the end of the block
	let match;
	let subruledefs = [];
	while ((match = regex.exec(text)) !== null) {
		let matchedString = match[0];
		const subruleName = match[1];
		matchedString = matchedString.replace(/#subruledef\s*([a-zA-Z0-9_]+)\s*\{/, "");

		const newRules = matchedString
			.trim()
			.split("\n")
			.map((entry) => entry.trim().split("=>")[0].trim().split(" ")[0]);
		newRules.pop(); //remove last entry as this is the "}" in the single line
		subruledefs.push({ subruleName: subruleName, operands: newRules });
	}
	return subruledefs;
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

/**
 * Doesn't work for nested comments yet
 * @param {*} text
 * @returns
 */
function removeComments(text) {
	return text.replace(/;\*[\s\S]*?\*;/gm, "").replace(/;.*$/gm, "");
}

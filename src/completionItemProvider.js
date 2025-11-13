import { generateLabelForMnemonic } from "./hoverProvider.js";
import { parseInstruction } from "./ruleParser.js";
import { getMnemonics, rules, subrules } from "./rulesProvider.js";
import * as vscode from "vscode";

export const completionItemProvider = {
	provideCompletionItems(document, position) {
		const lineText = document.lineAt(position).text;
		const prefix = lineText.slice(0, position.character).trim();

		// suggest operands/arguments if mnemonic is already there
		const match = parseInstruction(lineText);
		if (match) {
			const possibleOperandsForMnemonic = rules.get(match.mnemonic);
			return getCompletionItems(possibleOperandsForMnemonic, match.operands);
		}

		// suggest mnemonics if nothing has been typed in the line yet
		if (/^\s*[a-zA-Z0-9_]*$/m.test(prefix)) {
			return getMnemonics().map((mnemonic) => {
				const item = new vscode.CompletionItem(mnemonic, vscode.CompletionItemKind.Field);
				item.detail = generateLabelForMnemonic(mnemonic);
				return item;
			});
		}

		return undefined;
	},
};

/**
 *
 * @param {{name: string, type: string}[][]} possibleOperands
 * @param {string[]} currentOperands
 * @returns {vscode.CompletionItem[]}
 */
function getCompletionItems(possibleOperands, currentOperands) {
	if (currentOperands.length > 0) {
		currentOperands.pop();
	}
	const completionItems = [];
	const completionStrings = new Set();
	possibleOperands.forEach((operands) => {
		if (areOperandsMatchingRule(currentOperands, operands)) {
			const amountOfOperandsAlreadyChecked = currentOperands.length;
			if (operands.length > amountOfOperandsAlreadyChecked) {
				const operandType = operands[amountOfOperandsAlreadyChecked].type;
				if (operandType) {
					const subruleOperands = subrules.get(operandType);
					if (subruleOperands) {
						subruleOperands.forEach((operand) => {
							completionStrings.add(operand);
						});
					} else {
						completionStrings.add(`{${operands[amountOfOperandsAlreadyChecked].name}: ${operandType}}`);
					}
				} else {
					completionStrings.add(operands[amountOfOperandsAlreadyChecked].name);
				}
			}
		}
	});
	completionStrings.forEach((completionString) => {
		if (completionString.includes("{")) {
			const item = new vscode.CompletionItem(completionString, vscode.CompletionItemKind.Snippet);
			const escapedCompletionString = completionString.replace(/\}/g, "\\}"); //only closing brackets need escaping
			item.insertText = new vscode.SnippetString(`\${1:${escapedCompletionString}}`);
			completionItems.push(item);
		} else {
			completionItems.push(new vscode.CompletionItem(completionString, vscode.CompletionItemKind.Operator));
		}
	});

	return completionItems;
}

/**
 *
 * @param {string[]} operands
 * @param {{name: string, type: string}[]} ruleOperands
 */
export function areOperandsMatchingRule(operands, ruleOperands) {
	for (let i = 0; i < operands.length; i++) {
		const operandInstance = operands[i];
		const operandType = ruleOperands[i].type;
		if (!operandType && operandInstance !== ruleOperands[i].name) {
			return false;
		}
		if (!isOperandInstanceMatchingType(operandInstance, operandType)) {
			return false;
		}
	}

	return true;
}

function isOperandInstanceMatchingType(operandInstanceString, operandType) {
	if (!operandType) {
		return true;
	}

	//check if type is known subrule
	const match = subrules.get(operandType);
	if (match) {
		return match.includes(operandInstanceString);
	}

	//check if type is number
	const regex = /(u|s|i)([0-9]+)/;
	const regexMatch = regex.exec(operandType);
	if (regexMatch) {
		return !isNaN(operandInstanceString);
	}

	return false;
}

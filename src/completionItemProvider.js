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
				item.detail = mnemonic + " " + generateLabelForMnemonic(mnemonic);
				return item;
			});
		}

		return undefined;
	},
};

function getCompletionItems(possibleOperands, currentOperands) {
	const lastIndexOfCurrentOperands = currentOperands.length() - 1;
	if (lastIndexOfCurrentOperands == -1) {
		return null;
	}

	const currentOperand = currentOperands.pop();
	const completionItems = [];
	possibleOperands.forEach((operands) => {
		if (areOperandsMatchingRule(operands, currentOperands)) {
			//TODO
		}
	});

	//return new vscode.CompletionItem(operand, vscode.CompletionItemKind.Operator);
	return null; //TODO
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

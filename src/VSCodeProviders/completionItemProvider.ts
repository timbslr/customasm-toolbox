import CustomAsm, { OperandDefinition } from "../CustomAsm";
import Assert from "../util/Assert";
import FileProcessor from "../util/FileProcessor";
import { generateLabelForMnemonic } from "./hoverProvider";
import * as vscode from "vscode";

export const completionItemProvider = {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
		const lineText = document.lineAt(position).text;
		const prefix = lineText.slice(0, position.character).trim();

		// suggest operands/arguments if mnemonic is already there
		const match = FileProcessor.parseInstruction(lineText);
		if (match) {
			const operandDefinitionsForMnemonic = CustomAsm.rules.get(match.mnemonic);
			if (!operandDefinitionsForMnemonic) {
				return [];
			}
			return getCompletionItems(operandDefinitionsForMnemonic, match.operands);
		}

		// suggest mnemonics if nothing has been typed in the line yet
		if (/^\s*[a-zA-Z0-9_]*$/m.test(prefix)) {
			return CustomAsm.mnemonics.map((mnemonic) => {
				const item = new vscode.CompletionItem(mnemonic, vscode.CompletionItemKind.Field);
				const label = generateLabelForMnemonic(mnemonic);
				if (!label) {
					return item;
				}
				item.detail = label.value;
				return item;
			});
		}

		return [];
	},
};

function getCompletionItems(operandDefinitions: OperandDefinition[][], currentOperands: string[]): vscode.CompletionItem[] {
	if (currentOperands.length > 0) {
		currentOperands.pop();
	}
	const completionItems: vscode.CompletionItem[] = [];
	const completionStrings: Set<string> = new Set();
	operandDefinitions.forEach((operandDefinition) => {
		if (areOperandsMatchingRule(currentOperands, operandDefinition)) {
			const amountOfOperandsAlreadyChecked = currentOperands.length;
			if (operandDefinition.length > amountOfOperandsAlreadyChecked) {
				const operandType = operandDefinition[amountOfOperandsAlreadyChecked].type;
				if (operandType) {
					const subruleOperands = CustomAsm.operands.get(operandType);
					if (subruleOperands) {
						subruleOperands.forEach((operand) => {
							completionStrings.add(operand);
						});
					} else {
						completionStrings.add(`{${operandDefinition[amountOfOperandsAlreadyChecked].name}: ${operandType}}`);
					}
				} else {
					completionStrings.add(operandDefinition[amountOfOperandsAlreadyChecked].name);
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
 * @param {{name: string, type: string}[]} operandDefinitions
 */
export function areOperandsMatchingRule(operands: string[], operandDefinitions: OperandDefinition[]) {
	for (let i = 0; i < operands.length; i++) {
		const operandInstance = operands[i];
		const operandType = operandDefinitions[i].type;
		if (!operandType && operandInstance !== operandDefinitions[i].name) {
			return false;
		}
		if (!Assert.assertOperandInstanceMatchingDefinition(operandInstance, operandType)) {
			return false;
		}
	}

	return true;
}

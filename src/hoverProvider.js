import * as vscode from "vscode";
import { rules } from "./rulesProvider.js";

export const hoverProvider = {
	provideHover(document, position, token) {
		const wordRange = document.getWordRangeAtPosition(position, /\w+/);
		if (!wordRange) return;

		const mnemonic = document.getText(wordRange);
		const operandsLabel = generateOperandsLabelForMnemonic(mnemonic);
		if (!operandsLabel) return;

		const label = `${mnemonic} ${operandsLabel}`;

		return new vscode.Hover(label);
	},
};

export function generateOperandsLabelForMnemonic(mnemonic) {
	const operandsString = rules
		.find((rule) => rule.mnemonic === mnemonic)
		?.operands.map((operand) => `{${operand.name}: ${operand.type}}`)
		.join(", ");

	return operandsString;
}

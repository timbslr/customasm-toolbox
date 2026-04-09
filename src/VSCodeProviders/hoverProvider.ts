import * as vscode from "vscode";
import CustomAsm from "../CustomAsm";

export const hoverProvider = {
	provideHover(document: vscode.TextDocument, position: vscode.Position) {
		const wordRange = document.getWordRangeAtPosition(position, /\w+/);
		if (!wordRange) return;

		const mnemonic = document.getText(wordRange);
		const label = generateLabelForMnemonic(mnemonic);
		if (!label) return;

		return new vscode.Hover(label);
	},
};

export function generateLabelForMnemonic(mnemonic: string): vscode.MarkdownString | null {
	let label = new vscode.MarkdownString();
	label.supportHtml = true;
	label.isTrusted = true;

	const operandsForMnemonic = CustomAsm.rules.get(mnemonic);
	if (!operandsForMnemonic) {
		return null;
	}

	for (const operands of operandsForMnemonic) {
		const instructionLabel = `${mnemonic} ${operands.map((operand) => (operand.type === null ? operand.name : `{${operand.name}: ${operand.type}}`)).join(", ")}`;
		label.appendMarkdown(instructionLabel + "  \n");
	}

	const clobberedRegisters = CustomAsm.getClobberedMap().get(mnemonic);

	if (!clobberedRegisters) {
		return label;
	}

	const registersHtml = clobberedRegisters.map((reg) => `<span style="color:#ec7b5b;">${reg}</span>`).join(",");
	label.appendMarkdown(`\n<span style="color:#4FC1FF;">Clobbered Registers: ${registersHtml}</span>`);
	return label;
}

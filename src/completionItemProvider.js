import { getMnemonics, getSubruleOperands } from "./rulesProvider.js";
import * as vscode from "vscode";

export const completionItemProvider = {
	provideCompletionItems(document, position) {
		const lineText = document.lineAt(position).text;
		const prefix = lineText.slice(0, position.character).trim();

		// suggest operands/arguments if mnemonic is already there
		if (/^\s*\w+\s+/m.test(lineText)) {
			return getSubruleOperands().map((a) => new vscode.CompletionItem(a, vscode.CompletionItemKind.Variable));
		}

		// suggest mnemonics if nothing has been typed in the line yet
		if (/^\s*[a-zA-Z0-9_]*$/m.test(prefix)) {
			return getMnemonics().map((m) => new vscode.CompletionItem(m, vscode.CompletionItemKind.Keyword));
		}

		return undefined;
	},
};

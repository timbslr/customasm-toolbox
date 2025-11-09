import { getMnemonics } from "./rulesProvider.js";
import * as vscode from "vscode";

export const completionItemProvider = {
	provideCompletionItems(document, position) {
		const lineText = document.lineAt(position).text;
		const prefix = lineText.slice(0, position.character).trim();

		// suggest mnemonics if nothing has been typed in the line yet
		if (/^[A-Za-z]*$/.test(prefix)) {
			return getMnemonics().map((m) => new vscode.CompletionItem(m, vscode.CompletionItemKind.Keyword));
		}

		return undefined;
	},
};

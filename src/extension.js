import * as vscode from "vscode";
import { semanticTokensProvider, semanticTokensLegend } from "./semanticTokensProvider.js";
import { updateRules } from "./rulesProvider.js";
import { getRuledefPaths } from "./ruledefPathProvider.js";
import { completionItemProvider } from "./completionItemProvider.js";
import { hoverProvider } from "./hoverProvider.js";

/** This method is called when the extension is activated
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
	updateRules(); //call once to initialize rules

	const selector = { language: "customasm-assembly", scheme: "file" };

	const registeredSemanticTokensProvider = vscode.languages.registerDocumentSemanticTokensProvider(selector, semanticTokensProvider, semanticTokensLegend);
	context.subscriptions.push(registeredSemanticTokensProvider);

	const registeredCompletionItemProvider = vscode.languages.registerCompletionItemProvider(selector, completionItemProvider, " "); // space after mnemonic triggers suggestions
	context.subscriptions.push(registeredCompletionItemProvider);

	const registeredHoverProvider = vscode.languages.registerHoverProvider(selector, hoverProvider);
	context.subscriptions.push(registeredHoverProvider);

	// update the rules if any of the specified rule files is updated
	getRuledefPaths().forEach((ruledefPath) => {
		const ruledefWatcher = vscode.workspace.createFileSystemWatcher(ruledefPath);
		ruledefWatcher.onDidChange(() => {
			updateRules();
		});
	});

	// The command has been defined in the package.json file
	const disposable2 = vscode.commands.registerCommand("customasm-toolbox.helloWorld", function () {
		vscode.window.showInformationMessage("Hello World from customasm-toolbox extension!");
	});
	context.subscriptions.push(disposable2);
}

export function deactivate() {}

import * as vscode from "vscode";
import { semanticTokensProvider, semanticTokensLegend } from "./semanticTokensProvider.js";
import { updateRules } from "./rulesProvider.js";
import { getRuledefPaths } from "./ruledefPathProvider.js";

/** This method is called when the extension is activated
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
	updateRules(); //call once to initialize rules

	// Register the provider for the customasm-assembly language
	const selector = { language: "customasm-assembly", scheme: "file" };
	const disposable = vscode.languages.registerDocumentSemanticTokensProvider(selector, semanticTokensProvider, semanticTokensLegend);
	context.subscriptions.push(disposable);

	// The command has been defined in the package.json file
	const disposable2 = vscode.commands.registerCommand("customasm-toolbox.helloWorld", function () {
		vscode.window.showInformationMessage("Hello World from customasm-toolbox extension!");
	});
	context.subscriptions.push(disposable2);

	// update the rules if any of the specified rule files is updated
	getRuledefPaths().forEach((ruledefPath) => {
		const ruledefWatcher = vscode.workspace.createFileSystemWatcher(ruledefPath);
		ruledefWatcher.onDidChange((uri) => {
			updateRules();
		});
	});
}

export function deactivate() {}

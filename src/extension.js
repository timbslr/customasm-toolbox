import * as vscode from "vscode";
import { semanticTokensProvider, semanticTokensLegend } from "./semanticTokensProvider.js";
/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context) {
	console.log("Extension is now active!");

	// Register the provider for your language
	const selector = { language: "customasm-assembly", scheme: "file" };
	const disposable = vscode.languages.registerDocumentSemanticTokensProvider(selector, semanticTokensProvider, semanticTokensLegend);
	context.subscriptions.push(disposable);

	// The command has been defined in the package.json file
	const disposable2 = vscode.commands.registerCommand("customasm-syntax-highlighting.helloWorld", function () {
		vscode.window.showInformationMessage("Hello World from customasm-syntax-highlighting extension!");
	});

	context.subscriptions.push(disposable2);
}

export function deactivate() {}

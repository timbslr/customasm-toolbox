import * as vscode from "vscode";
import Path from "./util/Path";
import CustomAsm from "./CustomAsm";
import { semanticTokensProvider, semanticTokensLegend } from "./VSCodeProviders/semanticTokensProvider";
import { completionItemProvider } from "./VSCodeProviders/completionItemProvider";
import { hoverProvider } from "./VSCodeProviders/hoverProvider";

/** This method is called when the extension is activated
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	CustomAsm.updateRules(); //call once to initialize rules

	const languageSelector = { language: "customasm-assembly", scheme: "file" };

	const registeredSubscriptions = [
		vscode.languages.registerDocumentSemanticTokensProvider(languageSelector, semanticTokensProvider, semanticTokensLegend),
		vscode.languages.registerCompletionItemProvider(languageSelector, completionItemProvider, " "),
		vscode.languages.registerHoverProvider(languageSelector, hoverProvider),
		vscode.commands.registerCommand("customasm-toolbox.helloWorld", () => vscode.window.showInformationMessage("Hello World from customasm-toolbox extension!")),
	];

	context.subscriptions.push(...registeredSubscriptions);

	// update the rules if any of the specified rule files is updated
	Path.getRuleDefinitionPaths()?.forEach((ruledefPath) => {
		const ruledefWatcher = vscode.workspace.createFileSystemWatcher(ruledefPath);

		ruledefWatcher.onDidChange(() => {
			CustomAsm.updateRules();
		});
	});

	vscode.workspace.getConfiguration().update(
		"editor.semanticTokenColorCustomizations",
		{
			enabled: true,
			rules: {
				structClobbers: "#ec7b5b",
			},
		},
		vscode.ConfigurationTarget.Workspace,
	);
}

export function deactivate() {}

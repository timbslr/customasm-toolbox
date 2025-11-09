import * as vscode from "vscode";

/**
 *
 * @param {RegExp} regExp The regular expression that the input should me matched against
 * @param {vscode.TextDocument} document The document that should be checked
 * @returns {vscode.Range[]} The ranges in the document that matched the regular expression
 */
export function matchRegex(regExp, document) {
	const documentText = document.getText();
	const matchingRanges = [];
	let match;

	while ((match = regExp.exec(documentText))) {
		const start = document.positionAt(match.index);
		const end = document.positionAt(match.index + match[0].length);
		matchingRanges.push(new vscode.Range(start, end));
	}

	return matchingRanges;
}

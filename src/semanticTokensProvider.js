import * as vscode from "vscode";
import { mnemonics } from "./mnemonicsProvider.js";
import { matchRegex } from "./regexMatcher.js";

// Define what kinds of tokens and modifiers we can return
const tokenTypes = ["namespace", "class", "enum", "interface", "struct", "typeParameter", "type", "parameter", "variable", "property", "enumMember", "decorator", "event", "function", "method", "macro", "label", "comment", "string", "keyword", "number", "regexp", "operator"];
const tokenModifiers = ["declaration", "definition", "readonly", "static", "deprecated", "abstract", "async", "modification", "documentation", "defaultLibrary"];
export const semanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export const semanticTokensProvider = {
	provideDocumentSemanticTokens(document) {
		const tokensBuilder = new vscode.SemanticTokensBuilder(semanticTokensLegend);
		const text = document.getText();
		const mnemonicsRegex = new RegExp(`\\b(${mnemonics.join("|")})\\b`, "g");
		const foo = matchRegex(mnemonicsRegex, document, text);
		console.log(foo.length);
		foo.forEach((mnemonicsRange) => {
			tokensBuilder.push(mnemonicsRange, "comment", ["declaration"]);
		});

		return tokensBuilder.build();
	},
};

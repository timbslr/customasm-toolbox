import * as vscode from "vscode";
//import { mnemonics } from "./mnemonicsProvider.js";
import { matchRegex } from "./regexMatcher.js";
import { getMnemonics, getSubruleOperands } from "./rulesProvider.js";
import getTokenMapping from "./tokenMappings.js";

// Define what kinds of tokens and modifiers we can return
const tokenTypes = ["namespace", "class", "enum", "interface", "struct", "typeParameter", "type", "parameter", "variable", "property", "enumMember", "decorator", "event", "function", "method", "macro", "label", "comment", "string", "keyword", "number", "regexp", "operator"];
const tokenModifiers = ["declaration", "definition", "readonly", "static", "deprecated", "abstract", "async", "modification", "documentation", "defaultLibrary"];
export const semanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export const semanticTokensProvider = {
	provideDocumentSemanticTokens(document) {
		const tokensBuilder = new vscode.SemanticTokensBuilder(semanticTokensLegend);

		const mnemonics = getMnemonics();
		let semanticTokens = getSemanticTokens(mnemonics, "mnemonic", document);
		const subruleOperands = getSubruleOperands();
		semanticTokens = semanticTokens.concat(getSemanticTokens(subruleOperands, "subruleOperand", document));

		semanticTokens.forEach((semanticToken) => {
			tokensBuilder.push(semanticToken.range, semanticToken.tokenType, semanticToken.tokenModifiers);
		});

		return tokensBuilder.build();
	},
};

function getSemanticTokens(keywords, tokenKind, document) {
	const semanticTokens = [];
	const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
	const matchedRanges = matchRegex(keywordRegex, document);
	const tokenMapping = getTokenMapping(tokenKind);
	matchedRanges.forEach((range) => {
		semanticTokens.push({ range: range, tokenType: tokenMapping.mappedTokenType, tokenModifiers: tokenMapping.mappedTokenModifiers });
	});

	return semanticTokens;
}

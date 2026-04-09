import * as vscode from "vscode";
import { matchRegex } from "../regexMatcher";
import { getTokenMapping } from "../tokenMappings";
import CustomAsm from "../CustomAsm";

type SemanticToken = { range: vscode.Range; tokenType: string; tokenModifiers: string[] };

// Define what kinds of tokens and modifiers we can return
const tokenTypes = [
	"namespace",
	"class",
	"enum",
	"interface",
	"struct",
	"typeParameter",
	"type",
	"parameter",
	"variable",
	"property",
	"enumMember",
	"decorator",
	"event",
	"function",
	"method",
	"macro",
	"label",
	"comment",
	"string",
	"keyword",
	"number",
	"regexp",
	"operator",
	"structClobbers",
];
const tokenModifiers = ["declaration", "definition", "readonly", "static", "deprecated", "abstract", "async", "modification", "documentation", "defaultLibrary", "clobbers"];
export const semanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export const semanticTokensProvider = {
	provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.SemanticTokens {
		const tokensBuilder = new vscode.SemanticTokensBuilder(semanticTokensLegend);

		let semanticTokens = getSemanticTokens(CustomAsm.mnemonics, "mnemonic", document, CustomAsm.getClobberedMap());
		semanticTokens = semanticTokens.concat(getSemanticTokens(CustomAsm.operandValues, "subruleOperand", document));

		semanticTokens.forEach((semanticToken) => {
			tokensBuilder.push(semanticToken.range, semanticToken.tokenType, semanticToken.tokenModifiers);
		});

		return tokensBuilder.build();
	},
};

function getSemanticTokens(keywords: string[], tokenKind: string, document: vscode.TextDocument, clobberedRegistersMap?: Map<string, string[]>): SemanticToken[] {
	if (keywords.length === 0) {
		return [];
	}

	const semanticTokens: SemanticToken[] = [];
	const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
	const matchedRanges = matchRegex(keywordRegex, document);

	const tokenMapping = getTokenMapping(tokenKind);
	if (!tokenMapping) {
		return [];
	}

	const commentRanges = getCommentRanges(document);

	matchedRanges.forEach((range) => {
		const isInsideComment = commentRanges.some((c) => c.contains(range.start) || c.contains(range.end));

		if (!isInsideComment) {
			const modifiers = [...tokenMapping.mappedTokenModifiers];
			let tokenType = tokenMapping.mappedTokenType;
			if (clobberedRegistersMap?.has(document.getText(range))) {
				modifiers.push("clobbers");
				tokenType = "structClobbers";
			}
			semanticTokens.push({ range, tokenType, tokenModifiers: modifiers });
		}
	});

	return semanticTokens;
}

function getCommentRanges(document: vscode.TextDocument): vscode.Range[] {
	const commentRegexes = [
		/;\*[\s\S]*?\*;/g, // block comments
		/;.*$/gm, // line comments
	];

	const ranges: vscode.Range[] = [];

	for (const regex of commentRegexes) {
		const matches = matchRegex(regex, document);
		ranges.push(...matches);
	}

	return ranges;
}

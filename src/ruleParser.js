import { getMnemonics } from "./rulesProvider.js";

export function parseInstruction(line) {
	const mnemonics = getMnemonics();
	const regex = new RegExp(`^\\s*(${mnemonics.join("|")})\\s*(.*)$`, "gm");
	const match = regex.exec(line);
	let operandsString = match[2];
	operandsString = operandsString.includes("=>") ? operandsString.substring(0, operandsString.indexOf("=>")) : operandsString;
	const operands = operandsString.split(",").map((entry) => entry.trim());
	if (operands.length > 0 && operands[operands.length - 1] == "") {
		operands.pop();
	}
	return { mnemonic: match[1], operands: operands };
}

This extension uses static syntax analysis by analyzing files with regex as well as semantic syntax analysis for highlighting mnemonics e.g.

## Setting up semantic syntax highlighting

In order to use the full potential of this extension, you have to set up the path to all files containing rules that should be used in semantic syntax highlighting first.
This is done by creating a dedicated file containing all data the extension needs. At the root of your workspace, create a file named `.customasm.json` which contains at least the following content with the paths to the rule definitions:

```json
{
	"ruleDefinitions": ["exampleFile1.asm", "src/exampleFile2.asm"]
}
```

You can optionally add a list of clobbered registers per instruction and toggle the feature that highlights instructions that clobber registers in red in the editor. Here's an example how this may look like:

```json
{
	"showClobberedRegisters": true,
	"clobberedRegisterInstructions": [
		{ "mnemonic": "add", "clobberedRegisters": ["A"] },
		{ "mnemonic": "sub", "clobberedRegisters": ["A"] },
		{ "mnemonic": "beq", "clobberedRegisters": ["A", "TMP"] }
	]
}
```

## Requirements

This extension has some requirements in order to work properly:

- All ruledef's and subruledef's have to be described in exactly a single line of code. Multiple lines per rule will break the semantic syntax highlighting
- If you change anything in the .customasm.json file, please restart the extension

function parseLine(code) {
	code = code.trim();
	let results = variableOrFunctionRegEx.exec(code);
	if(results) {
		return {results: results, kind: results[1]};
	}

	results = existingVarSet.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.SET}
	}

	results = existingVarGet.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.GET};
	}

	results = functionCall.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.CALL};
	}

	return null;
}

function parseCode(code, lineNum=null, scriptName=null) {
	let lines = code.split("\n");
	let results = [];
	for(let i = 0; i < lines.length; i++) {
		let result = parseLine(lines[i]);
		if(result) {
			results.push(result);
		} else {
			results.push(new Error(ErrorNames.INVALID_SYNTAX, "Invalid Syntax: " + lines[i], lineNum, scriptName));
		}
	}

	return results;
}

function isReservedWord(word) {
	for(let i = 0; i < reservedWords.length; i++) {
		if(word.match(reservedWords[i])) {
			return true;
		}
	}

	return false;
}

function parseFunctionArgs(functionSig) {
	let functionArgs = functionSig.slice(functionSig.indexOf("(")+1, functionSig.lastIndexOf(")"));
	let args = [];
	let string = null;
	let start = 0;
	for(let i = 0; i < functionArgs.length; i++) {
		let currentChar = functionArgs.charAt(i);
		if(currentChar === ",") {
			if(!string) {
				args.push(functionArgs.slice(start, i).trim());
				start = i+1;
			}
		}
		else if(currentChar === "\"" || currentChar === "'") {
			if(!string) {
				string = currentChar;
			}
			else {
				if(currentChar === string) {
					string = null;
				}
			}
		}
	}
	args.push(functionArgs.slice(start).trim());

	return args;
}

function precidence(operator1, operator2) {
	if(precidenceChart == null) {
		var precidenceChart = {
			"+": 2,
			"-": 2,
			"*": 3,
			"/": 3,
			"%": 3,
			"<": 1,
			">": 1,
			"|": 0,
			"&": 0,
		};
	}

	return precidenceChart[operator1] >= precidenceChart[operator2];
}

class Script {
	constructor(name, code, status, externalVariables=null, externalFunctions=null, callback=null) {
		this.name = name;
		this.status = status;
		this.running = false;
		if(externalVariables) {
			this.variables = externalVariables.concat(gameStateHandler.variables);
			this.externalVariables = true;
		}
		if(externalFunctions) {
			this.functions = externalFunctions.concat(gameStateHandler.functions);
			this.externalFunctions = true;
		}
		this.callback = callback;
		this.setCode(code);
	}

	setCode(code) {
		this.errors = [];
		this.code = code;
		this.byteCode = [];
		this._currentLine = 0;
		this._tempVariables = [];
		if(!this.externalVariables) {
			this.variables = [].concat(gameStateHandler.variables);
		}
		if(!this.externalFunctions) {
			this.functions = [].concat(gameStateHandler.functions);
		}
		this.parseScript(code);
	}

	parseScript(code) {
		let results = parseCode(code, this._currentLine, this.name);
		for(let i = 0; i < results.length; i++) {
			this._currentLine++;
			let result = results[i];
			if(results[i].kind === CodeTypes.MAKE_VAR) {
				result = this.parseVar(results[i].results);
			}
			else if(results[i].kind === CodeTypes.MAKE_FUNCTION) {
				result = this.parseFunction(results[i].results);
			}
			else if(results[i].kind === CodeTypes.GET) {
				result = this.parseGet(results[i].results);
			}
			else if(results[i].kind === CodeTypes.SET) {
				result = this.parseSet(results[i].results);
			}
			else if(results[i].kind === CodeTypes.CALL) {
				result = this.parseCall(results[i].results);
			}

			if(result instanceof Error)  {
				this.errors.push(result);
			}
			else {
				this.byteCode.push(result);
			}
		}
	}

	parseVar(arr) {
		let name = arr[2];
		let functionResults = this.parseFunctionCall(arr[3]);
		if(functionResults instanceof Error)
		{
			return functionResults;
		}
		else if(this.getVariable(name) || this.getTempVariable(name)) {
			return new Error(ErrorNames.DUP_VAR, "Variable '" + name + "' already exists.", this._currentLine, this.name);
		}
		else if(this.getVariable(name) != null && this.getVariable(name).statuss === Status.GAME) {
			return new Error(ErrorNames.RESTRICTED, "Variable '" + name + "' is read-only.", this._currentLine, this.name);
		}
		let value = functionResults != null ? functionResults : this.parseValues(arr[3]);
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeMAKE_VAR(name, value, this);
		this._tempVariables.push(new Variable(name, null, this.status));
		return byteCode;
	}

	parseFunction(arr) {
		console.log("Trying to make function: " + arr);
	}
	
	parseGet(arr) {
		let name = arr[1];
		if(!this.getVariable(name) && !this.getTempVariable(name)) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name, this._currentLine, this.name);
		}
		return new ByteCodeGET_VAR(name, this);
	}

	parseSet(arr) {
		let name = arr[1];
		let functionResults = this.parseFunctionCall(arr[2]);
		if(functionResults === null && this.getVariable(name) === null) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name + ".", this._currentLine, this.name);
		}
		else if(this.getVariable(name).status === Status.GAME) {
			return new Error(ErrorNames.RESTRICTED, "Variable '" + name + "' is read-only.", this._currentLine, this.name);
		}
		let value = functionResults != null ? functionResults : this.parseValues(arr[2]);
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeSET_VAR(name, value, this);
		return byteCode;
	}

	parseCall(arr) {
		let name = arr[1];
		let args = parseFunctionArgs(arr[0]);
		for(let i = 0; i < args.length; i++) {
			args[i] = this.parseValues(args[i].trim());
			if(args[i] instanceof Error) {
				return args[i];
			}
		}
		let foundFunction = this.getFunction(name, args.length);
		if(foundFunction === null) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name + ".", this._currentLine, this.name);
		}
		if(foundFunction.length > args.length) {
			let plural = foundFunction.length === 1 ? "" : "s";
			return new Error(ErrorNames.INCORRECT_ARGS, foundFunction.name + " requires at least " + foundFunction.length + " argument" + plural + ", got " + args.length + ".", this._currentLine, this.name);
		}

		foundFunction.args = args;
		return foundFunction;
	}

	parseValues(values) {
		let separators = [];
		let tokens = [];

		let string = null;
		let start = 0;
		for(let i = 0; i < values.length; i++) {
			let currentChar = values.charAt(i);
			if(valueSeparators.test(currentChar)) {
				if(!string) {
					tokens.push(values.slice(start, i).trim());
					start = i+1;
					separators.push(i);
				}
			}
			else if(currentChar === "\"" || currentChar === "'") {
				if(!string) {
					string = currentChar;
				}
				else {
					if(currentChar === string) {
						string = null;
					}
				}
			}
		}
		tokens.push(values.slice(start).trim());

		for(let i = 0; i < tokens.length; i++)
		{
			tokens[i] = this.parseValue(tokens[i].trim());
			if(tokens[i] instanceof Error) {
				return tokens[i];
			}
		}

		while(separators.length > 0) {
			let currentOperator = 0;
			for(let i = 0; i < separators.length; i++) {
				let bigPrecChar = values.charAt(separators[currentOperator]);
				let currentChar = values.charAt(separators[i]);
				if(!precidence(bigPrecChar, currentChar)) {
					currentOperator = i;
				}
			}
			let chosenOperator = separators.splice(currentOperator, 1)[0];
			let chosenValues = tokens.splice(currentOperator, 2);
			let byteOperator = new ByteCodeOPERATOR(values.charAt(chosenOperator), chosenValues[0], chosenValues[1]);
			tokens.splice(currentOperator, 0, byteOperator);
		}

		return tokens[0];
	}

	parseValue(val) {
		let result = null;
		let strRegResults = stringRegEx.exec(val);
		if(strRegResults != null) {
			result = strRegResults[0];
			result = result.slice(1, result.length - 1);
			for(let i = 0; i < escapeCharactersReg.length; i++) {
				let pair = escapeCharactersReg[i];
				while(pair[0].test(result)) {
					result = result.replace(pair[0], pair[1]);
				}
			}
		}

		if(result === null) {
			result = Number(val)
			if(isNaN(result)) {
				result = null;
			}
		}

		if(result === null) {
			var variable = this.getTempVariable(val);
			var variable2 = this.getVariable(val);
			if(variable) {
				result = variable;
			}
			else if(variable2) {
				result = variable2;
			}
			else {
				let func = this.getFunction(val);
				let functionName = val.slice(0, val.indexOf("("));
				let func2 = this.getFunction(functionName);
				if(func) {
					result = func;
				}
				else if(func2) {
					let args = parseFunctionArgs(val);
					for(let i = 0; i < args.length; i++) {
						args[i] = this.parseValues(args[i]);
					}
					func2.args = args;
					result = func2;
				}
			}
		}

		if(result === null) {
			if(val === "true") {
				result = true;
			}
			else if(val === "false") {
				result = false;
			}
		}

		if(result === null) {
			result = new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + val, this._currentLine, this.name);
		}

		return result;
	}

	getVariable(variableName) {
		for(let i = 0; i < this.variables.length; i++) {
			if(this.variables[i].name === variableName) {
				return this.variables[i];
			}
		}

		return null;
	}

	getTempVariable(variableName) {
		for(let i = 0; i < this._tempVariables.length; i++) {
			if(this._tempVariables[i].name === variableName) {
				return this._tempVariables[i];
			}
		}

		return null;
	}

	getFunction(name, numOfArgs) {
		for(let i = 0; i < this.functions.length; i++) {
			if(this.functions[i].name === name) {
				return this.functions[i];
			}
		}

		return null;
	}

	execute() {
		this._currentLine = 1;
		this.running = true;
		if(this.errors.length > 0) {
			this.running = false;
			return this.errors;
		}
		
		for(let i = 0; i < this.byteCode.length; i++) {
			
			try {
				let value = this.byteCode[i].execute();
				if(this.callback)
				{
					this.callback(this.byteCode[i], value);
				}
			}
			catch(error) {
				if(error instanceof InternalError) {
					this.errors.push(new Error(ErrorNames.STACK_OVERFLOW, "Too much recursion", this._currentLine, this.name));
					this.running = false;
					return this.errors;
				}
			}
			this._currentLine++;
		}
		this.running = false;
		return [];
	}

	parseFunctionCall(funcStr) {
		funcStr += ";";
		if(funcStr.indexOf("(") === -1 && funcStr.indexOf(")") === -1) {
			return null;
		}
		let results = parseLine(funcStr);
		if(!results || isReservedWord(results.results[1])) {
			return null;
		}
		if(results != null) {
			results = this.parseCall(results.results);
		}

		return results;
	}
}

class Error {
	constructor(name, message, lineNum, scriptName) {
		this.name = name;
		this.message = message;
		this.lineNum = lineNum;
		this.scriptName = scriptName;
	}
}

var Status = {
	GAME: 1,
	PLAYER: 2,
	INTERPRETER: 3
};

var ErrorNames = {
	DUP_VAR: "Duplicate Variable",
	INVALID_VALUE: "Invalid Value",
	UNKNOWN_SYMBOL: "Unknown Symbol",
	INCORRECT_ARGS: "Incorrect number of arguments",
	INVALID_SYNTAX: "Invalid Syntax",
	RESTRICTED: "Access Restricted",
	STACK_OVERFLOW: "Stack Overflow"
};



var variableOrFunctionRegEx = /^(var|function)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);$/;
var existingVarSet = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);$/;
var existingVarGet = /^([a-zA-Z_][a-zA-Z0-9_]*);$/;
var functionCall = /^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\);$/;
var stringRegEx = /(?:^'(?:[^']|(?:\\'))*'$)|(?:^"(?:[^"]|(?:\\"))*"$)/;
var valueSeparators = /[-+\/%*|&<>]/;

var escapeCharactersReg = [
	[/\\n/, "\n"],
	[/\\t/, "\t"],
	[/\\'/, "'"],
	[/\\"/, "\""]
];

var reservedWords = [
	"true",
	"false",
];
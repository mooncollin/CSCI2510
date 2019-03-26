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

	results = ifStatement.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.IF};
	}

	results = endIfStatement.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.ENDIF};
	}

	results = whileStatement.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.WHILE};
	}

	results = endWhileStatement.exec(code);
	if(results) {
		return {results: results, kind: CodeTypes.ENDWHILE};
	}

	return null;
}

function parseCode(code, scriptName=null) {
	let lines = code.split("\n");
	let results = [];
	let lineNum = 0;
	for(let i = 0; i < lines.length; i++) {
		lineNum++;
		if(lines[i] != "") {
			let result = parseLine(lines[i]);
			if(result) {
				results.push(result);
			} else {
				results.push(new Error(ErrorNames.INVALID_SYNTAX, "Invalid Syntax: " + lines[i], lineNum, scriptName));
			}
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

function parseFunctionArgs(functionSig, type) {
	let functionArgs = [];
	if(type === "function") {
		functionArgs = functionSig.slice(functionSig.indexOf("(")+1, functionSig.lastIndexOf(")"));
	}
	else if(type === "array") {
		functionArgs = functionSig.slice(functionSig.indexOf("[")+1, functionSig.lastIndexOf("]"));
	}
	
	let args = [];
	let string = null;
	let start = 0;
	let inFunctionCall = false;
	for(let i = 0; i < functionArgs.length; i++) {
		let currentChar = functionArgs.charAt(i);
		if(currentChar === ",") {
			if(!string && !inFunctionCall) {
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
		else if(currentChar === "(") {
			inFunctionCall = true;
		}
		else if(currentChar === ")") {
			inFunctionCall = false;
		}
	}
	args.push(functionArgs.slice(start).trim());
	if(args.length === 1 && args[0] === "") {
		args = [];
	}
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
	constructor(name, code, status, externalVariables=null, externalFunctions=null, callback=null, executingEntity) {
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
		this.entity = executingEntity;
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
		for(let i = 0; i < this.functions.length; i++) {
			this.functions[i].script = this;
		}
		this.parseScript(code);
	}

	parseScript(code) {
		let results = parseCode(code, this.name);
		for(let i = 0; i < results.length; i++) {
			this._currentLine++;
			let result = this.parseByteCode(results, i);
			i = result[1];
			result = result[0];

			if(result instanceof Error)  {
				this.errors.push(result);
			}
			else {
				this.byteCode.push(result);
			}
		}
	}

	parseByteCode(results, i) {
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
		else if(results[i].kind === CodeTypes.IF) {
			result = this.parseIf(results[i].results, results, i+1);
			if(!(result instanceof Error)) {
				i = result.endLine;
			}
		}
		else if(results[i].kind === CodeTypes.ENDIF) {
			result = new ByteCodeENDIF(this);
		}
		else if(results[i].kind === CodeTypes.WHILE) {
			result = this.parseWhile(results[i].results, results, i+1);
			if(!(result instanceof Error)) {
				i += result.code.length + 1;
			}
		}
		else if(results[i].kind === CodeTypes.ENDWHILE) {
			result = new ByteCodeENDWHILE(this);
		}

		return [result, i];
	}

	parseVar(arr) {
		let name = arr[2];
		let functionResults = this.parseFunctionCall(arr[3]);
		let arrayResults = this.parseArray(arr[3]);
		if(functionResults instanceof Error) {
			return functionResults;
		}
		if(arrayResults instanceof Error) {
			return arrayResults;
		}
		else if(this.getVariable(name) || this.getTempVariable(name)) {
			return new Error(ErrorNames.DUP_VAR, "Variable '" + name + "' already exists.", this._currentLine, this.name);
		}
		else if(this.getVariable(name) != null && this.getVariable(name).status === Status.GAME
				|| this.getTempVariable(name) != null && this.getTempVariable(name).status === Status.GAME) {
			return new Error(ErrorNames.RESTRICTED, "Variable '" + name + "' is read-only.", this._currentLine, this.name);
		}
		let value = functionResults;
		if(value === null) {
			value = arrayResults;
		}
		if(value === null) {
			value = this.parseValues(arr[3]);
		}
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeMAKE_VAR(name, value, this);
		this._tempVariables.push(new Variable(name, null, this.status, this));
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
		let arrayResults = this.parseArray(arr[2]);
		if(functionResults === null && this.getVariable(name) === null && this.getTempVariable(name) === null) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name + ".", this._currentLine, this.name);
		}
		else if((this.getVariable(name) && this.getVariable(name).status === Status.GAME)
				|| (this.getTempVariable(name) && this.getTempVariable(name).status === Status.GAME)) {
			return new Error(ErrorNames.RESTRICTED, "Variable '" + name + "' is read-only.", this._currentLine, this.name);
		}
		let value = functionResults;
		if(value === null) {
			value = arrayResults;
		}
		if(value === null) {
			value = this.parseValues(arr[2]);
		}
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeSET_VAR(name, value, this);
		return byteCode;
	}

	parseCall(arr) {
		let name = arr[1];
		let args = parseFunctionArgs(arr[0], "function");
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

		foundFunction = new ByteCodeFunction(foundFunction.name, args, foundFunction.getCode(), this);
		return foundFunction;
	}

	parseIf(arr, results, position) {
		let functionResults = this.parseFunctionCall(arr[1]);
		let condition = functionResults;
		if(condition === null) {
			condition = this.parseValues(arr[1]);
		}
		if(condition instanceof Error) {
			return condition;
		}

		let inIf = false;
		let foundEnd = false;
		let code = [];
		let saveLine = this._currentLine;
		while(!foundEnd && position < results.length) {
			this._currentLine++;
			let compiledCode = this.parseByteCode(results, position);
			position = compiledCode[1];
			compiledCode = compiledCode[0];

			if(compiledCode instanceof Error) {
				this.errors.push(compiledCode);
			}
			else {
				if(compiledCode instanceof ByteCodeIF) {
					inIf = true;
					position--;
				}
				else if(compiledCode instanceof ByteCodeENDIF) {
					if(inIf) {
						inIf = false;
					}
					else {
						foundEnd = true;
					}
					
				}
				if(!foundEnd) {
					code.push(compiledCode);
				}
			}
			position++;
		}

		if(!foundEnd) {
			return new Error(ErrorNames.NOENDIF, "Missing endif", this._currentLine, this.name);
		}

		return new ByteCodeIF(condition, code, this, saveLine, position - 1);
	}

	parseWhile(arr, results, position) {
		let functionResults = this.parseFunctionCall(arr[1]);
		let condition = functionResults;
		if(condition === null) {
			condition = this.parseValues(arr[1]);
		}
		if(condition instanceof Error) {
			return condition;
		}
		
		let inWhile = false;
		let foundEnd = false;
		let code = [];
		let saveLine = this._currentLine;
		while(!foundEnd && position < results.length) {
			this._currentLine++;
			let compiledCode = this.parseByteCode(results, position);
			position = compiledCode[1];
			compiledCode = compiledCode[0];

			if(compiledCode instanceof Error) {
				this.errors.push(compiledCode);
			}
			else {
				if(compiledCode instanceof ByteCodeWHILE) {
					inWhile = true;
					position--;
				}
				else if(compiledCode instanceof ByteCodeENDWHILE) {
					if(inWhile) {
						inWhile = false;
					}
					else {
						foundEnd = true;
					}
				}
				if(!foundEnd) {
					code.push(compiledCode);
				}
			}
			position++;
		}

		if(!foundEnd) {
			return new Error(ErrorNames.NOENDWHILE, "Missing endwhile", this._currentLine, this.name);
		}

		return new ByteCodeWHILE(condition, code, this, saveLine, position);
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
			let byteOperator = new ByteCodeOPERATOR(values.charAt(chosenOperator), chosenValues[0], chosenValues[1], this);
			tokens.splice(currentOperator, 0, byteOperator);
		}

		return tokens[0];
	}

	parseValue(val) {
		let result = null;
		let strRegResults = stringRegEx.exec(val);

		// String
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

		// Number
		if(result === null) {
			result = Number(val)
			if(isNaN(result)) {
				result = null;
			}
		}

		// Variable or Function
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
					let args = parseFunctionArgs(val, "function");
					for(let i = 0; i < args.length; i++) {
						args[i] = this.parseValues(args[i]);
					}
					func2.args = args;
					result = func2;
				}
			}
		}

		// True or False
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
		this._currentLine = 0;
		this.running = true;
		if(this.errors.length > 0) {
			this.running = false;
			return this.errors;
		}

		if(!this.externalVariables) {
			this.variables = [].concat(gameStateHandler.variables);
		}
		if(!this.externalFunctions) {
			this.functions = [].concat(gameStateHandler.functions);
		}
		for(let i = 0; i < this.functions.length; i++) {
			this.functions[i].script = this;
		}

		executeNext(this.byteCode, -1, this);
		return [];
	}

	executeLine(lineNum) {
		if(lineNum < this.byteCode.length) {
			
			if(typeof this.byteCode[lineNum].moveFromTempVariables === "function") {
				this.byteCode[lineNum].script = this;
				this.byteCode[lineNum].moveFromTempVariables();
			}
			try {
				let value = this.byteCode[lineNum].execute();
				
				if(this.callback)
				{
					this.callback(this.byteCode[lineNum], value);
				}
				if(this.code[lineNum].type != CodeTypes.ENDWHILE && this.code[lineNum].type != CodeTypes.ENDIF
					&& this.code[lineNum].type != CodeTypes.WHILE && this.code[lineNum].type != CodeTypes.IF) {
					this._currentLine++;
				}
				executeNext(this.byteCode, lineNum, this);
			}
			catch(error) {
				if(error instanceof InternalError) {
					this.errors.push(new Error(ErrorNames.STACK_OVERFLOW, "Too much recursion", this._currentLine, this.name));
					if(this.callback)
					{
						this.callback(error, null);
					}
				}
				else {
					console.log(error);
				}
				this.running = false;
			}
		}
		else {
			this.running = false;
		}
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

	parseArray(str) {
		if(str.indexOf('[') === -1 && str.indexOf(']') === -1) {
			return null;
		}
		let values = parseFunctionArgs(str, "array");
		for(let i = 0; i < values.length; i++) {
			let value = this.parseValues(values[i]);
			if(value instanceof Error) {
				return value;
			}
			values[i] = value;
		}

		return values;
	}

	getCurrentLine() {
		return this._currentLine;
	}

	getEntity() {
		return this.entity;
	}
}

function executeNext(code, lineNum, callingObj) {
	let executeLineFunction = function(){
		callingObj.executeLine(lineNum + 1);
	};

	// If the code that was just executed was a looping or if structure
	// wait until it gets done before moving on.
	if((code.length > lineNum && lineNum >= 0) && (code[lineNum].type === CodeTypes.WHILE || code[lineNum].type === CodeTypes.IF)) {
		var executingLineInterval = setInterval(function(){
			if(callingObj.getCurrentLine() >= code[lineNum].endLine) {
				clearInterval(executingLineInterval);
				setTimeout(executeLineFunction, callingObj.getEntity().executionSpeed);
			}
		}, 50);
	}
	else {
		setTimeout(executeLineFunction, callingObj.getEntity().executionSpeed);
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
	STACK_OVERFLOW: "Stack Overflow",
	NOENDIF: "Missing endif",
	NOENDWHILE: "Missing endwhile"
};



var variableOrFunctionRegEx = /^(var|function)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);$/;
var existingVarSet = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);$/;
var existingVarGet = /^([a-zA-Z_][a-zA-Z0-9_]*);$/;
var functionCall = /^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\);$/;
var stringRegEx = /(?:^'(?:[^']|(?:\\'))*'$)|(?:^"(?:[^"]|(?:\\"))*"$)/;
var ifStatement = /^if\s*(.+)/;
var whileStatement = /^while\s*(.+)/;
var endIfStatement = /^endif$/;
var endWhileStatement = /^endwhile$/;
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
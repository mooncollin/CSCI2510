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

function parseCode(code) {
	let lines = code.split("\n");
	let results = [];
	for(let i = 0; i < lines.length; i++) {
		let result = parseLine(lines[i]);
		if(result) {
			results.push(result);
		}
	}

	return results;
}

function precidence(operator1, operator2) {
	if(precidenceChart == null) {
		var precidenceChart = {
			"+": 0,
			"-": 0,
			"*": 1,
			"/": 1,
			"%": 1
		};
	}

	return precidenceChart[operator1] >= precidenceChart[operator2];
}

class Script {
	constructor(name, code, status, externalVariables=null, externalFunctions=null) {
		this.name = name;
		this.status = status;
		if(externalVariables) {
			this.variables = externalVariables.concat(gameStateHandler.variables);
			this.externalVariables = true;
		}
		if(externalFunctions) {
			this.functions = externalFunctions.concat(gameStateHandler.functions);
			this.externalFunctions = true;
		}
		this.setCode(code);
	}

	setCode(code) {
		this.errors = [];
		this.code = code;
		this.byteCode = [];
		this._currentLine = 0;
		if(!this.externalVariables) {
			this.variables = [].concat(gameStateHandler.variables);
		}
		if(!this.externalFunctions) {
			this.functions = [].concat(gameStateHandler.functions);
		}
		this.parseScript(code);
	}

	parseScript(code) {
		let results = parseCode(code);
		for(let i = 0; i < results.length; i++) {
			this._currentLine++;
			let result = null;
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

			if(result != null) {
				if(result instanceof Error)  {
					this.errors.push(result);
				}
				else {
					this.byteCode.push(result);
				}
			}
		}
	}

	parseVar(arr) {
		let name = arr[2];
		if(this.getVariable(name)) {
			return new Error(ErrorNames.DUP_VAR, "Variable: '" + name + "' already exists.", this._currentLine, this.name);
		}
		let value = this.parseValues(arr[3]);
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeMAKE_VAR(name, value, this);
		this.variables.push(new Variable(name, null, this.status));
		return byteCode;
	}

	parseFunction(arr) {
		console.log("Trying to make function: " + arr);
	}
	
	parseGet(arr) {
		console.log("Trying to get: " + arr);
	}

	parseSet(arr) {
		let name = arr[1];
		if(!this.getVariable(name)) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name, this._currentLine, this.name);
		}
		let value = this.parseValues(arr[2]);
		if(value instanceof Error) {
			return value;
		}
		let byteCode = new ByteCodeMAKE_VAR(name, value, this);
		return byteCode;
	}

	parseCall(arr) {
		let name = arr[1];
		let args = arr[2].split(',').filter(function(el){
			return el != null && el != "";
		});
		for(let i = 0; i < args.length; i++) {
			args[i] = this.parseValues(args[i].trim());
			if(args[i] instanceof Error) {
				return args[i];
			}
		}
		let foundFunction = this.getFunction(name, args.length);
		if(foundFunction === null) {
			return new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + name, this._currentLine, this.name);
		}

		foundFunction.args = args;
		return foundFunction;
	}

	parseValues(values) {
		let separators = [];
		let tokens = values.split(valueSeparators);
		let location = values.search(valueSeparators);
		while(location >= 0)
		{
			separators.push(values.charAt(location));
			values = values.substring(location+1);
			location = values.search(valueSeparators);
		}

		for(let i = 0; i < tokens.length; i++)
		{
			tokens[i] = this.parseValue(tokens[i].trim());
			if(tokens[i] instanceof Error) {
				return tokens[i];
			}
		}

		while(separators.length > 0) {
			let currentOperator = 0;
			for(let i = 1; i < separators.length; i++) {
				if(!precidence(separators[currentOperator], separators[i])) {
					currentOperator = i;
				}
			}
			let chosenOperator = separators.splice(currentOperator, 1)[0];
			let chosenValues = tokens.splice(currentOperator, 2);
			let byteOperator = new ByteCodeOPERATOR(chosenOperator, chosenValues[0], chosenValues[1]);
			tokens.splice(chosenOperator, 0, byteOperator);
		}

		return tokens[0];
	}

	parseValue(val) {
		let result = null;
		let strRegResults = stringRegEx.exec(val);
		if(strRegResults != null) {
			result = strRegResults[0];
			result = result.replace("\\n", "\n");
			result = result.replace("\\t", "\t");
			result = result.replace("\\'", "'");
			result = result.replace("\\\"", "\"");
		}

		if(result === null) {
			result = Number(val)
			if(isNaN(result)) {
				result = null;
			}
		}

		if(result === null) {
			var variable = this.getVariable(val);
			if(variable) {
				result = variable;
			}
			else {
				var func = this.getFunction(val);
				if(func) {
					result = func;
				}
			}

			if(result === null) {
				result = new Error(ErrorNames.UNKNOWN_SYMBOL, "Cannot find symbol: " + val, this._currentLine, this.name);
			}
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

	getFunction(name, numOfArgs) {
		for(let i = 0; i < this.functions.length; i++) {
			if(this.functions[i].name === name) {
				return this.functions[i];
			}
		}

		return null;
	}

	execute() {
		if(this.errors.length > 0) {
			return this.errors;
		}
		for(let i = 0; i < this.byteCode.length; i++) {
			this.byteCode[i].execute();
		}
		return [];
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
	INCORRECT_ARGS: "Incorrect number of arguments"
};



var variableOrFunctionRegEx = /^(var|function)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);/;
var existingVarSet = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.*?);/;
var existingVarGet = /^([a-zA-Z_][a-zA-Z0-9_]*);/;
var functionCall = /^([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\);/;
var stringRegEx = /(?:^'(?:[^']|(?:\\'))*'$)|(?:^"(?:[^"]|(?:\\"))*"$)/;
var valueSeparators = /[-+\/%*]/;
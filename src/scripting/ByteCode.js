class Variable {
	constructor(name, variable, statu, script) {
		this.name = name;
		this.variable = variable;
		this.status = status;
		this.script = script;
	}

	getValue() {
		if(this.variable instanceof ByteCode) {
			return this.variable.getValue();
		}
		if(this.variable instanceof Function) {
			return this.variable.execute();
		}
		return this.variable;
	}
}

class Function extends Variable {
	constructor(name, func, status, args=[]) {
		super(name, func, status, null);
		this.args = args;
		this.length = func.length;
	}

	equals(other) {
		if(!(other instanceof Function)) {
			return false;
		}

		return this.name === other.name && this.length === other.length;
	}

	execute() {
		let completedArguments = [].concat(this.args);
		for(let i = 0; i < completedArguments.length; i++) {
			if(typeof completedArguments[i].getValue === "function") {
				completedArguments[i] = completedArguments[i].getValue();
			}
		}
		return this.variable(...completedArguments);
	}

	getValue() {
		return this.execute();
	}

	getFunctionVariable() {
		return this.variable;
	}

	moveFromTempVariables() {
		let completedArguments = [].concat(this.args);
		for(let i = 0; i < completedArguments.length; i++) {
			let arg = completedArguments[i];
			if(arg instanceof Variable) {
				completedArguments[i] = this.script.getVariable(arg.name);
			}
			else if(typeof arg.moveFromTempVariables === "function") {
				completedArguments[i].moveFromTempVariables();
			}
		}
		this.args = completedArguments;
	}
}

class ByteCode {
	constructor(type, script) {
		this.type = type;
		this.script = script;
	}

	execute() {

	}

	getValue() {
		return this.execute();
	}

	moveFromTempVariables() {}
}

class ByteCodeOPERATOR extends ByteCode {
	constructor(type, operand1, operand2, script) {
		super(type, script);
		this.operand1 = operand1;
		this.operand2 = operand2;
	}

	execute() {
		let value1 = this.operand1;
		let value2 = this.operand2;
		let result = null;
		if(typeof this.operand1.getValue === "function") {
			value1 = this.operand1.getValue();
		}
		if(typeof this.operand2.getValue === "function") {
			value2 = this.operand2.getValue();
		}
		switch(this.type) {
			case OperatorTypes.ADD:
				result = value1 + value2;
				break;
			case OperatorTypes.SUBSTRACT:
				result = value1 - value2;
				break;
			case OperatorTypes.MULTIPLY:
				result = value1 * value2;
				break;
			case OperatorTypes.DIVIDE:
				result = value1 / value2;
				break;
			case OperatorTypes.MOD:
				result = value1 % value2;
				break;
			case OperatorTypes.AND:
				result = value1 && value2;
				break;
			case OperatorTypes.OR:
				result = value1 || value2;
				break;
			case OperatorTypes.GREATER:
				result = value1 > value2;
				break;
			case OperatorTypes.LESSER:
				result = value1 < value2;
				break;
		}

		return result;
	}

	moveFromTempVariables() {
		if(this.operand1 instanceof Variable) {
			this.operand1 = this.script.getVariable(this.operand1.name);
		}
		else if(typeof this.operand1.moveFromTempVariables === "function") {
			this.operand1.moveFromTempVariables();
		}
		if(this.operand2 instanceof Variable) {
			this.operand2 = this.script.getVariable(this.operand2.name);
		}
		else if(typeof this.operand2.moveFromTempVariables === "function") {
			this.operand2.moveFromTempVariables();
		}
	}
}

class ByteCodeMAKE_VAR extends ByteCode {
	constructor(name, value, script) {
		super(CodeTypes.MAKE_VAR, script);
		this.name = name;
		this.value = value;
	}

	execute() {
		let value = this.getValue();

		this.script.variables.push(new Variable(this.name, value, this.script.status));
		return value;
	}

	getValue() {
		let realValue = this.value;
		if(typeof realValue.getValue === "function") {
			realValue = realValue.getValue();
		}

		return realValue;
	}

	moveFromTempVariables() {
		if(this.value instanceof Variable) {
			this.value = this.script.getVariable(this.value.name);
		}
		else if(typeof this.value.moveFromTempVariables === "function") {
			this.value.moveFromTempVariables();
		}
	}
}

class ByteCodeSET_VAR extends ByteCode {
	constructor(name, value, script) {
		super(CodeTypes.MAKE_VAR, script);
		this.name = name;
		this.value = value;
	}

	execute() {
		let value = this.getValue();
		this.script.getVariable(this.name).variable = value;
		return value;
	}

	getValue() {
		let realValue = this.value;
		if(typeof realValue.getValue === "function") {
			realValue = realValue.getValue();
		}

		return realValue;
	}

	moveFromTempVariables() {
		if(this.value instanceof Variable) {
			this.value = this.script.getVariable(this.value.name);
		}
		else if(typeof this.value.moveFromTempVariables === "function") {
			this.value.moveFromTempVariables();
		}
	}
}

class ByteCodeGET_VAR extends ByteCode {
	constructor(name, script) {
		super(CodeTypes.GET, script);
		this.name = name;
	}

	execute() {
		let value = this.script.getVariable(this.name).variable;
		if(typeof value.getValue === "function") {
			value = value.getValue();
		}
		return value;
	}
}


class ByteCodeFunction extends ByteCode {
	constructor(type, name, args=[], code, script) {
		super(type, script);
		this.name = name;
		this.args = args;
		this.length = this.args.length;
		this.code = code;
	}

	execute() {
		for(let i = 0; i < code.length; i++) {
			code[i].execute();
		}
	}

	equals(other) {
		if(!(other instanceof ByteCodeFunction)) {
			return false;
		}

		return this.name === other.name && this.length === other.length;
	}
}

var CodeTypes = {
	GET: "get",
	CALL: "call",
	MAKE_VAR: "var",
	MAKE_FUNCTION: "function",
	SET: "set"
};

var OperatorTypes = {
	ADD: "+",
	SUBSTRACT: "-",
	MULTIPLY: "*",
	DIVIDE: "/",
	MOD: "%",
	AND: "&",
	OR: "|",
	GREATER: ">",
	LESSER: "<"
}
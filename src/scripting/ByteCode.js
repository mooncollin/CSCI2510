class Variable {
	constructor(name, variable, status) {
		this.name = name;
		this.variable = variable;
		this.status = status;
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
		super(name, func, status);
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
}

class ByteCode {
	constructor(type) {
		this.type = type;
	}

	execute() {

	}

	getValue() {
		return this.execute();
	}
}

class ByteCodeOPERATOR extends ByteCode {
	constructor(type, operand1, operand2) {
		super(type);
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
		}

		return result;
	}
}

class ByteCodeMAKE_VAR extends ByteCode {
	constructor(name, value, script) {
		super(CodeTypes.MAKE_VAR);
		this.name = name;
		this.value = value;
		this.script = script;
	}

	execute() {
		let currentVar = this.script.getVariable(this.name);
		if(typeof this.value.getValue === "function") {
			currentVar.variable = this.value.getValue();
		}
		else {
			currentVar.variable = this.value;
		}
	}
}


class ByteCodeFunction extends ByteCode {
	constructor(type, name, args=[], code) {
		super(type);
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
};

var OperatorTypes = {
	ADD: "+",
	SUBSTRACT: "-",
	MULTIPLY: "*",
	DIVIDE: "/",
	MOD: "%"
}
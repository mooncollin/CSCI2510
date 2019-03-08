class Triangle extends Geometry {
	constructor(vec1, vec2, vec3) {
		if(!(vec1 instanceof Vector2)
			|| !(vec2 instanceof Vector2)
			|| !(vec3 instanceof Vector2)) {
				throw "Triangle constructor values must be of type Vector2";
		}

		this.points = [vec1, vec2, vec3];
	}
}
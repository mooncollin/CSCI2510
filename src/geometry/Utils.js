function flipYAxis(components) {
	for(let i = 0; i < components.length; i++) {
		if(components[i] instanceof GeometryRendererComponent) {
			components[i].offsetX = -components[i].offsetX;
		}
		if(components[i].components != undefined) {
			flipYAxis(components[i].components);
		}
	}
}
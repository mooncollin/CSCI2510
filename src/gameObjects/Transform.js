//Defines a model's transforms from model space into world space
class Transform{

	constructor(vec1, vec2){
		//translate
		 this.position = new Vector2(0, 0);
  
		//scale
	  this.scale = new Vector2(0, 0);
	  this.scale.x = 1;
	  this.scale.y = 1;
  
	  //rotate
		this.rotation = 0;
		
		if(vec1) {
			this.position.x = vec1.x;
			this.position.y = vec1.y;
		}
		if(vec2) {
			this.scale.x = vec2.x;
			this.scale.y = vec2.y;
		}
	}
  }
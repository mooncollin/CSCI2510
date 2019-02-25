//Defines a model's transforms from model space into world space
class Transform{

	constructor(){
	  //translate
	 this.position = new Vector2();
  
	  //scale
	  this.scale = new Vector2();
	  this.scale.x = 1;
	  this.scale.y = 1;
  
	  //rotate
	  this.rotation = 0;
	}
  }
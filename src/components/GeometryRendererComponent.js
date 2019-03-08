class GeometryRendererComponent extends RendererComponent {
	constructor(color, geometry, offsetX=0, offsetY=0) {
		super();
		this.color = color;
		this.geometry = geometry;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}

	render(ctx, gameObject) {

		ctx.fillStyle = this.color;
	
		if (this.geometry instanceof AxisAlignedRectangle) {
		  let width = this.geometry.width;
		  let height = this.geometry.height;
	
		  let x = -width / 2;
		  let y = -height / 2;
	
		  ctx.fillRect(x + this.offsetX, y + this.offsetY, width, height);
	
		}
		else if (this.geometry instanceof Circle) {
		  ctx.fillStyle = this.color;
	
		  ctx.beginPath();
		  ctx.ellipse(0, 0, this.geometry.radius, this.geometry.radius, 0, 0, Math.PI * 2);
		  ctx.fill();
		}
		else if (this.geometry instanceof Vector2) {
		  ctx.strokeStyle = this.color;
		  ctx.lineWidth = .05;
	
		  ctx.beginPath();
		  ctx.moveTo(this.geometry.x - .25, 0);
		  ctx.lineTo(this.geometry.y + .25, 0);
		  ctx.moveTo(0, this.geometry.y + .25);
		  ctx.lineTo(0, this.geometry.y - .25);
		  ctx.stroke();
		}
		else if(this.geometry instanceof Triangle) {
			ctx.strokeStyle = this.color;
      ctx.lineWidth = .1;
      ctx.beginPath();
      ctx.moveTo(this.geometry.points[0].x, this.geometry.points[0].y);
      ctx.lineTo(this.geometry.points[1].x, this.geometry.points[1].y);
      ctx.lineTo(this.geometry.points[2].x, this.geometry.points[2].y);
      ctx.lineTo(this.geometry.points[0].x, this.geometry.points[0].y);
      ctx.stroke();
		}
		 
	}
}
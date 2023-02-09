// (function(t){
const DEPTH_SORT = true;
var drawable = [];
class Camera{
	constructor(fov=140,res=1){
		this.show_2D_MAP = false;
		this.fov = fov;
		this.res = res;
		this.map = new Path2D;
		this.x = 20;
		this.y = 20;
		this.pt = {x:0,y:0};
		this.dir = 0;
		this.show = false;
		this.DV;
	}
	castRay(){

	}
	draw(){
		ctx.beginPath();
		ctx.fillStyle = 'yellow';
		ctx.fillRect(this.x-3,this.y-3,6,6);
		this.show = true;
	}
	update(draw3d=true){
		const THIS = this;
		let speed = 3;
		if(keys.down('arrowup') || keys.down('w')){
			tryMove(speed);
		}
		if(keys.down('arrowdown') || keys.down('s')){
			tryMove(-speed);
		}
		if(keys.down('arrowleft')){
			this.dir -= 6;
		}
		if(keys.down('arrowright')){
			this.dir += 6;
		}
		if(keys.down('a')){
			tryMove(speed,-90);
		}
		if(keys.down('d')){
			tryMove(speed,90);
		}
		function tryMove(steps,dir_off=0){
			let dir_radians = (THIS.dir+dir_off) * Math.PI / 180;
			let x = Math.cos(dir_radians) * steps;
			let y = Math.sin(dir_radians) * steps;
			collision(x,0);
			collision(0,y);
		}
		function collision(x,y){
			let nx = THIS.x + x;
			let ny = THIS.y + y;
			if(!ctx.isPointInPath(THIS.map,nx,ny)){
				THIS.x = nx;
				THIS.y = ny;
			}
		}
		this.raycast(draw3d);
	}
	raycast(draw3d){
		var DV = 350 / (Math.tan(this.fov) / 2);
		var rays = [];
		let x = this.res / 2 - 350;
		for(let i=0;i<700/this.res;i++){
			rays.unshift(this.castRay(this.dir + 180/Math.PI*Math.atan(x/DV)));
			x += this.res;
		}
		let r = 700 / rays.length;
		this.show = false;
		this.DV = DV;
		if(draw3d){
			for(let i=0;i<rays.length;i++){
				rays[i].i=i;
				if(!DEPTH_SORT){
					drawWall(rays[i],this);
				} 
				else {
					drawable.push(rays[i]);
				}
			}
		}
	}
	castRay(dir){
		this.pt.x = this.x;
		this.pt.y = this.y;
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 4;
		let dist = 0;
		while(!ctx.isPointInPath(this.map,this.pt.x,this.pt.y)){
			dist += 4;
			this.pt.x += Math.cos(dir*Math.PI/180) * 4;
			this.pt.y += Math.sin(dir*Math.PI/180) * 4;
			if(dist > 10000) return {d:10000,c:140};
		}
		while(ctx.isPointInPath(this.map,this.pt.x,this.pt.y)){
			dist -= .5;
			this.pt.x += Math.cos(dir*Math.PI/180) * -.5;
			this.pt.y += Math.sin(dir*Math.PI/180) * -.5;
		}
		let test_left = ctx.isPointInPath(this.map,this.pt.x+2,this.pt.y);
		let test_right = ctx.isPointInPath(this.map,this.pt.x-2,this.pt.y);
		let color = test_left || test_right ? 135 : 100;
		if(this.show){
			ctx.beginPath();
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 1;
			ctx.moveTo(this.x,this.y);
			ctx.lineTo(this.pt.x,this.pt.y);
			ctx.stroke();
		}
		let ray_angle = (this.dir - dir) * Math.PI / 180;
		let corrected_dist = Math.cos(ray_angle) * dist;
		return {d:corrected_dist,c:color,t:'w'};
	}
}
function drawWall(ray,camera){
	let h = 20*(camera.DV/ray.d); // HIGHT FORMULA (height of walls)
	let sy = h/2;
	let r = camera.res;
	ctx.fillStyle = `hsl(${ray.c},75%,${80-(ray.d*.4)}%)`;
	ctx.fillRect(ray.i*r,250-sy,r+1,h);
}
class Entity{
	constructor(x,y,size=5){
		this.x = x;
		this.y = y;
		this.size = size;
		this.image;
		this.d = 0;
		this.t = 'e';
	}
	isPointInPath(x,y){
		return distance(this.x,this.y,x,y) <= this.size;
	}
	draw(){
		ctx.beginPath();
		ctx.fillStyle = 'cyan';
		ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
		ctx.fill();
	}
	calculate3Dpos(camera){
		let cdir = (((camera.dir+camera.fov/1.53)%360) * Math.PI / 180) * -1;
		let tx = this.x - camera.x;
		let ty = this.y - camera.y;
		let vx = (tx*Math.cos(cdir)) - (ty*Math.sin(cdir));
		let vy = (tx*Math.sin(cdir)) + (ty*Math.cos(cdir));
		this.vx = vx; // x value (left / right)
		this.vy = vy; // distance from camera
		this.d = -vy;
	}
	draw3D(camera){
		let DV = camera.DV;
		let d = this.vy;
		let h = 20*(DV/d);
		let x = this.vx*(DV/d);
		let y = 250;
		this.threedata = {d,h,x,y,DV};
		if(h < 0) return;
		h = h*.6;
		ctx.drawImage(this.image,(x-h/2)+350,y,h,h);
	}
}




// })(this);
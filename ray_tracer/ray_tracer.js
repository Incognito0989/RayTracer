
//Andrew Jones
// You should swap in your routines from Part A for the placeholder routines below
// these are the routines that you should write for the project

let bounces = 1;
//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Scene {  
  constructor() {
    this.ambientLight = false;
    this.backColor = new p5.Vector(0, 0, 0);
    this.lights = [];
    this.objects = [];
    this.rays = [];
    this.fov = 0;
  }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Sphere {
  constructor(pos, radius, mat) {
    this.pos = pos;
    this.radius = radius;
    this.material = mat;
  }
  
    //returns closest intersection point of object
  checkIntersection(ray) {
    let rayDirection = createVector(ray.direction.x, ray.direction.y, ray.direction.z);
    let rayOrigin = createVector(ray.origin.x, ray.origin.y, ray.origin.z);
    
    let a = pow(rayDirection.x, 2) + pow(rayDirection.y, 2) + pow(rayDirection.z, 2);
    let b = 2 * ((rayDirection.x * (rayOrigin.x - this.pos.x)) + (rayDirection.y * (rayOrigin.y - this.pos.y)) + (rayDirection.z * (rayOrigin.z - this.pos.z)));
    let c = pow(rayOrigin.x - this.pos.x, 2) + pow(rayOrigin.y - this.pos.y, 2) + pow(rayOrigin.z - this.pos.z, 2) - pow(this.radius,2);
    let quadraticTest = (pow(b,2) - (4 * a * c));

    if (quadraticTest < 0) {
      return null;
    } else {
      let negative = (-b - sqrt(quadraticTest));
      negative /= (2 * a);
      let positive = (-b + sqrt(quadraticTest));
      positive /= (2 * a);
      let solutions = [negative, positive];
      
      if (negative < 0) {
        //remove front entry
        solutions.splice(0,1);
      }
      if (positive < 0) {
        //remove back entry
        solutions.splice(solutions.length - 1, 1);
      }
      if (solutions.length == 2) {
        //check for most valid t value
        return Math.min(negative, positive);
      } else if (solutions.length == 1) {
        return solutions[0];
      } else {
        return null;
      }
  }
}
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Cap {
  constructor(p, radius, h, mat, cyl) {
    this.cylinder = cyl;
    this.pos = p;
    this.radius = radius;
    this.h = h;
    this.material = mat;        //vector
  }
  
  checkIntersection(ray) {
          let ret = [];
          let top = ((this.pos.y + this.h) - ray.origin.y) / (ray.direction.y);            //the t of hitting the top cap
          let bot = ((this.pos.y) - ray.origin.y) / (ray.direction.y);                     //the t of hitting the bot cap
          let xt = top * ray.direction.x + ray.origin.x;
          let zt = top * ray.direction.z + ray.origin.z;

          let xb = bot * ray.direction.x + ray.origin.x;
          let zb = bot * ray.direction.z + ray.origin.z;
          let topV = new p5.Vector(xt, top, zt);
          let botV = new p5.Vector(xb, bot, zb);
          
          topV.sub(this.pos);
          botV.sub(this.pos);
          let a = pow(pow(topV.x, 2) + pow(topV.z, 2), 0.5);
          let b = pow(pow(botV.x, 2) + pow(botV.z, 2), 0.5);
          
          if(top >= 0  &&  a <= this.radius) {
            ret.push(top);
          }
          if(bot >= 0  &&  b <= this.radius) {
            ret.push(bot);
          }
          if(ret.length > 0) {
            return Math.min.apply(Math, ret);
          } else {return null;}
  }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Cylinder {
  constructor(p, radius, h, mat) {
    this.pos = p;
    this.radius = radius;
    this.h = h;
    this.material = mat;        //vector
  }
  
  
  //returns closest intersection point of object
  checkIntersection(ray) {
    let rayDirection = createVector(ray.direction.x, ray.direction.y, ray.direction.z);
    let rayOrigin = createVector(ray.origin.x, ray.origin.y, ray.origin.z);
    
    let a = pow(rayDirection.x, 2) + pow(rayDirection.z, 2);
    let b = 2 * ((rayDirection.x * (rayOrigin.x - this.pos.x)) + (rayDirection.z * (rayOrigin.z - this.pos.z)));
    let c = pow(rayOrigin.x - this.pos.x, 2) + pow(rayOrigin.z - this.pos.z, 2) - pow(this.radius,2);

    let quadraticTest = (pow(b,2) - (4 * a * c));

    if (quadraticTest < 0) {
      return null;
    } else {
      let negative = (-b - sqrt(quadraticTest));
      negative /= (2 * a);
      let positive = (-b + sqrt(quadraticTest));
      positive /= (2 * a);
      let solutions = [negative, positive];

      if (negative < 0) {
        //remove front entry
        solutions.splice(0,1);
      }
      if (positive < 0) {
        //remove back entry
        solutions.splice(solutions.length - 1, 1);
      }
      if (solutions.length == 2) {
        let n = negative;      //front
        let p = positive;
        negative = valChecker(negative, ray, this);
        //return negative;
        positive = valChecker(positive, ray, this);
        //check for most valid t value
        
        //if the back of the object is valid but front is not, then checks for the top or bottom of the cap


        if(negative == null) {    //back isnt valid
          return positive;
        } else if(positive == null) {  //front isnt valid
          return negative;
        } else {
          //front and back are both valid
          return Math.min(negative, positive);
        }
        
      } else if (solutions.length == 1) {
        return valChecker(solutions[0], ray, this);
      } else {
        return null;
      }
  }
}
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Ray {
  constructor() {
    this.origin = new p5.Vector(0, 0, 0);
    this.direction = new p5.Vector(0, 0, 0);
    this.dColor = new p5.Vector(0, 0, 0);
  }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Light {
  constructor(c, position) {
    this.lightColor = c;
    this.pos = position;
  }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class AmbientLight {
 constructor(ambient) {
   this.ambient = ambient;
 }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Material {
  constructor(diffuse, ambient, specular, pow, refl) {
    this.diffuse = diffuse;
    this.specular = specular;
    this.ambient = ambient;
    this.pow = pow;
    this.k_refl = refl;
  }
}


//CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC//
class Hit {
  //pp is time
  constructor(pp, obj, ray) {
    this.hitPos = new p5.Vector(pp * ray.direction.x + ray.origin.x, pp * ray.direction.y + ray.origin.y, pp * ray.direction.z + ray.origin.z);
    this.object = obj;
    this.hit = true;
    this.norm = 0;
    //maybe light info
  }
}



//=========================================================================================//

let scene = new Scene();
let material = new Material();                  //sets material for next objects added


function reset_scene() {
  console.clear();
  noStroke();
  angleMode(DEGREES);
  scene = new Scene();
}

function set_background (r, g, b) {
  scene.backColor = new p5.Vector(r, g, b);
}

function set_fov (angle) {
  scene.fov = (angle);
}

function new_light (r, g, b, x, y, z) {
  scene.lights.push(new Light(new p5.Vector(r, g, b), new p5.Vector(x, y, z)));
}

function new_material (dr, dg, db,  ar, ag, ab,  sr, sg, sb,  pow,  k_refl) {
  let diffuse = new p5.Vector(dr, dg, db);
  let ambient = new p5.Vector(ar, ag, ab);
  let specular = new p5.Vector(sr, sg, sb);
  material = new Material(diffuse, ambient, specular, pow, k_refl);
}

function new_cylinder (x, y, z, radius, h) {
  let c = new Cylinder(new p5.Vector(x, y, z), radius, h, material);
  scene.objects.push(c);
  scene.objects.push(new Cap(new p5.Vector(x, y, z), radius, h, material, c));
}

function makeEyeRay(x, y) {
  let ray = new Ray();
  let k = tan(scene.fov / 2);
  let x1 = ((2 * (x + 0.5) / width) - 1);
  let y1 = 1 - 2 * ((y + 0.5) / height);
  //y1 *= k;
  //x1 *= k;
  let z1 = -1 / k;
  ray.direction = (new p5.Vector(x1, y1, z1));
  return ray;
}

//check if value is in vertical bounds
function valChecker(t, ray, obj) {
  let x = t * ray.direction.x + ray.origin.x;
  let y = t * ray.direction.y + ray.origin.y;
  let z = t * ray.direction.z + ray.origin.z;
  if((y >= obj.pos.y  &&  y <= obj.pos.y + obj.h)) {
    return t;
  }
  //return null if not in bounds
  else {
   return null; 
  }
  
}


// Here are the two new routines that you should add to your ray tracer for Part B

function new_sphere (x, y, z, radius) {
  let s = new Sphere(new p5.Vector(x, y, z), radius, material);
  scene.objects.push(s);
}

function ambient_light (r, g, b) {
  scene.ambientLight = new p5.Vector(r, g, b);
}

function castShadow (hitObj, light) {
    //cast shadow
    let shadRay = new Ray();
    shadRay.direction = new p5.Vector(light.pos.x, light.pos.y, light.pos.z);
    shadRay.origin = new p5.Vector(hitObj.hitPos.x, hitObj.hitPos.y, hitObj.hitPos.z);
    shadRay.direction.sub(shadRay.origin);
    shadRay.direction.normalize();
    for(let n = 0; n < scene.objects.length; n++) {
      if(scene.objects[n] != hitObj.object) {
        if(!(scene.objects[n] instanceof Cap)  || scene.objects[n].cylinder != hitObj.object) {
          if(scene.objects[n].checkIntersection(shadRay) != null) {
            return 0;
          }
        }
      }
    }
    return 1;
}

function getNorm(hitObj, ray, closest) {

      if(hitObj != null) {
        

        let intersectionPoint = new p5.Vector(0, 0, 0);
        let center = new p5.Vector(0, 0, 0);
        let pp = 0;
        
        
        if(hitObj.object instanceof Cylinder) {
          intersectionPoint = new p5.Vector(ray.origin.x + (closest * ray.direction.x), 0, ray.origin.z + (closest * ray.direction.z));
          center = new p5.Vector(hitObj.object.pos.x, 0, hitObj.object.pos.z);
        }
        if(hitObj.object instanceof Cap) {
          //print("cap");
          intersectionPoint = new p5.Vector(0, hitObj.hitPos.y, 0);
          center = new p5.Vector(0, hitObj.object.pos.y + hitObj.object.h / 2, 0);
        }
        if(hitObj.object instanceof Sphere) {
          intersectionPoint = new p5.Vector(ray.origin.x + (closest * ray.direction.x), ray.origin.y + (closest * ray.direction.y), ray.origin.z + (closest * ray.direction.z));
          center = new p5.Vector(hitObj.object.pos.x, hitObj.object.pos.y, hitObj.object.pos.z);
        } 
        
        let surfaceNormal = new p5.Vector(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
        surfaceNormal.sub(center);
        surfaceNormal.normalize();
        let temp = new Ray();
        temp.direction = new p5.Vector(surfaceNormal.x, surfaceNormal.y, surfaceNormal.z);
        temp.origin = center.copy();
        return temp;
  }
}

function getColor(hitObj, ray, closest) {
      //draw pixel if hit
      let red = 0;
      let green = 0;
      let blue = 0;
      
      if(hitObj != null) {
        
        let surfaceNormal = hitObj.norm.direction.copy();
        let center = hitObj.norm.origin.copy();
        let lights = scene.lights;
                  
          for (let i = 0; i < lights.length; i++) {

              //SHADOW CAST
              let shad = castShadow(hitObj, scene.lights[i]);        //this is to determine if shadow cast

              //MAKE PIXEL COLOR
              let lightDirection = new p5.Vector(lights[i].pos.x, lights[i].pos.y, lights[i].pos.z);
              lightDirection.sub(hitObj.hitPos);
              lightDirection.normalize();
    
              red += hitObj.object.material.diffuse.x * shad * lights[i].lightColor.x * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              green += hitObj.object.material.diffuse.y * shad * lights[i].lightColor.y * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              blue += hitObj.object.material.diffuse.z * shad * lights[i].lightColor.z * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              
              
              //SPECULAR
              //H = (L + E) / ||L + E||
              let H;
              let L = lightDirection.copy();//lights[i].pos.copy();
              let E = new p5.Vector(-ray.direction.x, -ray.direction.y, -ray.direction.z);
              E.normalize();
              //L.normalize();
  
              H = p5.Vector.add(L, E);

              let temp = p5.Vector.add(L, E);

              temp = pow((pow(temp.x, 2) + pow(temp.y, 2) + pow(temp.z, 2)), 0.5);

              H = new p5.Vector(H.x / temp, H.y / temp, H.z / temp);
              
              red += hitObj.object.material.specular.x * lights[i].lightColor.x * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
              green += hitObj.object.material.specular.y * lights[i].lightColor.y * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
              blue += hitObj.object.material.specular.z * lights[i].lightColor.z * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
          }

          //AMBIENT LIGHT
          if(scene.ambientLight != false) { 
            red += hitObj.object.material.diffuse.x * scene.ambientLight.x * hitObj.object.material.ambient.x;
            green += hitObj.object.material.diffuse.y * scene.ambientLight.y * hitObj.object.material.ambient.y;
            blue += hitObj.object.material.diffuse.z * scene.ambientLight.z * hitObj.object.material.ambient.z;
          }
          
          let kref = hitObj.object.material.k_refl;
          if(kref > 0) {
            let refColor = reflection(hitObj, ray, closest, bounces);
            red += refColor.x * kref;
            green += refColor.y * kref;
            blue += refColor.z * kref;
          }
  }
  return new p5.Vector(red, green, blue);
}

//reflection ray may be wrong
function reflection(hitObj, ray, closest, times) {
  times--;
  //make reflected ray
  
  //2*N * (N dot E) - E
  let reflectionRay;
  let N =  new p5.Vector(hitObj.norm.direction.x, hitObj.norm.direction.y, hitObj.norm.direction.z);
  let E = new p5.Vector(-ray.direction.x, -ray.direction.y, -ray.direction.z);
  N.normalize();
  E.normalize();
  let NE = p5.Vector.dot(N, E);      //dot product
  NE *= 2;
  reflectionRay = new p5.Vector(NE * N.x, NE * N.y, NE * N.z);
  reflectionRay.sub(E);
  
  let refRay = new Ray();
  refRay.direction = reflectionRay;
  refRay.origin = hitObj.hitPos;
  refRay.direction.normalize();
  
  //find closest object intersection  (refHit == null if no intersection)
  let refHit = null;
  let sT = Number.MAX_SAFE_INTEGER;
  for(let n = 0; n < scene.objects.length; n++) {
    if(scene.objects[n] != hitObj.object) {
      if(!(scene.objects[n] instanceof Cap)  || scene.objects[n].cylinder != hitObj.object) {
        let t = scene.objects[n].checkIntersection(refRay);
        //if intersection
        if(t != null) {
          //if intersected object is closer then make closest object new object
          if(sT > t) {
            sT = t;
            refHit = new Hit(t, scene.objects[n], refRay);
          }
        }
      }
    }
  }
  
  
  
  if(refHit != null) { 
    refHit.norm = getNorm(refHit, refRay, sT);
    if(refHit.object.material.k_refl > 0  &&  times > 0) {
      return reflection(refHit, refRay, sT, times) * refHit.object.material.k_refl;
    }
    let refColor = getColor(refHit, refRay, sT);
    return refColor;
  } 
  //no intersection
  else {
    return new p5.Vector(scene.backColor.x, scene.backColor.y, scene.backColor.z);
  }
  
  
}



//MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM//

function draw_scene() {
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      //make eye ray
      let ray = makeEyeRay(x, y);
      
      //test intersection for each object and find closest point
      let hit = null;
      let closest = Number.MAX_SAFE_INTEGER;
      let hitObj = null;
      for(let n = 0; n < scene.objects.length; n++) {
        let obj = scene.objects[n];
          //returns the smaller t value as hit
          hit = obj.checkIntersection(ray);
         if(hit != null && closest > hit) {
          hitObj = new Hit(hit, obj, ray);
          closest = hit;
        }
      }
      
      //draw pixel if hit
      let red = 0;
      let green = 0;
      let blue = 0;
      if(hitObj != null) {
        

        let intersectionPoint = new p5.Vector(0, 0, 0);
        let center = new p5.Vector(0, 0, 0);
        let pp = 0;
        
        
        if(hitObj.object instanceof Cylinder) {
          intersectionPoint = new p5.Vector(ray.origin.x + (closest * ray.direction.x), 0, ray.origin.z + (closest * ray.direction.z));
          center = new p5.Vector(hitObj.object.pos.x, 0, hitObj.object.pos.z);
        }
        if(hitObj.object instanceof Cap) {
          intersectionPoint = new p5.Vector(0, hitObj.hitPos.y, 0);
          center = new p5.Vector(0, hitObj.object.pos.y + hitObj.object.h / 2, 0);
        }
        if(hitObj.object instanceof Sphere) {
          intersectionPoint = new p5.Vector(ray.origin.x + (closest * ray.direction.x), ray.origin.y + (closest * ray.direction.y), ray.origin.z + (closest * ray.direction.z));
          center = new p5.Vector(hitObj.object.pos.x, hitObj.object.pos.y, hitObj.object.pos.z);
        } 
        
        
        let dColor = (new p5.Vector(hitObj.object.material.diffuse.x, hitObj.object.material.diffuse.y, hitObj.object.material.diffuse.z));
        let surfaceNormal = new p5.Vector(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
        surfaceNormal.sub(center);
        surfaceNormal.normalize();
        let temp = new Ray();
        temp.direction = new p5.Vector(surfaceNormal.x, surfaceNormal.y, surfaceNormal.z);
        temp.origin = center.copy();
        hitObj.norm = temp;
        
        let lights = scene.lights;
                  
          for (let i = 0; i < lights.length; i++) {

              //SHADOW CAST
              let shad = castShadow(hitObj, scene.lights[i]);        //this is to determine if shadow cast

              //MAKE PIXEL COLOR
              let lightDirection = new p5.Vector(lights[i].pos.x, lights[i].pos.y, lights[i].pos.z);
              lightDirection.sub(hitObj.hitPos);
              lightDirection.normalize();
    
              red += hitObj.object.material.diffuse.x * shad * lights[i].lightColor.x * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              green += hitObj.object.material.diffuse.y * shad * lights[i].lightColor.y * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              blue += hitObj.object.material.diffuse.z * shad * lights[i].lightColor.z * max(0, p5.Vector.dot(surfaceNormal,lightDirection));
              
              
              //SPECULAR
              //H = (L + E) / ||L + E||
              let H;
              let L = lightDirection.copy();//lights[i].pos.copy();
              let E = new p5.Vector(-ray.direction.x, -ray.direction.y, -ray.direction.z);
              E.normalize();
  
              H = p5.Vector.add(L, E);
              
              let temp = p5.Vector.add(L, E);
              temp = pow((pow(temp.x, 2) + pow(temp.y, 2) + pow(temp.z, 2)), 0.5);
              H = new p5.Vector(H.x / temp, H.y / temp, H.z / temp);
              
              red += hitObj.object.material.specular.x * lights[i].lightColor.x * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
              green += hitObj.object.material.specular.y * lights[i].lightColor.y * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
              blue += hitObj.object.material.specular.z * lights[i].lightColor.z * pow(p5.Vector.dot(H, surfaceNormal), hitObj.object.material.pow);
          }

          //AMBIENT LIGHT
          if(scene.ambientLight != false) { 
            red += hitObj.object.material.diffuse.x * scene.ambientLight.x * hitObj.object.material.ambient.x;
            green += hitObj.object.material.diffuse.y * scene.ambientLight.y * hitObj.object.material.ambient.y;
            blue += hitObj.object.material.diffuse.z * scene.ambientLight.z * hitObj.object.material.ambient.z;
          }
          let kref = hitObj.object.material.k_refl;
          if(kref > 0) {
            let refColor = reflection(hitObj, ray, closest, bounces);
            red += refColor.x * kref;
            green += refColor.y * kref;
            blue += refColor.z * kref;
          }
      } else {
        red = scene.backColor.x;
        green = scene.backColor.y;
        blue = scene.backColor.z;
      }

        fill(red * 255, green * 255, blue * 255);
        noStroke();
        rect(x, y, 1, 1);
      
  }

}
}

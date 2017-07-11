// Copyright 2017 by David A Smith and CEO Vision, Inc. All Rights Reserved.
// davidasmith@gmail.com
// 919-244-4448

// This implements a number of toy objects.
// A four point compass with a tetrahedron, cube, sphere and torus knot
// A globe of the Eart and Moon (moon is incomplete), a group of planets to provide orientation to the user (deprecated), and a height map of the US as a functional demo

/*global THREE*/
import { Globals, TObject } from "./TObject.js";
import { TButton } from "./TButtons.js"
import { TSlider, TRectangle, TTrackball, TGhost } from "./TObjects.js";

var TFollowGhost = TObject.subclass('TFollowGhost', 

  'properties',{
    action: null,
    radius: null,
    ghost: null,
    phongMaterial: null,
    cage: null,
    bttn: null,
    pauseActive: null
  },

  'initialize',{
    initialize: function(parent, onComplete, radius){
      this.radius = radius ||8;
      var geometry = new THREE.DodecahedronBufferGeometry( this.radius);
      //var lineMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
      this.phongMaterial = new THREE.MeshPhongMaterial({color : 0xffffff});

      var sphere = new THREE.Mesh( geometry, this.phongMaterial ); 
      sphere.castShadow = true;   
      this.setObject3D(sphere);
      this.object3D.name = 'TFollowGhost';
      this.pauseActive = false;
      //var cageGeometry = new THREE.SphereBufferGeometry( this.radius );
      //var cagePhongMaterial = new THREE.MeshPhongMaterial({color : 'blue'});
      //var cageMesh = new THREE.Mesh( cageGeometry, cagePhongMaterial );

      //bttn = new TButton(Globals.tScene, null, function() {self.toggleChase(self.ghost)}, cageMesh, 0);
      //bttn.object3D.position.set(50, 0, 50);

      this.ghost = new TGhost(this);
      if(parent)parent.addChild(this);
      if(onComplete)onComplete(this);
    }

    
  },
  'events',
  {
    onPointerEnter: function(pEvt){
      if (!this.pauseActive) {
        this.ghost.isChasing = false;
        this.phongMaterial.color = new THREE.Color( 'pink' );
      }
      return true;
    },
    onPointerLeave: function(pEvt){
      if (!this.pauseActive) {
        this.ghost.isChasing = true;
        this.phongMaterial.color = new THREE.Color('white');
      }
      return true;
    },
    onPointerUp: function(pEvt) {
      return true;
    },
    toggleChase: function() {
      if (this.pauseActive) {
        this.pauseActive = false;
        this.ghost.paused = false;
      }
      else {
        this.pauseActive = true;
        this.ghost.paused = true;
      }
    }
    
  },
  'behavior',
  {
    update: function(time, tScene){
      this.object3D.position.copy(this.ghost.object3D.position);
      if (!this.pauseActive) {
        if (!this.ghost.isChasing) this.object3D.rotation.y += 0.1;
      }

    }
  }
);

var TCompass = TObject.subclass('TCompass',
  'properties',{
    tetrahedron: null,
    cube: null,
    dodecahedron: null,
    torusknot: null,
    cube2: null,
  },
  'initialize',{
    initialize: function(parent, onComplete, distance, size){
      this.setObject3D(new THREE.Group());
      this.construct(new THREE.TetrahedronGeometry(2*size),    new THREE.Vector3(0,distance/2,distance), 0x111144, true);
      var cube  = this.construct(new THREE.BoxGeometry(size*2,size*2,size*2, 4,4,4),        new THREE.Vector3(distance, distance/2, distance), 0x440011, true);
      var cube2 = this.construct(new THREE.BoxGeometry(size*3,size*3,size*3, 4,4,4),        new THREE.Vector3(distance, distance/2, 0), 0xf48f42, true);
      this.construct(new THREE.SphereBufferGeometry( size, 16, 16 ),   new THREE.Vector3(0, distance/2,-distance), 0x114411, true);
      var torus = this.construct(new THREE.TorusKnotGeometry(size, size/3), new THREE.Vector3(-distance, distance/2,0), 0x333333, false);
      torus.object3D.rotation.y = Math.PI/2;
      cube.object3D.rotation.y  = Math.PI/4;
      cube2.object3D.rotation.y = Math.PI/4;
      if(parent)parent.addChild(this);
      if(onComplete)onComplete(this);
    },
    construct: function(geo, pos, color, doScale){
      var trackBall = new TTrackball(this);
      trackBall.object3D.position.copy(pos);
      var lineMaterial = new THREE.MeshBasicMaterial( { wireframe: true } );
      var phongMaterial = new THREE.MeshPhongMaterial({color : color});
      var mesh = new THREE.Mesh( geo, phongMaterial);
      var line = new THREE.Mesh( geo, lineMaterial );
      if(doScale)line.scale.set(1.05, 1.05, 1.05);
      mesh.add(line);
      return new TObject(trackBall, null, mesh);
    }
  }
);

// a spinnable Earth
var TEarth = TObject.subclass('users.TEarth',
  'properties',{
    action: null,
    radius: null
  },
  'initialize',{
    initialize: function(parent, onComplete, radius){
      this.radius = radius ||8;
      var geometry = new THREE.SphereBufferGeometry( this.radius, 32, 32 );

  				var textureLoader = new THREE.TextureLoader();
  				var material = new THREE.MeshPhongMaterial( {
  					color: 0xffffff,
  					specular: 0x666666,
            emissive: 0x000000,
  					shininess: 35,
  					map: textureLoader.load( Globals.imagePath+"earth.png" ),
            //map: textureLoader.load( Globals.imagePath+"earth-hot.png" ),
   					specularMap: textureLoader.load( Globals.imagePath+"LitSphere_test_05.jpg" ),
  					normalMap: textureLoader.load( Globals.imagePath+"earth_normalmap.png" ),
  					normalScale: new THREE.Vector2( 0.8, -0.8 )
  				} );
      var sphere = new THREE.Mesh( geometry, material );
      sphere.castShadow = true;
      this.setObject3D(sphere);
      this.object3D.name = 'TEarth';
      if(parent)parent.addChild(this);
      if(onComplete)onComplete(this);
    },
  }
);

var TMoon = TObject.subclass('users.TMoon',
  'properties',{
    action: null,
    radius: null
  },
  'initialize',{
    initialize: function(parent, onComplete, radius){
      this.radius = radius ||8;
      var geometry = new THREE.SphereBufferGeometry( this.radius, 32, 32 );

          var textureLoader = new THREE.TextureLoader();
          var material = new THREE.MeshPhongMaterial( {
            color: 0xeeeeee,
            specular: 0x222222,
            emissive: 0x222222,
            shininess: 35,
            map: textureLoader.load( Globals.imagePath+"Moon2.jpg" ),
            //map: textureLoader.load( Globals.imagePath+"earth-hot.png" ),
            specularMap: textureLoader.load( Globals.imagePath+"LitSphere_test_05.jpg" ),
            bumpMap: textureLoader.load( Globals.imagePath+"Moon2-Bump.jpg" ),
            normalScale: new THREE.Vector2( 0.8, 0.8 )
          } );
      var sphere = new THREE.Mesh( geometry, material );
      sphere.castShadow = true;
      this.setObject3D(sphere);
      this.object3D.name = 'TMoon';
      if(parent)parent.addChild(this);
      if(onComplete)onComplete(this);
    }
  }
);

var TCubeX = TObject.subclass('users.TCubeX',
'properties',{
  action: null,
  },
  'initialize',{
    initialize: function(parent, onComplete, w, h, d, dw, dh, dd){
      dw = dw || 5;
      dh = dh || 5;
      dd = dd || 5;
      var geometry      = new THREE.BoxGeometry(w||10, h||10, d||10, dw, dh, dd );
  		var textureLoader = new THREE.TextureLoader();
  		var material = new THREE.MeshPhongMaterial( {
  			color: 0xdddddd,
  			specular: 0x222222,
  			shininess: 35,
  			//map: textureLoader.load( Globals.imagePath+"crossColor.jpg" ),
  			specularMap: textureLoader.load( Globals.imagePath+"LitSphere_test_05.jpg" ),
  			normalMap: textureLoader.load( Globals.imagePath+"wrinkle-normal.jpg" ),
   			//normalMap: textureLoader.load( Globals.imagePath+"sci_fi_normal.jpg" ),
 			  normalScale: new THREE.Vector2( 0.8, -0.8 )
  		} );
      var cube = new THREE.Mesh( geometry, material );
      cube.castShadow = true;
      this.setObject3D(cube);
      this.object3D.name = 'TCubeX';
      if(parent)parent.addChild(this);
      if(onComplete)onComplete(this);
    }
  }
);


var TPlanets = TObject.subclass('users.TPlanets',
  'properties', {
    moon: null,
    jupiter: null,
    saturn: null
  },
  'initialize',{
    initialize: function($super, parent, onComplete, radius){
      $super(parent, onComplete);
      this.moon = this.makePlanet("Moon.png", 0.5);
      this.moon.name = 'Moon';
      this.saturn = this.makePlanet("Saturn.png", 0.5);
      this.saturn.name = 'Saturn';
      this.jupiter = this.makePlanet("Jupiter.png", 0.5);
      this.jupiter.name = 'Jupiter';
      this.object3D.add(this.moon);
      this.object3D.add(this.saturn);
      this.object3D.add(this.jupiter);
      this.moon.rotateY(Math.PI/2);
      this.saturn.rotateY(Math.PI);
      this.jupiter.rotateY(-Math.PI/2);
      this.moon.position.set(-radius,radius/2,0);
      this.jupiter.position.set(radius,radius/2,0);
      this.saturn.position.set(0,radius/2,radius);
      this.object3D.name = 'TPlanets';
    },

    makePlanet: function(planet, opacity){
      var textureLoader = new THREE.TextureLoader();
      var geometry      = new THREE.PlaneBufferGeometry(250, 250, 10, 10);
      var material      = new THREE.MeshBasicMaterial( {
            map: textureLoader.load( Globals.imagePath+planet ),
            opacity:opacity,
            transparent:true, side: THREE.FrontSide} );
      return new THREE.Mesh(geometry, material);
    }
  }
);

var TUSA = TRectangle.subclass('users.TUSA',
  'properties',{
        metalness: 1.0,
        roughness: 0.4,
        ambientIntensity: 0.2,
        aoMapIntensity: 1.0,
        envMapIntensity: 1.0,
        displacementScale: 0, // from original model
        normalScale: 1.0,
        water: null,
        bumpMap: null
    },
  'initialize',{
    initialize: function($super, parent, onComplete){
      $super(parent, onComplete, 100, 50, 100, 50);

      var textureLoader = new THREE.TextureLoader();
      var material = new THREE.MeshStandardMaterial( {
          color: 0x888888,
          //roughness: this.roughness,
          //metalness: this.metalness,
          //specularMap: textureLoader.load( Globals.imagePath+"LitSphere_test_05.jpg" ),

          //aoMap: aoMap,
          //aoMapIntensity: 1,
          displacementMap: textureLoader.load( Globals.imagePath+'USADepth.jpg'),
          displacementScale: this.displacementScale,
          //bumpMap: textureLoader.load( Globals.imagePath+"USADepth.jpg" ),
          //displacementBias: - 0.428408, // from original model
          //envMap: reflectionCube,
          //envMapIntensity: settings.envMapIntensity,
          side: THREE.DoubleSide
        } );
      this.bumpMap = textureLoader.load( Globals.imagePath+"USADepth.jpg" );
      this.object3D.material = material;
      this.object3D.raycast = function(){}; // suppress ray test
      this.water = new TRectangle(this, null, 100,50, 20, 10);
      this.water.object3D.position.z=-0.02;
      var mat = new THREE.MeshStandardMaterial({color:0x7777ee, transparent:true, opacity:0.75});
      this.water.object3D.material = mat;
      var self = this;
      this.displacementSlider = new TSlider(this, function(tObj){tObj.object3D.position.y = -self.extent.y/2 - 3}, function(val){self.setDisplacement(val)}, 40, 2, 0);
      this.waterSlider = new TSlider(this, function(tObj){tObj.object3D.position.y = -self.extent.y/2 - 6}, function(val){self.risingWater(val)}, 40, 2, 0);
      }
    },
    'action',
    {
      risingWater: function(val){
        this.water.object3D.position.z = -0.02 + val/2;
      },
      setDisplacement: function(val){
        if(val==0)
        {
          this.object3D.material.bumpMap = null;
        }else{
          this.object3D.material.bumpMap = this.bumpMap;
        }
        this.object3D.material.bumpScale = val;
        this.object3D.material.displacementScale = val*5;
        this.object3D.material.needsUpdate = true;
      }
    });

export {
  TEarth,
  TMoon,
  TCubeX,
  TPlanets,
  TUSA,
  TCompass,
  TFollowGhost
}

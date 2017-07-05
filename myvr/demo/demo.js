/*!
 *
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* eslint-env es6 */

class Demo {

  static get CAMERA_SETTINGS () {
    return {
      viewAngle: 45,
      near: 0.1,
      far: 10000
    };
  }

  constructor () {
    this._width;
    this._height;
    this._renderer;
    this._camera;
    this._aspect;
    this._settings;
    this._box;
    this._container = document.querySelector('#container');

    this.mouse = new THREE.Vector2();
    this.mouse.x = 0;
    this.mouse.y = 0;
    this.mouseButtonL = false;

  //  this.setupTextOverlay();
    this.createEventListeners();

    this.clearContainer();
    this.createRenderer();

    this._onResize = this._onResize.bind(this);
    this._update = this._update.bind(this);
    this._onResize();

    this.createCamera();
    this.createScene();
    this.createMeshes();

    this._addEventListeners();
    requestAnimationFrame(this._update);
  }

  _update () {

    //this.text.innerHTML = "Mouse: (" + this.mouse.x + "," + this.mouse.y + ")<br>mouseButtonL: " + this.mouseButtonL ;

    this._moveObjects();

    this._turnOnVR();

    this._render();
  }

  _turnOnVR(){

  }

  _moveObjects(){
    const ROTATION_VALUE = 4;
    const time = window.performance.now() * 0.0001;
    this._box.rotation.x = Math.sin(time) * ROTATION_VALUE;
    this._box.rotation.y = Math.cos(time) * ROTATION_VALUE;
    this._box.position.x = this.mouse.x;
    this._box.position.y = this.mouse.y;
    if(this.mouseButtonL){ this._box.position.z = -5;}
    else                 { this._box.position.z = -10;}
  }

  _render () {
    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this._update);
  }

  _onResize () {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._aspect = this._width / this._height;

    this._renderer.setSize(this._width, this._height);

    if (!this._camera) {
      return;
    }

    this._camera.aspect = this._aspect;
    this._camera.updateProjectionMatrix();
  }

  _addEventListeners () {
    window.addEventListener('resize', this._onResize);
    window.addEventListener( 'keydown',    this.onKeyDown,    false );
    window.addEventListener( 'keyup',      this.onKeyUp,      false );

  }

  clearContainer () {
    this._container.innerHTML = '';
  }

  createRenderer () {
    this._renderer = new THREE.WebGLRenderer();
    this._container.appendChild(this._renderer.domElement);
  }

  createCamera () {
    this._settings = Demo.CAMERA_SETTINGS;
    this._camera = new THREE.PerspectiveCamera(
        this._settings.viewAngle,
        this._aspect,
        this._settings.near,
        this._settings.far
    );
  }

  createScene () {
    this._scene = new THREE.Scene();
  }

  createMeshes () {
    const WIDTH  = 1;    // 1
    const HEIGHT = 1;  // 1
    const DEPTH  = 1;    // 1

    // Box.
    const boxGeometry = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH);
    const boxMaterial = new THREE.MeshNormalMaterial();

    this._box = new THREE.Mesh(boxGeometry, boxMaterial);
    this._box.position.z = -5;

    // Room.
    const roomGeometry = new THREE.BoxGeometry(10, 2, 10, 10, 2, 10);
    const roomMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      opacity: 0.3,
      transparent: true,
      side: THREE.BackSide
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);

    room.position.z = -5;

    this._scene.add(this._box);
    this._scene.add(room);
  }

setupTextOverlay(){
      this.text = document.createElement('div');
      this.text.style.position = 'absolute';
      this.text.style.backgroundColor = "red";
      this.text.style.top = 50 + 'px';
      this.text.style.left = 50 + 'px';
      this.text.innerHTML = "...text...";  // for dynamic text, must be updated every frame
      document.body.appendChild(this.text);
  }

  createEventListeners(){
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 87: /*W*/                     this.keyW = true;  break;
            case 83: /*S*/                     this.keyS = true;  break;
        }
    };

    var onKeyUp = function ( event ) {
        switch ( event.keyCode ) {
          case 87: /*W*/                     this.keyW = false;  break;
          case 83: /*S*/                     this.keyS = false;  break;
        }
    };

    var self = this;
    var onMouseMove = function ( event ) {
      this.mouseX = event.pageX;
      this.mouseY = event.pageY;
      self.mouse.x =   ( this.mouseX / window.innerWidth  ) * 2 - 1; // Normalize values between -1 and 1
      self.mouse.y = - ( this.mouseY / window.innerHeight ) * 2 + 1;
    };
    var onMouseup   = function ( event ) {this.mouseX = event.pageX; this.mouseY = event.pageY; self.mouseButtonL = false;};
    var onMousedown = function ( event ) {this.mouseX = event.pageX; this.mouseY = event.pageY; self.mouseButtonL = true;};

    window.addEventListener( 'mousemove',  onMouseMove,  false );
    window.addEventListener( 'mousedown',  onMousedown,  false );
    window.addEventListener( 'mouseup',    onMouseup,    false );

    //window.addEventListener("DOMContentLoaded",   function(event) { init(); }   );
  }


}

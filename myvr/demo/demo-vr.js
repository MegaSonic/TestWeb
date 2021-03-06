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

class DemoVR extends Demo {
  constructor () {
    super();

    this._onResize = this._onResize.bind(this);

    this._disabled = false;
    if (typeof VRFrameData === 'undefined') {
      this._disabled = true;
      this._showWebVRNotSupportedError();
      return;
    }

    this._firstVRFrame = false;
    this._button = undefined;
    this._vr = {
      display: null,
      frameData: new VRFrameData()
    };

    this.setupTextOverlayVR();
    this._addVREventListeners();
    this.createEventListeners();
    this._getDisplays();
    // Get any available inputs.
    this._getInput();
    this._addInputEventListeners();
    // Default the box to 'deselected'.
    this._onDeselected(this._box);
  }

  _addVREventListeners () {
    window.addEventListener('vrdisplayactivate', _ => {
      this._activateVR();
    });

    window.addEventListener('vrdisplaydeactivate', _ => {
      this._deactivateVR();
    });
  }

  _getDisplays () {
    return navigator.getVRDisplays().then(displays => {
      // Filter down to devices that can present.
      displays = displays.filter(display => display.capabilities.canPresent);

      // If there are no devices available, quit out.
      if (displays.length === 0) {
        console.warn('No devices available able to present.');
        return;
      }

      // Store the first display we find. A more production-ready version should
      // allow the user to choose from their available displays.
      this._vr.display = displays[0];
      this._vr.display.depthNear = DemoVR.CAMERA_SETTINGS.near;
      this._vr.display.depthFar = DemoVR.CAMERA_SETTINGS.far;
      console.log("setting displays");
      this._createPresentationButton();
    });
  }

  _getInput () {
    this._rayInput = new RayInput.default(
        this._camera, this._renderer.domElement);
        this._rayInput.setSize(this._renderer.getSize());
    this._onResize();
  }

  _addInputEventListeners () {
    // Track the box for ray inputs.
    this._rayInput.add(this._box);

    // Set up a bunch of event listeners.
    this._rayInput.on('rayover', this._onSelected);
    this._rayInput.on('rayout', this._onDeselected);
    this._rayInput.on('raydown', this._onSelected);
    this._rayInput.on('rayup', this._onDeselected);
  }

  _onSelected (optMesh) {
    if (!optMesh) {
      return;
    }

    optMesh.material.transparent = true;
    optMesh.material.opacity = 1;
  }

  _onDeselected (optMesh) {
    if (!optMesh) {
      return;
    }

    optMesh.material.transparent = true;
    optMesh.material.opacity = 0.5;
  }

  _showNoPresentError () {
    console.error(`Unable to present with this device ${this._vr.display}`);
  }

  _showWebVRNotSupportedError () {
    console.error('WebVR not supported');
  }

  _createPresentationButton () {
    this._button = document.createElement('button');
    this._button.classList.add('vr-toggle');
    this._button.textContent = 'Enable VR';
    this._button.addEventListener('click', _ => {
      this._toggleVR();
    });
    document.body.appendChild(this._button);
  }

  _deactivateVR () {
    if (!this._vr.display) {
      return;
    }

    if (!this._vr.display.isPresenting) {
      return;
    }

    this._vr.display.exitPresent();
    return;
  }

  _activateVR () {
    if (!this._vr.display) {
      return;
    }

    this._vr.display.requestPresent([{
      source: this._renderer.domElement
    }])
    .catch(e => {
      console.error(`Unable to init VR: ${e}`);
    });
  }

  _toggleVR () {
    if (this._vr.display.isPresenting) {
      return this._deactivateVR();
    }

    return this._activateVR();
  }

  setupTextOverlayVR(){
        this.text = document.createElement('div');
        this.text.style.position = 'absolute';
        this.text.style.backgroundColor = "blue";
        this.text.style.top = 50 + 'px';
        this.text.style.left = 50 + 'px';
        this.text.innerHTML = "This text is for VR mode";  // for dynamic text, must be updated every frame
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

  _render () {
    this.text.innerHTML = "Mouse: (" + this.mouse.x + "," + this.mouse.y + ")<br>mouseButtonL: " + this.mouseButtonL;
    if (this._disabled || !(this._vr.display && this._vr.display.isPresenting)) {
      // Ensure that we switch everything back to auto for non-VR mode.
      this._onResize();
      this._renderer.autoClear = true;
      this._scene.matrixAutoUpdate = true;

      return super._render();
    }

    // When this is called the first time, it will be using the standard
    // window.requestAnimationFrame API, which will throw a warning when we call
    // display.submitFrame. So for the first frame that this is called we will
    // exit early and request a new frame from the VR device instead.
    if (this._firstVRFrame) {
      this._firstVRFrame = false;
      return this._vr.display.requestAnimationFrame(this._update);
    }

    const EYE_WIDTH = this._width * 0.5;
    const EYE_HEIGHT = this._height;

    // Get all the latest data from the VR headset and dump it into frameData.
    this._vr.display.getFrameData(this._vr.frameData);

    // Disable autoupdating because these values will be coming from the
    // frameData data directly.
    this._scene.matrixAutoUpdate = false;

    // Make sure not to clear the renderer automatically, because we will need
    // to render it ourselves twice, once for each eye.
    this._renderer.autoClear = false;

    // Clear the canvas manually.
    this._renderer.clear();

    // Left eye.
    this._renderEye(
      this._vr.frameData.leftViewMatrix,
      this._vr.frameData.leftProjectionMatrix,
      {
        x: 0,
        y: 0,
        w: EYE_WIDTH,
        h: EYE_HEIGHT
      });

    // Ensure that left eye calcs aren't going to interfere with right eye ones.
    this._renderer.clearDepth();

    // Right eye.
    this._renderEye(
      this._vr.frameData.rightViewMatrix,
      this._vr.frameData.rightProjectionMatrix, {
        x: EYE_WIDTH,
        y: 0,
        w: EYE_WIDTH,
        h: EYE_HEIGHT
      });

    // Use the VR display's in-built rAF (which can be a diff refresh rate to
    // the default browser one).

    this._vr.display.requestAnimationFrame(this._update);

    // Call submitFrame to ensure that the device renders the latest image from
    // the WebGL context.
    this._vr.display.submitFrame();
  }

  _renderEye (viewMatrix, projectionMatrix, viewport) {
    // Set the left or right eye half.
    this._renderer.setViewport(viewport.x, viewport.y, viewport.w, viewport.h);

    // Update the scene and camera matrices.
    this._camera.projectionMatrix.fromArray(projectionMatrix);
    this._scene.matrix.fromArray(viewMatrix);

    // Tell the scene to update (otherwise it will ignore the change of matrix).
    this._scene.updateMatrixWorld(true);
    this._renderer.render(this._scene, this._camera);
  }
}

new DemoVR();

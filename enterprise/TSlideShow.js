// Copyright 2017 by David A Smith and CEO Vision, Inc. All Rights Reserved.
// davidasmith@gmail.com
// 919-244-4448

/*global THREE*/
import { Globals, TObject } from "./TObject.js";
import { TRectangle } from "./TObjects.js";
import { TArrowButton } from "./TButtons.js";


// this is a simple slideshow object. Add any kind of TObject here and it allow you to flip through them...
var TSlideShow = TObject.subclass('users.TSlideShow',
  'properties',{
    nextArrow: null, // show next slide
    previousArrow: null, // show previous slide
    slides: null, // array of all slides
    currentSlideIndex: null, // current slide index
    currentSlide: null,
    height: null,
    width: null,
    segs: null,
  },
  'initialize',{
    initialize: function($super, parent, onComplete, slides, height, segs){
      this.height = height || 15;
      this.segs = segs || 10;
      this.extent = new THREE.Vector3(1,1,1); // has to be something
      this.currentSlideIndex = -1;
      this.slides = [];
      var self = this;
      $super(parent, onComplete); // define object3D

      if(slides){
        for(var i=0; i<slides.length;i++)this.addSlide(slides[i]);
        this.currentSlide = this.slides[this.currentSlideIndex];
        this.addChild(this.currentSlide);
      }      
      var xOffset = this.extent.x/2;
      this.previousArrow = new TArrowButton(this, function(tObj){tObj.object3D.rotation.z = -Math.PI/2; tObj.object3D.position.x = 1 - xOffset;}, function(){self.showPreviousSlide();},2);
      this.nextArrow =     new TArrowButton(this, function(tObj){tObj.object3D.rotation.z = Math.PI/2; tObj.object3D.position.x = xOffset - 1; }, function(){self.showNextSlide();},2);    
    },

    buildOnboard: function(count, onComplete, height, segs){
      count = count||1;
      if(count===9)return;
      var self = this;
      var txtrLoader = new THREE.TextureLoader();
 
      var c = ''+count;
      //if(c.length === 1)c='0'+c;
      var fname = Globals.imagePath+'preso/OnBoard/Slide'+c+'.jpg';
      var self = this;
      txtrLoader.load(fname,
        function(texture){
          var slide = new TRectangle(null, function(tObj){
            tObj.object3D.material = new THREE.MeshBasicMaterial({map: texture});
          }, self.height*texture.image.width/texture.image.height, self.height, self.segs, self.segs);
          slide.selectable = false;
          self.addSlide(slide);
          if(onComplete)onComplete(self);
          self.buildOnboard(count+1);
        });
    },

    build1968: function(count, onComplete, height, segs){
      count = count||1;
      var self = this;

      if(count===10){
 //         new users.TVideo2D(Globals.imagePath+'preso/1968/Engelbart.mp4', function(vid){
 //             self.slides[3]=new users.TVideoRectangle(null, null, vid, self.height, self.segs);
          new users.TVideo2D(Globals.imagePath+'preso/1968/Steve.mp4', function(vid){
              self.slides[5]=new users.TVideoRectangle(null, null, vid, self.height, self.segs);
          new users.TVideo2D(Globals.imagePath+'preso/1968/Sutherland.mp4', function(vid){
              self.slides[6]=new users.TVideoRectangle(null, null, vid, self.height, self.segs);
          });          
          });          
//          });

        return;
      }
      var txtrLoader = new THREE.TextureLoader();
 
      var c = ''+count;
      //if(c.length === 1)c='0'+c;
      var fname = Globals.imagePath+'preso/1968/Slide'+c+'.jpg';
      var self = this;
      txtrLoader.load(fname,
        function(texture){
          var slide = new users.TRectangle(null, function(tObj){
            tObj.object3D.material = new THREE.MeshBasicMaterial({map: texture});
          }, self.height*texture.image.width/texture.image.height, self.height, self.segs, self.segs);
          slide.selectable = false;
          self.addSlide(slide);
          if(onComplete)onComplete(self);
          self.build1968(count+1);
        });
    },

     buildVRTO: function(count, onComplete, height, segs){
      count = count||1;
      var self = this;

      if(count===8){
 //         new users.TVideo2D(Globals.imagePath+'preso/1968/Engelbart.mp4', function(vid){
 //             self.slides[3]=new users.TVideoRectangle(null, null, vid, self.height, self.segs);
          new users.TVideo2D(Globals.imagePath+'preso/VRTO/Steve.mp4', function(vid){
              self.slides[3]=new users.TVideoRectangle(null, null, vid, self.height, self.segs);        
          });          
//          });

        return;
      }
      var txtrLoader = new THREE.TextureLoader();
 
      var c = ''+count;
      //if(c.length === 1)c='0'+c;
      var fname = Globals.imagePath+'preso/VRTO/Slide'+c+'.jpg';
      var self = this;
      txtrLoader.load(fname,
        function(texture){
          var slide = new users.TRectangle(null, function(tObj){
            tObj.object3D.material = new THREE.MeshBasicMaterial({map: texture});
          }, self.height*texture.image.width/texture.image.height, self.height, self.segs, self.segs);
          slide.selectable = false;
          self.addSlide(slide);
          if(onComplete)onComplete(self);
          self.buildVRTO(count+1);
        });
    },   

    addSlide: function(slide){
      this.extent.x = Math.max(this.extent.x, slide.extent.x);
      this.extent.y = Math.max(this.extent.y, slide.extent.y);
      var xOffset = this.extent.x/2;
      this.previousArrow.object3D.position.x = 1 - xOffset; 
      this.nextArrow.object3D.position.x = xOffset - 1;
      this.slides.push(slide);      
      if(this.slides.length===1)this.showSlide(0);
      this.contentsChanged();
    },

    removeSlide: function(slide){
      // find and remove slide 
      // recalculate the extent as well
    },
  },
  'actions',{
    showNextSlide: function(){this.showSlide(this.currentSlideIndex+1);},
    showPreviousSlide: function(){this.showSlide(this.currentSlideIndex-1);},
    showSlide:function(index){
      if(this.slides.length === 0)return;
      index = index>=0?index:this.slides.length-1;//wrap to top
      index = index<this.slides.length?index:0;//wrap to bottom
      if(index!=this.currentSlideIndex){
        this.currentSlideIndex = index;
        if(this.currentSlide)this.currentSlide.removeSelf();
        this.currentSlide = this.slides[index];
        this.addChild(this.currentSlide);
      }
    },
  }
);

export {
  TSlideShow
}

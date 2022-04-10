   /**
    * The main Javascript object that contains all the methods and classes of GameMaker.js
    */
    const GameMaker = {


        /**
         * Creates a canvas element and then appends it to the HTML Body
         * 
         * It will also auto update the canvs to take up 100% of the screen so it will scale
         * @returns {canvas} usable HTML canvas element
         * @method
         * @example 
         * //Make a canvas and add it to the HTML body, then print it to the console
         * console.log(GameMaker.Init())
         * 
         * @example
         * //Make a new world and then auto generate a canvas
         * const world = GameMaker.World(GameMaker.Init())
         * 
         */
        Init: function () {
     
           var Canvas = document.createElement('canvas')
           Canvas.className = "GameMakerCanvas"
     
           resizeCanvas()
     
           document.body.append(Canvas)
           window.addEventListener('resize', resizeCanvas, false);
     
           function resizeCanvas() {
              Canvas.width = window.innerWidth;
              Canvas.height = window.innerHeight;
              Canvas.style.position = 'absolute'
              Canvas.style.top = '0px'
              Canvas.style.left = '0px'
           }
     
           return Canvas
     
        },
     
        /**
        * The container for objects and also used for rendering
        * @param {HTMLCanvasElement} canvas
        * @class
        * @example //Make a new world with canvas then update it every 60th of a second
        * 
        * //Make the world
        * const world = new GameMaker.World(GameMaker.Init())
        * 
        * //Update the frame every 60th of a second
        *setInterval(() => {
        *
        *   //Render the world and push it to the canvas/screen
        *   world.Render()
        *
        *}, 1000/60)
        */
     
        World: class World {
     
           /**
           *  @constructor
           *  
           */
     
           constructor(canvas) {
              this.canvas = canvas
              this.canvasContext = canvas.getContext('2d');
              this.canvas.addEventListener("contextmenu", e => e.preventDefault());
     
              this.objects = []
              this.plugins = {}
              this.backgroundColor = '#ffffff'
              /**
              * Add sprite to render list so it will render to the canvas
              * @param {GameMaker.BaseObject} Object
              * @memberof GameMaker.World
              * @example
              * //Create a new world and add a object to it
              * 
              * //Create new world
              * const world = new GameMaker.World(GameMaker.Init())
              * 
              * //Create new ImageSprite 
              * var ImageSprite = new GameMaker.TextSprite("TestImage", new GameMaker.Vector2(1, 1), new GameMaker.Vector2(10, 10), 0, 'Image.png')
              * 
              * //Add the sprite to the world when world.render() is used it will show up
              * world.addobjects(ImageSprite)
              */
              this.addobjects = function (Object) {
     
                 this.objects.push(Object)
     
              }
     
              
              this.canvasContext.save()
     
              /**
              * Renders all objects in world to canvas
              * @memberof GameMaker.World
              * @example //Look at the GameMaker.World example to see how it's used
              */
              this.render = function () {
     
                 this.canvasContext.restore()
     
                 this.canvasContext.globalAlpha = 1
                 this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
                 this.canvasContext.fillStyle = this.backgroundColor
                 this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height)
     
                 this.objects.forEach((object) => {
     
                    switch (object.type) {
     
                       case "ShapeSprite":
     
                          if (!object.visible) { return }
     
                          this.canvasContext.translate(object.pos.X, object.pos.Y)
     
                          this.canvasContext.rotate(object.angle * Math.PI / 180)
     
                          this.canvasContext.fillStyle = object.color
                          this.canvasContext.globalAlpha = object.opacity / 100
                          this.canvasContext.fillRect(-object.size.X / 2, -object.size.Y / 2, object.size.X, object.size.Y)
     
                          this.canvasContext.restore()
                          this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
     
     
                          break
     
                       case "ImageSprite":
     
                          if (!object.visible) { return }
     
                          this.canvasContext.translate(object.pos.X, object.pos.Y)
     
                          this.canvasContext.rotate(object.angle * Math.PI / 180)
     
                          this.canvasContext.globalAlpha = object.opacity / 100
                          this.canvasContext.drawImage(object.imageObject, -object.size.X / 2, -object.size.X / 2, object.size.X, object.size.Y);
     
                          this.canvasContext.restore()
                          this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
     
     
                          break
     
                       case "TextSprite":
     
                          if (!object.visible) { return }
     
                          this.canvasContext.translate(object.pos.X, object.pos.Y)
     
                          this.canvasContext.rotate(object.angle * Math.PI / 180)
     
                          this.canvasContext.fillStyle = object.color
                          this.canvasContext.globalAlpha = object.opacity / 100
                          this.canvasContext.font = `${object.fontSize}px ${object.font}`;
                          this.canvasContext.fillStyle = object.fontColor;
                          this.canvasContext.fillText(object.text, 0, object.fontSize);
     
                          this.canvasContext.restore()
                          this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
     
     
                          break
     
     
                    }
     
                 })
     
              }
           }
        },
     
     
        /**
        * @description
        * A object that contains 2 numbers X and Y, used for things like position and size
        * @param {number} X
        * @param {number} Y
        * @class
        * 
        * 
        * @example
        * 
        * //Create a new Vector2 where both the X and Y are 0
        * var Vector2 = new GameMaker.Vector2(0,0)
        */
     
        Vector2: class Vector2 {
           constructor(X, Y) {
     
              /**
              * The X Vector of the Vector2 
              * @constant {number}
              * @default
              * @memberof GameMaker.Vector2
              */
              this.X = X;
     
              /**
              * The Y Vector of the Vector2 
              * @constant {number}
              * @default
              * @memberof GameMaker.Vector2
              */
              this.Y = Y;
     
              /** 
              * Given another Vector2 it will return a number between 0 and 360 that is the angle between the 2 positions
              * @param {GameMaker.Vector2} Pos2
              * @returns {number} Angle
              * @memberof GameMaker.Vector2
              * 
              * @example
              * //How to use the Angle function
              * 
              * //Create a new Vector2 (Just for the example)
              * var Vector2 = new GameMaker.Vector2(0,0)
              * 
              * //Saves the angle to a var
              * var Angle = Vector2.angle(new GameMaker.Vector2(0,10))
              * 
              * //Print out the angle vecter, it should be 90
              * console.log(Angle)
              */
              this.angle = (Pos2) => { return Math.atan2(Pos2.Y - this.Y, Pos2.X - this.X) * 180 / Math.PI; }
              /** 
              * Given another Vector2 it will return a number representing the distance in pixels between the 2 positions
              * @param {GameMaker.Vector2} Pos2
              * @returns {number} Distance
              * @memberof GameMaker.Vector2
              * 
              * @example
              * //How to use the Distance function
              * 
              * //Create a new Vector2 (Just for the example)
              * var Vector2 = new GameMaker.Vector2(0,0)
              * 
              * //Saves the distance to a var
              * var Distance = Vector2.angle(new GameMaker.Vector2(10,0))
              * 
              * //Print out the distance vecter, it should be 10 since X-10 is 10 pixels away from X-0
              * console.log(Distance)
              */
              this.distance = (Pos2) => { return Math.sqrt((this.X - Pos2.X) * (this.X - Pos2.X) + (this.Y - Pos2.Y) * (this.Y - Pos2.Y)); }
           }
        },
     
        /**
        * A Base object that can be used to make new renderable objects
        * @param {string} Name
        * @param {GameMaker.Vector2} Position
        * @param {GameMaker.Vector2} Position
        * @param {GameMaker.Vector2} Size
        * @param {number} Angle
        * @class
        */
        BaseObject: class BaseObject {
           constructor(Name, Position, Size, Angle) {
     
              /**
              * @memberof GameMaker.BaseObject
              */
              this.type = "BaseObject"
              this.pos = Position
              this.name = Name
              this.size = Size
              this.angle = Angle
              this.visible = true
              this.opacity = 100
     
           }
        },
     
        /**
        * A Base plugin that can be used to make new plugins
        * @param {GameMaker.World} World
        * @class
        * @private
        */
        BasePlugin: class BasePlugin {
           constructor(World) {
     
              this.world = World
              this.type = "BasePlugin"
     
           }
        },
     
        /**
        * Javascript object holding all the usable and loaded in plugins
        * @memberof Body
        */
        Plugins: {}
     
     }
     
        /**
        * A object that renders a image to the screen when added to a world
        * @param {string} Name
        * @param {GameMaker.Vector2} Position
        * @param {GameMaker.Vector2} Position
        * @param {GameMaker.Vector2} Size
        * @param {number} Angle
        * @param {string} URL the image the sprite renders as
        * @class
        * @override
        * @inheritdoc
        */
     GameMaker.ImageSprite = class ImageSprite extends GameMaker.BaseObject {
        constructor(Name, Position, Size, Angle, ImageURL) {
     
           super(Name, Position, Size, Angle)
           this.type = "ImageSprite"
           this.pos 
           this.name
           this.size
           this.angle
           this.visible = true
           this.opacity = 100
     
           this.imageObject = new Image(Size.X, Size.Y)
           this.imageObject.src = ImageURL
     
           this.changeImage = (ImageURL) => {
     
              var UpdateImage = new Image(30, 30)
              UpdateImage.src = ImageURL
     
              this.imageObject = UpdateImage
     
           } 
     
        }
     }
     
        /**
        * A object that renders a square to the screen when added to a world
        * @param {string} Color the color the sprite renders as
        * @class
        */
     GameMaker.ShapeSprite = class ShapeSprite extends GameMaker.BaseObject {
        constructor(Name, Position, Size, Angle, Color) {
     
           super(Name, Position, Size, Angle)
           this.type = "ShapeSprite"
           this.color = Color
           this.visible = true
           this.opacity = 100
     
        }
     }
     
        /**
        * A object that renders Text to the screen when added to a world
        * @param {string} Text The text that the text sprite renders
        * @class
        */
     GameMaker.TextSprite = class TextSprite extends GameMaker.BaseObject {
        constructor(Name, Position, Angle, Text) {
     
           super(Name, Position, { X: 0, Y: 0 }, Angle)
           this.type = "TextSprite"
           this.text = Text
           this.fontSize = 12
           this.fontColor = 'white'
           this.font = 'Arial'
     
        }
     }
     
        /**
         @description 
        * A plugin that allows you to get the canvas position of the mouse pointer,
        * 
        * **Keep in mind you have to use document events to check for mouse clicks.
        * This plugin is only use to find the canvas position of the mouse**
        * 
        * @class
        * @memberof Body.Plugins
        * @param {GameMaker.World} world
        * @example //Creating a new world and then adding the mouse plugin to it
        * 
        * //Create the world
        * const world = new GameMaker.World(GameMaker.Init())
        * 
        * //Add the mouse plugin to the world
        * new GameMaker.Plugins.Mouse(world)
        * 
        * @example //Check for mouse clicks
        * 
        * //Add a event listener for when any mouse button has been pressed
        * new GameMaker.World(GameMaker.init()).canvas.addEventListener("mousedown", function (e) {
        *
        *  //Print out the mouse event
        *  console.log(e)
        * 
        *})
        */
     GameMaker.Plugins.Mouse = class Mouse extends GameMaker.BasePlugin {
        constructor(World) {
     
           super(World)
           this.type = "Mouse"
           this.world.plugins.mouse = {}
           this.world.plugins.mouse.pos = new GameMaker.Vector2(0, 0)
     
           var CurrentWorld = this.world
     
           this.world.canvas.addEventListener("mousemove", function (e) {
     
              var cRect = CurrentWorld.canvas.getBoundingClientRect();
              var canvasX = Math.round(e.clientX - cRect.left);
              var canvasY = Math.round(e.clientY - cRect.top);
     
              this.pos = new GameMaker.Vector2(canvasX, canvasY)
              CurrentWorld.plugins.mouse.pos = this.pos
     
           })
     
        }
     }
     
        /**
        * A plugin that allows you to get the currntly pressed buttons on a Keyboard
        * @class
        * @memberof Body.Plugins
        * @param {GameMaker.World} world
        * @example //Creating a new world and then adding the mouse plugin to it
        * //Create the world
        * const world = new GameMaker.World(GameMaker.Init())
        * //Add the Keyboard plugin to the world
        * new GameMaker.Plugins.Keyboard(world)
        */
     GameMaker.Plugins.Keyboard = class Keyboard extends GameMaker.BasePlugin {
        constructor(World) {
     
           super(World)
           this.type = "Keyboard"
           this.world.plugins.Keyboard = { down: [] }
     
           this.isKeyDown = (key) => {
              if (keys[key] != undefined) {
     
                 return True
     
              } else {
     
                 return False
     
              }
           }
     
           var keys = this.world.plugins.Keyboard.down
     
           window.addEventListener("keydown",
              function (e) {
                 keys[e.keyCode] = true;
              },
              false);
     
           window.addEventListener('keyup',
              function (e) {
                 keys[e.keyCode] = undefined;
              },
              false);
     
        }
     }
     
     console.log("GameMaker Started")
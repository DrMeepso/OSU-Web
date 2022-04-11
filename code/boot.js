//https://osu.ppy.sh/wiki/en/Client/File_formats/Osu_%28file_format%29#difficulty

var locationOSU = `${window.location.href}/libs/OSU.js`
var locationOAuth = `${window.location.href}/code/OSU.oauth.js`

//import * as OSU from locationOSU
var OSU = {}
import(locationOSU).then( mod => OSU = mod )

var ClientToken = ""

/*
import(locationOAuth).then( Oauth => {

   Oauth.OpenAuth().then(json => {

      ClientToken = json.access_token
        
      fetch("https://OSUWeb-Server.drmeepso.repl.co/me", {method: "POST", body: JSON.stringify({ "auth": ClientToken })})
      .then( e => e.json() )
      .then( json => console.log(json) )

   })
})
*/

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

//Create World And Canvas To Render To
const world = new GameMaker.World(GameMaker.Init())
world.backgroundColor = "#141e36"
//Render Frame When Game Window Changes
window.addEventListener('resize', () => { world.render() }, false);

var MapData = {}

StartGame(true)

var Background = new GameMaker.ShapeSprite("BackgroundObject", new GameMaker.Vector2(((512*2)/2), ((384*2)/2)), new GameMaker.Vector2(512*1.5, 384*1.5), 0, "#000000")
world.addobjects(Background)

var Cursor = new GameMaker.ImageSprite("CursorObject", new GameMaker.Vector2(0, 0), new GameMaker.Vector2(50, 50), 0, `${window.location.href}/Skin/cursor.png`)
world.addobjects(Cursor)
Cursor.Tweening = false


function UpdateCursorTween(AutoNotes, Song, Action, Auto) {

    if (!Auto) return

    if ((Action == "Add" && AutoNotes.length == 1)||(Action == "Remove" && AutoNotes.length > 0)) {

        var MouseTween = new TWEEN.Tween(Cursor)
        Cursor.Tweening = true
        MouseTween.easing(TWEEN.Easing.Cubic.InOut)
        MouseTween.to({pos: OSUpxToRealpx(AutoNotes[0].x, AutoNotes[0].y)}, AutoNotes[0].time - (Song.currentTime * 1000)).start()
        MouseTween.onStop( () => {Cursor.Tweening = false} )

    }

}

function OSUpxToRealpx(x,y){

    return new GameMaker.Vector2(((x*(Background.size.X/512)) + (Background.pos.X - (Background.size.X/2))) + ((512 - 512)/2),((y*(Background.size.Y/384)) + (Background.pos.Y - (Background.size.Y/2))) + ((384 - 384)/2) )

}

function StartGame(Auto) {

    setTimeout(() => {

        fetch(`${window.location.href}/Maps/Pumpin' Junkies/map.osu`)
            .then(e => e.text())
            .then(text => {

                OSU.OSUJSON.ParseOSUFileAsync(text)
                    .then(json => {

                        MapData = json
                        console.log(MapData)

                        var Song = new Audio(`${window.location.href}/Maps/Pumpin' Junkies/song.mp3`)

                        Song.addEventListener("canplaythrough", event => {
                            /* the audio is now playable; play it if permissions allow */
                            var QueuedNotes = MapData.HitObjects.slice(0)
                            var AutoNotes = []
                            var ColorCombo = 0
                            var ColorComboIndex = 1

                            Song.play();

                            var Loop = setInterval(() => {

                                if (QueuedNotes.length == 0) {

                                    clearInterval(Loop)
                                    console.log("Map Finished!")
                                    return

                                }

                                if (QueuedNotes[0].time - (Song.currentTime * 1000) > 5000) {

                                    if (QueuedNotes.length == MapData.HitObjects.length) {

                                        Song.currentTime = (QueuedNotes[0].time - 3000) / 1000
                                        console.log("Skiped Start")

                                    }

                                }

                                if ((QueuedNotes[0].time - lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)) < Song.currentTime * 1000) {

                                    if (QueuedNotes[0].type.isNewCombo) {

                                       ColorCombo += 1
                                       ColorComboIndex = 1

                                    }

                                    AutoNotes.push(QueuedNotes[0])
                                    UpdateCursorTween(AutoNotes, Song, "Add", Auto)
                                    var UUID = uuidv4()
                                    var HitCircle = new GameMaker.ImageSprite("HitObject", OSUpxToRealpx(QueuedNotes[0].x, QueuedNotes[0].y), new GameMaker.Vector2((54.4 - 4.48 * MapData.Difficulty.CircleSize) * (Background.size.X/512), (54.4 - 4.48 * MapData.Difficulty.CircleSize) * (Background.size.Y/384)), 0, `${window.location.href}/Skin/hitcircle.png`)
                                    var ApproachCircle = new GameMaker.ImageSprite("ApproachObject", OSUpxToRealpx(QueuedNotes[0].x, QueuedNotes[0].y), new GameMaker.Vector2(((54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4) * (Background.size.X/512), ((54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4) * (Background.size.Y/384)), 0, `${window.location.href}/Skin/approachcircle.png`)
                                    
                                    console.log(HitCircle)

                                    //Set The UUID of the circals so they can be removed later
                                    HitCircle.id = UUID
                                    ApproachCircle.id = UUID

                                    //Set Variables
                                    HitCircle.Used = false
                                    HitCircle.Active = true

                                    ApproachCircle.parent = HitCircle

                                    //Animate HitCircal Spawn
                                    HitCircle.opacity = 0
                                    var HitTween = new TWEEN.Tween(HitCircle)
                                    HitTween.to({opacity: 100}, 50).start()

                                    //Make the approach circal approach
                                    var ApproachTween = new TWEEN.Tween(ApproachCircle.size)
                                    ApproachTween.to({X: (54.4 - 4.48 * MapData.Difficulty.CircleSize) * (Background.size.X/512), Y: (54.4 - 4.48 * MapData.Difficulty.CircleSize) * (Background.size.Y/384)}, lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)).start()

                                    world.addobjects(HitCircle)
                                    world.addobjects(ApproachCircle)

                                    ColorComboIndex += 1

                                    QueuedNotes.shift()

                                    setTimeout(() => {

                                        if (HitCircle.Used) return

                                        HitCircle.Active = false

                                        //Animate Fade Out
                                        var HitTween = new TWEEN.Tween(HitCircle)
                                        HitTween.to({opacity: 0}, 10).start()
                                        var ApproachTween = new TWEEN.Tween(ApproachCircle)
                                        ApproachTween.to({opacity: 0}, 10).start()


                                        setTimeout( () => {

                                            
                                            world.objects = world.objects.filter( e => e.id != UUID )
                                            AutoNotes.shift()
                                            UpdateCursorTween(AutoNotes, Song, "Remove", Auto)

                                            

                                        }, 10)

                                    }, (lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)))

                                }

                            }, 1);

                        });

                    })

            })

    }, 1500);

}

console.log("Booting")

//Run Tick Timings
setInterval(() => {

    //Render the world to the screen
    TWEEN.update()
    world.render()

}, 1000 / 60)

//https://osu.ppy.sh/wiki/en/Client/File_formats/Osu_%28file_format%29#difficulty
//cursor.png


console.log(location.origin)

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

var Cursor = new GameMaker.ImageSprite("CursorObject", new GameMaker.Vector2(0, 0), new GameMaker.Vector2(25, 25), 0, `${window.location.href}/Skin/cursor.png`)
world.addobjects(Cursor)
Cursor.Tweening = false


function UpdateCursorTween(AutoNotes, Song, Action, Auto) {

    if (!Auto) return

    if ((Action == "Add" && AutoNotes.length == 1)||(Action == "Remove" && AutoNotes.length > 0)) {

        var MouseTween = new TWEEN.Tween(Cursor.pos)
        Cursor.Tweening = true
        MouseTween.easing(TWEEN.Easing.Cubic.InOut)
        MouseTween.to({X: AutoNotes[0].x, Y: AutoNotes[0].y}, AutoNotes[0].time - (Song.currentTime * 1000)).start()
        MouseTween.onStop( () => {Cursor.Tweening = false} )

    }

}

function StartGame(Auto) {

    setTimeout(() => {

        fetch(`${window.location.href}/Maps/Centipead/map.osu`)
            .then(e => e.text())
            .then(text => {

                OSU.OSUJSON.ParseOSUFileAsync(text)
                    .then(json => {

                        MapData = json
                        console.log(MapData)

                        var Song = new Audio(`${window.location.href}/Maps/Centipead/song.mp3`)

                        Song.addEventListener("canplaythrough", event => {
                            /* the audio is now playable; play it if permissions allow */
                            var QueuedNotes = MapData.HitObjects
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

                                    console.log(QueuedNotes[0].time - (Song.currentTime * 1000))
                                    if (QueuedNotes.length == MapData.HitObjects.length) {

                                        //Song.currentTime = (QueuedNotes[0].time - 3000) / 1000
                                        //AutoNotes = []
                                        //console.log("Skiped Start")

                                    }

                                }

                                if ((QueuedNotes[0].time - lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)) < Song.currentTime * 1000) {

                                    console.log(MapData.HitObjects[0])

                                    if (MapData.HitObjects[0].type.isNewCombo) {

                                       ColorCombo += 1
                                       ColorComboIndex = 1

                                    }
                                    AutoNotes.push(MapData.HitObjects[0])
                                    UpdateCursorTween(AutoNotes, Song, "Add", Auto)
                                    var UUID = uuidv4()
                                    var HitCircle = new GameMaker.ImageSprite("HitObject", new GameMaker.Vector2(MapData.HitObjects[0].x, MapData.HitObjects[0].y), new GameMaker.Vector2((54.4 - 4.48 * MapData.Difficulty.CircleSize) / 1, (54.4 - 4.48 * MapData.Difficulty.CircleSize) / 1), 0, `${window.location.href}/Skin/hitcircle.png`)
                                    var ApproachCircle = new GameMaker.ImageSprite("ApproachObject", new GameMaker.Vector2(MapData.HitObjects[0].x, MapData.HitObjects[0].y), new GameMaker.Vector2((54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4, (54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4), 0, `${window.location.href}/Skin/approachcircle.png`)
                                    HitCircle.id = UUID
                                    ApproachCircle.id = UUID
                                    HitCircle.Used = false
                                    HitCircle.Active = true
                                    ApproachCircle.parent = HitCircle
                                    HitCircle.opacity = 0

                                    var HitTween = new TWEEN.Tween(HitCircle)
                                    HitTween.to({opacity: 100}, 50).start()

                                    var ApproachTween = new TWEEN.Tween(ApproachCircle.size)
                                    ApproachTween.to({X: (54.4 - 4.48 * MapData.Difficulty.CircleSize), Y: (54.4 - 4.48 * MapData.Difficulty.CircleSize)}, lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)).start()

                                    world.addobjects(HitCircle)
                                    world.addobjects(ApproachCircle)

                                    ColorComboIndex += 1

                                    QueuedNotes.shift()


                                    setTimeout(() => {

                                        if (HitCircle.Used) return

                                        HitCircle.Active = false

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

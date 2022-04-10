//https://osu.ppy.sh/wiki/en/Client/File_formats/Osu_%28file_format%29#difficulty

import * as OSU from "/libs/OSU.js";
import * as Oauth from "OSU.oauth.js"
import * as Oauth2 from "OSU.oauth.js"

var ClientToken = ""

Oauth.OpenAuth().then(json => {

    ClientToken = json.access_token
        
    fetch("https://OSUWeb-Server.drmeepso.repl.co/me", {method: "POST", body: JSON.stringify({ "auth": ClientToken })})
    .then( e => e.json() )
    .then( json => console.log(json) )

})

function lerp(v0, v1, t) {
    return v0 * (1 - t) + v1 * t
}

//Create World And Canvas To Render To
const world = new GameMaker.World(GameMaker.Init())
world.backgroundColor = "#141e36"
//Render Frame When Game Window Changes
window.addEventListener('resize', () => { world.render() }, false);

var MapData = {}

StartGame()

function StartGame() {

    setTimeout(() => {

        fetch("/Maps/Pumpin' Junkies/map.osu")
            .then(e => e.text())
            .then(text => {

                OSU.OSUJSON.ParseOSUFileAsync(text)
                    .then(json => {

                        MapData = json
                        console.log(MapData)

                        var Song = new Audio("/Maps/Pumpin' Junkies/song.mp3")

                        Song.addEventListener("canplaythrough", event => {
                            /* the audio is now playable; play it if permissions allow */
                            var QueuedNotes = MapData.HitObjects

                            Song.play();

                            var Loop = setInterval(() => {

                                if (QueuedNotes.length == 0) {

                                    clearInterval(Loop)
                                    console.log("Map Finished!")
                                    return

                                }

                                if ((QueuedNotes[0].time - lerp(1800, 450, MapData.Difficulty.ApproachRate / 10)) < Song.currentTime * 1000) {

                                    console.log(MapData.HitObjects[0])
                                    QueuedNotes.shift()
                                    var HitCircle = new GameMaker.ImageSprite("HitObject", new GameMaker.Vector2(MapData.HitObjects[0].x, MapData.HitObjects[0].y), new GameMaker.Vector2((54.4 - 4.48 * MapData.Difficulty.CircleSize) / 1, (54.4 - 4.48 * MapData.Difficulty.CircleSize) / 1), 0, "/Skin/hitcircle.png")
                                    var ApproachCircle = new GameMaker.ImageSprite("ApproachObject", new GameMaker.Vector2(MapData.HitObjects[0].x, MapData.HitObjects[0].y), new GameMaker.Vector2((54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4, (54.4 - 4.48 * MapData.Difficulty.CircleSize) * 4), 0, "/Skin/approachcircle.png")
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

                                    setTimeout(() => {

                                        if (HitCircle.Used) return

                                        HitCircle.Active = false

                                        var HitTween = new TWEEN.Tween(HitCircle)
                                        HitTween.to({opacity: 0}, 10).start()
                                        var ApproachTween = new TWEEN.Tween(ApproachCircle)
                                        ApproachTween.to({opacity: 0}, 10).start()

                                        setTimeout( () => {

                                            HitCircle.visible = false
                                            ApproachCircle.visible = false

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

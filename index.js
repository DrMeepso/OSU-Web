//https://chimu.moe/docs

var ZIPJS = {}
var OSUParser = {}
var FilePicker = document.getElementById("FilePicker")
var Source = document.getElementById("source")
var Audio = document.getElementById("audio")

import(`${location.href}libs/ZipJS/lib/zip.js`).then(mod => ZIPJS = mod)
import(`${location.href}libs/osuParser/index.js`).then(mod => {
    OSUParser = mod    
})

FilePicker.addEventListener("change", e => {

    var reader = new FileReader();
    
    reader.addEventListener('load', (event) => {
        
        var zipReader = new ZIPJS.ZipReader(new ZIPJS.Data64URIReader(event.currentTarget.result))
        
        zipReader.getEntries().then(en => {        
            
            en.filter( file => file.filename.split(".")[1] == "osu" ).forEach( e => {
            
                e.getData(new ZIPJS.TextWriter(),new ZIPJS.TextReader()).then( file => {
            
                    
                    var Map = OSUParser.parseContent(file)
                    console.log(Map.metadata.Version)
            
                })
            
            })
            
            // Find Song File
            en.find( file => file.filename.split(".")[1] == "mp3" ).getData(new ZIPJS.Data64URIWriter("audio/mp3"),new ZIPJS.TextReader()).then( file => { 
            
                Source.src = file
                
                Audio.load()
                Audio.play()
            
            } )

            en.find( file => file.filename.split(".")[1] == "osu" ).getData(new ZIPJS.TextWriter(),new ZIPJS.TextReader()).then( file => {
            
                var Mapdata = OSUParser.parseContent(file)
                console.log(Mapdata)
                
                CalculateStarRating(Mapdata.metadata.BeatmapID).then( console.log )
                
            
            })
        
        })


    })
    reader.readAsDataURL(FilePicker.files[0]);

})

function CalculateStarRating(MapID){
    
    return new Promise( (res, rej) => {

        fetch("https://OSUWeb-Server.drmeepso.repl.co/stars", {method: "POST", body: JSON.stringify({ "mapID": MapID })})
        .then( e => e.json() )
        .then( json => {
            
            if(json.Error == undefined) {
            
                res( json )
            
            } else {
            
                rej( json )
            
            }
            
            
        }) 
    
    })
    

}
//https://chimu.moe/docs

var ZIPJS = {}
var FilePicker = document.getElementById("FilePicker")
var Source = document.getElementById("source")
var Audio = document.getElementById("audio")

import(`${location.href}libs/ZipJS/lib/zip.js`).then(mod => ZIPJS = mod)

function GetBeatMapInfo(file){

    var BeatmapInfo = {}
    
    file.replaceAll("\n", '').split("]").forEach( (Sec, SecIndex) => {
    
        if (Sec.includes("osu file format")) return

        Sec.split("\r").filter( e => !e.includes("[") ).forEach( (e,i) => {
                
            if (e == "" || SecIndex > 4) return
        
            var Values = e.split(":")
            BeatmapInfo[Values[0]] = Values[1]
        
        })
    
    })
    
    return BeatmapInfo
    
}

FilePicker.addEventListener("change", e => {

    console.log(FilePicker.files)

    var reader = new FileReader();
    
    reader.addEventListener('load', (event) => {
        
        var zipReader = new ZIPJS.ZipReader(new ZIPJS.Data64URIReader(event.currentTarget.result))
        
        zipReader.getEntries().then(en => {
        
            console.log(en.filter( file => file.filename.split(".")[1] == "mp3" ))
                        
            en.filter( file => file.filename.split(".")[1] == "osu" ).forEach( e => {
            
                e.getData(new ZIPJS.TextWriter(),new ZIPJS.TextReader()).then( file => {
            
                    console.log(GetBeatMapInfo(file))
            
                })
            
            })
            
            // Find Song File
            en.find( file => file.filename.split(".")[1] == "mp3" ).getData(new ZIPJS.Data64URIWriter("audio/mp3"),new ZIPJS.TextReader()).then( file => { 
            
                Source.src = file
                
                Audio.load()
                Audio.play()
            
            } )

            en[0].getData(new ZIPJS.TextWriter(),new ZIPJS.TextReader()).then( file => {} )
        
        })


    })
    reader.readAsDataURL(FilePicker.files[0]);

})
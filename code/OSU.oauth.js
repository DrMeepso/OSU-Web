export function OpenAuth() {

    return new Promise(resolve => {

        var popupWindow = window.open('https://osu.ppy.sh/oauth/authorize?client_id=13977&redirect_uri=http://localhost:58118&response_type=code&scope=identify public friends.read', 'popUpWindow', 'height=800,width=500,left=100,top=100,resizable=no,scrollbars=no,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
        var wait = setInterval(() => {

            if (popupWindow.window.location.href.split("?")[0] == "http://localhost:58118/") {

                clearInterval(wait)
                popupWindow.close()


                fetch("https://OSUWeb-Server.drmeepso.repl.co/oauth/token", { method: "POST", body: JSON.stringify({ "code": popupWindow.window.location.href.split("?")[1].split("=")[1], "uri": "http://localhost:58118" }) })
                    .then(responce => responce.json())
                    .then(json => { resolve(json); })

            }

        }, 500)

    })

}
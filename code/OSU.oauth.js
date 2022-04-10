export function OpenAuth() {

    return new Promise(resolve => {

        var popupWindow = window.open(`https://osu.ppy.sh/oauth/authorize?client_id=13977&redirect_uri=${window.location.origin}&response_type=code&scope=identify`, 'popUpWindow', 'height=800,width=500,left=100,top=100,resizable=no,scrollbars=no,toolbar=yes,menubar=no,location=no,directories=no,status=yes');
        var wait = setInterval(() => {

            if (popupWindow.window.location.href.split("?")[0] == window.location.href) {

                clearInterval(wait)
                popupWindow.close()
                
                fetch("https://OSUWeb-Server.drmeepso.repl.co/oauth/token", { method: "POST", body: JSON.stringify({ "code": popupWindow.window.location.href.split("?")[1].split("=")[1], "uri": window.location.origin }) })
                    .then(responce => responce.json())
                    .then(json => { resolve(json); })

            }

        }, 10)

    })

}
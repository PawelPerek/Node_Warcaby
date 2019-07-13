class Net {
    loginRequest(login) {
        return new Promise(resolve => {
            $.ajax({
                url: "/login",
                type: "POST",
                data: {login}
            }).done(data => {
                resolve(data);
            })
        })
    }

    loginStatus() {
        return new Promise(resolve => {
            $.ajax({
                url: "/check",
                type: "POST"
            }).done(data => {
                resolve(data);
            })
        })
    }

    dbReset() {
        return new Promise(resolve => {
            $.ajax({
                url: "/reset",
                type: "POST"
            }).done(()=> {
                resolve();
            })
        })
    }
    
    sendPawns(pawns) {
        return new Promise(resolve => {
            $.ajax({
                url: "/receivePawns",
                type: "POST",
                data: {pawns},
            }).done(data => {
                resolve(data);
            })
        })
    }

    checkTurn() {
        return new Promise(resolve => {
            $.ajax({
                url: "/turn",
                type: "POST",
            }).done(data => {
                resolve(data);
            })
        })
    }
}
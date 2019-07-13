class Ui {
    constructor() {
        $("#btLogin").on("click", this.handleLogin)
        $("#btReset").on("click", this.handleReset)
    }

    handleLogin() {
        const LOGIN_SUCCESS_FIRST = 1;
        const LOGIN_SUCCESS_SECOND = 2;
        const LOGIN_FAIL_OVERFLOW = 3;
        const LOGIN_FAIL_NICKNAME = 4;

        net.loginRequest($("#inLogin").val()).then(data => {
            let status = JSON.parse(data).status;
            if (status === LOGIN_FAIL_NICKNAME) {
                $("h1").text("Jest juz taki nick w grze");
            }
            else if (status === LOGIN_FAIL_OVERFLOW) {
                $("h1").text("Za duzo graczy w jednej grze");
            }
            else if (status === LOGIN_SUCCESS_FIRST || status === LOGIN_SUCCESS_SECOND) {
                $("#inLogin").remove();
                $("button").remove();
                $("h1").text("Oczekuję na drugiego gracza");

                if (status === LOGIN_SUCCESS_SECOND)
                    game.first = false;

                let interval = setInterval(() => {
                    net.loginStatus().then(data => {
                        let status = JSON.parse(data).state;
                        if (status) {
                            $("#all").remove();
                            game.afterLogin();
                            clearInterval(interval);
                        }
                    })
                }, 500);
            }
        })
    }
    handleReset() {
        net.dbReset().then(() => {
            $("h1").html("Zresetowano bazę danych");
        })
    }
    doOverlay() {
        let annoyer = $("<div>").attr("id", "annoyer");
        $("body").append(annoyer)
        this.startTimer(false);
    }
    startTimer(yourTurn) {
        if (this.id) clearInterval(this.id);
        $("#timer").text(60);
        this.id = setInterval(() => {
            net.checkTurn().then(obj => {
                obj = JSON.parse(obj);
                let status = obj.status;
                let time = +$("#timer").text() - 1;
                $("#timer").text(time);
                if (time === 0) {
                    clearInterval(this.id);
                    yourTurn ? this.lose() : this.win();
                }
                if (((status === "1" && game.first) || (status === "2" && !game.first)) && !yourTurn) {
                    $("#annoyer").remove();
                    this.startTimer(true);
                    game.synchronize(obj.pawns)
                }
            })
        }, 1000)
    }
    win() {
        $("#root").remove();
        $("#timer").text("WYGRAŁEŚ");
    }
    lose() {
        $("#root").remove();
        $("#timer").text("PRZEGRAŁEŚ");
    }
    debug() {
        if (game.first)
            $("#debug").html(game.pawns.join("<br>"))
        else {
            let tmp = JSON.parse(JSON.stringify(game.pawns));
            $("#debug").html(tmp.reverse().map(el => el.reverse()).join("<br>"))
        }
    }
}
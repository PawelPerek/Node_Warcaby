let http = require("http");
let fs = require("fs");
let qs = require("querystring")

const PORT = 80;
const filename = "public";

let array = [];
let isFull = false;
let turn = 1;
let pawns = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

http.createServer((req, res) => {
    if (req.method == "GET") {
        let content;
        if (req.url == "/") {
            res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
            content = fs.readFileSync(`./${filename}/index.html`);
        }
        else if (req.url.includes("js")) {
            res.writeHead(200, { "Content-Type": "application/javascript" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        else if (req.url.includes("css")) {
            res.writeHead(200, { "Content-Type": "text/css" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        else if (req.url.includes("img")) {
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        res.end(content);
    }
    else if (req.method == "POST") {
        if (req.url.includes("login")) {
            let allData = "";

            req.on("data", data => {
                allData += data;
            })

            req.on("end", () => {
                let obj = qs.parse(allData)

                const LOGIN_SUCCESS_FIRST = 1;
                const LOGIN_SUCCESS_SECOND = 2;
                const LOGIN_FAIL_OVERFLOW = 3;
                const LOGIN_FAIL_NICKNAME = 4;

                if (!array.includes(obj.login)) {
                    array.push(obj.login);
                    if (array.length == 1)
                        res.end(JSON.stringify({ status: LOGIN_SUCCESS_FIRST }));
                    else if (array.length == 2)
                        res.end(JSON.stringify({ status: LOGIN_SUCCESS_SECOND }));
                    else
                        res.end(JSON.stringify({ status: LOGIN_FAIL_OVERFLOW }));
                }
                else
                    res.end(JSON.stringify({ status: LOGIN_FAIL_NICKNAME }));
            })
        }
        else if (req.url.includes("reset")) {
            array = [];
            turn = 1;
            pawns = [
                [0, 2, 0, 2, 0, 2, 0, 2],
                [2, 0, 2, 0, 2, 0, 2, 0],
                [0, 2, 0, 2, 0, 2, 0, 2],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 1, 0, 1, 0, 1, 0],
                [0, 1, 0, 1, 0, 1, 0, 1],
                [1, 0, 1, 0, 1, 0, 1, 0]
            ];
            res.end();
        }
        else if (req.url.includes("check")) {
            if (array.length == 2)
                res.end(JSON.stringify({ state: true }));
            else
                res.end(JSON.stringify({ state: false }))
        }
        else if (req.url.includes("receivePawns")) {
            let allData = "";
            
            req.on("data", data => {
                allData += data;
            })
            req.on("end", () => {
                let obj = JSON.parse((qs.parse(allData)).pawns);
                console.log(obj, allData)
                pawns = obj;
                res.end(JSON.stringify(pawns));
            })

            turn = turn === 1 ? 2 : 1;
        }
        else if (req.url.includes("turn")) {
            res.end(JSON.stringify({
                status: turn.toString(),
                pawns: pawns
            }));
        }
    }

}).listen(PORT, () => console.log("Zahostowano na " + PORT));
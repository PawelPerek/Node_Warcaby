class Game {
    constructor() {
        ///---------------------------deklaracje
        //plansza
        this.chessboard = [
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1]
        ]

        this.pawns = [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ]

        //zmienne WebGL
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        this.camera = new THREE.PerspectiveCamera(
            45,
            $(document).width() / $(document).height(),
            0.1,
            10000
        );

        //zmienne dev
        this.first = true;
        this.currentPawn = null;

        //stałe
        this.FIELD_SIDE = 30;
        this.FIELD_HEIGHT = 10;
        this.PAWN_WIDTH = 12;
        this.PAWN_HEIGHT = 5;

        //gra
        this.beforeLogin();
    }

    beforeLogin() {
        this.prepareGame();
        this.renderChessboard();
        this.render();
    }

    afterLogin() {
        $("#root").mousedown(this.click.bind(this));
        this.renderPawns();
        this.setCamera();
    }

    prepareGame() {
        this.renderer.setClearColor(0xffffff);
        this.renderer.setSize($(document).width(), $(document).height());

        $("#root").append(this.renderer.domElement);

        this.camera.position.set(0, 150, 300);
        this.camera.lookAt(this.scene.position);

        $(window).resize(this.resize.bind(this));
    }

    resize() {
        this.renderer.setSize($(window).width(), $(window).height());
        this.camera.aspect = $(window).width() / $(window).height();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

    renderChessboard() {
        for (let row in this.chessboard) {
            for (let field in this.chessboard[row]) {
                let filename = null;

                if (this.chessboard[row][field] == 1)
                    filename = "field_white.jpg";
                else if (this.chessboard[row][field] == 0)
                    filename = "field_black.jpg";

                let geometry = new THREE.BoxGeometry(this.FIELD_SIDE, this.FIELD_HEIGHT, this.FIELD_SIDE);
                let material = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(`./img/${filename}`),
                    side: THREE.DoubleSide,
                    wireframe: false,
                    transparent: false,
                    opacity: 1
                });

                let fieldObject = new THREE.Mesh(geometry, material);

                fieldObject.position.x = row * this.FIELD_SIDE - (this.chessboard.length - 1) * this.FIELD_SIDE / 2;
                fieldObject.position.z = field * this.FIELD_SIDE - (this.chessboard.length - 1) * this.FIELD_SIDE / 2;
                fieldObject.userData = { type: "field", color: filename.split(".")[0], x: field, y: row };
                this.scene.add(fieldObject);
            }
        }
    }

    setCamera() {
        if (this.first) {
            this.camera.position.set(0, 150, 300);
            ui.startTimer(true);
        }
        else {
            this.camera.position.set(0, 150, -300);
            ui.doOverlay();
        }
        ui.debug();
        this.camera.lookAt(this.scene.position);
    }

    renderPawns() {
        for (let row in this.pawns) {
            for (let field in this.pawns[row]) {
                let filename = null;

                if (this.pawns[row][field] == 1)
                    filename = "pawn_white.jpg";
                else if (this.pawns[row][field] == 2)
                    filename = "pawn_black.jpg";
                else
                    continue;

                let geometry = new THREE.CylinderGeometry(this.PAWN_WIDTH, this.PAWN_WIDTH, this.PAWN_HEIGHT, 16);
                let material = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(`./img/${filename}`),
                    side: THREE.DoubleSide,
                    wireframe: false,
                    transparent: false,
                    opacity: 1
                });

                let pawn = new THREE.Mesh(geometry, material);

                pawn.position.x = field * this.FIELD_SIDE - (this.chessboard.length - 1) * this.FIELD_SIDE / 2;
                pawn.position.y = this.FIELD_HEIGHT;
                pawn.position.z = row * this.FIELD_SIDE - (this.chessboard.length - 1) * this.FIELD_SIDE / 2;
                pawn.userData = { type: "pawn", color: filename.split(".")[0], colorCode: this.pawns[row][field], y: field, x: row };

                this.scene.add(pawn);
            }
        }
    }

    synchronize(pawns) {
        let tmp = [];
        for (let row in pawns) {
            for (let cell in pawns[row]) {
                if (pawns[row][cell] !== this.pawns[row][cell]) {
                    if (this.pawns[row][cell] == 0) {
                        tmp[2] = row;
                        tmp[3] = cell;
                    }
                    else {
                        tmp[0] = row;
                        tmp[1] = cell;
                    }
                }
            }
        }
        this.move(tmp[0], tmp[1], tmp[2], tmp[3]);
        ui.debug();
    }

    move(x1, z1, x2, z2) {
        let pawn, field;
        for (let el in arguments)
            arguments[el] = Number(arguments[el])

        for (let el of this.scene.children) {
            if (el.userData.x == x1 && el.userData.y == z1 && el.userData.type == "pawn")
                pawn = el;
            else if (el.userData.x == x2 && el.userData.y == z2 && el.userData.type == "field")
                field = el;
        }

        console.log(x1, z1, x2, z2)

        this.pawns[x2][z2] = pawn.userData.colorCode;
        this.pawns[x1][z1] = 0;

        pawn.userData.x = x2;
        pawn.userData.y = z2;

        pawn.position.x = field.position.x;
        pawn.position.z = field.position.z;
    }

    click(e) {
        let raycaster = new THREE.Raycaster();
        let mouseVector = new THREE.Vector2();

        let localColor = null;
        let oldPawn = null;

        mouseVector.x = (e.clientX / $(window).width()) * 2 - 1;
        mouseVector.y = -(e.clientY / $(window).height()) * 2 + 1;
        raycaster.setFromCamera(mouseVector, this.camera);

        if (this.first)
            localColor = "pawn_white";
        else
            localColor = "pawn_black";

        let intersects = raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0 && intersects[0].object.userData.type == "pawn" && intersects[0].object.userData.color == localColor) {
            if (!this.currentPawn)
                this.currentPawn = intersects[0].object;
            else {
                oldPawn = this.currentPawn;
                this.currentPawn = intersects[0].object;
            }
        }
        else if (intersects.length > 0 && intersects[0].object.userData.type == "field" && intersects[0].object.userData.color == "field_black" && this.currentPawn) {
            this.move(this.currentPawn.userData.x, this.currentPawn.userData.y, intersects[0].object.userData.x, intersects[0].object.userData.y)

            this.currentPawn.position.x = intersects[0].object.position.x;
            this.currentPawn.position.z = intersects[0].object.position.z;

            this.sendToServer();
            ui.doOverlay();
            [oldPawn, this.currentPawn] = [this.currentPawn, null];
        }

        if (this.currentPawn) {
            let newColor = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load('./img/marked.jpg'),
                side: THREE.DoubleSide,
                wireframe: false,
                transparent: false,
                opacity: 1
            });
            this.currentPawn.material = newColor;
        }

        if (oldPawn) {
            let newColor = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(`./img/${localColor}.jpg`),
                side: THREE.DoubleSide,
                wireframe: false,
                transparent: false,
                opacity: 1
            });
            oldPawn.material = newColor;
        }
    }
    sendToServer() {
        net.sendPawns(JSON.stringify(this.pawns)).then(data => {
            let obj = JSON.parse(data);
            this.pawns = obj;
            ui.debug();
        });
    }
}

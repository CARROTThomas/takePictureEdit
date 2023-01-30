const width = 700;
let height = 0;
let streaming = false;

let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

window.addEventListener("load", startup, false);

function startup() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");

    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
    video.addEventListener(
        "canplay",
        (ev) => {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute("width", width);
                video.setAttribute("height", height);
                canvas.setAttribute("width", width);
                canvas.setAttribute("height", height);
                streaming = true;
            }
        },
        false
    );

    startbutton.addEventListener(
        "click",
        (ev) => {
            takepicture();
            ev.preventDefault();
        },
        false
    );
    clearphoto();
}

function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    sourceImage = canvas.toDataURL("image/png");
}

function takepicture() {
    const context = canvas.getContext("2d");
    if (!width && !height) {
        clearphoto();
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    let data = canvas.toDataURL("image/png");

    let canvas1 = document.querySelector('#canvas1')
    const ctx = canvas1.getContext('2d');
    const image1 = new Image();
    image1.src=data
    //console.log(image1.src) // ################## Lien de la base64
    class Cell {
        constructor(x, y, symbol) {
            this.x = x;
            this.y = y;
            this.symbol = symbol;
        }
        draw(ctx){
            ctx.fillStyle = 'white';
            ctx.fillText(this.symbol, this.x, this.y)
        }
    }

    class AscciEffect {
        #imageCellArray = [];
        #pixels = [];
        #ctx;
        #width;
        #height;
        constructor(ctx, width, height) {
            this.#ctx = ctx;
            this.#width = width;
            this.#height = height;
            this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
            this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
            //console.log(this.#pixels.data) // ################## Grille
        }
        #convertToSymbol(g) {
            if (g > 250) return '@';
            else if (g > 240) return '*';
            else if (g > 220) return '+';
            else if (g > 200) return '#';
            else if (g > 180) return '&';
            else if (g > 160) return '%';
            else if (g > 140) return '_';
            else if (g > 120) return ':';
            else if (g > 100) return '$';
            else if (g > 80) return '/';
            else if (g > 60) return '-';
            else if (g > 40) return 'X';
            else if (g > 20) return 'W';
            else return '';
        }
        #scanImage(cellSize){
            this.#imageCellArray = [];
            for (let y = 0; y < this.#pixels.height; y +=
                cellSize){
                for (let x = 0; x < this.#pixels.width; x += cellSize) {
                    const posX = x * 4;
                    const posY = y * 4;
                    const pos = (posY * this.#pixels.width) + posX;

                    if (this.#pixels.data[pos + 3] >128 ){
                        const red = this.#pixels.data[pos];
                        const green = this.#pixels.data[pos + 1];
                        const blue = this.#pixels.data[pos + 2];
                        const total = red + green + blue;
                        const averageColorValue = total/3;
                        const color = "rgb(" + red + ","+ green + "," + blue + ")";
                        const symbol = this.#convertToSymbol(averageColorValue);
                        if (total > 200) {this.#imageCellArray.push(new Cell(x, y, symbol, color));}
                    }
                }
            }
        }
        #drawAscii(){
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            for (let i = 0; i < this.#imageCellArray.length; i++) {
                this.#imageCellArray[i].draw(this.#ctx);
            }
        }
        draw(cellSize){
            this.#scanImage(cellSize);
            this.#drawAscii();
        }
    }

    let effect; // ################## objet = tableau => tableau = coordonnées, symbol

    image1.onload = function initialize(){
        canvas1.width = image1.width;
        canvas1.height = image1.height;
        effect = new AscciEffect(ctx, image1.width, image1.height);
        effect.draw(6);
        // valeur de la resolution
        // (4 ou 5 pour fond noir et caractère blanc
        // (5 ou 6 pour fond blanc et caractère noir)
    }
}
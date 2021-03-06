const Constants = require('../Constants.js');
const Render = require('./Render.js');
const Input = require('./Input.js');
const Point = require('../Server/Point.js');

class Game {
    constructor(render, input, socket) {
        this.imgs = {};
        this.render = render;
        this.input = input;
        this.socket = socket;

        this.me = null;
        this.players = {};
        this.powerups = [];
        this.area = null;
        this.newO = new Point(0, 0);
        this.lastUpdateTime = 0;
        this.dt = 0;
    }

    static create(document, socket) {
        const game = new Game(Render.create(),
            Input.create(document),
            socket);
        game.init();
        return game;
    }

    //скачиваем все нужные изображения
    downloadImages() {
        let downloadImage = (imageName) => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = `/css/${imageName}`;
                img.onload = () => {
                    console.log(`Downloaded ${imageName}`);
                    this.imgs[imageName.slice(0, imageName.length - 4)] = img;
                    resolve();
                };
            });
        }
        Promise.all(Constants.IMG_NAMES.map(downloadImage)).then(() => console.log('All images downloaded'));
        this.render.loadImgs(this.imgs);
    }

    //игра в текущее мнгновение
    start(canvas, context, chat) {
        this.dt = Date.now() - this.lastUpdateTime;
        this.lastUpdateTime = Date.now();

        this.update(chat);
        this.socket.on(Constants.STATE_UPDATE, this.getState.bind(this));
        this.renderGame(canvas, context);
    }

    //инициализация
    init() {
        this.lastUpdateTime = Date.now();
        this.socket.on(Constants.STATE_UPDATE, this.getState.bind(this));
    }

    //функция для обработки серверной информации об игре
    getState(state) {
        this.me = state.me;
        this.players = state.players;
        this.powerups = state.powerups;
        this.area = state.area;
        this.newO = new Point(this.me.screenWidth / 2 - this.me.x,
            this.me.screenHeight / 2 - this.me.y);
    }

    //посылаем обновленную информацию от клиента на сервер
    update(chat) {
        if (this.me) {
            this.socket.emit(Constants.PLAYER_ACTION, {
                up: this.input.upPressed,
                down: this.input.downPressed,
                left: this.input.leftPressed,
                right: this.input.rightPressed,
                mouse: this.input.mousePressed,
                /*
                    вычитая параметры экрана, находим положение курсора мыши
                    относительно середины экрана(где находится игрок), далее
                    переводим эти координаты в с.к. серверного игрового поля,
                    за счёт того, что мы знаем положение игрока на сервере(x,y),
                    и знаем,как относительно него располагается курсор.
                */
                mouseX: this.input.mouseX - document.documentElement.clientWidth / 2 + this.me.x + this.me.w / 2,
                mouseY: this.input.mouseY - document.documentElement.clientHeight / 2 + this.me.y + this.me.h / 2,
                dt: this.dt,
                mouseInChat: chat.mouseInChat,
                inputFocus: chat.inputFocus
            })
        }
    }

    //рисуем игру
    renderGame(canvas, context) {
        this.render.clear(canvas, context);
        context.save(); //добавляет текущее положение экрана в стек
        context.translate(this.newO.x - this.me.w / 2, this.newO.y - this.me.h / 2); //переносит начало координат в зааданную точку
        this.render.drawFrame(context);
        this.render.drawField(context);
        this.render.drawProjectiles(context, this.players);
        this.render.drawPowerups(context, this.powerups);
        this.render.drawEpidemicArea(context, this.area);
        context.restore();
        this.render.drawPlayers(this.newO, context, this.players);
    }
}

module.exports = Game;

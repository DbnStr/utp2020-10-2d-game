const Player = require('./Player.js');
const Epidemic = require('./Epidemic.js');
const Point = require('./Point.js');
const Chat = require('./Chat.js');
const Leaderboard = require('./Leaderboard.js');
const Constants = require('../Constants.js');
const Powerup = require('./Powerup.js');
class Game {
    constructor() {
        this.clients = new Map();
        this.players = {};
        this.humanCount = 0;
        this.zombieCount = 0;
        this.w = 0;
        this.h = 0;
        this.powerups = [];
        this.epidemicArea = new Epidemic(new Point(0, 0), 0);
        this.chat = new Chat();
        this.lastUpdateTime = 0;
        this.timeToStart = 0;
    }

    static create() {
        const game = new Game();
        game.init();
        return game;
    }

    init() {
        this.lastUpdateTime = Date.now();
        this.lastCreationPowerupTime = 0;
        this.leaderboard = new Leaderboard();
    }

    updatePlayerOnInput(id, state) {
        if (id in this.players) {
            this.players[id].updateOnInput(state);
            if (state.mouse && !state.mouseInChat)
                this.addProjectile(id, {
                    mouseX: state.mouseX,
                    mouseY: state.mouseY,
                });
        }
    }

    //проверка, что людей становится слишком много
    demographicImbalance() {
        return this.humanCount > this.zombieCount + 1;
    }

    //возвращает точку с координатами около рандомного игрока, являющегося человеком
    randomHuman() {
        let keys = Object.keys(this.players),
            curPlayer = this.players[keys[Math.floor(Math.random() * (keys.length - 1))]];
        while (curPlayer.role !== Constants.HUMAN_TYPE)
            curPlayer = this.players[keys[Math.floor(Math.random() * keys.length)]];
        return new Point(Math.abs(curPlayer.x - 15), Math.abs(curPlayer.y - 15));
    }

    //вспышка эпидемии случается рядом со случайным человеком
    outbreak() {
        if (this.demographicImbalance()) {
            console.log('we need more zombie! Zombie: ' + this.zombieCount + ' Human: ' + this.humanCount);
            let c = this.randomHuman();
            this.epidemicArea = new Epidemic(c, 0);
            this.epidemicArea.coordinateFixed = true;
            this.epidemicArea.marker = true;
            this.epidemicArea.start = Date.now();

        }
    }

    //поиск имени среди уже существующих на сервере
    findName(name) {
        for (let key in this.players)
            if (this.players[key].name === name)
                return 1;
        return 0;
    }

    collisionWithEpidemicArea(id) {
        if (this.players[id].role === 'Human' &&
            this.players[id].intersectCircle(this.epidemicArea)) { //люди, которых задело
            this.turningIntoZombie(id);
            let note = this.players[id].name + ' got to the infected area. He is zombie now';
            Chat.sendNote(note, this.clients);
        }
    }

    //проверяет какие таблетки подобрал игрок
    collisionWithPowerups(id) {
        let player = this.players[id];
        this.powerups.forEach((powerup) => {
            switch (powerup.type) {
                case Constants.POWERUP_PILL_TYPE:
                    if (player.role === Constants.HUMAN_TYPE && player.intersect(powerup)) {
                        player.pickUpPowerup(powerup);
                    }
                    break;
                case Constants.POWERUP_MASK_TYPE:
                    if (player.role === Constants.HUMAN_TYPE && player.intersect(powerup)) {
                        player.pickUpPowerup(powerup);
                    }
            }
        })
    }

    //просчитываем получение урона игроком id от снарядов других игроков
    collisionWithProjectile(id) {
        let player = this.players[id];
        for (let key in this.players) {
            if (key !== id && this.players[key].role !== player.role && this.players[key].isAlive()) {
                for (let i = 0; i < this.players[key].projectiles.length; i++) {
                    let projectile = this.players[key].projectiles[i];
                    if (projectile.isExist && player.intersect(projectile)) {
                        player.decreaseHealth(projectile.damage * player.damageMultiplier); //уменьшаем здоровье игрока, по которому попали
                        projectile.exist = false;
                        if (player.health === 0) {
                            if (player.role === 'Zombie') {
                                this.leaderboard.addKill(key);
                                player.alive = false; //удаляем его из списка игроков
                                this.clients.get(id).emit(Constants.GAME_OVER);
                            } else {
                                this.leaderboard.addZombie(key);
                                this.turningIntoZombie(id);
                                let note = player.name + ' was infected by Zombie community. He is zombie now too';
                                Chat.sendNote(note, this.clients);
                            }
                            return;
                        }
                    }
                }
            }
        }
    }

    turningIntoZombie(id) {
        const player = this.players[id];
        this.players[id] = new Player(Constants.ZOMBIE_TYPE, player.name, player.screenWidth, player.screenHeight);
        this.players[id].x = player.x;
        this.players[id].y = player.y;
        --this.humanCount;
        ++this.zombieCount;
    }

    createNewPowerup() {
        const currentTime = this.lastUpdateTime;
        if (currentTime - this.lastCreationPowerupTime >= Constants.POWERUP_APPEARANCE_PERIOD) {
            this.lastCreationPowerupTime = currentTime;
            this.powerups.unshift(Powerup.create());
        }
    }

    updatePlayers() {
        for (let key in this.players) {
            this.players[key].update(this.lastUpdateTime);
        }

    }

    update() {
        this.lastUpdateTime = Date.now();
        this.createNewPowerup();
        this.updatePlayers();
        //движение снарядов
        this.moveProjectiles();

        //столкновение с таблетками
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.collisionWithPowerups(key);
        }
        if (!this.epidemicArea.coordinateFixed &&
            this.lastUpdateTime - this.timeToStart >= Constants.EPIDEMIC_AREA_TIME_OF_FIRST_EPIDEMIC)
            this.outbreak();
        else if (this.epidemicArea.marker) {
            if (this.epidemicArea.isTooBig()) {
                this.epidemicArea.marker = false;
                this.epidemicArea.coordinateFixed = false;
            } else {
                console.log("EPIDEMIC AREA RADIUS IS " + this.epidemicArea.radius)
                this.epidemicArea.increaseRadius();
            }
        }
        //столкновение с epidemicArea
        for (let key in this.players) {
            if (this.players[key].isAlive()) {
                if (this.epidemicArea.marker)
                    this.collisionWithEpidemicArea(key);
            }
        }
        //столкновение игроков со снарядами
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.collisionWithProjectile(key);
        }
        //удаляем уничтоженные снаряды
        for (let key in this.players)
            this.players[key].projectiles = this.players[key].projectiles.filter(
                projectile => projectile.isExist())

        //удаляем подобранные лекарства
        this.powerups = this.powerups.filter(
            powerup => powerup.isExist());

        //удаляем убитых игроков
        for (let key in this.players) {
            if (!this.players[key].isAlive()) {
                let note = this.players[key].name + ' has died. Completely. RIP';
                this.players[key].role === Constants.HUMAN_TYPE ? --this.humanCount : --this.zombieCount;
                delete this.players[key];
                delete this.clients[key];
                this.chat.removeUser(key);
                this.leaderboard.removeUser(key);
                Chat.sendNote(note, this.clients);
            }
        }

    }

    addProjectile(id, projectile) {
        this.players[id].shoot(projectile);
    }

    moveProjectiles() {
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.players[key].moveProjectiles();
        }
    }

    //добавляет нового игрока
    addPlayer(player, socket) {
        this.players[socket.id] = new Player(player.role, player.name, player.width, player.height);
        if (this.w === 0 || this.h === 0) {
            this.w = player.width;
            this.h = player.height;
        }
        this.clients.set(socket.id, socket);
        if (player.role === Constants.ZOMBIE_TYPE)
            this.zombieCount++;
        else
            this.humanCount++;
        console.log(this.humanCount + " " + this.zombieCount);
        this.chat.addUser(socket);
        this.leaderboard.addUser(socket, player);
    }

    start() {
        this.timeToStart = this.lastUpdateTime;
        this.clients.forEach((client, socketID) => {
            client.emit(Constants.PLAY);
        });
    }

    //отправляет текущее состояние клиентам
    sendState() {
        this.clients.forEach((client, socketID) => {
            const currentPlayer = this.players[socketID]
            client.emit(Constants.STATE_UPDATE, {
                me: currentPlayer,
                players: this.players,
                powerups: this.powerups,
                area: this.epidemicArea,
            })
        });
        this.chat.sendState();
        this.leaderboard.sendState();
    }

    addTyping(id) {
        if (id in this.players) {
            this.chat.addTyping(this.players[id]);
        }
    }

    removeTyping(id) {
        if (id in this.players) {
            this.chat.removeTyping(this.players[id]);
        }
    }

    sendMessage(id, msg) {
        if (id in this.players) {
            this.clients.forEach((client) => {
                client.emit(Constants.NEW_MSG, {
                    name: this.players[id].name,
                    msg: msg
                });
            });
        }
    }

    sendNote(data) {
        Chat.sendNote(data, this.clients);
    }
}

module.exports = Game;
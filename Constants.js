module.exports = Object.freeze({
    WORLD_MIN: 0,
    WORLD_WIDTH: 3000,
    WORLD_HEIGHT: 3000,
    ZOMBIE_MAX_HEALTH: 1.00,
    HUMAN_MAX_HEALTH: 1.00,
    SPEED_OF_COUGH: 5, //скорость полёта кашля
    SPEED_OF_BULLET: 10, //скорость полёта пули
    BULLET_WIDTH: 10, //длина модельки пули
    BULLET_HEIGHT: 10, //ширина модельки пули
    COUGH_WIDTH: 10, //длина снаряда кашя
    COUGH_HEIGHT: 10, //ширина снаряда кашля
    PLAYER_WIDTH: 90, //длина прямоугольника модельки человека
    PLAYER_HEIGHT: 90, //ширина прямоугольника модельки человека
    PILL_WIDTH: 50, //длина прямоугльника модельки лекарства
    PILL_HEIGHT: 50, //ширина прямоугольника модельки лекарства
    HEALTH_OF_PILL: 0.10, //лечение от лекарства
    COUGH_FLIGHT_DISTANCE: 200, //дальность кашля
    BULLET_FLIGHT_DISTANCE: 400, //дальность кашля
    IMG_NAMES: [
        'Zombie.png', //Zombie
        'Human.png', //Human
        'Virus.png', //моделька снарядов - кашля
        'Medicine.svg', //лекарство
        'Bullet.png', //пуля
        'Field.jpg'
    ],
    STATE_UPDATE: 'update',
    PLAYER_ACTION: 'playerAction',
    PLAY: 'playTheGame',
    RELOAD_PISTOL: 5000, //длительность перезарядки пистолета
    BULLET_TYPE: 'bullet',
    COUGH_TYPE: 'cough',
    BULLET_DAMAGE: 0.10, //урон от пули
    COUGH_DAMAGE: 0.05, //урон от кашля
    MAX_RADIUS_OF_EPIDEMIC_AREA: 100,
    FRAME_RATE: 1000 / 60,
    USER_EXISTS: 'usersExists',
    INVALID_NICKNAME: 'invalidNickname',
    SET_PLAYER_NAME: 'setPlayerName',
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    GAME_OVER: 'gameOver',
    CHAT_WIDTH_PERCENT: 0.2, //проуент экрана, занимаемого чатом
    NEW_MSG: 'newMessage',
    PROJECTILE_WIDTH: 10,
    PROJECTILE_HEIGHT: 10,
    ZOMBIE_TYPE: 'Zombie',
    HUMAN_TYPE: 'Human',
    NICKNAME_FONT: "15px Arial", //шрифт для имен над игроками
    NICKNAME_COLOR: "#0095DD", //цвет для имен над игроками
    HP_BAR_FRAME_COLOR: "#000000", //цвет контура шкалы здоровья
    HP_COLOR: "#32CD32", //цвет оставшегося здоровья
    HP_ABSENT_COLOR: "#B22222", //цвет отнятого здоровья
    EPIDEMIC_AREA_COLOR: 'rgb(46, 139, 87, 0.25)',
    HUMAN_TIME_BETWEEN_SHOOTS: 50,
    ZOMBIE_TIME_BETWEEN_SHOOTS: 100,
    USER_TYPING: 'someoneIsTyping',
    STOP_TYPING: 'stopTyping',
    NEW_NOTE: 'newNotification',
    FIELD_PIECE_WIDTH: 150,
    FIELD_PIECE_HEIGHT: 150,
    LDB_UPDATE: 'leaderboardUpdate',
    CLEAR_LDB: 'cleanLeaderboard'
})
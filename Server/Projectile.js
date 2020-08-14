const Rect = require('./Rect.js');
const Point = require('./Point.js');
const Constants = require('../Constants.js');
//класс снаряда
class Projectile extends Rect {
    constructor(x, y, projectileWidth, projectileHeight, mouseX, mouseY, mouseMove, type, projectileSpeed, damage) {
        super(x, y, projectileWidth, projectileHeight);
        this.mouseX = mouseX; //координаты мышки в момент выпуска сняряда
        this.mouseY = mouseY; //используяются для определения траектории полёта снаряда
        this.mouseMove = mouseMove;
        this.type = type;
        if (type === 'cough') {
            this.flightDistance = Constants.COUGH_FLIGHT_DISTANCE;
        } else {
            this.flightDistance = Constants.BULLET_FLIGHT_DISTANCE;
        }
        this.projectileSpeed = projectileSpeed; //скорость снаряда
        this.damage = damage; //урон от попадание этим снарядом
    }

    //заменяет свойства this,с именами из массива fields, одноимёнными свойствами из props(если в props их нет, то оствялет то, что было в this)
    cloneWith(props) {
        const fields = ['x', 'y', 'w', 'h', 'mouseX', 'mouseY', 'mouseMove', 'type', 'projectileSpeed', 'damage', 'startPoint'],
            res = new Projectile();
        for (let field in fields) {
            res[fields[field]] = (props[fields[field]] == undefined) ? this[fields[field]] : props[fields[field]];
        }
        return res;
    }

    //перемещение снаряда по изначальной траектории(прямой startPoint и (mouseX,mouseY)
    move() {
        if (!this.mouseMove) {
            this.x += this.projectileSpeed;
        } else {
            let points = (new Point(this.x, this.y)).findPoints(new Point(this.mouseX, this.mouseY), Math.pow(this.projectileSpeed, 2)),
                fP = points.firstPoint,
                sP = points.secondPoint,
                fDist = this.startPoint.findDist(fP),
                sDist = this.startPoint.findDist(sP);
            if (fDist > sDist) {
                this.x = fP.x;
                this.y = fP.y;
            } else {
                this.x = sP.x;
                this.y = sP.y;
            }
        }
    }

    //проверка улетел ли снаряд на свой радиус поражения
    flewAway() {
        return this.startPoint.findDist(new Point(this.x, this.y)) > this.flightDistance;
    }
}
module.exports = Projectile;
class Bomb {
    constructor() {
        this.x_position = 0;
        this.y_position = 0;
        this.size = 0;
        this.speed = 0;
        this.alive = false;
    }
    set(x_position, y_position, size, speed) {
        // 座標をセット
        this.x_position = x_position;
        this.y_position = y_position+40;
        // 爆弾のサイズ、スピードをセット
        this.size = size;
        this.speed = speed;
        // 生存フラグを立てる
        this.alive = true;
    }
    move() {
        // 爆弾の位置を左にspeed分だけ移動させる
        this.x_position -= this.speed;
        // 一定以上の座標に到達していたら生存フラグを降ろす
        if (this.x_position < -this.size) {
            this.alive = false;
        }
    }
}
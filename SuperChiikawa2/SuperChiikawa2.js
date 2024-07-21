// キーボードの入力状態を管理する配列を定義
let input_key = new Array();
// キーボードの入力イベント
// Keyを押下時の関数（keydown）
window.addEventListener("keydown", handleKeydown);
function handleKeydown(e) {
    input_key[e.keyCode] = true;
}

// Keyを離す際の関数（keyup）
window.addEventListener("keyup", handleKeyup);
function handleKeyup(e) {
    input_key[e.keyCode] = false;
}

// canvas要素の取得
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// canvas要素の幅と高さ指定
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 640;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

//キャラの設定
const IMG_SIZE = 80;
// キャラクターの操作速度
const CHARA_SPEED = 4;
// キャラの配置初期値
let x = 0;
let y = 300;

// 上下方向の速度
let vy = 0; // 正の時：落下中; 負の時：上昇中;
// ジャンプしたかのフラグ値
let isJump = false;

// ゴール位置の設定（ちいかわの位置）
const GOAL_X = 850;
const GOAL_Y = 370;

// 敵の情報
let enemy = {x: 700, y: 420, alive: true };
let enemyXUp = true;

// ブロック要素の定義
let blocks = [
    { x: 0, y: 500, w: 960, h: 40 },
    { x: 0, y: 540, w: 100, h: 100 },
    { x: 0, y: 0, w: 100, h: 200 },
    { x: 0, y: 0, w: 960, h: 100 },
    { x: 850, y: 450, w: 110, h: 70 },
    { x: 850, y: 540, w: 110, h: 100 },
];

// 爆弾設定
const BOMB_COLOR = 'rgba(255, 0, 0, 0.95)';
const BOMB_MAX_COUNT = 5; //画面上に出せる敵の爆弾の数
// 爆弾初期化
let bomb = new Array(BOMB_MAX_COUNT); // 要素が5個の空配列を作成
for (i = 0; i < BOMB_MAX_COUNT; i++) {
    bomb[i] = new Bomb(); //それぞれにインスタンスをセット
}
let bomb_timer = 0;

// ゲームオーバーのフラグ値
let isGameOver = false;
// ゲームクリアのフラグ値
let isGameClear = false;

// ロード時に画面描画の処理が実行されるようにする
window.addEventListener("load", update);

// 画面を更新する関数を定義
function update() {
        // 毎回画面をクリア設定
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (enemy.alive) {
        let updatedEnemyY = enemy.y;
        if (enemyXUp) {
            updatedEnemyY = updatedEnemyY - 3
            if (enemy.y < 300) enemyXUp = false;
        } else {
            updatedEnemyY = updatedEnemyY + 3
            if (enemy.y > 420) enemyXUp = true;
        }
        enemy.y = updatedEnemyY;
        bomb_timer++
        // 爆弾の速度設定
        if (bomb_timer % 50 === 0) {
            // すべての爆弾を調査する
            for (j = 0; j < BOMB_MAX_COUNT; j++) {
                if (!bomb[j].alive) {
                    // 爆弾を新規にセットする
                    bomb[j].set(enemy.x, enemy.y , 10, 5);
                    // 1個出現させたのでループを抜ける
                    break;
                }
            }
        }
        ctx.beginPath();
        // 全てのエネミーショットを調査する
        for (i = 0; i < BOMB_MAX_COUNT; i++) {
            // エネミーショットが既に発射されているかチェック
            if (bomb[i].alive) {
                // エネミーショットを動かす
                bomb[i].move();
                // エネミーショットを描くパスを設定
                ctx.arc(
                    bomb[i].x_position,    //円の中心のx座標
                    bomb[i].y_position,    //円の中心のy座標
                    bomb[i].size,          //円の大きさ
                    0, Math.PI * 2, false  //0度から330度
                );
                // パスをいったん閉じる
                ctx.closePath();
            }
        }
        // 爆弾の色を設定する
        ctx.fillStyle = BOMB_COLOR;
        //爆弾を描く
        ctx.fill();
    } else {
        enemy.x = 0;
        enemy.y = 0;
    }

    let updatedX = x;
    let updatedY = y;
    // ゲームクリア時アラート出力
    if (isGameClear) {
        alert("GAME COMPLETE");
        isGameClear = false;
        isJump = false;
        updatedX = 0;
        updatedY = 300;
        vy = 0;
    } else if (isGameOver) {
        updatedY = y + vy;
        vy = vy + 0.5;
        if (y > CANVAS_HEIGHT) { //キャラが更に下に落ちてきた時
            // ゲームオーバー時アラート出力
            alert("GAME OVER");
            isGameOver = false;
            isJump = false;
            updatedX = 0;
            updatedY = 300;
            vy = 0;
        }
    } else {
        // キーボード操作設定
        if (input_key[37]) {
            updatedX = x - CHARA_SPEED;
        }
        if (input_key[38] && !isJump) {
            /* updatedY = y + CHARA_SPEED; */
            vy = -12;
            isJump = true;
        }
        if (input_key[39]) {
            updatedX = x + CHARA_SPEED;
        }
        if (isJump) {
            updatedY = y + vy;
            vy = vy + 0.5; // ジャンプの高さ
            const BlockTargetIsOn = getBlockTargetIsOn(x, y, updatedX, updatedY);
            if (BlockTargetIsOn !== null) { // ブロックが取得できた場合には、着地させる
                updatedY = BlockTargetIsOn.y - IMG_SIZE; // 地面で止まる
                isJump = false;
            }
        } else { // ジャンプしていない状態でブロックが取得できなかった場合
            if (getBlockTargetIsOn(x, y, updatedX, updatedY) === null) {
                isJump = true; // 上のif文が適用される
                vy = 0;
            }
        }
    }
    x = updatedX;
    y = updatedY;

    if (!isGameOver) {
        let isHit = isAreaOverlap(x, y, IMG_SIZE, IMG_SIZE, enemy.x, enemy.y, IMG_SIZE, IMG_SIZE);
        if (isHit) { // 重なっていて
            if (isJump && vy > 0) { // ジャンプしていて、落下している状態で敵に衝突した場合は
                vy = -7; //上向のジャンプ
                enemy.alive = false;
            } else { // それ以外で衝突した場合は
                isGameOver = true; // ゲームオーバー
                vy = -10; // 上へ飛び上がる
            }
        }
        // うさぎと爆弾との衝突判定
        for (i = 0; i < BOMB_MAX_COUNT; i++) {
            // 爆弾の生存フラグをチェック
            if (bomb[i].alive) {
                isHit = isAreaOverlap(x, y, IMG_SIZE, IMG_SIZE,
                    bomb[i].x_position - bomb[i].size / 2, bomb[i].y_position - bomb[i].size / 2,
                    bomb[i].size, bomb[i].size);
                if (isHit) {
                    isGameOver = true; //ゲームオーバー
                    vy = -10; //上に飛び上がる
                    break;
                }
            }
        }

        // もしも「ちいかわ」に衝突したらクリアとする
        isHit = isAreaOverlap(x, y, IMG_SIZE, IMG_SIZE, GOAL_X, GOAL_Y, IMG_SIZE, IMG_SIZE);
        if (isHit) {
            isGameClear = true;
        }
    }

    //うさぎの画像を表示
    let image = new Image();
    image.src = "img/Usagi.png";
    ctx.drawImage(image, x, y, IMG_SIZE, IMG_SIZE);

    // ブロックを表示
    ctx.fillStyle = "Gray";
    for (const block of blocks) {
        ctx.fillRect(block.x, block.y, block.w, block.h);
    }

    // ちいかわの画像を表示
    image = new Image();
    image.src = "img/Chikawa.png";
    ctx.drawImage(image, GOAL_X, GOAL_Y, IMG_SIZE, IMG_SIZE);

    // モモンガの画像を表示
    if (enemy.alive) {
        let enemyImage = new Image();
        enemyImage.src = "img/Momonga.png";
        ctx.drawImage(enemyImage, enemy.x, enemy.y, IMG_SIZE, IMG_SIZE);
    }

    window.requestAnimationFrame(update);
}

// ブロック上に存在していればそのブロックの情報を返す、存在していなければ「null」を返す
function getBlockTargetIsOn(x, y, updatedX, updatedY) {
    for (const block of blocks) {
        // 更新前はキャラ下部が地面以上　且つ　更新後はキャラ下部が地面以下
        if (y + IMG_SIZE <= block.y && updatedY + IMG_SIZE >= block.y) {
            if (//このifを満たす時は、ブロックが存在しないので、取得不可
                //キャラ右端 <= ブロック左端 または キャラ左端 >= ブロック右端
                (x + IMG_SIZE <= block.x || x >= block.x + block.w) &&
                (updatedX + IMG_SIZE <= block.x || updatedX >= block.x + block.w)
            ) {
                // ブロックの上に居ない場合には、何もしない
                continue;
            }
            // ブロックの上に居る場合には、そのブロック要素を返す
            return block;
        }
    }// 最後までブロック要素を返さなかった場合（全て「continue」処理された場合）
    return null; //ブロック要素の上に居ないということなので「null」を返却する
}

// キャラの左上の角の座標を（cx, cy）、幅をcw、 高さをchとする
// 敵の左上の角の座標を（ex, ey）、幅をew、高さをehとする
function isAreaOverlap(cx, cy, cw, ch, ex, ey, ew, eh) {
    if (ex + ew < cx) return false; //キャラの左と敵の右
    if (cx + cw < ex) return false; //キャラの右と敵の左
    if (ey + eh < cy) return false; //キャラの上と敵の下
    if (cy + ch < ey) return false; //キャラの下と敵の上
    return true; // ここまで到達する場合には、何処かしらで重なる
}

// 効果音再生用のオーディオ要素を作成
let jumpSound = new Audio("Sounds/Usagi.mp4");

// ジャンプ時の音声再生
function playJumpSound() {
    jumpSound.currentTime = 0; // 再生位置を初期化（連続で再生するため）
    jumpSound.play();
}

function handleKeydown(e) {
    /*alert(`${e.keyCode}が押されたよ`)*/
    if (e.keyCode === 38) { // 上向き矢印キー（ジャンプキー）
        playJumpSound(); // ジャンプ効果音の再生
    }
    input_key[e.keyCode] = true;
}
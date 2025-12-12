// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 设置画布尺寸
canvas.width = 600;
canvas.height = 400;
//增加一行日志查看提交情况

// 游戏常量
const GRID_SIZE = 20;
const ROWS = canvas.height / GRID_SIZE;
const COLS = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 10;
const MAX_LEVEL = 10;

// 游戏变量
let snake = [];
let food = {};
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let level = 1;
let gameSpeed = INITIAL_SPEED;
let gameLoopId = null;
let isGameRunning = false;
let isGameOver = false;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    score = 0;
    level = 1;
    gameSpeed = INITIAL_SPEED;
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    isGameRunning = false;
    isGameOver = false;
    
    // 初始化蛇的位置
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // 生成食物
    generateFood();
    
    // 更新分数和等级显示
    updateScore();
    updateLevel();
    
    // 绘制初始画面
    draw();
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
}

// 生成食物
function generateFood() {
    // 确保食物不会出现在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 移动蛇
function moveSnake() {
    // 保存当前方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'UP':
            head.y -= 1;
            break;
        case 'DOWN':
            head.y += 1;
            break;
        case 'LEFT':
            head.x -= 1;
            break;
        case 'RIGHT':
            head.x += 1;
            break;
    }
    
    // 穿墙效果
    if (head.x < 0) head.x = COLS - 1;
    if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    if (head.y >= ROWS) head.y = 0;
    
    // 检查是否吃到自己
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇的前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10 * level;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 检查是否升级
        if (score >= level * 100) {
            levelUp();
        }
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }
}

// 升级函数
function levelUp() {
    if (level < MAX_LEVEL) {
        level++;
        updateLevel();
        
        // 增加游戏速度
        if (gameSpeed > 50) {
            gameSpeed -= SPEED_INCREASE;
        }
        
        // 如果游戏正在运行，重新设置游戏循环
        if (isGameRunning) {
            clearInterval(gameLoopId);
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }
        
        // 显示升级消息
        showMessage('升级了！Level ' + level);
    }
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    isGameOver = true;
    clearInterval(gameLoopId);
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
    
    // 显示游戏结束消息
    showMessage('游戏结束！最终分数：' + score);
}

// 显示消息
function showMessage(message) {
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

// 绘制游戏画面
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物（老鼠）
    drawFood();
    
    // 如果游戏结束，显示结束消息
    if (isGameOver) {
        showMessage('游戏结束！最终分数：' + score);
    }
}

// 绘制网格（可选）
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        
        // 计算当前段与前后段的关系，确定绘制样式
        let prevSegment = snake[i-1];
        let nextSegment = snake[i+1] || null;
        
        // 设置蛇身体颜色
        ctx.fillStyle = '#22c55e'; // 绿色
        
        // 绘制圆润的蛇身体
        ctx.beginPath();
        
        // 基本圆形身体
        ctx.arc(
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(
            segment.x * GRID_SIZE + GRID_SIZE / 3,
            segment.y * GRID_SIZE + GRID_SIZE / 3,
            GRID_SIZE / 6,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 如果是蛇尾，添加尾巴尖端效果
        if (nextSegment === null) {
            drawTail(segment, prevSegment);
        }
    }
    
    // 绘制蛇头
    const head = snake[0];
    drawHead(head);
}

// 绘制蛇尾
function drawTail(segment, prevSegment) {
    // 确定尾巴方向
    let tailDirection = '';
    if (prevSegment.x > segment.x) tailDirection = 'RIGHT';
    if (prevSegment.x < segment.x) tailDirection = 'LEFT';
    if (prevSegment.y > segment.y) tailDirection = 'DOWN';
    if (prevSegment.y < segment.y) tailDirection = 'UP';
    
    // 绘制尾巴尖端
    ctx.fillStyle = '#15803d'; // 深绿色
    ctx.beginPath();
    
    const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;
    
    switch (tailDirection) {
        case 'UP':
            ctx.moveTo(centerX, centerY + GRID_SIZE / 2);
            ctx.lineTo(centerX - GRID_SIZE / 4, centerY + GRID_SIZE / 2 + GRID_SIZE / 4);
            ctx.lineTo(centerX + GRID_SIZE / 4, centerY + GRID_SIZE / 2 + GRID_SIZE / 4);
            break;
        case 'DOWN':
            ctx.moveTo(centerX, centerY - GRID_SIZE / 2);
            ctx.lineTo(centerX - GRID_SIZE / 4, centerY - GRID_SIZE / 2 - GRID_SIZE / 4);
            ctx.lineTo(centerX + GRID_SIZE / 4, centerY - GRID_SIZE / 2 - GRID_SIZE / 4);
            break;
        case 'LEFT':
            ctx.moveTo(centerX + GRID_SIZE / 2, centerY);
            ctx.lineTo(centerX + GRID_SIZE / 2 + GRID_SIZE / 4, centerY - GRID_SIZE / 4);
            ctx.lineTo(centerX + GRID_SIZE / 2 + GRID_SIZE / 4, centerY + GRID_SIZE / 4);
            break;
        case 'RIGHT':
            ctx.moveTo(centerX - GRID_SIZE / 2, centerY);
            ctx.lineTo(centerX - GRID_SIZE / 2 - GRID_SIZE / 4, centerY - GRID_SIZE / 4);
            ctx.lineTo(centerX - GRID_SIZE / 2 - GRID_SIZE / 4, centerY + GRID_SIZE / 4);
            break;
    }
    
    ctx.closePath();
    ctx.fill();
}

// 绘制蛇头
function drawHead(head) {
    // 设置蛇头基本颜色
    ctx.fillStyle = '#16a34a'; // 深绿色
    
    const centerX = head.x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = head.y * GRID_SIZE + GRID_SIZE / 2;
    
    // 绘制圆形蛇头
    ctx.beginPath();
    ctx.arc(centerX, centerY, GRID_SIZE / 2 - 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 根据方向绘制蛇嘴
    drawMouth(head, centerX, centerY);
    
    // 绘制蛇眼睛
    drawEyes(head, centerX, centerY);
    
    // 添加蛇头高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        centerX - GRID_SIZE / 6,
        centerY - GRID_SIZE / 6,
        GRID_SIZE / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 绘制蛇嘴
function drawMouth(head, centerX, centerY) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    
    switch (direction) {
        case 'UP':
            ctx.ellipse(centerX, centerY - GRID_SIZE / 4, GRID_SIZE / 6, GRID_SIZE / 8, 0, 0, Math.PI * 2);
            break;
        case 'DOWN':
            ctx.ellipse(centerX, centerY + GRID_SIZE / 4, GRID_SIZE / 6, GRID_SIZE / 8, 0, 0, Math.PI * 2);
            break;
        case 'LEFT':
            ctx.ellipse(centerX - GRID_SIZE / 4, centerY, GRID_SIZE / 8, GRID_SIZE / 6, 0, 0, Math.PI * 2);
            break;
        case 'RIGHT':
            ctx.ellipse(centerX + GRID_SIZE / 4, centerY, GRID_SIZE / 8, GRID_SIZE / 6, 0, 0, Math.PI * 2);
            break;
    }
    
    ctx.fill();
}

// 绘制蛇眼睛
function drawEyes(head, centerX, centerY) {
    // 眼睛白色部分
    ctx.fillStyle = 'white';
    
    // 根据方向确定眼睛位置
    switch (direction) {
        case 'UP':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5, centerY - GRID_SIZE / 6, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5, centerY - GRID_SIZE / 6, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'DOWN':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5, centerY + GRID_SIZE / 6, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5, centerY + GRID_SIZE / 6, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'LEFT':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 6, centerY - GRID_SIZE / 5, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.arc(centerX - GRID_SIZE / 6, centerY + GRID_SIZE / 5, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'RIGHT':
            ctx.beginPath();
            ctx.arc(centerX + GRID_SIZE / 6, centerY - GRID_SIZE / 5, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 6, centerY + GRID_SIZE / 5, GRID_SIZE / 7, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    // 绘制黑色瞳孔，看向移动方向
    ctx.fillStyle = 'black';
    switch (direction) {
        case 'UP':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5, centerY - GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5, centerY - GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'DOWN':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5, centerY + GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5, centerY + GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'LEFT':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5, centerY - GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.arc(centerX - GRID_SIZE / 5, centerY + GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'RIGHT':
            ctx.beginPath();
            ctx.arc(centerX + GRID_SIZE / 5, centerY - GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5, centerY + GRID_SIZE / 5, GRID_SIZE / 14, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    // 绘制眼睛高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    switch (direction) {
        case 'UP':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5 + GRID_SIZE / 25, centerY - GRID_SIZE / 5 - GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5 + GRID_SIZE / 25, centerY - GRID_SIZE / 5 - GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'DOWN':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5 + GRID_SIZE / 25, centerY + GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5 + GRID_SIZE / 25, centerY + GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'LEFT':
            ctx.beginPath();
            ctx.arc(centerX - GRID_SIZE / 5 - GRID_SIZE / 25, centerY - GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.arc(centerX - GRID_SIZE / 5 - GRID_SIZE / 25, centerY + GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'RIGHT':
            ctx.beginPath();
            ctx.arc(centerX + GRID_SIZE / 5 + GRID_SIZE / 25, centerY - GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.arc(centerX + GRID_SIZE / 5 + GRID_SIZE / 25, centerY + GRID_SIZE / 5 + GRID_SIZE / 25, GRID_SIZE / 28, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

// 绘制食物（老鼠）
function drawFood() {
    // 直接使用Canvas API绘制老鼠图案
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;
    const size = GRID_SIZE;
    
    // 老鼠头部
    ctx.fillStyle = '#8B4513'; // 棕色
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size*0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // 老鼠耳朵
    ctx.beginPath();
    ctx.arc(x + size*0.3, y + size*0.25, size*0.15, 0, Math.PI * 2);
    ctx.arc(x + size*0.7, y + size*0.25, size*0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // 老鼠眼睛（白色部分）
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + size*0.4, y + size*0.45, size*0.05, 0, Math.PI * 2);
    ctx.arc(x + size*0.6, y + size*0.45, size*0.05, 0, Math.PI * 2);
    ctx.fill();
    
    // 老鼠眼睛（黑色瞳孔）
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + size*0.4, y + size*0.45, size*0.025, 0, Math.PI * 2);
    ctx.arc(x + size*0.6, y + size*0.45, size*0.025, 0, Math.PI * 2);
    ctx.fill();
    
    // 老鼠鼻子
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.ellipse(x + size*0.5, y + size*0.6, size*0.05, size*0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 老鼠胡须
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size*0.025;
    ctx.beginPath();
    ctx.moveTo(x + size*0.35, y + size*0.6);
    ctx.lineTo(x + size*0.25, y + size*0.55);
    ctx.moveTo(x + size*0.35, y + size*0.6);
    ctx.lineTo(x + size*0.25, y + size*0.65);
    ctx.moveTo(x + size*0.65, y + size*0.6);
    ctx.lineTo(x + size*0.75, y + size*0.55);
    ctx.moveTo(x + size*0.65, y + size*0.6);
    ctx.lineTo(x + size*0.75, y + size*0.65);
    ctx.stroke();
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新等级显示
function updateLevel() {
    levelElement.textContent = level;
}

// 游戏主循环
function gameLoop() {
    moveSnake();
    draw();
}

// 开始游戏
function startGame() {
    if (!isGameRunning && !isGameOver) {
        isGameRunning = true;
        gameLoopId = setInterval(gameLoop, gameSpeed);
        
        // 更新按钮状态
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
    } else if (isGameOver) {
        // 如果游戏结束，重新初始化并开始
        initGame();
        startGame();
    }
}

// 暂停游戏
function pauseGame() {
    if (isGameRunning) {
        isGameRunning = false;
        clearInterval(gameLoopId);
        
        // 更新按钮状态
        startBtn.disabled = false;
        startBtn.textContent = '继续游戏';
        pauseBtn.disabled = true;
        
        // 显示暂停消息
        showMessage('游戏暂停');
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameLoopId);
    initGame();
    startBtn.textContent = '开始游戏';
}

// 处理键盘输入
function handleKeyPress(e) {
    const key = e.key;
    
    // 阻止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
        e.preventDefault();
    }
    
    // 处理方向控制
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'DOWN') {
                nextDirection = 'UP';
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'UP') {
                nextDirection = 'DOWN';
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'RIGHT') {
                nextDirection = 'LEFT';
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'LEFT') {
                nextDirection = 'RIGHT';
            }
            break;
        case ' ': // 空格暂停/继续
            if (isGameRunning) {
                pauseGame();
            } else if (!isGameOver) {
                startGame();
            }
            break;
        case 'Enter': // 回车键开始/重置
            if (!isGameRunning) {
                if (isGameOver) {
                    resetGame();
                }
                startGame();
            }
            break;
    }
}

// 添加触摸控制（移动端）
function initTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchend', (e) => {
        if (!isGameRunning) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 确定滑动方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'LEFT') {
                nextDirection = 'RIGHT';
            } else if (diffX < 0 && direction !== 'RIGHT') {
                nextDirection = 'LEFT';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'UP') {
                nextDirection = 'DOWN';
            } else if (diffY < 0 && direction !== 'DOWN') {
                nextDirection = 'UP';
            }
        }
        
        e.preventDefault();
    }, false);
}

// 添加事件监听器
function initEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    
    // 触摸控制（移动端）
    initTouchControls();
}

// 窗口调整大小时重新绘制游戏
window.addEventListener('resize', () => {
    // 保持画布尺寸不变
    // 可以根据需要实现响应式画布
    if (!isGameRunning) {
        draw();
    }
});

// 初始化游戏
initGame();
initEventListeners();

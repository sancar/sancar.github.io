window.onload = function() {
    new Main()
};

function ControlHandler(main) {
    this.a = false;
    this.d = false;
    this.s = false;
    this.space = false;
    this.main = main;
    this.canvas = main.canvas;
    window.addEventListener('keydown', this.keyDownEvent.bind(this));
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
    document.getElementById('canvas').addEventListener('contextmenu', function(e) {
        if (e.button == 2) {
            e.preventDefault();
            return false
        }
    })
}
ControlHandler.prototype.init = function(main) {
    this.playerHandler = main.playerHandler
};
ControlHandler.prototype.enterFrame = function() {};
ControlHandler.prototype.keyDownEvent = function(e) {
    if (this.main.state == 'menuScreen' || this.main.state == 'gameOverScreen') {
        this.main.startGame()
    }
    if (e.keyCode == 32) {
        this.space = true
    } else if (e.keyCode == 65) {
        this.a = true
    } else if (e.keyCode == 68) {
        this.d = true
    } else if (e.keyCode == 83) {
        this.s = true
    } else if ((e.keyCode >= 48 || e.keyCode <= 57) && this.main.state == 'game') {
        this.playerHandler.hotKey(e.keyCode)
    }
};
ControlHandler.prototype.keyUpEvent = function(e) {
    if (e.keyCode == 32) {
        this.space = false
    } else if (e.keyCode == 65) {
        this.a = false
    } else if (e.keyCode == 68) {
        this.d = false
    } else if (e.keyCode == 83) {
        this.s = false
    }
};

function CreateLevel(main) {
    var flatness = 0.90;
    var levelWidth = main.levelWidth;
    var levelHeight = main.levelHeight;
    var blockSize = main.blockSize;
    var blockInt = main.blockInt;
    var list = main.gridHandler.list;
    var waterList = main.gridHandler.waterList;
    var horizon = main.horizon;
    var Y = horizon;
    var i, j;
    for (i = 0; i < levelWidth / 20; i++) {
        var randX = Math.random() * (levelWidth - 20) + 10 | 0;
        var randY = Math.random() * (levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = 0; k < 9; k++) {
                list[randX + Math.random() * k * 2 - k | 0][randY + Math.random() * k - k / 2 | 0] = blockInt.cloud
            }
        }
    }
    for (i = 0; i < levelWidth; i++) {
        if (i == 0 || i == levelWidth - 1) {
            for (j = 0; j < levelHeight; j++) {
                list[i][j] = blockInt.bedrock
            }
            continue
        }
        list[i][0] = blockInt.bedrock;
        list[i][levelHeight - 1] = blockInt.bedrock;
        if (Y > horizon) {
            for (j = horizon; j < Y; j++) {
                list[i][j] = blockInt.water;
                waterList[waterList.length] = {
                    x: i,
                    y: j
                }
            }
        }
        for (j = Y; j < levelHeight - 1; j++) {
            if (j > Y + Math.random() * 8 + 4) {
                list[i][j] = blockInt.stone
            } else {
                list[i][j] = blockInt.dirt
            }
        }
        if (Math.random() < flatness) {
            Y += (Math.random() * 3 | 0) - 1
        }
        if (Y > horizon && i > levelWidth / 2 - 20 && i < levelWidth / 2) {
            Y--
        }
        if (Y > levelHeight - 1) {
            Y--
        } else if (Y < 1) {
            Y++
        }
    }
    for (i = 0; i < levelWidth / 25; i++) {
        var randX = Math.random() * (levelWidth - 20) + 10 | 0;
        var randY = horizon + Math.random() * (levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = Math.random() * 8 | 0; k >= 0; k--) {
                var X = randX + Math.random() * k * 2 - k | 0;
                var Y = randY + Math.random() * k - k / 2 | 0;
                list[X][Y] = false
            }
        }
    }
    for (i = 0; i < levelWidth / 25; i++) {
        var randX = Math.random() * (levelWidth - 20) + 10 | 0;
        var randY = horizon + Math.random() * (levelHeight * 0.5 - 20) + 8 | 0;
        for (j = 0; j < 25; j++) {
            for (var k = Math.random() * 8 | 0; k >= 0; k--) {
                var X = randX + Math.random() * k * 2 - k | 0;
                var Y = randY + Math.random() * k - k / 2 | 0;
                list[X][Y] = blockInt.water;
                waterList[waterList.length] = {
                    x: X,
                    y: Y
                }
            }
        }
    }
}

function GameOverScreen(main) {
    main.state = 'gameOverScreen';
    main.context.clearRect(0, 0, main.canvas.width, main.canvas.height);
    var hW = main.canvas.width * 0.5;
    var hH = main.canvas.height * 0.5;
    var dark = 'rgba(0,0,0,0.9)';
    var medium = 'rgba(0,0,0,0.5)';
    var light = 'rgba(0,0,0,0.3)';
    new Text(main.context, 'Büşram', 9, 18, 'normal 21px/1 ' + main.fontFamily, light, 'left');
    new Text(main.context, 'Tebrikler Sen Birtanesin', hW, hH - 70, 'normal 22px/1 ' + main.fontFamily, dark);
}

function GridHandler(main) {}
GridHandler.prototype.init = function(main) {
    this.blockSize = main.blockSize;
    this.blockInt = main.blockInt;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight;
    this.list = [];
    this.waterList = [];
    this.toggle = 0;
    for (var i = 0; i < this.levelWidth; i++) {
        this.list[i] = [];
        for (var j = 0; j < this.levelHeight; j++) {
            this.list[i][j] = false
        }
    }
};
GridHandler.prototype.enterFrame = function() {
    var list = this.list;
    var levelWidth = this.levelWidth;
    var levelHeight = this.levelHeight;
    var toggle = this.toggle;
    for (var i = this.waterList.length - 1; i >= 0; i--) {
        toggle++;
        if (toggle > 9) {
            toggle = 0
        }
        if (toggle != 0) {
            continue
        }
        var water = this.waterList[i];
        if (list[water.x][water.y] != this.blockInt.water) {
            this.waterList.splice(i, 1);
            continue
        }
        if (water.y < levelHeight && list[water.x][water.y + 1] === false) {
            list[water.x][water.y + 1] = this.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x,
                y: water.y + 1
            };
            continue
        }
        if (water.x > 0 && list[water.x - 1][water.y] === false) {
            list[water.x - 1][water.y] = this.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x - 1,
                y: water.y
            };
            continue
        }
        if (water.x < levelWidth - 1 && list[water.x + 1][water.y] === false) {
            list[water.x + 1][water.y] = this.blockInt.water;
            this.waterList[this.waterList.length] = {
                x: water.x + 1,
                y: water.y
            };
            continue
        }
    }
    this.toggle++;
    if (this.toggle > 9) {
        this.toggle = 0
    }
};

function Main() {
    this.blockSize = 16;
    this.levelWidth = 500;
    this.levelHeight = 120;
    this.handlers = ['control', 'grid', 'render', 'player', 'view'];
    this.fontFamily = '"Segoe UI",Arial,sans-serif';
    this.dayLength = 480 * 60;
    this.blocks = {
        bedrock: '#363532',
        dirt: '#AE9A73',
        stone: '#807E79',
        wood: '#9F763B',
        water: 'rgba(0,72,151,0.5)',
        cloud: 'rgba(255,255,255,0.7)',
        platform: '#9F763B'
    };
    this.blockInt = {};
    this.blockColor = [];
    var i = 0;
    for (var block in this.blocks) {
        this.blockInt[block] = i;
        this.blockColor[i] = this.blocks[block];
        i++
    }
    this.state = 'loading';
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');
    this.horizon = this.levelHeight / 2 | 0;
    this.time;
    this.timeIncrement;
    for (i = 0; i < this.handlers.length; i++) {
        var handlerName = this.handlers[i] + 'Handler';
        var className = handlerName.charAt(0).toUpperCase() + handlerName.slice(1);
        this[handlerName] = new window[className](this)
    }
    setInterval(this.enterFrame.bind(this), 1000 / 60);
    new MenuScreen(this)
}
Main.prototype.startGame = function() {
    for (var i = 0; i < this.handlers.length; i++) {
        this[this.handlers[i] + 'Handler'].init(this)
    }
    new CreateLevel(this);
    this.state = 'game';
    this.time = this.dayLength * 0.37
};
Main.prototype.enterFrame = function() {
    if (this.state != 'game') {
        return
    }
    if (this.playerHandler.x > this.levelWidth * 15 + 100) {
        this.state = 'gameOverScreen';
        new GameOverScreen(this);
        return
    }
    this.time++;
    if (this.time > this.dayLength) {
        this.time = 0
    }
    for (var i = 0; i < this.handlers.length; i++) {
        this[this.handlers[i] + 'Handler'].enterFrame()
    }
};

function MenuScreen(main) {
    main.state = 'menuScreen';
    main.context.clearRect(0, 0, main.canvas.width, main.canvas.height);
    var hW = main.canvas.width * 0.5;
    var hH = main.canvas.height * 0.5;
    var dark = 'rgba(0,0,0,0.9)';
    var medium = 'rgba(0,0,0,0.5)';
    var light = 'rgba(0,0,0,0.3)';
    new Text(main.context, 'Büşram', hW, hH - 90 )
    new Text(main.context, 'Seni Seviyorum Birtanesi', hW, hH - 70, 'normal 15px/1 ' + main.fontFamily, medium)
    new Text(main.context, 'A ile sola D ile sağa gidebilirsin', hW, hH - 50, 'normal 15px/1 ' + main.fontFamily, medium);
    new Text(main.context, 'Zıplamak için boşluğa bas', hW, hH - 30, 'normal 15px/1 ' + main.fontFamily, medium);
    new Text(main.context, 'Başlamak için bir tuşa bas kuzusu', hW, hH + 30, 'normal 15px/1 ' + main.fontFamily, medium)
}

function PlayerHandler(main) {
    this.accel = 0.3;
    this.speed = 2.5;
    this.fallSpeed = 8.0;
    this.width = 20;
    this.height = 25;
    this.regen = 0.01;
    this.jumpHeight = 7.0;
    this.jumpDelay = 4.0;
}
PlayerHandler.prototype.init = function(main) {
    this.blockSize = main.blockSize;
    this.blockInt = main.blockInt;
    this.controlHandler = main.controlHandler;
    this.gridHandler = main.gridHandler;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight;
    this.viewHandler = main.viewHandler;
    this.halfWidth = main.canvas.width / 2;
    this.halfHeight = main.canvas.height / 2;
    this.horizon = main.horizon;
    this.x = 50;
    this.y = this.height * 10;
    this.vX = 0;
    this.vY = 20;
    this.reload = 0;
    this.canJump = 0;
    this.inWater = false;
    this.spaceDown = false;
};
PlayerHandler.prototype.enterFrame = function() {
    var controlHandler = this.controlHandler;
    var accel = this.accel;
    var speed = this.speed;
    var blockSize = this.blockSize;
    var blockInt = this.blockInt;
    var gridList = this.gridHandler.list;
    var width = this.width;
    var height = this.height;
    var i, j;
    if (this.canJump < 1 && controlHandler.space && this.spaceDown == false) {
        this.vY = -this.jumpHeight;
        this.spaceDown = true
    }
    if (controlHandler.space == false && this.spaceDown) {
        this.spaceDown = false
    }
    if (controlHandler.a) {
        this.vX -= accel;
        if (this.vX < -speed) {
            this.vX = -speed
        }
    } else if (controlHandler.d) {
        this.vX += accel;
        if (this.vX > speed) {
            this.vX = speed
        }
    } else if (this.vX != 0) {
        if (this.vX > 0) {
            this.vX -= accel
        } else if (this.vX < 0) {
            this.vX += accel
        }
        if (this.vX > -accel && this.vX < accel) {
            this.vX = 0
        }
    }
    var newX = this.x + this.vX;
    var startX = Math.max((newX - width * 0.5) / blockSize | 0, 0);
    var startY = Math.max((this.y - height * 0.5) / blockSize | 0, 0);
    var endX = Math.min((newX + width * 0.5 - 1) / blockSize | 0, this.levelWidth - 1);
    var endY = Math.min((this.y + height * 0.5) / blockSize | 0, this.levelHeight - 1);
    for (i = startX; i <= endX; i++) {
        for (j = startY; j <= endY; j++) {
            if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud && gridList[i][j] != blockInt.platform) {
                if (gridList[i][j] == blockInt.water) {
                    this.inWater = true;
                    if (this.vX > speed * 0.5) {
                        this.vX = speed * 0.5
                    } else if (this.vX < -speed * 0.5) {
                        this.vX = -speed * 0.5
                    }
                } else {
                    if (newX < i * blockSize) {
                        newX = i * blockSize - width * 0.5
                    } else {
                        newX = i * blockSize + blockSize + width * 0.5
                    }
                    this.vX = 0
                }
            }
        }
    }
    this.x = newX;
    if (this.inWater) {
        this.vY += 0.25;
        if (this.vY > this.fallSpeed * 0.3) {
            this.vY = this.fallSpeed * 0.3
        }
        var newY = this.y + this.vY * 0.6
    } else {
        this.vY += 0.4;
        if (this.vY > this.fallSpeed) {
            this.vY = this.fallSpeed
        }
        var newY = this.y + this.vY
    }
    var collide = false;
    this.inWater = false;
    startX = Math.max((this.x - width * 0.5) / blockSize | 0, 0);
    startY = Math.max((newY - height * 0.5) / blockSize | 0, 0);
    endX = Math.min((this.x + width * 0.5 - 1) / blockSize | 0, this.levelWidth - 1);
    endY = Math.min((newY + height * 0.5) / blockSize | 0, this.levelHeight - 1);
    for (i = startX; i <= endX; i++) {
        for (j = startY; j <= endY; j++) {
            if (gridList[i][j] !== false && gridList[i][j] != blockInt.cloud && gridList[i][j] != blockInt.platform) {
                collide = true;
                if (gridList[i][j] == blockInt.water) {
                    this.inWater = true;
                    this.canJump--
                } else {
                    if (newY < j * blockSize) {
                        newY = j * blockSize - height * 0.5 - 0.001;
                        this.canJump--
                    } else {
                        newY = j * blockSize + blockSize + height * 0.5
                    }
                    this.vY = 0
                }
            }
            if (gridList[i][j] == blockInt.platform && this.vY > 0 && controlHandler.s == false) {
                if (this.y + height * 0.5 < j * blockSize) {
                    newY = j * blockSize - height * 0.5 - 0.001;
                    collide = true;
                    this.vY = 0;
                    this.canJump--
                }
            }
        }
    }
    this.y = newY;
    if (collide == false) {
        this.canJump = this.jumpDelay
    }
    this.reload--;
};

function RenderHandler(main) {
    this.sunMoonArcRadius = main.canvas.height - 40;
    this.main = main;
    this.canvas = main.canvas;
    this.context = main.context;
    this.blockSize = main.blockSize;
    this.blockColor = main.blockColor;
    this.blockInt = main.blockInt;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight;
    this.horizon = main.horizon;
    this.timeRatio = Math.PI * 2 / main.dayLength
}
RenderHandler.prototype.init = function(main) {
    this.gridHandler = main.gridHandler;
    this.controlHandler = main.controlHandler;
    this.viewHandler = main.viewHandler;
    this.dustHandler = main.dustHandler;
    this.player = main.playerHandler
};
RenderHandler.prototype.enterFrame = function() {
    var context = this.context;
    var gridList = this.gridHandler.list;
    var blockSize = this.blockSize;
    var blockHalf = blockSize / 2;
    var blockColor = this.blockColor;
    var blockInt = this.blockInt;
    var horizon = this.horizon;
    var player = this.player;
    var pX = player.x;
    var pY = player.y;
    var obj, X, Y, i, j, depth, dist;
    dist = this.main.time * this.timeRatio;
    i = Math.sin(dist);
    j = Math.cos(dist);
    var gradient = context.createLinearGradient(0, 0, 0, this.canvas.height);
    depth = this.viewHandler.y / (this.levelHeight * blockSize) * 250 | 0;
    dist = (j + 1) * 75 | 0;
    gradient.addColorStop(0, 'rgb(' + (77 + depth) + ',' + (117 + depth) + ',' + (179 + depth) + ')');
    gradient.addColorStop(1, 'rgb(' + (127 + depth - dist) + ',' + (167 + depth - dist) + ',' + (228 + depth - dist) + ')');
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    X = this.canvas.width * 0.5 + i * this.sunMoonArcRadius;
    Y = this.canvas.height + j * this.sunMoonArcRadius;
    context.shadowBlur = 40;
    context.shadowColor = '#FEDB16';
    context.fillStyle = '#FEDB16';
    context.beginPath();
    context.arc(X, Y, 30, 0, 6.2832);
    context.fill();
    context.closePath();
    X = this.canvas.width * 0.5 + -i * this.sunMoonArcRadius;
    Y = this.canvas.height + -j * this.sunMoonArcRadius;
    context.shadowBlur = 20;
    context.shadowColor = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(X, Y, 30, 1.2, 4.3416);
    context.fill();
    context.closePath();
    context.shadowBlur = 0;
    var offsetX = this.canvas.width * 0.5 - this.viewHandler.x;
    var offsetY = this.canvas.height * 0.5 - this.viewHandler.y;
    context.fillStyle = '#776655';
    Y = Math.round(horizon * blockSize + offsetY);
    context.fillRect(0, Y, this.canvas.width, this.canvas.height - Y);
    var startX = Math.max(-offsetX / blockSize | 0, 0);
    var endX = Math.min(startX + Math.ceil(this.canvas.width / blockSize) + 1, this.levelWidth);
    var startY = Math.max(-offsetY / blockSize | 0, 0);
    var endY = Math.min(startY + Math.ceil(this.canvas.height / blockSize) + 1, this.levelHeight);
    for (i = startX; i < endX; i++) {
        for (j = startY; j < endY; j++) {
            obj = gridList[i][j];
            if (obj !== false && obj != blockInt.water && obj != blockInt.cloud) {
                X = Math.round(i * blockSize + offsetX);
                Y = Math.round(j * blockSize + offsetY);
                context.fillStyle = blockColor[obj];
                if (obj == blockInt.platform) {
                    context.fillRect(X, Y, blockSize, blockSize * 0.25);
                    context.fillRect(X, Y + blockSize * 0.5, blockSize, blockSize * 0.25)
                } else {
                    context.fillRect(X, Y, blockSize, blockSize)
                }
            }
            if (obj === false && j == horizon && gridList[i][j - 1] === false) {
                X = Math.round(i * blockSize + offsetX);
                Y = Math.round(j * blockSize + offsetY);
                context.fillStyle = 'rbga(0,0,0,0.2)';
                context.fillRect(X + 1, Y, 2, 2);
                context.fillRect(X + 5, Y, 3, 3);
                context.fillRect(X + 11, Y, 2, 2)
            }
        }
    }
    X = Math.round(pX + offsetX - player.width / 2);
    Y = Math.round(pY + offsetY - player.height / 2);
    context.shadowBlur = 5;
    context.shadowOffsetX = -player.vX;
    context.shadowOffsetY = -player.vY;
    context.shadowColor = 'rgba(0,0,0,0.1)';
    context.fillStyle = '#333333';
    context.fillRect(X, Y, player.width, player.height);
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
   
    for (i = startX; i < endX; i++) {
        for (j = startY; j < endY; j++) {
            obj = gridList[i][j];
            if (obj == blockInt.dirt && j <= horizon && (gridList[i][j - 1] === false || gridList[i][j - 1] == blockInt.cloud)) {
                X = Math.round(i * blockSize + offsetX);
                Y = Math.round(j * blockSize + offsetY);
                context.fillStyle = 'rgba(45,130,45,0.75)';
                context.fillRect(X, Y - 3, blockSize, 3);
                context.fillRect(X + 1, Y - 5, 2, 2);
                context.fillRect(X + 5, Y - 5, 3, 2);
                context.fillRect(X + 11, Y - 5, 2, 2)
            }
            if (obj == blockInt.water || obj == blockInt.cloud) {
                X = Math.round(i * blockSize + offsetX);
                Y = Math.round(j * blockSize + offsetY);
                context.fillStyle = blockColor[obj];
                context.fillRect(X, Y, blockSize, blockSize)
            }
            if (obj == blockInt.water && j <= horizon && (gridList[i][j - 1] === false || gridList[i][j - 1] == blockInt.cloud)) {
                context.fillStyle = 'rgba(255,255,255,0.2)';
                context.fillRect(X, Y, blockSize, 6);
                context.fillRect(X, Y, blockSize / 2, 3)
            }
        }
    }
    for (i = startX; i < endX; i++) {
        depth = 0;
        for (j = 0; j < endY; j++) {
            obj = gridList[i][j];
            if (obj != blockInt.bedrock && obj != blockInt.cloud && obj != false || j >= horizon) {
                X = i * blockSize;
                Y = j * blockSize;
                dist = (pX - X - blockHalf) * (pX - X - blockHalf) + (pY - Y - blockHalf) * (pY - Y - blockHalf);
                X = Math.round(X + offsetX);
                Y = Math.round(Y + offsetY);
                context.fillStyle = 'rgba(0,0,0,' + (depth * 0.05 * Math.max(Math.min(dist / 16000, 1), 0.4)) + ')';
                context.fillRect(X, Y, blockSize, blockSize);
                if (obj == blockInt.platform) {
                    depth += 0.2
                } else if (obj == blockInt.water) {
                    depth += 0.5
                } else {
                    depth += 1
                }
            }
        }
    }
    depth = Math.min(Math.cos(this.main.time * this.timeRatio) + 0.3, 0.5);
    if (depth > 0) {
        context.fillStyle = 'rgba(0,0,0,' + depth + ')';
        context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
    context.fillStyle = '#444444';
    context.fillRect(0, 0, this.canvas.width, 20);
    context.textAlign = 'left';
    context.font = 'bold 15px/1 Arial';
    context.fillStyle = '#DDDDDD';
    context.fillText("x : " + player.x + ", y :" + player.y, 15, 10);
    //context.fillText(Math.round(player.kills), 95, 10);
    context.textAlign = 'right';
    //Sancar context.fillText(player.actions[player.action].name, this.canvas.width - 5, 10)
};

function Text(context, text, x, y, font, style, align, baseline) {
    context.font = typeof font === 'undefined' ? 'normal 16px/1 Arial' : font;
    context.fillStyle = typeof style === 'undefined' ? '#000000' : style;
    context.textAlign = typeof align === 'undefined' ? 'center' : align;
    context.textBaseline = typeof baseline === 'undefined' ? 'middle' : baseline;
    context.fillText(text, x, y)
}

function ViewHandler(main) {
    this.x;
    this.y
}
ViewHandler.prototype.init = function(main) {
    this.x = main.levelWidth * main.blockSize * 0.5;
    this.y = 300;
    this.canvas = main.canvas;
    this.blockSize = main.blockSize;
    this.player = main.playerHandler;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight
};
ViewHandler.prototype.enterFrame = function() {
    this.x += (this.player.x - this.x) * 0.05;
    if (this.x < this.player.x + 1 && this.x > this.player.x - 1) {
        this.x = this.player.x
    }
    this.y += (this.player.y - this.y) * 0.05;
    if (this.y < this.player.y + 1 && this.y > this.player.y - 1) {
        this.y = this.player.y
    }
    if (this.x < this.canvas.width * 0.5) {
        this.x = this.canvas.width * 0.5
    } else if (this.x > this.levelWidth * this.blockSize - this.canvas.width * 0.5) {
        this.x = this.levelWidth * this.blockSize - this.canvas.width * 0.5
    }
    if (this.y < this.canvas.height * 0.5) {
        this.y = this.canvas.height * 0.5
    } else if (this.y > this.levelHeight * this.blockSize - this.canvas.height * 0.5) {
        this.y = this.levelHeight * this.blockSize - this.canvas.height * 0.5
    }
};
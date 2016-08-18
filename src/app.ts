/// <reference path="typings/phaser.comments.d.ts"/>

import { Player } from "./player.ts";
import { Enemy } from "./enemy.ts";
import { Bullet } from "./bullet.ts";

class SimpleGame {
    game : Phaser.Game;
    player : Player
    cursors : Phaser.CursorKeys;
    nextEnemyAt : number;
    enemies : Phaser.Group;
    enemyBullets : Phaser.Group;
    playerBullets : Phaser.Group;

    constructor() {
        this.game = new Phaser.Game(240, 320, Phaser.CANVAS, 
            'content', {preload : this.preload,
                create: this.create, 
                update: this.update, 
                render: this.render});   
    }

    preload() {
        //Scale the game windows by two in both directions
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(2,2);

        //Ensure that we are not moving in subpixel space. A movement of 1 pixel in the non-scaled world equals to 2 pixels
        //on the actual screen. 
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        this.game.scale.pageAlignHorizontally = true;
        this.game.load.spritesheet('player', "resources/player.png", 16, 16);
        this.game.load.spritesheet('bullets', "resources/bullets.png", 16, 16);
        this.game.load.spritesheet('enemy', "resources/enemies.png", 16, 16);
        
        //TODO: Show the amount of objects in the debug menu!! 

    }

    create() {
        //Enable arcade physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //Create the game groups
        this.enemies = this.game.add.group(this.game.world, "Enemies", false, true, Phaser.Physics.ARCADE);
        this.enemyBullets = this.game.add.group(this.game.world, "EnemyBullets", false, true, Phaser.Physics.ARCADE);
        this.playerBullets = this.game.add.group(this.game.world, "PlayerBullets", false, true, Phaser.Physics.ARCADE);
        for(var i = 0; i < 10; i++)
        {
            this.enemies.add(new Enemy(this.game, 0, 0, this.enemyBullets), true);
        }

        for(var i = 0; i < 128; i++)
        {
            this.enemyBullets.add(new Bullet(this.game, 'bullets', 0), true);
            this.playerBullets.add(new Bullet(this.game, 'bullets', 0), true);
        }

        //Create the player and add it to the game
        this.player = new Player(this.game, this.game.world.centerX, this.game.world.centerY, this.playerBullets);
        this.game.add.existing(this.player);

        //Startup variables
        var now = this.game.time.now;
        this.nextEnemyAt = now + (1000 * Math.random()); 
    }

    update() {
        var now = this.game.time.now;
        if(now > this.nextEnemyAt)
        {
            var enemy = this.enemies.getFirstExists(false) as Enemy;
            if(enemy)
            {
                var x = 2*enemy.width + Math.random() * (this.game.world.width - 2*enemy.width);
                var y = -enemy.height;
                enemy.start(x, y);
                this.nextEnemyAt = now + (2500 + 500 * Math.random());
            }
        }

        //Check collisions
        /*this.game.physics.arcade.overlap(this.player, this.enemies, this.playerEnemyCollision, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerEnemyBulletCollision, null, this);
        this.game.physics.arcade.overlap(this.enemies, this.playerBullets, this.enemyPlayerBulletCollision, null, this);*/
    }

    render() {

    }

    playerEnemyCollision(playerObj : any, enemyObj : any)
    {
        var player = playerObj as Player;
        var enemy = enemyObj as Enemy;
        //player.kill();
        //enemy.kill();
    }

    playerEnemyBulletCollision(playerObj : any, bulletObj : any)
    {
        var player = playerObj as Player;
        var enemyBullet = bulletObj as Bullet;
        //player.kill();
        //enemyBullet.kill();
        //this.enemyBullets.remove
    }

    enemyPlayerBulletCollision(enemyObj : any, bulletObj : any)
    {
        var enemy = enemyObj as Enemy;
        var playerBullet = bulletObj as Bullet;
        enemy.kill();
        playerBullet.kill();
    }
}

window.onload = () => {
    var game = new SimpleGame();
}
/// <reference path="typings/phaser.comments.d.ts"/>
import { Player, PlayerState } from "./player.ts";
import { Enemy, SpecialEnemy } from "./enemy.ts";
import { Bullet } from "./bullet.ts";

export class GameplayState extends Phaser.State
{
    player : Player;
    cursors : Phaser.CursorKeys;
    nextEnemyAt : number;
    enemies : Phaser.Group;
    enemyBullets : Phaser.Group;
    playerBullets : Phaser.Group;
    score : number;
    scoreText : Phaser.Text;
    livesText : Phaser.Text;
    showDebug : boolean;
    
    constructor()
    {
        super();
    }

    preload() {
        //Show debug property
        this.showDebug = false;

        //Scale the game windows by two in both directions
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(2,2);

        //Ensure that we are not moving in subpixel space. A movement of 1 pixel in the non-scaled world equals to 2 pixels
        //on the actual screen. 
        this.game.renderer.renderSession.roundPixels = true;
        //Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        this.game.scale.pageAlignHorizontally = true;
        this.game.load.spritesheet('player', "resources/player.png", 16, 16);
        this.game.load.spritesheet('bullets', "resources/bullets.png", 16, 16);
        this.game.load.spritesheet('enemy', "resources/enemies.png", 16, 16);
        
        //TODO: Show the amount of objects in the debug menu!! 
        this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.D]);
        var dKey = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
        var tKey = this.game.input.keyboard.addKey(Phaser.KeyCode.T);
        dKey.onDown.add(this.toggleDebug, this);
        tKey.onDown.add(this.tryRestart, this);
    }

    create() {
        //Retrieve game and input variables
        var game = this.game;
        var input = this.game.input;

        //Enable arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Create the game groups
        this.enemies = game.add.group(this.game.world, "Enemies", false, true, Phaser.Physics.ARCADE);
        this.enemyBullets = game.add.group(this.game.world, "EnemyBullets", false, true, Phaser.Physics.ARCADE);
        this.playerBullets = game.add.group(this.game.world, "PlayerBullets", false, true, Phaser.Physics.ARCADE);
        for(var i = 0; i < 5; i++)
        {
            this.enemies.add(new SpecialEnemy(game, 0, 0, this.enemyBullets), true);
        }

        for(var i = 0; i < 128; i++)
        {
            this.enemyBullets.add(new Bullet(game, 'bullets', 0), true);
            this.playerBullets.add(new Bullet(game, 'bullets', 0), true);
        }
        
                //Create the player and add it to the game
        this.player = new Player(game, game.world.centerX, this.game.world.centerY, this.playerBullets);
        this.game.add.existing(this.player);
        this.player.start();

        //UI Initialization
        this.score = 0;
        var style = {font: "24px Arial", fill: "#ffffff", align: "left"}
        this.livesText = game.add.text(16, game.world.height - 32, "", style);
        this.livesText.text = ""+this.player.lives;
        var style2 = {font : "12px Arial", fill: "#ffffff", align: "left"}
        this.scoreText = game.add.text(8, 8, "", style2);
        this.scoreText.text = "0";
        this.updateScoreText();

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
                enemy.setTarget(this.player);
                enemy.start(x, y);
                this.nextEnemyAt = now + (750 + 500 * Math.random());
            }
        }

        //Check collisions
        this.game.physics.arcade.overlap(this.player, this.enemies, this.playerEnemyCollision, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerEnemyBulletCollision, null, this);
        this.game.physics.arcade.overlap(this.enemies, this.playerBullets, this.enemyPlayerBulletCollision, null, this);
    }

    render() {
        if(this.showDebug)
        {
            this.debugGroup(this.enemyBullets);
            this.debugGroup(this.playerBullets);
            this.debugGroup(this.enemies);
            if(this.player.exists)
                this.game.debug.body(this.player);
        }
    }

    debugGroup(group : Phaser.Group)
    {
        for(var child of group.children)
        {
            var childSprite = child as Phaser.Sprite;
            if(childSprite.exists)
                this.game.debug.body(childSprite);
        }
    }

    toggleDebug() {
        this.showDebug = !this.showDebug;
    }

    tryRestart() {
        if(this.player.state == PlayerState.Dead)
        {
            //Restart the stage if the player is dead
            this.game.state.start(this.game.state.current);
        }
    }

    playerEnemyCollision(playerObj : any, enemyObj : any)
    {
        
        var player = playerObj as Player;
        if(player.state != PlayerState.Playing)
            return;
        var enemy = enemyObj as Enemy;
        player.kill();
        enemy.kill();
        this.updateLivesText();
        
        if(player.state == PlayerState.Dead)
            this.showGameOver();
        
    }

    playerEnemyBulletCollision(playerObj : any, bulletObj : any)
    {
        var player = playerObj as Player;
        var enemyBullet = bulletObj as Bullet;
        if(player.state != PlayerState.Playing)
            return;
        player.kill();
        enemyBullet.kill();
        this.updateLivesText();

        if(player.state == PlayerState.Dead)
            this.showGameOver();
    }

    enemyPlayerBulletCollision(enemyObj : any, bulletObj : any)
    {
        var enemy = enemyObj as Enemy;
        var playerBullet = bulletObj as Bullet;
        //Only kill the enemy if its actually being shown
        if(enemy.y > 0)
        {
            this.score += 10;
            enemy.kill();
            this.updateScoreText();
        }
        playerBullet.kill();
        
    }

    updateLivesText()
    {
        if(this.player.state != PlayerState.Dead)
            this.livesText.text = this.player.lives.toString();
        else
            this.livesText.text = "";
    }

    updateScoreText()
    {
        this.scoreText.text = this.score.toString();
    }

    showGameOver()
    {
        var world = this.game.world;
        var style = {font: "32px Arial", fill: "#ff0044", align: "center"}
        var gameOverText = this.game.add.text(world.centerX,world.centerY, "Game Over", style);
        gameOverText.anchor.set(0.5, 0.5);
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
/// <reference path="typings/slick-ui.d.ts"/>
import * as EnemySpawners from "./enemy_spawner/enemy_spawner";
import { Player, PlayerState } from "./player";
import { Enemy } from "./enemy";
import { Bullet } from "./bullet"; 

export class GameplayState extends Phaser.State
{
    player : Player;
    cursors : Phaser.CursorKeys;
    
    playerGroup : Phaser.Group;
    enemies : Phaser.Group;
    enemyBullets : Phaser.Group;
    playerBullets : Phaser.Group;
    score : number;
    scoreText : Phaser.Text;
    livesText : Phaser.Text;
    showDebug : boolean;
    enemySpawner : EnemySpawners.EnemySpawner;
    
    constructor()
    {
        super();
    }

    preload() {
        //Show debug property
        this.showDebug = false;

        //Scale the game windows by two in both directions
        //this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(1,1);

        //Ensure that we are not moving in subpixel space. A movement of 1 pixel in the non-scaled world equals to 2 pixels
        //on the actual screen. 
        //this.game.renderer.renderSession.roundPixels = true;
        
        //Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        //TODO: Go back to using 32x32 sprites and upscaling.
        this.game.scale.pageAlignHorizontally = true;
        this.game.load.spritesheet('player', "resources/new_player_64.png", 64, 64);
        this.game.load.spritesheet('bullets', "resources/bullets2.png", 32, 32);
        this.game.load.spritesheet('enemy', "resources/new_enemy_64.png", 64, 64);
        this.game.load.spritesheet('explosions', "resources/explosions.png", 16, 16);

        //TODO: Use multi texture support to improve performance!
        //Read this: http://phaser.io/news/2016/07/multitexturing-support-added
         
        this.game.input.keyboard.addKeyCapture([Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.D]);
        var dKey = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
        var tKey = this.game.input.keyboard.addKey(Phaser.KeyCode.T);
        dKey.onDown.add(this.toggleDebug, this);
        tKey.onDown.add(this.tryRestart, this);
    }

    create() {
        var game = this.game;
        var input = this.game.input;
        game.time.advancedTiming = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Create the game groups
        this.playerGroup = game.add.group(this.game.world, "Player", false, true, Phaser.Physics.ARCADE);        
        this.enemies = game.add.group(this.game.world, "Enemies", false, true, Phaser.Physics.ARCADE);
        this.playerBullets = game.add.group(this.game.world, "PlayerBullets", false, true, Phaser.Physics.ARCADE);
        this.enemyBullets = game.add.group(this.game.world, "EnemyBullets", false, true, Phaser.Physics.ARCADE);

        //Initialize the bullets
        for(var i = 0; i < 128; i++)
        {
            this.enemyBullets.add(new Bullet(game, 'bullets', 0), true);
            this.playerBullets.add(new Bullet(game, 'bullets', 0), true);
        }
        
        //Create the player and add it to the game
        this.player = new Player(game, game.world.centerX, this.game.world.centerY, this.playerBullets);
        this.playerGroup.add(this.player); 
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

        //Initialize the enemy spawner
        this.enemySpawner = new EnemySpawners.RandomEnemySpawner(this.game, this.player, this.enemies, this.enemyBullets);
        this.enemySpawner.start(); 
    }

    update() {
        this.enemySpawner.update();
        this.game.physics.arcade.overlap(this.player, this.enemies, this.playerEnemyCollision, null, this);
        this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerEnemyBulletCollision, null, this);
        this.game.physics.arcade.overlap(this.enemies, this.playerBullets, this.enemyPlayerBulletCollision, null, this);
    }

    render() {
        if(this.showDebug) {
            this.debugGroup(this.enemyBullets);
            this.debugGroup(this.playerBullets);
            this.debugGroup(this.enemies);
            if(this.player.exists)
                this.game.debug.body(this.player);
        }
        this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#00ff00");
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
        
        if (this.player.state == PlayerState.Dead)
            this.showGameOver();
    }

    playerEnemyBulletCollision(playerObj : any, bulletObj : any)
    {

        var player = playerObj as Player;
        var enemyBullet = bulletObj as Bullet;
        if(player.state != PlayerState.Playing) {
            return;
        }
        player.kill();
        enemyBullet.kill();
        this.updateLivesText();
        if (this.player.state == PlayerState.Dead)
            this.showGameOver();
    }

    enemyPlayerBulletCollision(enemyObj : any, bulletObj : any) {
        var enemy = enemyObj as Enemy;
        var playerBullet = bulletObj as Bullet;
        //Only kill the enemy if its actually being shown
        if(enemy.y > 0) {
            this.score += 10;
            enemy.kill();
            this.updateScoreText();
        }
        playerBullet.kill();
    }

    updateLivesText() {
        if(this.player.state != PlayerState.Dead)
            this.livesText.text = this.player.lives.toString();
        else
            this.livesText.text = "";
    }

    updateScoreText() {
        this.scoreText.text = this.score.toString();
    }

    public showGameOver() : void {
        var world = this.game.world;
        var style = {font: "32px Arial", fill: "#ff0044", align: "center"}
        var gameOverText = this.game.add.text(world.centerX,world.centerY, "Game Over", style);
        gameOverText.anchor.set(0.5, 0.5);
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
import { Weapon, SingleBulletWeapon, ScatterShotWeapon, TwinShot } from "./weapon.ts" ;
export enum PlayerState
{
    Starting,
    Playing,
    Restarting,
    Dead
}

export class Player extends Phaser.Sprite {
    speed : number;
    game : Phaser.Game;
    cursors : Phaser.CursorKeys;
    weapon : Weapon;
    lives : number;
    state : PlayerState;
    restartAt : number;

    constructor(game : Phaser.Game, x : number, y : number, bulletGroup : Phaser.Group) 
    {
        super(game, x, y, 'player');
        this.animations.add('idle', [0]);
        this.animations.add('right', [1]);
        this.animations.add('left', [2]);
        this.anchor.setTo(0.5, 0.5);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.speed = 2;
        this.weapon = new TwinShot(this.game, bulletGroup, 'bullets', 0);
        this.weapon.fireRateMillis = 200;
        this.weapon.bulletSize = new Phaser.Rectangle(7, 0, 1, 8);
        this.game.physics.arcade.enable(this);
        this.alive = false;
    }

    public start() : void {
        var x = this.game.world.centerX;
        var y = this.game.world.height + this.height + 50;
        this.reset(x, y);
        this.state = PlayerState.Starting;
    }

    public update() : void {
        switch(this.state)
        {
            case PlayerState.Starting:
                this.y += 1 * this.speed;
                var world = this.game.world;
                if(this.y < world.height - 2 * this.height)
                    this.state = PlayerState.Playing;
                break;
            case PlayerState.Playing:
                this.updatePlaying();
                break;
            case PlayerState.Restarting:
                
                this.state = PlayerState.Dead;
                break;
            case PlayerState.Dead:
                if(this.lives >= 0 && this.game.time.now > this.restartAt)
                    this.start();
                break;    
        }
    }

    protected updatePlaying() : void
    {
        var cursors = this.cursors;
        var game = this.game;

        var dx : number = 0;
        var dy : number = 0;
        if (cursors.left.isDown)
        {
            this.animations.play('left');
            dx = -1;
        }
        else if(cursors.right.isDown)
        {
            this.animations.play('right');
            dx = +1;
        }
        else
        {
            this.animations.play('idle');
        }
        
        if(cursors.up.isDown)
            dy = -1;
        else if(cursors.down.isDown)
            dy = +1;
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        if(this.x < 0)
            this.x = 0;
        else if(this.x > this.game.camera.width)
            this.x = this.game.camera.width;

        if(this.y < 0)
            this.y = 0;
        else if(this.y > this.game.camera.height)
            this.y = this.game.camera.height;

        //Firing bullets
        if(game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) && this.weapon)
        {
            var point = new Phaser.Point(this.position.x, this.position.y - 10);
            this.weapon.tryFire(this.position, -90);
        }
    }   

    public kill() : Phaser.Sprite
    {
        //TODO: Add explosion visual effect
        if(this.lives > 0)
        {
            this.lives--;
            this.restartAt = this.game.time.now + 1000;
            this.state = PlayerState.Restarting;
        }
        else 
        {
            //TODO: Add a game over text to the screen
            var world = this.game.world;
            var style = {font: "65px Arial", fill: "#ff0044", align: "center"}
            var gameOverText = this.game.add.text(world.centerX,world.centerY, "Game Over", style);
            gameOverText.anchor.set(0.5, 0.5);
            this.state = PlayerState.Dead;    
        }        
        return super.kill();
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
import * as Weapons from "./weapon" ;
import { ExplosionEmitter } from "./explosion_emitter";
export enum PlayerState
{
    Starting = 1,
    Playing = 2,
    Restarting = 3,
    Dead = 4
}

export class Player extends Phaser.Sprite {
    speed : number;
    game : Phaser.Game;
    cursors : Phaser.CursorKeys;
    weapon : Weapons.Weapon;
    lives : number;
    state : PlayerState;
    restartAt : number;
    score : number;  
    explosionEmitter : ExplosionEmitter;  

    constructor(game : Phaser.Game, x : number, y : number, bulletGroup : Phaser.Group) 
    {
        super(game, x, y, 'player');
        this.animations.add('idle', [0]);
        this.animations.add('right', [1]);
        this.animations.add('left', [2]);
        this.anchor.setTo(0.5, 0.5);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.speed = 4;
        var twinShoot = new Weapons.TwinShot(this.game, bulletGroup, 'bullets', 8); 
        twinShoot.fireRateMillis = 200;
        twinShoot.bulletSize = new Phaser.Rectangle(7, 0, 1, 8);
        twinShoot.bulletSpacing = 10; 
        this.weapon = twinShoot;
        this.lives = 2;
        this.alive = false;
        this.explosionEmitter = new ExplosionEmitter(game);
        this.game.physics.arcade.enable(this);
    }

    public start() : void {
        var x = this.game.world.centerX;
        var y = this.game.world.height + this.height + 50;
        this.reset(x, y);
        this.body.setSize(16, 14, 24, 32);
        this.state = PlayerState.Starting;
    }

    public update() : void {
        switch(this.state)
        {
            case PlayerState.Starting:
                this.y -= 1 * this.speed;
                var world = this.game.world;
                if(this.y < world.height - 1.5 * this.height)
                    this.state = PlayerState.Playing;
                break;
            case PlayerState.Playing:
                this.updatePlaying();
                break;         
            case PlayerState.Restarting:
                if(this.game.time.now > this.restartAt)
                {
                    this.start();
                }       
            case PlayerState.Dead:
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

        if(this.x < 0 )
            this.x = 0;
        else if(this.x > this.game.camera.width)
            this.x = this.game.camera.width;

        if(this.y < 0 + this.body.height)
            this.y = this.body.height;
        else if(this.y  > this.game.camera.height - this.body.height)
            this.y = this.game.camera.height - this.body.height;

        //Firing bullets
        if(game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR) && this.weapon)
        {
            var point = new Phaser.Point(this.position.x, this.position.y - 10);
            this.weapon.tryFire(point, -90);
        }
    }   

    public kill() : Phaser.Sprite
    {   
        if(this.lives > 0)
        {
            this.lives--;    
            this.restartAt = this.game.time.now + 250;
            this.state = PlayerState.Restarting;
        }
        else 
        {
            this.state = PlayerState.Dead;
        }
        this.explosionEmitter.explode(new Phaser.Point(this.x, this.y), this.body.width, this.body.height);
        return super.kill();
    }
}
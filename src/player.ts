/// <reference path="typings/phaser.comments.d.ts"/>
import { Weapon, SingleBulletWeapon, ScatterShotWeapon, TwinShot } from "./weapon.ts" ;
export class Player extends Phaser.Sprite {
    speed : number;
    game : Phaser.Game;
    cursors : Phaser.CursorKeys;
    weapon : Weapon;

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
    }

    public update() {
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
}
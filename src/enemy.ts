/// <reference path="typings/phaser.comments.d.ts"/>
import {Weapon, SingleBulletWeapon} from "./weapon.ts"
export class Enemy extends Phaser.Sprite
{
    weapon : Weapon;
    nextFireAt : number;
    fireRate : number;
    shooting : boolean;
    
    constructor(game : Phaser.Game, x : number, y : number, enemyBullets : Phaser.Group)
    {
        super(game, x, y, 'enemy');
        this.anchor.setTo(0.5, 0.5);
        this.animations.add('idle', [20])
        this.animations.add('blinking', [21, 20], 8, false);
        this.exists = false; 
        this.nextFireAt = 0;
        this.fireRate = 500;
        this.shooting = false;
        var singleBullet = new SingleBulletWeapon(this.game, enemyBullets, "bullets", 4);
        singleBullet.bulletSpeed = 150;
        this.weapon = singleBullet;
    }

    start(x : number, y : number) : void
    {
        this.reset(x, y); 
        this.body.velocity = new Phaser.Point(0, 50);    
    }

    update() : void
    {
        if(!this.exists)
            return;

        if(this.shooting && this.animations.currentAnim.isFinished)
        {
            this.animations.play('idle');
            this.shooting = false;
        }

        //this.y += this.speed;
        var now = this.game.time.now;
        if(now > this.nextFireAt)
        {
            var source = new Phaser.Point(this.position.x, this.position.y + 10);
            this.animations.play('blinking');
            this.weapon.fire(this.position, 90);
            this.nextFireAt = now + 2000 + this.fireRate * Math.random();
            this.shooting = true;
        }

        if(this.y > this.game.world.height + this.height)
        {
            this.kill();
        }
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
import { Bullet } from "./bullet.ts"
export abstract class Weapon
{
    game : Phaser.Game;
    bulletGroup : Phaser.Group;
    bulletSpeed : number;
    fireRateMillis : number; 
    nextFireMillis : number;
    spriteKey : string;
    spriteFrame : number;
    bulletSize : Phaser.Rectangle;

    ///Instantiates a new weapon. Overriding constructors can pass or not a bulletkey to reserve a buffer 
    ///of bullets inmediately. 
    constructor(game : Phaser.Game, bulletGroup : Phaser.Group, spriteKey? : string, spriteFrame? : number)
    {
        this.game = game;
        this.bulletGroup = bulletGroup;
        this.spriteKey = spriteKey || null;
        this.spriteFrame = spriteFrame || null;
        this.nextFireMillis = 0;
        this.bulletSize = null;
        
    }

    getNextBullet() : Bullet
    {
        var bullet = this.bulletGroup.getFirstExists(false) as Bullet;
        if(bullet == null)
            return null;

        bullet.key = this.spriteKey;
        bullet.frame = this.spriteFrame; 
        if(this.bulletSize != null)
        {
            var bulletSize = this.bulletSize;
            bullet.body.setSize(bulletSize.width, bulletSize.height, bulletSize.x, bulletSize.y);
        }
        return bullet;
    }
    
    tryFire(source : Phaser.Point, shootAngle : number) : void
    {
        var now = this.game.time.now;
        if(now > this.nextFireMillis)
        {
            this.fire(source, shootAngle);
            this.nextFireMillis = now + this.fireRateMillis;  
        }
    }

    abstract fire(source : Phaser.Point, shootAngle : number) : void;
}

export class SingleBulletWeapon extends Weapon
{
    
    constructor(game : Phaser.Game, bulletGroup : Phaser.Group, spriteKey : string, spriteFrame : number)
    {
        super(game, bulletGroup, spriteKey, spriteFrame);
        this.fireRateMillis = 200;
        this.bulletSpeed = 600;
    }

    fire(source : Phaser.Point, shootAngle : number) : void
    {
        //var bullet = this.bulletGroup.getFirstExists(false) as Bullet;
        //TODO: Retrieve a bullet from a method in the weapon class, change its key and frame
        //instead of instancing a new one.
        var bullet = this.getNextBullet();
        if(bullet)
        {
            var x = source.x;
            var y = source.y;
            bullet.fire(x, y, shootAngle, this.bulletSpeed, 0, 0);
        }
    }
}

export class TwinShot extends Weapon
{
    bulletSpacing : number;

    constructor(game : Phaser.Game, bulletGroup : Phaser.Group, spriteKey : string, spriteFrame : number)
    {
        super(game, bulletGroup, spriteKey, spriteFrame);
        this.fireRateMillis = 100;
        this.bulletSpeed = 600;
        this.bulletSpacing = 5;
    }

    fire(source : Phaser.Point, shootAngle : number) : void
    {
        var bullet1 = this.getNextBullet();
        if(bullet1)
            bullet1.fire(source.x - this.bulletSpacing, source.y, shootAngle, this.bulletSpeed, 0, 0, -90);

        var bullet2 = this.getNextBullet();
        if(bullet2)
            bullet2.fire(source.x + this.bulletSpacing, source.y, shootAngle, this.bulletSpeed, 0, 0, -90);
    }
}

export class ScatterShotWeapon extends Weapon
{
    constructor(game : Phaser.Game, bulletGroup : Phaser.Group, spriteKey : string, spriteFrame : number)
    {
        super(game, bulletGroup, spriteKey, spriteFrame);
        this.fireRateMillis = 100;
        this.bulletSpeed = 600;
    }

    fire(source : Phaser.Point, shootAngle : number)
    {
        //var bullet = this.bulletGroup.getFirstExists(false) as Bullet;
        var bullet = this.getNextBullet();
        if(bullet)
        {
            var x = (source.x - 5) + Math.random() * 10;
            var y = source.y - 10;
            bullet.fire(x,y, shootAngle, this.bulletSpeed, 0, 0); 
        }
    }
}
/// <reference path="../typings/phaser.comments.d.ts"/>
import { Weapon } from "../weapon";
import { ExplosionEmitter } from "../explosion_emitter";

/**
 * A behavior defines a single action that is executed either
 * once or continually by a sprite. 
 */
export abstract class Behavior
{
    protected sprite : Phaser.Sprite;
    protected game : Phaser.Game;
    
    public constructor(sprite : Phaser.Sprite, game : Phaser.Game) 
    {
        this.sprite = sprite;
        this.game = game;
    }

    public start() : void
    {
    }
    
    public update() : void
    {
    }

    public stop() : void
    {
    }
}

export class TweenToPos extends Behavior
{
    public targetPos : Phaser.Point = new Phaser.Point(0, 0);
    public duration : number = 2000;
    public delay : number = 0;
    public easing : Function = Phaser.Easing.Linear;
    private tween : Phaser.Tween = null;

    public start() : void
    {
        //TODO: Try to use the same tween and reuse it rather than creating new tweeners.
        this.tween = this.game.add.tween(this.sprite).to({x : this.targetPos.x, y : this.targetPos.y}, this.duration, this.easing, true, this.delay);
    }

    public stop() : void
    {
        if(this.tween != null && this.tween.isRunning != false)
            this.tween.stop(false);
        super.stop();
    }

    public isFinished() : boolean
    {
        return this.tween != null && this.tween.isRunning == false;
    }
}

export class TurnTowardsTarget extends Behavior
{
    public target : Phaser.Sprite;
    public update()
    {
        if(this.sprite.alive && this.target != null && this.target.alive)
        {
            var pDelta = new Phaser.Point(this.target.x - this.sprite.x, this.target.y - this.sprite.y);
            var pAngleRad = Math.atan2(pDelta.y, pDelta.x);
            this.sprite.rotation = pAngleRad;  
        }
    }
}

export class ShootTarget extends Behavior
{
    public target : Phaser.Sprite;
    public weapon : Weapon;  
    public fireRate : number;
    private nextFireAt : number;
    private numShots : number;
    
    //TODO: Add variations or modes to this behavior, e.g.
    //1. Shoot Once: Only shoots at the start.
    //2. Shoot Frequent: Shoots every time fireRate seconds have passed
    //3. Shoot Frequent Random: Makes shoots anytime between shoot_time + fireRate * Random(0,1). 
    //The current implementation is equivalent to shoot frequent random.
    private shoot(now : number) : void
    {
        var source = new Phaser.Point(this.sprite.position.x, this.sprite.position.y + 10);
        this.weapon.fire(this.sprite.position, this.sprite.angle);
        this.nextFireAt = now + this.fireRate;
        this.numShots++;    
    } 

    public start() : void 
    {
        if(this.fireRate == null || this.weapon == null)
            throw Error("FireRate and weapon should be set.")
        this.numShots = 0;
        var now = this.game.time.now;
        this.shoot(now);
    }

    public update() : void
    {
        if(this.target == null || this.target.alive == false)
            return;
            
        var now = this.game.time.now;
        if (now > this.nextFireAt)
        {
            this.shoot(now);
        }
    }

    public getNumShots() : number
    {
        return this.numShots;
    }
}

export class Explode extends Behavior
{
    public explosionEmitter : ExplosionEmitter;
    public start() : void 
    {
        this.explosionEmitter.explode(new Phaser.Point(this.sprite.x,this.sprite.y), this.sprite.body.width, this.sprite.body.height);
    }
}
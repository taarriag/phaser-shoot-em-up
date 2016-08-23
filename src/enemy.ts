/// <reference path="typings/phaser.comments.d.ts"/>
import {Weapon, SingleBulletWeapon} from "./weapon.ts";
import { Player, PlayerState } from "./player.ts";

/***
 * For the time being, this will contain every possible enemy state.
 * Note that some enemies might not use all of them.
 * TODO: Change it for a more flexible FSM model using behaviours
 */
export enum EnemyState
{
    Starting,
    Shooting,
    Leaving,
    TurningToLeave
}

export class Enemy extends Phaser.Sprite
{
    public weapon : Weapon;
    public nextFireAt : number;
    public fireRate : number;
    public shooting : boolean;
    protected target : Phaser.Sprite; 
    protected state : EnemyState;
    protected finalPos : Phaser.Point;
    protected delay : number = 0;

    constructor(game : Phaser.Game, x : number, y : number, enemyBullets : Phaser.Group)
    {
        super(game, x, y, 'enemy');
        this.anchor.setTo(0.5, 0.5);
        this.animations.add('idle', [20])
        this.animations.add('blinking', [21, 20], 8, false);
        this.exists = false; 
        this.nextFireAt = 0;
        this.fireRate = 1000;
        this.shooting = false;
        var singleBullet = new SingleBulletWeapon(this.game, enemyBullets, "bullets", 4);
        singleBullet.bulletSpeed = 150;
        singleBullet.bulletSize = new Phaser.Rectangle(4, 5, 5, 5);
        this.weapon = singleBullet;
        this.delay = 0;
        
    }

    /**
     * Sets a target towards which the enemy could have a certain behavior
     * E.g. rotate towards this target or following this target.
     * 
     * @param target The target object 
     */
    public setTarget(target : Phaser.Sprite)
    {
        this.target = target;
    }   

    /**
     * Sets the final position of this enemy, usually this is the position
     * the enemy will arrive to after the entry tween
     */
    public setFinalPos(finalPos : Phaser.Point)
    {
        this.finalPos = finalPos;
    }

    public setDelay(delay : number) : void 
    {
        this.delay = delay;
    }

    public start(x : number, y : number) : void
    {
        this.reset(x, y); 
        this.body.setSize(12, 14, 2, 2);
        this.body.velocity = new Phaser.Point(0, 80);    
    }

    public update() : void
    {
        if(!this.exists)
            return;

        if(this.shooting && this.animations.currentAnim.isFinished)
        {
            this.animations.play('idle');
            this.shooting = false;
        }

        this.tryShoot();
        this.checkOutOfBounds();
    }

    protected tryShoot() : boolean
    {
        //If there is no target, do not shoot.
        if(this.target == null || this.target.alive == false)
        {
            return false;
        }
        
        //Try to cast the target as a player.
        var player = this.target as Player;
        if (player != null && player.state != PlayerState.Playing)
            return;

        var now = this.game.time.now;
        if(now > this.nextFireAt)
        {
            var source = new Phaser.Point(this.position.x, this.position.y + 10);
            this.weapon.fire(this.position, this.angle + 90);
            this.nextFireAt = now + this.fireRate + this.fireRate * Math.random();
            this.shooting = true;
            return true;
        }
        return false;
    }

    protected checkOutOfBounds()
    {
        if(this.y > this.game.world.height + this.height*2)
        {
            this.kill();
        }
    }
}

export class SpecialEnemy extends Enemy
{
    /*public static get STATE_STARTING() : number {return 0;}
    public static get STATE_SHOOTING() : number {return 1;}
    public static get STATE_LEAVING() : number {return 2;}*/
    protected tween : Phaser.Tween;
    protected state : number;
    protected numShots : number;
    
    
    public start(x : number, y : number) : void
    {
        this.reset(x, y); 
        this.rotation = 0;
        this.body.setSize(12, 14, 2, 2);

        var finalX = this.x;
        var finalY = this.game.world.centerY - this.height * 3;
        if(this.finalPos != null)
        {
            finalX = this.finalPos.x;
            finalY = this.finalPos.y;
        }

        this.tween = this.game.add.tween(this).to({x : finalX, y : finalY}, 2000, Phaser.Easing.Back.InOut, true, this.delay);
        this.state = EnemyState.Starting;
        this.numShots = 0;
        this.delay = 0;
        this.animations.play('idle');
    }

    public update() : void
    {
        if(!this.exists)
            return;
        
        switch(this.state)
        {
            case EnemyState.Starting:
                if(this.tween != null && this.tween.isRunning == false)
                {
                    this.state = EnemyState.Shooting;
                }
                this.turnTowardsTarget();
                break;

            case EnemyState.Shooting:
                this.turnTowardsTarget();
                var shot = this.tryShoot();
                if(shot)
                {
                    //this.animations.play('blinking');
                    this.numShots++;
                    if(this.numShots >= 3)
                    {
                        this.state = EnemyState.TurningToLeave;
                    }
                }                
                break;

            case EnemyState.TurningToLeave:
                if(Math.abs(0 - this.angle) > 20)
                {
                    var angDir = (0 > this.angle) ? 1 : -1;
                    this.rotation += angDir * 0.3;
                } 
                else
                {
                    var finalY = this.game.world.height + this.height * 2; 
                    this.tween = this.game.add.tween(this).to({x : this.x, y : finalY}, 4000, Phaser.Easing.Back.InOut, true);
                    this.state = EnemyState.Leaving;
                }
                break;

            case EnemyState.Leaving:
                this.turnTowardsTarget();
                this.checkOutOfBounds();
                break;

        }

        //Only play the idle animation if there is no other animation showing.
        /*if(this.animations.currentAnim.name != 'idle' && this.animations.currentAnim.isFinished)
            this.animations.play('idle');*/
    }

    protected turnTowardsTarget() : void
    {
        //Turn towards the player only if its alive
        if(this.alive && this.target != null && this.target.alive)
        {
            var pDelta = new Phaser.Point(this.target.x - this.x, this.target.y - this.y);
            var pAngleRad = Math.atan2(pDelta.y, pDelta.x) - Math.PI*0.5;
            this.rotation = pAngleRad;  
        }
    }

    public kill() : Phaser.Sprite
    {
        if(this.tween != null)
        {
            this.tween.stop(false);
        }
        return super.kill();
    }

}
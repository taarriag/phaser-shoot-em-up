/// <reference path="typings/phaser.comments.d.ts"/>
import { Player, PlayerState } from "./player";
import { ExplosionEmitter } from "./explosion_emitter";
import * as EnemyStates from "./states/enemy_state";
import * as Collections from 'typescript-collections';

export enum State
{
    Starting,
    Attacking,
    Leaving,
    Exploding
}

export class Enemy extends Phaser.Sprite {
    private states : Collections.Dictionary<State, EnemyStates.EnemyState>; 
    private currentState : EnemyStates.EnemyState;
    private target : Phaser.Sprite;

    constructor(game : Phaser.Game, x : number, y : number, 
        enemyBullets : Phaser.Group)
    {
        super(game, x, y, 'enemy');
        this.anchor.setTo(0.5, 0.5);
        this.animations.add('idle', [0]);
        this.exists = false;
        this.health = 1;
        
        this.states = new Collections.Dictionary<State, EnemyStates.EnemyState>();

        //Define the enemy states. Any state can switch the enemy current state.
        //An enemy can only be in one state at any given type, but each state
        //can execute many behaviors simultaneously.
        this.states.setValue(State.Starting, new EnemyStates.Starting(this, this.game));
        this.states.setValue(State.Leaving, new EnemyStates.Leaving(this, this.game));
        /*this.states.setValue(State.Attacking, new EnemyStates.Attacking(this, this.game));
        this.states.setValue(State.Exploding, new EnemyStates.Exploding(this, this.game));*/
        this.currentState = null;
        this.alive = false;
    }

    public setState(state : State) : void {
        if (this.currentState != null) 
            this.currentState.stop();
        this.currentState = this.states.getValue(state);
        this.currentState.start();
    }

    public getState(state : State) : EnemyStates.EnemyState
    {
     return this.states.getValue(state);   
    }

    public setTarget(target : Phaser.Sprite) {
        this.target = target;
    }

    public getTarget() {
        return this.target;
    }

    public start(pos : Phaser.Point) : void {
        this.reset(pos.x, pos.y);
        this.body.setSize(52, 40, 8, 3);
        //this.body.velocity = new Phaser.Point(0, 80);
        this.animations.play('idle');
        this.setState(State.Starting);
    }

    public update() : void
    {
        if(!this.exists)
            return;

        //Update the current state, if any.
        //Note that this may change the current state and start it.
        if(this.currentState != null)
            this.currentState.update();

        //Check if we are out of bounds, stop the current state
        //And kill the enemy if it happens.
        this.checkOutOfBounds();
    }

    protected checkOutOfBounds() : void
    {
        if(this.y > this.game.world.height + this.height * 2)
        {
            if(this.currentState != null)
                this.currentState.stop();
            this.kill();
            
        }
    }

    //TODO: Update damage so that we can show an explosion animation for the enemy.
    /*public damage(amount : number) : Phaser.Sprite
    {
        if(this.health - amount <= 0)
        {
            currentStatae
        }
        return super.damage();
    }*/

    public kill() : Phaser.Sprite
    {
        if(this.currentState != null)
        {
            this.currentState.stop();
            this.currentState = null;
        }
        return super.kill();
    }
}

/***
 * For the time being, this will contain every possible enemy state.
 * Note that some enemies might not use all of them.
 * TODO: Change it for a more flexible FSM model using behaviours
 */
/*

export class OldEnemy extends Phaser.Sprite
{
    public weapon : Weapon;
    public nextFireAt : number;
    public fireRate : number;
    public shooting : boolean;
    public life : number = 1;
    protected target : Phaser.Sprite; 
    protected state : State;
    protected finalPos : Phaser.Point;
    protected delay : number = 0;
    protected explosionEmitter : ExplosionEmitter
    
    constructor(game : Phaser.Game, x : number, y : number, enemyBullets : Phaser.Group)
    {
        super(game, x, y, 'enemy');
        this.anchor.setTo(0.5, 0.5);
        this.animations.add('idle', [0]);
        //this.animations.add('idle', [20])
        //this.animations.add('blinking', [21, 20], 8, false);
        this.exists = false; 
        this.nextFireAt = 0;
        this.fireRate = 1000;
        this.shooting = false;
        var singleBullet = new SingleBulletWeapon(this.game, enemyBullets, "bullets", 7);
        singleBullet.bulletSpeed = 120;
        singleBullet.bulletSize = new Phaser.Rectangle(106 - 3*32, 42 - 32, 12, 12);
        this.weapon = singleBullet;
        this.delay = 0;
        this.explosionEmitter = new ExplosionEmitter(game);
        
    }

    public Damage(amount : number)
    {
        this.life -= amount;
    }
    public setTarget(target : Phaser.Sprite)
    {
        this.target = target;
    }   

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
        this.body.setSize(48, 40, 8, 13);
        this.body.velocity = new Phaser.Point(0, 80);
        this.animations.play('idle');    
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
    protected tween : Phaser.Tween;
    protected state : number;
    protected numShots : number;
    
    
    public start(x : number, y : number) : void
    {
        this.reset(x, y); 
        this.rotation = 0;
        this.body.setSize(48, 40, 5, 16);

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
        
        this.explosionEmitter.explode(new Phaser.Point(this.x,this.y), this.body.width, this.body.height);
        return super.kill();
    }
}*/


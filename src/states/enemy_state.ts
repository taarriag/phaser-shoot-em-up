import { State } from "./state";
import * as Enemies from "../enemy";
import * as Behaviors from "../behaviors/behavior";
import * as Weapons from "../weapon";

/**
 * Base state for an enemy.
 * Gives access to an enemy object to inheritor states.
 */
export class EnemyState extends State {
    public enemy : Enemies.Enemy;

    public constructor(sprite : Phaser.Sprite, game : Phaser.Game) {
        super(sprite, game);
        this.enemy = sprite as Enemies.Enemy;
    }

    public reset() : void
    {

    }

    public start() : void
    {
        super.start();
    }

    public update() : void 
    {
        super.update();
    }

    public stop() : void
    {
        super.stop();
    }
} 

export class Starting extends EnemyState {
    private tweenToPos : Behaviors.TweenToPos;

    //TODO: In the future, make this public so that it can be setState
    //up by the spawner when creating an enemy.
    public targetPos : Phaser.Point;
    public delay : number
    private arrivalTime : number = null;
    public init() : void 
    {
        super.init();
        this.tweenToPos = new Behaviors.TweenToPos(this.sprite, this.game);
        this.behaviors.add(this.tweenToPos);
    }

    public reset() : void 
    {
        this.delay = 0;
        this.targetPos = null;
    }

    public start() : void
    {
        //Configure the target position of the tween before moving the target.
        this.tweenToPos.duration = 2000;
        this.tweenToPos.easing = Phaser.Easing.Back.InOut;
        this.tweenToPos.delay = this.delay;
        // TODO: Allow these to be changed externally, they could be retrieved before
        // starting the enemy in the spawner.
        this.tweenToPos.targetPos = this.targetPos;
        super.start();
    }

    public update() : void
    {
        var now = this.game.time.now;
        super.update();
        if(this.tweenToPos.isFinished())
        {
            if(this.arrivalTime == null)
                this.arrivalTime = now;
            if(now - this.arrivalTime > 2000)
            {
                this.enemy.setState(Enemies.State.Leaving);
            }
        }
            
    }
}

export class Leaving extends EnemyState {
    private tweenToPos : Behaviors.TweenToPos;
    public delay : number;
    public targetPos : Phaser.Point;

    public init() : void {
        super.init();
        //Initialize only the behaviors or other private properties.
        this.tweenToPos = new Behaviors.TweenToPos(this.sprite, this.game);
        this.behaviors.add(this.tweenToPos);
        this.targetPos = new Phaser.Point(0, 0);
    }

    public reset() : void{
        //Reset externally modifiable variables. This gets called by init and stop.
        this.delay = 0;
        this.targetPos = null;
    }

    public start() : void {
        this.tweenToPos.duration = 4000;
        this.tweenToPos.easing = Phaser.Easing.Back.InOut;
        this.tweenToPos.delay = this.delay;
        this.tweenToPos.targetPos = this.targetPos; 
        super.start();
    }
}

/*export class Attacking extends EnemyState {
    private turnTowardsTarget : Behaviors.TurnTowardsTarget;
    private shootTarget : Behaviors.ShootTarget;
    private maxShots : number;

    public constructor(enemy : Enemies.Enemy) {
        super(enemy);
        this.turnTowardsTarget = new Behaviors.TurnTowardsTarget();
        this.turnTowardsTarget.target = this.enemy.target;
        this.shootTarget = new Behaviors.ShootTarget();
        this.shootTarget.target = this.enemy.target;
        var singleBullet = new Weapons.SingleBulletWeapon(this.game, enemyBullets, "bullets", 7);
        singleBullet.bulletSpeed = 120;
        singleBullet.bulletSize = new Phaser.Rectangle(106 - 3*32, 42 - 32, 12, 12);


        this.behaviors.add(this.turnTowardsTarget);
        this.behaviors.add(this.shootTarget);
    }

    public update() : void
    {
        super.update();
        if (this.shootTarget.getNumShots() >= this.maxShots)
        {
            this.enemy.setState(Enemies.State.Leaving);
        }
    }
}*/
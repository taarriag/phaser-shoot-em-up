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
        this.states.setValue(State.Attacking, new EnemyStates.Attacking(this, this.game));
        /*this.states.setValue(State.Exploding, new EnemyStates.Exploding(this, this.game));*/
        this.currentState = null;
        this.alive = false;
    }

    public setState(state : State) : void {
        if (this.currentState != null) 
        {
            this.currentState.stop();
            this.currentState.stopBehaviors();
            this.currentState.reset();
        }
        this.currentState = this.states.getValue(state);
        this.currentState.start();
        this.currentState.startBehaviors();
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
        {
            this.currentState.updateBehaviors();
            this.currentState.update();
        }
        //Check if we are out of bounds, stop the current state
        //And kill the enemy if it happens.
        this.checkOutOfBounds();
    }

    protected checkOutOfBounds() : void {
        if(this.y > this.game.world.height + this.height * 2) {
            this.kill();
        }
    }

    public kill() : Phaser.Sprite {
        if (this.currentState != null) {
            this.currentState.stop();
            this.currentState = null;
        }
        return super.kill();
    }
}
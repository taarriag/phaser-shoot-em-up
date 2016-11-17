/// <reference path="../typings/phaser.comments.d.ts"/>
import { Behavior } from "../behaviors/behavior";
import * as Collections from 'typescript-collections';

/**
 * A state represents the current sum of behaviors of an npc.
 * Examples: Attacking, Hiding, Following the player, Dying, etc.
 * Each state maintains and executes a list of behaviors which are
 * updated simultaneously. For instance, an attacking enemy could be 
 * shooting and turning towards a player simultaneously.
 * 
 * Behaviors should be instanced in the constructor and they will be
 * initialized when the init method is called.
 *  
 */
export abstract class State
{
    protected behaviors : Collections.LinkedList<Behavior>;
    protected sprite : Phaser.Sprite;
    protected game : Phaser.Game;

    /**
     * The constructor should be used to instantiate and add behaviors 
     * to the list
     */
    public constructor(sprite : Phaser.Sprite, game : Phaser.Game) {
        this.behaviors = new Collections.LinkedList<Behavior>();
        this.sprite = sprite;
        this.game = game;

        //Initialize any behaviors from child classes. 
        this.init();

        //Reset the state modifiable properties. 
        this.reset();
    }

    /**
     * Initializes the state. Override this method to instantiate and 
     * add behaviors to the state. This method only gets called once (in this class 
     * constructor)
     */
    public abstract init() : void;

    /**
     * Override this method to reset all state variables to their default values.
     * This method will be called after init and after stop. It allows us to reuse
     * the same state objects and set up the default values so that other enemy instances
     * can modify them.
     */
    public abstract reset() : void;

    /**
     * This is the first method that will be called after setting the 
     * state of an enemy/npc.
     * Override this method to set any parameters on
     * the behaviors before calling start on each behavior. 
     */
    public abstract start() : void;
        
    /**
     * Calls the start method on each behavior registered in this state.
     */
    public startBehaviors() : void 
    {
        this.behaviors.forEach(behavior => behavior.start());
    }

    /**
     * Updates behaviors registered in this state.
     */
    public updateBehaviors() : void
    {
        this.behaviors.forEach(behavior => behavior.update());
    }

    /**
     * Update is called in the main loop after the behaviors have been updated.
     * Use this to check the status of the state´s behaviors and act accordingly.
     */
    public abstract update() : void;

    /** 
     * Stop is called after a different state has been set for the enemy.
     * Override this method to apply any logic when this state has been stopped
     */
    public abstract stop() : void;

    /**
     * Stops all the behaviors in this state. This is called after stop
     * and before reset whenever the enemy changes it state to something else.
     */
    public stopBehaviors() : void 
    {
        this.behaviors.forEach(behavior => behavior.stop());
        this.reset();
    }


}
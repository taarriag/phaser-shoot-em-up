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
    }

    /**
     * Initializes the state. Override this method to instantiate and 
     * add behaviors to the state.
     */
    public init() : void
    {
        this.reset();
    }

    /**
     * Override this method to reset all state variables to their default values.
     * This method will be called on init and stop. It allows us to reuse
     * the same state objects and set up the default values before starting
     * its execution.
     */
    public abstract reset() : void;

    /**
     * Calls the start method on each behavior, this will be called 
     * inmediately after setting the state of an enemy/npc.
     * Override this method to set any parameters on
     * the behaviors before calling start on each behavior. 
     */
    public start() : void 
    {
        this.behaviors.forEach(behavior => behavior.start());
    }

    /**
     * Update is called in the main loop, updates each of the state
     * behaviors.
     */
    public update() : void {
        this.behaviors.forEach(behavior => behavior.update());
    }

    /**
     * Stops all the behaviors in this state.
     */
    public stop() : void 
    {
        this.behaviors.forEach(behavior => behavior.stop());
        this.reset();
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
export class Bullet extends Phaser.Sprite
{
    speed : number;
    tracking : boolean;
    scaleSpeed : number;
    spriteAngle : number;

    //Constructs a bullet object that can be reused later
    constructor(game : Phaser.Game, key : string, frame? : number)
    {
        if(frame)
            super(game, 0, 0, key, frame);
        else 
            super(game, 0, 0, key);
            
        this.anchor.set(0.5, 0.5);
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        this.exists = false;
        this.tracking = false;
        this.scaleSpeed = 0;
    }

    fire(x : number, y : number, angle : number, speed : number, gx? : number, gy? : number, spriteAngle? : number)
    {
        //Reset the object, making it visible, alive, etc.
        var gx = gx || 0;
        var gy = gy || 0;
        this.reset(x, y);
        this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
        this.angle = (spriteAngle) ? angle - spriteAngle : angle;
        this.body.gravity.set (gx, gy);
    }
    

    update() {
        if(!this.exists)
            return;
        if(this.tracking)
        {
            //TODO: Fix this when changing the angle
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x); 
        }

        if(this.scaleSpeed > 0)
        {
            this.scale.x += this.scaleSpeed;
            this.scale.y += this.scaleSpeed;
        }
    }
}
/// <reference path="typings/phaser.comments.d.ts"/>
export class Bullet extends Phaser.Sprite
{
    speed : number;
    angSpeed : number;
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
    
    fire(origin : Phaser.Point, angle : number, speed : number, angSpeed : number = 0, gravity? : Phaser.Point, spriteAngle? : number)
    {
        //Reset the object, making it visible, alive, etc.
        this.reset(origin.x, origin.y);
        this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
        this.angle = (spriteAngle) ? angle - spriteAngle : angle;
        if(gravity != null)
            this.body.gravity.set (gravity.x, gravity.y);
        else
            this.body.gravity.set (0,0);
    }
    

    update() {
        if(!this.exists)
            return;
        if(this.tracking)
        {
            //TODO: Fix this when changing the angle
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x); 
        }
        this.rotation += (this.angSpeed * Math.PI/180.0);

        if(this.scaleSpeed > 0)
        {
            this.scale.x += this.scaleSpeed;
            this.scale.y += this.scaleSpeed;
        }

        
    }
}
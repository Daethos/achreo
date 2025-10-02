import Enemy from "../entities/Enemy";
import Party from "../entities/PartyComputer";
import Player from "../entities/Player";

export enum HitLocation {
    HEAD = "head",
    CHEST = "chest",
    LEGS = "legs",
};

export interface HitLocationResult {
    location: HitLocation;
    hitPoint: { x: number, y: number };
    relativePosition: { x: number, y: number };
};

type Position = { x: number; y: number; };

export class HitLocationDetector {
    detectHitLocation(weaponHitbox: Phaser.GameObjects.Shape, target: Player | Enemy | Party): HitLocationResult {
        let location: HitLocation;
        const hitPoint = { x: weaponHitbox.x, y: weaponHitbox.y };
        const targetBounds = target.getBounds();
        const relativePosition = {
            x: (hitPoint.x - targetBounds.x) / targetBounds.width,
            y: (hitPoint.y - targetBounds.y) / targetBounds.height
        };

        if (relativePosition.y < 0.33) {
            location = HitLocation.HEAD;
        } else if (relativePosition.y < 0.67) {
            location = HitLocation.CHEST;
        } else {
            location = HitLocation.LEGS
        };

        return {
            location,
            hitPoint,
            relativePosition
        };
    };

    detectParticleLocation(sensor: any, target: Enemy | Player): HitLocationResult {
        // Get sensor center point (same logic as weapon hitbox)
        const sensorCenter = {
            x: sensor.position.x,  // Matter.js uses .position instead of direct .x/.y
            y: sensor.position.y
        };
        
        // Get target bounds
        const targetBounds = target.getBounds();
        
        // Calculate relative position (same math as before)
        const relativeX = (sensorCenter.x - targetBounds.x) / targetBounds.width;
        const relativeY = (sensorCenter.y - targetBounds.y) / targetBounds.height;
        
        // Determine location (same logic)
        let location: HitLocation;
        if (relativeY < 0.33) {
            location = HitLocation.HEAD;
        } else if (relativeY < 0.67) {
            location = HitLocation.CHEST;
        } else {
            location = HitLocation.LEGS;
        }
        return {
            location,
            hitPoint: sensorCenter,
            relativePosition: { x: relativeX, y: relativeY }
        };
    }

    detectHitLocationWithRaycast(attacker: Player | Enemy | Party, target: Enemy | Party | Player): HitLocationResult {
        const attackerCenter = { x: attacker.x, y: attacker.y };
        const targetBounds = target.getBounds();
        const targetCenter = { 
            x: targetBounds.x + targetBounds.width / 2, 
            y: targetBounds.y + targetBounds.height / 2 
        };
        
        // Calculate where the "ray" from attacker hits the target
        const direction = {
            x: targetCenter.x - attackerCenter.x,
            y: targetCenter.y - attackerCenter.y
        };
        
        // Normalize direction
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const normalizedDir = {
            x: direction.x / length,
            y: direction.y / length
        };
        
        // Project ray onto target bounds to find intersection point
        const intersectionPoint = this.findRayTargetIntersection(
            attackerCenter,
            normalizedDir,
            targetBounds
        );
        
        // Calculate relative position on target
        const relativeX = (intersectionPoint.x - targetBounds.x) / targetBounds.width;
        const relativeY = (intersectionPoint.y - targetBounds.y) / targetBounds.height;
        
        // Determine location
        let location: HitLocation;
        if (relativeY < 0.33) {
            location = HitLocation.HEAD;
        } else if (relativeY < 0.67) {
            location = HitLocation.CHEST;
        } else {
            location = HitLocation.LEGS;
        };
        
        return {
            location,
            hitPoint: intersectionPoint,
            relativePosition: { x: relativeX, y: relativeY }
        };
    };

    private findRayTargetIntersection(rayOrigin: Position, rayDirection: Position, targetBounds: Phaser.Geom.Rectangle): Position {
        // Find where ray intersects target rectangle
        // This is a simplified version - you could use Phaser's built-in ray intersection
        
        const targetLeft = targetBounds.x;
        const targetRight = targetBounds.x + targetBounds.width;
        const targetTop = targetBounds.y;
        const targetBottom = targetBounds.y + targetBounds.height;
        
        // Calculate t values for each edge
        const tLeft = (targetLeft - rayOrigin.x) / rayDirection.x;
        const tRight = (targetRight - rayOrigin.x) / rayDirection.x;
        const tTop = (targetTop - rayOrigin.y) / rayDirection.y;
        const tBottom = (targetBottom - rayOrigin.y) / rayDirection.y;
        
        // Find the closest valid intersection
        const validTs = [tLeft, tRight, tTop, tBottom].filter(t => t > 0);
        const minT = Math.min(...validTs);
        
        return {
            x: rayOrigin.x + rayDirection.x * minT,
            y: rayOrigin.y + rayDirection.y * minT
        };
    };

    // Method considering attack angle/direction
    detectHitLocationByAttackAngle(
        attacker: Player | Enemy, 
        target: Enemy | Player, 
        weaponHitbox: Phaser.GameObjects.Shape
    ): HitLocationResult {
        const targetBounds = target.getBounds();
        
        // Get attack direction based on attacker facing
        // const attackFromLeft = attacker.x < target.x;
        const attackFromAbove = attacker.y < target.y;
        
        // Adjust hit location based on attack angle
        const weaponCenter = { x: weaponHitbox.x, y: weaponHitbox.y };
        
        let relativeX = (weaponCenter.x - targetBounds.x) / targetBounds.width;
        let relativeY = (weaponCenter.y - targetBounds.y) / targetBounds.height;
        
        // Modify based on attack direction
        if (attackFromAbove) {
            relativeY -= 0.1; // Bias toward hitting higher on the body
        } else {
            relativeY += 0.1; // Bias toward hitting lower
        };
        
        // Clamp values
        relativeY = Math.max(0, Math.min(1, relativeY));
        relativeX = Math.max(0, Math.min(1, relativeX));
        
        // Determine location
        let location: HitLocation;
        if (relativeY < 0.3) {
            location = HitLocation.HEAD;
        } else if (relativeY < 0.7) {
            location = HitLocation.CHEST;
        } else {
            location = HitLocation.LEGS;
        };
        
        return {
            location,
            hitPoint: weaponCenter,
            relativePosition: { x: relativeX, y: relativeY }
        };
    };
};

export const hitLocationDetector = new HitLocationDetector();
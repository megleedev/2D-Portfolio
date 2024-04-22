import { dialogData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialog, setCamScale, openContactForm, closeContactForm } from "./utils";

document.addEventListener("DOMContentLoaded", () => {

    k.loadSprite ("spritesheet", "./spritesheet.png", {

        sliceX: 39,
        sliceY: 31,
        anims: {
            "idle-down": 936,
            "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
            "idle-side": 975,
            "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
            "idle-up": 1014,
            "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
            "bag-open": 128,
        },
    });

    k.loadSprite ("map", "./map.png");

    k.setBackground (k.Color.fromHex ("#311047"));

    // Creating a scene
    k.scene ("main", async () => {
        
        const mapData = await (await fetch ("./map.json")).json ();
        const layers = mapData.layers;

        const map = k.add ([
            k.sprite ("map"),
            k.pos (0, 0),
            // Controls the scale size of the map -- see constants.js
            k.scale (scaleFactor)
        ]);

        const player = k.make ([
            k.sprite ("spritesheet", { anim: "idle-down" }),
            k.area ({ 
                shape: new k.Rect (k.vec2(0, 3), 10, 10),
            }),
            k.body (),
            k.anchor ("center"),
            k.pos (),
            k.scale (scaleFactor),
            {
                speed: 250,
                direction: "down",
                isInDialog: false,
            },
            "player",
        ]);

        for (const layer of layers) {
            if (layer.name == "Boundaries") {
                for (const boundary of layer.objects) {
                    map.add ([
                        k.area ({
                            shape: new k.Rect (k.vec2(0), boundary.width, boundary.height),
                        }),
                        k.body ({isStatic: true}),
                        k.pos (boundary.x, boundary.y),
                        boundary.name,
                    ]);

                    if (boundary.name) {
                        player.onCollide(boundary.name, () => {
                            player.isInDialog = true;

                            displayDialog(
                                dialogData[boundary.name],
                                () => (player.isInDialog = false)
                            );
                        });
                    }
                }
                
                continue;
            }

            if (layer.name == "Spawnpoint") {
                for (const entity of layer.objects) {
                    if (entity.name == "player") {
                        player.pos = k.vec2(
                            (map.pos.x + entity.x) * scaleFactor,
                            (map.pos.y + entity.y) * scaleFactor
                        );
                        k.add(player);
                        continue;
                    }
                }
            }
        }

        setCamScale(k)

        k.onResize(() => {
            setCamScale(k);
        });

        k.onUpdate(() => {
            k.camPos(player.pos.x, player.pos.y + 100);
        });

        // Player movement
        k.onMouseDown((mouseBtn) => {
            if (mouseBtn !== "left" || player.isInDialog)
                return;

            const worldMousePos = k.toWorld(k.mousePos());
            player.moveTo(worldMousePos, player.speed);

            const mouseAngle = player.pos.angle(worldMousePos);
            const lowerBound = 50;
            const upperBound = 125;

            // Up
            if (mouseAngle > lowerBound && 
                mouseAngle < upperBound && 
                player.curAnim() !== "walk-up") {

                player.play("walk-up");
                player.direction = "up";
                return;
            }

            // Down
            if (mouseAngle < -lowerBound &&
                mouseAngle > -upperBound &&
                player.curAnim() !== "walk-down") {

                player.play("walk-down");
                player.direction = "down";
                return;
                }

            // Right
            if (Math.abs(mouseAngle) > upperBound) {
                player.flipX = false;

                if (player.curAnim() !== "walk-side") {
                    player.play("walk-side");
                    player.direction = "right";
                    return;
                }
            }

            // Left
            if (Math.abs(mouseAngle) < lowerBound) {
                player.flipX = true;

                if (player.curAnim() !== "walk-side") {
                    player.play("walk-side");
                    player.direction = "left";
                    return;
                }
            }
        });

        // Stops walking animation
        k.onMouseRelease(() => {
            if (player.direction === "down") {
                player.play("idle-down");
                return;
            }

            if (player.direction === "up") {
                player.play("idle-up");
                return;
            }

            player.play("idle-side");
        });
    });

    k.go ("main");

});

// Wait for the DOM to load before querying elements
window.addEventListener('DOMContentLoaded', (event) => {
    
    // Closes the contact form when the page loads
    closeContactForm();
    
    // Gets contact form buttons
    const openButton = document.querySelector('.ui-popup-button');
    const closeButton = document.querySelector('#closeContactFormButton');

    // Check if the elements exist before adding event listeners
    if (openButton) {
        openButton.addEventListener('click', openContactForm);
    } else {
        console.error("Element with class '.ui-popup-button' not found");
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeContactForm);
    } else {
        console.error("Element with id 'closeContactFormButton' not found");
    }
});
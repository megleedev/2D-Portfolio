import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialog } from "./utils";

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
                        displayDialog("TODO", () => player.isInDialog = false)
                    });
                }
            }
            continue;
        }

        if (layer.name == "Spawnpoint") {
            console.log("Hello");
            for (const entitiy of layer.objects) {
                if (entitiy.name == "player") {
                    player.pos = k.vec2(
                        (map.pos.x + entitiy.x) * scaleFactor,
                        (map.pos.y + entitiy.y) * scaleFactor
                    );
                    k.add(player);
                    continue;
                }
            }
        }
    }

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });
});

k.go ("main");
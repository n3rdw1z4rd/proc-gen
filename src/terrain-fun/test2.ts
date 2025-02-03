import { ThreeJsBoilerPlate } from '../utils/threejs-boiler-plate';
import { rng } from '../utils/rng';

rng.seed = 42;

const eng = new ThreeJsBoilerPlate();
eng.appendTo(document.getElementById('ROOT')!);

eng.setupBasicScene({
    onFrame: (deltaTime: number) => {
        eng.clock.showStats({
            cameraZ: eng.camera.position.z.toFixed(2),
        });
    }
});

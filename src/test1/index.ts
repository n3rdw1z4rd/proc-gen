import { ThreeJsDevelopmentEnvironment } from './dev-env';
import { VoxelWorld } from './voxel-world';

const env = new ThreeJsDevelopmentEnvironment(document.getElementById('ROOT_DIV')!);

const world = new VoxelWorld();

env.clock.run((deltaTime: number) => {
    env.resize();

    // update scene:

    env.controls.update(deltaTime);
    env.renderer.render(env.scene, env.camera);
    env.clock.showStats({});
});
import { useEffect, useRef, useState } from "react";
import * as BABYLON from 'babylonjs';
import * as CANNON from 'cannon';
import 'babylonjs-loaders';

function GameEngine() {
    const [once, setOnce] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [beta, setBeta] = useState<number>(0);
    const [gamma, setGamma] = useState<number>(0);

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(!once) return;
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }
      
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // 캔버스와 엔진 초기화
        const canvas = canvasRef.current as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas, true);
    
        // 씬 생성 함수
        const createScene = (): BABYLON.Scene => {
            const scene = new BABYLON.Scene(engine);
            
            // 카메라 생성
            const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);
            
            // 라이트 생성
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    
            // Cannon.js 물리 엔진 설정
            const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
            const physicsPlugin = new BABYLON.CannonJSPlugin(true, 10, CANNON);
            scene.enablePhysics(gravityVector, physicsPlugin);
    
            // 지면 생성
            const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 0.9 }, scene);
    
            // 플레이어 생성
            const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
            player.position.y = 5;
            player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);

            // 플레이어 이동
            window.addEventListener('deviceorientation', (e) => {
                const { beta, gamma } = e;
                if (!beta || !gamma) return;
                player.position.x += gamma / 100;
                player.position.z += beta / 100;
                setBeta(beta);
                setGamma(gamma);
            });
            
            return scene;
        }
    
        // 씬 생성 및 렌더 루프 설정
        const scene = createScene();
        engine.runRenderLoop(() => {
            scene.render();
        });
    
        // 브라우저 창 크기 조정 시 씬 크기 조정
        window.addEventListener('resize', () => {
            engine.resize();
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            engine.stopRenderLoop();
        }
    }, [once]);

    return (<>
        {/* layout */}
        <div className="fixed top-0 left-0 w-full h-full bg-black z-10">
            {/* display accelermeter */}
            <div className="fixed top-0 left-0 w-full h-20 bg-black z-10">
                <div className="flex flex-row items-center justify-center w-full h-full">
                    <div className="flex-1 w-full h-full flex flex-row items-center justify-center">
                        <div className="text-white text-2xl">beta: {beta}</div>
                        <div className="text-white text-2xl">gamma: {gamma}</div>
                    </div>
                </div>
            </div>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </>);
}

export default GameEngine;
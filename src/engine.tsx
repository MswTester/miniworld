import { useEffect, useRef, useState } from "react";
import * as BABYLON from 'babylonjs';
import * as CANNON from 'cannon';
import 'babylonjs-loaders';

function GameEngine() {
    const [once, setOnce] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [beta, setBeta] = useState<number>(0);
    const [gamma, setGamma] = useState<number>(0);
    const [acceleration, setAcceleration] = useState<{ x: number|null, y: number|null, z: number|null }>({ x: 0, y: 0, z: 0 });

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(!once) return;
        let lastGamma = 0;
        let lastBeta = 0;
        let dGamma = 0;
        let dBeta = 0;

        // 캔버스와 엔진 초기화
        const canvas = canvasRef.current as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas, true);
    
        // 씬 생성 함수
        const createScene = (): BABYLON.Scene => {
            const scene = new BABYLON.Scene(engine);
            
            // 카메라 생성
            const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, false);
            
            // 라이트 생성
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    
            // Cannon.js 물리 엔진 설정
            const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
            const physicsPlugin = new BABYLON.CannonJSPlugin(true, 10, CANNON);
            scene.enablePhysics(gravityVector, physicsPlugin);
    
            // 지면 생성
            const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 0.9 }, scene);

            // 캐릭터 생성
            const player = BABYLON.MeshBuilder.CreateCylinder("player", { height: 2, diameterTop: 1, diameterBottom: 1 }, scene);
            player.position.y = 0.5;
            player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0.9 }, scene);

            scene.registerBeforeRender(() => {
                // 카메라 위치 설정
                camera.target = player.position;
            });

            scene.onBeforeRenderObservable.add(() => {
                // 원통의 회전을 0으로 고정
                player.rotationQuaternion = BABYLON.Quaternion.Identity();
            });

            return scene;
        }

        // 디바이스 방향 센서 이벤트 리스너
        window.addEventListener('deviceorientation', (event) => {
            let { beta, gamma } = event;
            beta = beta ? beta : 0;
            gamma = gamma ? gamma : 0;
            setBeta(beta);
            setGamma(gamma);
            dGamma = gamma - lastGamma;
            dBeta = beta - lastBeta;
            lastGamma = gamma;
            lastBeta = beta;
        });

        // 가속도 센서에 따른 카메라 회전
        const updateCamera = () => {
            const camera = engine.scenes[0].activeCamera as BABYLON.ArcRotateCamera;
            camera.alpha += dGamma / 100;
            camera.beta += dBeta / 100;
        }
        
        // 캔버스 크기 조정 함수
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            engine.resize();
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    
        // 씬 생성 및 렌더 루프 설정
        const scene = createScene();
        engine.runRenderLoop(() => {
            scene.render();
            updateCamera();
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            engine.stopRenderLoop();
        }
    }, [once]);

    return (<>
        {/* layout */}
        <div className="fixed top-0 left-0 w-full h-full bg-transparent flex flex-col justify-start items-start text-white">
            <div>Gamma : {gamma}</div>
            <div>Beta : {beta}</div>
            <div>X : {acceleration.x}</div>
            <div>Y : {acceleration.y}</div>
            <div>Z : {acceleration.z}</div>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </>);
}

export default GameEngine;
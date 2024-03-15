import { useEffect, useRef, useState } from "react";
import * as BABYLON from 'babylonjs';
import * as CANNON from 'cannon';
import 'babylonjs-loaders';

function calculateCircularDifference(value1:number, value2:number, range:number, offset:number = 0) {
    value1 += offset;
    value2 += offset;
    let diff = value2 - value1;
    // 값이 긍정적인 방향으로 순환하는 경우
    if (diff > range / 2) {
        diff -= range;
    }
    // 값이 부정적인 방향으로 순환하는 경우
    else if (diff < -range / 2) {
        diff += range;
    }
    return diff;
}

function GameEngine() {
    const [once, setOnce] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [beta, setBeta] = useState<number>(0);
    const [gamma, setGamma] = useState<number>(0);
    const [alpha, setAlpha] = useState<number>(0);
    const [gammaDiff, setGammaDiff] = useState<number>(0);

    useEffect(() => setOnce(true), [])
    useEffect(() => {
        if(!once) return;
        let lastGamma = 0;
        let lastBeta = 0;
        let lastAlpha = 0;
        let dGamma = 0;
        let dBeta = 0;
        let dAlpha = 0;

        // 캔버스와 엔진 초기화
        const canvas = canvasRef.current as HTMLCanvasElement;
        const engine = new BABYLON.Engine(canvas, true);
    
        // 씬 생성 함수
        const createScene = (): BABYLON.Scene => {
            const scene = new BABYLON.Scene(engine);
            
            // 카메라 생성
            const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, false);
            camera.radius = 10;
            
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
            player.position.y = 2;
            player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0 }, scene);

            scene.registerBeforeRender(() => {
                // 카메라 위치 설정
                let last = camera.target.clone();
                camera.target = player.position;
                let diff = camera.target.subtract(last);
                camera.position = camera.position.add(diff);
            });

            scene.onBeforeRenderObservable.add(() => {
                // 원통의 회전을 0으로 고정
                player.rotationQuaternion = BABYLON.Quaternion.Identity();
            });

            return scene;
        }

        // 디바이스 방향 센서 이벤트 리스너
        const deviceOrientationHandler = (event: DeviceOrientationEvent) => {
            let { beta, gamma, alpha } = event;
            beta = beta ? beta : 0;
            gamma = gamma ? gamma : 0;
            alpha = alpha ? alpha : 0;
            setBeta(beta);
            setGamma(gamma);
            setAlpha(alpha);
            dGamma = calculateCircularDifference(lastGamma, gamma, 180, 90);
            dBeta = calculateCircularDifference(lastBeta, beta, 180, 90);
            dAlpha = calculateCircularDifference(lastAlpha, alpha, 360);
            lastGamma = gamma;
            lastBeta = beta;
            lastAlpha = alpha;
            setGammaDiff(dGamma);
        }
        window.addEventListener('deviceorientation', deviceOrientationHandler);

        // 가속도 센서에 따른 카메라 회전
        const updateCamera = () => {
            const camera = engine.scenes[0].activeCamera as BABYLON.ArcRotateCamera;
            camera.alpha += dAlpha / 50;
            camera.beta -= dGamma / 50;
        }

        const updatePlayer = () => {
            const player = engine.scenes[0].getMeshByName("player") as BABYLON.Mesh;
            const camera = engine.scenes[0].activeCamera as BABYLON.ArcRotateCamera;
            let dx = (camera.target.x - camera.position.x)
            let dz = (camera.target.z - camera.position.z)
            let angle = Math.atan2(dz, dx);
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

        // 화면 터치 이벤트 리스너
        const touchHandler = (event: TouchEvent) => {
            [...event.touches].forEach((touch, index) => {
            });
        }
        window.addEventListener('touchstart', touchHandler);
        window.addEventListener('touchmove', touchHandler);
        window.addEventListener('touchend', touchHandler);
    
        // 씬 생성 및 렌더 루프 설정
        const scene = createScene();
        engine.runRenderLoop(() => {
            scene.render();
            updateCamera();
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            window.removeEventListener('touchstart', touchHandler);
            window.removeEventListener('touchmove', touchHandler);
            window.removeEventListener('touchend', touchHandler);
            engine.stopRenderLoop();
        }
    }, [once]);

    return (<>
        {/* layout */}
        <div className="fixed top-0 left-0 w-full h-full bg-transparent flex flex-row justify-start items-start text-white">
            <div>Gamma : {gammaDiff}</div>
            <div className="absolute bottom-3 right-3 bg-[#ffffff22] w-12 h-12 rounded-full"
            onClick={e => navigator.vibrate(1000)}
            ></div>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </>);
}

export default GameEngine;
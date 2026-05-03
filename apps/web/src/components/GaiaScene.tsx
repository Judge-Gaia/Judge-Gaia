import { useEffect, useRef } from "react";
import * as THREE from "three";

type GaiaSceneProps = {
  className?: string;
};

export function GaiaScene({ className = "gaiaScene" }: GaiaSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    // React는 DOM을 직접 그리지만, Three.js는 별도의 렌더 루프를 가진다.
    // 그래서 이 컴포넌트에서는 DOM 컨테이너를 확보한 뒤, 그 안에 3D 캔버스를 직접 붙인다.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.2);

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      const fallback = document.createElement("div");
      fallback.className = "globeFallback";
      fallback.setAttribute("aria-hidden", "true");
      container.appendChild(fallback);

      return () => {
        container.removeChild(fallback);
      };
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    scene.add(globe);

    const sphereGeometry = new THREE.SphereGeometry(1.55, 96, 96);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: "#032a44",
      emissive: "#001c30",
      emissiveIntensity: 0.55,
      roughness: 0.72,
      metalness: 0.08
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globe.add(sphere);

    const wireGeometry = new THREE.SphereGeometry(1.565, 48, 48);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: "#78a9ff",
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    globe.add(wire);

    const landGeometry = new THREE.BufferGeometry();
    const landPoints = createLandPoints();
    landGeometry.setAttribute("position", new THREE.Float32BufferAttribute(landPoints, 3));
    const landMaterial = new THREE.PointsMaterial({
      color: "#56c02b",
      size: 0.025,
      transparent: true,
      opacity: 0.78
    });
    const land = new THREE.Points(landGeometry, landMaterial);
    globe.add(land);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.92, 0.009, 12, 160),
      new THREE.MeshBasicMaterial({ color: "#4589ff", transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2.7;
    globe.add(ring);

    scene.add(new THREE.AmbientLight("#ffffff", 0.58));

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
    keyLight.position.set(2.5, 3, 4);
    scene.add(keyLight);

    const pointerState = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      velocityX: 0.0028,
      velocityY: 0
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerState.dragging = true;
      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
      container.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerState.dragging) {
        return;
      }

      const deltaX = event.clientX - pointerState.lastX;
      const deltaY = event.clientY - pointerState.lastY;

      // 드래그 중에는 화면 상태를 React state로 바꾸지 않고, 3D 오브젝트만 즉시 회전시킨다.
      // 이렇게 하면 60fps에 가까운 부드러운 인터랙션을 유지할 수 있다.
      globe.rotation.y += deltaX * 0.006;
      globe.rotation.x += deltaY * 0.004;
      pointerState.velocityX = deltaX * 0.0008;
      pointerState.velocityY = deltaY * 0.0006;
      pointerState.lastX = event.clientX;
      pointerState.lastY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      pointerState.dragging = false;
      container.releasePointerCapture(event.pointerId);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      // 휠/트랙패드 입력으로 카메라 거리를 조절해 줌 인터랙션을 만든다.
      // clamp를 써서 카메라가 너무 멀거나 너무 가까워지지 않게 제한한다.
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.002, 2.6, 5.2);
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    let frameId = 0;
    const animate = () => {
      if (!pointerState.dragging) {
        globe.rotation.y += pointerState.velocityX;
        globe.rotation.x += pointerState.velocityY;
        pointerState.velocityX = THREE.MathUtils.lerp(pointerState.velocityX, 0.0028, 0.012);
        pointerState.velocityY *= 0.96;
      }

      ring.rotation.z -= 0.0025;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      landGeometry.dispose();
      landMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={className} ref={containerRef} aria-label="Interactive 3D Earth" />;
}

function createLandPoints() {
  const points: number[] = [];
  const clusters = [
    { lat: 45, lon: -100, radius: 28, count: 180 },
    { lat: -15, lon: -60, radius: 24, count: 140 },
    { lat: 8, lon: 20, radius: 26, count: 170 },
    { lat: 50, lon: 70, radius: 34, count: 220 },
    { lat: 22, lon: 105, radius: 20, count: 130 },
    { lat: -25, lon: 135, radius: 18, count: 80 }
  ];

  for (const cluster of clusters) {
    for (let index = 0; index < cluster.count; index += 1) {
      const lat = cluster.lat + (Math.random() - 0.5) * cluster.radius;
      const lon = cluster.lon + (Math.random() - 0.5) * cluster.radius * 1.6;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 180);
      const radius = 1.585;

      points.push(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
  }

  return points;
}

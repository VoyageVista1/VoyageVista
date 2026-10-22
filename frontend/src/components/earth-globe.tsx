import { Html, Line, OrbitControls, Stars } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { CityMap, type CityMapPhase } from "./city-map"
import "./earth-globe.css"

type Location = {
  id: string
  city: string
  country: string
  lat: number
  lon: number
  description: string
}
type RouteMode = "idle" | "destination-selected" | "selecting-origin" | "route-ready"
const locations: Location[] = [
  {
    id: "amsterdam",
    city: "Amsterdam",
    country: "Nederland",
    lat: 52.3676,
    lon: 4.9041,
    description:
      "Fietsen langs het water, design en kleine tafels aan de gracht.",
  },
  {
    id: "lisbon",
    city: "Lissabon",
    country: "Portugal",
    lat: 38.7223,
    lon: -9.1393,
    description: "Licht, tegels en een stad die altijd naar de oceaan kijkt.",
  },
  {
    id: "new-york",
    city: "New York",
    country: "Verenigde Staten",
    lat: 40.7128,
    lon: -74.006,
    description: "City energy, skyline views and a thousand ways to get lost.",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lon: 139.6503,
    description: "Neon nights, quiet shrines and the fastest slow mornings.",
  },
  {
    id: "willemstad",
    city: "Willemstad",
    country: "Curaçao",
    lat: 12.1696,
    lon: -68.99,
    description: "Colourful streets, warm water and space to breathe.",
  },
  {
    id: "cape-town",
    city: "Kaapstad",
    country: "Zuid-Afrika",
    lat: -33.9249,
    lon: 18.4241,
    description: "Ocean roads, mountain air and a wild edge to the city.",
  },
  {
    id: "reykjavik",
    city: "Reykjavik",
    country: "IJsland",
    lat: 64.1466,
    lon: -21.9426,
    description: "Open skies, geothermal water and the long way around.",
  },
  {
    id: "bali",
    city: "Bali",
    country: "Indonesië",
    lat: -8.4095,
    lon: 115.1889,
    description: "Rice terraces, salt air and a slower rhythm.",
  },
]

function vector(lat: number, lon: number, radius = 1.22) {
  const phi = ((90 - lat) * Math.PI) / 180,
    theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function routePoints(origin: Location, destination: Location) {
  const start = vector(origin.lat, origin.lon, 1).normalize()
  const end = vector(destination.lat, destination.lon, 1).normalize()
  const rotation = new THREE.Quaternion().setFromUnitVectors(start, end)
  const angle = start.angleTo(end)
  const points: THREE.Vector3[] = []
  for (let index = 0; index <= 80; index += 1) {
    const progress = index / 80
    const point = start.clone().applyQuaternion(
      new THREE.Quaternion().identity().slerp(rotation, progress),
    )
    const lift = Math.sin(Math.PI * progress) * Math.min(0.16, 0.045 + angle * 0.045)
    points.push(point.normalize().multiplyScalar(1.235 + lift))
  }
  return points
}
function ease(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
}

function createEarthFallbackTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 1200
  canvas.height = 600
  const context = canvas.getContext("2d")
  if (!context) return null
  const ocean = context.createLinearGradient(0, 0, 0, canvas.height)
  ocean.addColorStop(0, "#173f66")
  ocean.addColorStop(0.5, "#0c7893")
  ocean.addColorStop(1, "#083552")
  context.fillStyle = ocean
  context.fillRect(0, 0, canvas.width, canvas.height)
  const land = [
    [
      [110, 105],
      [180, 62],
      [254, 89],
      [281, 143],
      [231, 180],
      [183, 158],
      [142, 191],
      [104, 153],
    ],
    [
      [278, 206],
      [327, 221],
      [349, 283],
      [316, 382],
      [276, 326],
      [259, 257],
    ],
    [
      [431, 92],
      [504, 61],
      [584, 91],
      [625, 132],
      [581, 172],
      [525, 158],
      [481, 198],
      [438, 154],
    ],
    [
      [500, 202],
      [555, 195],
      [598, 237],
      [570, 330],
      [519, 314],
      [485, 251],
    ],
    [
      [634, 139],
      [723, 124],
      [808, 170],
      [854, 224],
      [791, 248],
      [711, 215],
      [662, 241],
      [624, 193],
    ],
    [
      [840, 311],
      [920, 290],
      [989, 320],
      [965, 370],
      [884, 375],
    ],
  ]
  context.fillStyle = "#5a9b72"
  context.strokeStyle = "#9bc487"
  context.lineWidth = 3
  land.forEach((polygon) => {
    context.beginPath()
    polygon.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.closePath()
    context.fill()
    context.stroke()
  })
  context.globalAlpha = 0.2
  context.strokeStyle = "#c5eff0"
  context.lineWidth = 1
  for (let x = 0; x < canvas.width; x += 75) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, canvas.height)
    context.stroke()
  }
  for (let y = 0; y < canvas.height; y += 75) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(canvas.width, y)
    context.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function Marker({
  location,
  selected,
  locked,
  select,
}: {
  location: Location
  selected: boolean
  locked: boolean
  select: (location: Location) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const point = useMemo(() => vector(location.lat, location.lon), [location])
  useFrame(({ camera, clock }) => {
    if (!ref.current) return
    const pos = new THREE.Vector3()
    ref.current.getWorldPosition(pos)
    ref.current.visible =
      pos.normalize().dot(camera.position.clone().sub(pos).normalize()) > -0.03
    ref.current.scale.setScalar(
      locked ? 1 + Math.sin(clock.elapsedTime * 8) * 0.16 : 1,
    )
  })
  return (
    <group ref={ref} position={point}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: React Three Fiber meshes are canvas targets, not static DOM elements. */}
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          select(location)
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default"
        }}
      >
        <sphereGeometry args={[selected || locked ? 0.052 : 0.032, 14, 14]} />
        <meshBasicMaterial color={locked ? "#f6c978" : selected ? "#8fe0c0" : "#f4f8f7"} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[selected || locked ? 0.078 : 0.052, selected || locked ? 0.085 : 0.057, 24]}
        />
        <meshBasicMaterial
          color={locked ? "#f6c978" : selected ? "#8fe0c0" : "#c96f5d"}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {(selected || locked) && (
        <Html distanceFactor={5} center className="vv-marker-label">
          {locked ? `From · ${location.city}` : location.city}
        </Html>
      )}
    </group>
  )
}

function Scene({
  selected,
  origin,
  select,
  setPhase,
  setTravelling,
}: {
  selected: Location | null
  origin: Location | null
  select: (location: Location) => void
  setPhase: (phase: CityMapPhase) => void
  setTravelling: (value: boolean) => void
}) {
  const earth = useRef<THREE.Group>(null),
    clouds = useRef<THREE.Mesh>(null),
    controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const motion = useRef({
    stage: "idle" as "idle" | "moving",
    started: 0,
    duration: 1750,
    startQ: new THREE.Quaternion(),
    endQ: new THREE.Quaternion(),
    start: new THREE.Vector3(),
    end: new THREE.Vector3(0, 0, 4.25),
  })
  const hasMounted = useRef(false)
  const [texture, setTexture] = useState<THREE.Texture | null>(() =>
    createEarthFallbackTexture(),
  )
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin("anonymous")
    loader.load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace
        setTexture(loaded)
      },
      undefined,
      () => undefined,
    )
  }, [])
  useEffect(() => {
    if (!earth.current) return
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    const state = motion.current
    state.stage = "moving"
    state.started = performance.now()
    state.duration = 1750
    state.startQ.copy(earth.current.quaternion)
    if (selected) {
      state.endQ.setFromUnitVectors(
        vector(selected.lat, selected.lon, 1).normalize(),
        new THREE.Vector3(0, 0, 1),
      )
    } else state.endQ.identity()
    state.start.copy(camera.position)
    // One calm, continuous movement, as in the original prototype.
    state.end.set(selected ? 0.16 : 0, selected ? 0.08 : 0, selected ? 3.15 : 4.25)
    setPhase(selected ? "finding" : "global")
    setTravelling(true)
  }, [selected, camera, setPhase, setTravelling])
  useFrame(({ clock }, delta) => {
    if (clouds.current) clouds.current.rotation.y = clock.elapsedTime * 0.018
    if (!earth.current) return
    const state = motion.current
    if (state.stage === "idle") {
      if (!selected) earth.current.rotation.y += delta * 0.025
      return
    }
    const raw = Math.min(
      1,
      (performance.now() - state.started) / state.duration,
    )
    earth.current.quaternion.slerpQuaternions(
      state.startQ,
      state.endQ,
      ease(raw),
    )
    camera.position.lerpVectors(state.start, state.end, ease(raw))
    camera.lookAt(0, 0, 0)
    if (raw < 1) return
    state.stage = "idle"
    setPhase(selected ? "arrived" : "global")
    setTravelling(false)
  })
  return (
    <>
      <color attach="background" args={["#030b17"]} />
      <ambientLight intensity={0.38} color="#9dc6df" />
      <directionalLight position={[-4, 2, 5]} intensity={2.3} color="#fff6e8" />
      <Stars radius={80} depth={40} count={1600} factor={2} fade />
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[1.2, 80, 80]} />
          <meshPhongMaterial
            map={texture ?? undefined}
            color="#ffffff"
            shininess={18}
          />
        </mesh>
        <mesh ref={clouds} scale={1.015}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshBasicMaterial
            color="#d6edf7"
            transparent
            opacity={0.09}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshBasicMaterial
            color="#68b9e8"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {locations.map((location) => (
          <Marker
            key={location.id}
            location={location}
            selected={selected?.id === location.id}
            locked={origin?.id === location.id}
            select={select}
          />
        ))}
        {origin && selected && (
          <Line
            points={routePoints(origin, selected)}
            color="#f6c978"
            lineWidth={2.4}
            transparent
            opacity={0.9}
            dashed
            dashSize={0.035}
            gapSize={0.022}
          />
        )}
      </group>
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        enablePan={false}
        minDistance={2.9}
        maxDistance={6.2}
        enabled={motion.current.stage === "idle"}
      />
    </>
  )
}

export default function EarthGlobe() {
  const [selected, setSelected] = useState<Location | null>(null),
    [origin, setOrigin] = useState<Location | null>(null),
    [mode, setMode] = useState<RouteMode>("idle"),
    [query, setQuery] = useState(""),
    [phase, setPhase] = useState<CityMapPhase>("global"),
    [travelling, setTravelling] = useState(false)
  const results =
    query.trim().length < 2
      ? []
      : locations.filter((place) =>
          `${place.city} ${place.country}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
  const select = (location: Location) => {
    if (mode === "selecting-origin") {
      if (selected?.id === location.id) return
      setOrigin(location)
      setMode("route-ready")
      setPhase("locked")
    } else {
      setPhase("finding")
      setSelected(location)
      setOrigin(null)
      setMode("destination-selected")
    }
    setQuery("")
  }
  const reset = () => {
    setSelected(null)
    setOrigin(null)
    setMode("idle")
    setPhase("global")
    setTravelling(false)
  }
  const startRoute = () => {
    if (!selected) return
    setOrigin(null)
    setMode("selecting-origin")
    setPhase("locked")
  }
  return (
    <section className="vv-globe" aria-labelledby="vv-globe-title">
      <header>
        <div>
          <p>VoyageVista planetary routes</p>
          <h2 id="vv-globe-title">
            The world is
            <br />
            <em>already calling.</em>
          </h2>
        </div>
        <span>
          <i /> Live 3D atlas
        </span>
      </header>
      <div className={`vv-stage vv-stage--${phase} vv-stage--${mode}`}>
        <Canvas
          camera={{ position: [0, 0, 4.25], fov: 38 }}
          dpr={[1, 1.7]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Scene
            selected={selected}
            origin={origin}
            select={select}
            setPhase={setPhase}
            setTravelling={setTravelling}
          />
        </Canvas>
        <div className="vv-search">
          <label htmlFor="vv-search">Find a place</label>
          <div>
            <Search size={16} />
            <input
              id="vv-search"
              placeholder="Search city or country"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          {results.length > 0 && (
            <section>
              {results.map((location) => (
                <button
                  type="button"
                  key={location.id}
                  onClick={() => select(location)}
                >
                  <span>
                    {location.city}
                    <small>{location.country}</small>
                  </span>
                  ↗
                </button>
              ))}
            </section>
          )}
        </div>
        {selected && (
          <div className="vv-status" aria-live="polite">
            {mode === "selecting-origin"
              ? "Select your departure city"
              : mode === "route-ready"
                ? "Route ready · drag to explore"
                : phase === "finding"
              ? `Locating ${selected.city}`
              : phase === "locked"
                ? `Destination locked · ${selected.city}`
                : phase === "approach"
                  ? `Approaching ${selected.city}`
                  : `${selected.city} · arrived`}
          </div>
        )}
        <div className="vv-controls">
          <button
            type="button"
            onClick={reset}
            disabled={!selected && !travelling}
          >
            Global view
          </button>
          <span>
            {travelling
              ? "Travelling…"
              : selected
                ? `Viewing ${selected.city}`
                : "Drag to rotate · scroll to zoom"}
          </span>
        </div>
        {selected && (
          <aside className="vv-info">
            <CityMap
              city={selected.city}
              latitude={selected.lat}
              longitude={selected.lon}
              phase={phase}
            />
            <div>
              <p>{mode === "route-ready" ? "Destination" : "Selected destination"}</p>
              <h3>{selected.city}</h3>
              <span>{selected.country}</span>
              <article>{mode === "selecting-origin" ? "Now choose the city you will depart from." : selected.description}</article>
              {mode === "route-ready" && origin ? (
                <div className="vv-route-summary"><div><small>FROM</small><strong>{origin.city}</strong></div><b>→</b><div><small>TO</small><strong>{selected.city}</strong></div></div>
              ) : (
                <dl>
                  <div><dt>LAT</dt><dd>{selected.lat.toFixed(4)}°</dd></div>
                  <div><dt>LON</dt><dd>{selected.lon.toFixed(4)}°</dd></div>
                </dl>
              )}
              {mode === "destination-selected" && <button type="button" onClick={startRoute}>Fly there ↗</button>}
              {mode === "selecting-origin" && <button type="button" onClick={() => setMode("destination-selected")}>Choose another destination ↗</button>}
              {mode === "route-ready" && <button type="button" onClick={reset}>Change route ↗</button>}
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

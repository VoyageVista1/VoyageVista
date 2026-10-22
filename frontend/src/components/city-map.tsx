import L from "leaflet"
import { Maximize2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "./earth-globe.css"

export type CityMapPhase =
  | "global"
  | "finding"
  | "locked"
  | "approach"
  | "arrived"

type CityMapProps = {
  city: string
  latitude: number
  longitude: number
  phase?: CityMapPhase
}
const pin = L.divIcon({
  className: "vv-map-pin-shell",
  html: '<span class="vv-map-pin"><i /></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function Focus({
  latitude,
  longitude,
  phase,
  compact,
}: CityMapProps & { compact: boolean }) {
  const map = useMap()
  useEffect(() => {
    const zoom = compact
      ? phase === "approach" || phase === "arrived"
        ? 10
        : 8
      : 12
    map.flyTo([latitude, longitude], zoom, { animate: true, duration: 0.85 })
  }, [compact, latitude, longitude, map, phase])
  return null
}

function CityMapCanvas({
  city,
  latitude,
  longitude,
  phase = "global",
  compact,
}: CityMapProps & { compact: boolean }) {
  const center = useMemo<[number, number]>(
    () => [latitude, longitude],
    [latitude, longitude],
  )
  return (
    <MapContainer
      key={`${city}-${compact}`}
      center={center}
      zoom={compact ? 8 : 12}
      minZoom={3}
      scrollWheelZoom
      className="vv-leaflet"
      zoomControl={false}
      aria-label={`${city} map`}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ZoomControl position="bottomright" />
      <Marker position={center} icon={pin} title={city} />
      <Focus
        city={city}
        latitude={latitude}
        longitude={longitude}
        phase={phase}
        compact={compact}
      />
    </MapContainer>
  )
}

export function CityMap({ city, latitude, longitude, phase }: CityMapProps) {
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!expanded) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false)
    }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [expanded])
  return (
    <>
      <div className="vv-map-frame">
        <CityMapCanvas
          city={city}
          latitude={latitude}
          longitude={longitude}
          phase={phase}
          compact
        />
        <div className="vv-map-overlay">
          <span>{phase === "approach" ? "Approaching" : city}</span>
          <button
            type="button"
            aria-label={`Expand map of ${city}`}
            onClick={() => setExpanded(true)}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="vv-map-backdrop">
          <section
            className="vv-map-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${city} map`}
          >
            <header className="vv-map-modal-header">
              <div>
                <small>OpenStreetMap · live city map</small>
                <h2>{city}</h2>
              </div>
              <button
                type="button"
                aria-label="Close map"
                onClick={() => setExpanded(false)}
              >
                <X size={19} />
              </button>
            </header>
            <div className="vv-map-large">
              <CityMapCanvas
                city={city}
                latitude={latitude}
                longitude={longitude}
                phase={phase}
                compact={false}
              />
            </div>
          </section>
        </div>
      )}
    </>
  )
}

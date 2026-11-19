
import { useEffect, useState } from 'react'
import {
  MapContainer,
  ImageOverlay,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet'
import { CRS } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

const SIZE = 2048

const bounds: [[number, number], [number, number]] = [
  [0, 0],
  [SIZE, SIZE]
]


type KeyColor = 'blue' | 'purple' | 'gold' | 'red'

type KeyLocation = {
  id: string
  name: string
  aliases: string[]
  color?: KeyColor
  x: number | null
  y: number | null
  description: string
  image: string | null
  verified: boolean
  source: string
}

const KEY_COLORS: Record<KeyColor, string> = {
  blue: '#3B82F6',
  purple: '#A855F7',
  gold: '#EAB308',
  red: '#EF4444'
}


type Point = {
  x: number
  y: number
}

function MapController({
  selectedKey
}: {
  selectedKey: KeyLocation | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedKey &&
        selectedKey.x !== null &&
        selectedKey.y !== null) {
      map.flyTo(
        [SIZE - selectedKey.y, selectedKey.x],
        1,
        { duration: 1.2 }
      )
    }
  }, [selectedKey, map])

  return null
}

function ClickHandler({
  onClick
}: {
  onClick: (point: Point) => void
}) {
  useMapEvents({
    click(e) {
      onClick({
        x: Math.round(e.latlng.lng),
        y: Math.round(SIZE - e.latlng.lat)
      })
    }
  })

  return null
}

function App() {
  const [keys, setKeys] = useState<KeyLocation[]>([])
  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] =
    useState<KeyLocation | null>(null)
  const [clickedPoint, setClickedPoint] =
    useState<Point | null>(null)

  function copyCoordinates() {
  if (!clickedPoint) return

  const coordinates = JSON.stringify({
    x: clickedPoint.x,
    y: clickedPoint.y
  }, null, 2)

  navigator.clipboard.writeText(coordinates)
    .then(() => alert('坐标已复制！'))
    .catch(() => alert('复制失败，请手动记录坐标'))
}

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}keys.json`)
      .then(response => response.json())
      .then(data => setKeys(data))
      .catch(error => console.error(error))
  }, [])

  const results = query.trim()
    ? keys.filter(key => {
        const text = [
          key.name,
          ...(key.aliases ?? [])
        ].join(' ').toLowerCase()

        return text.includes(query.trim().toLowerCase())
      })
    : []

  function selectKey(key: KeyLocation) {
    setSelectedKey(key)
    setQuery(key.name)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>HAJIN DMZ MAP</h1>
        <p>交互式钥匙与地点查询地图</p>
      </header>

      <div className="search-panel">
        <input
          type="text"
          placeholder="搜索钥匙、区域或箱子..."
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setSelectedKey(null)
          }}
        />

        {results.length > 0 && (
          <div className="search-results">
            {results.map(key => (
              <button
                key={key.id}
                onClick={() => selectKey(key)}
              >
                <strong>{key.name}</strong>
                <span>
                  {key.color
                    ? ({
                        blue: '蓝色',
                        purple: '紫色',
                        gold: '金色',
                        red: '红色'
                      }[key.color] + '钥匙')
                    : '颜色未录入'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="map-wrapper">
        <MapContainer
          crs={CRS.Simple}
          center={[1024, 1024]}
          zoom={-1}
          minZoom={-3}
          maxZoom={2}
          scrollWheelZoom
          className="map"
        >
          <ImageOverlay
            url={`${import.meta.env.BASE_URL}maps/hajin.webp`}
            bounds={bounds}
          />

          <MapController selectedKey={selectedKey} />
          {import.meta.env.DEV && (
            <ClickHandler onClick={setClickedPoint} />
          )}
          
{/* 显示所有已经录入坐标的钥匙 */}
{keys
  .filter(key =>
    key.x !== null &&
    key.y !== null
  )
  .map(key => {
    const isSelected = selectedKey?.id === key.id

    const color = key.color
      ? KEY_COLORS[key.color]
      : '#94A3B8'

    return (
      <CircleMarker
        key={key.id}
        center={[
          SIZE - key.y!,
          key.x!
        ]}
        radius={isSelected ? 13 : 6}
        pathOptions={{
          color: isSelected ? '#ffffff' : color,
          weight: isSelected ? 4 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 1 : 0.85
        }}
      >
        <Popup>
          <strong>{key.name}</strong>
          <p>
            颜色：{
              key.color
                ? ({
                    blue: '蓝色',
                    purple: '紫色',
                    gold: '金色',
                    red: '红色'
                  }[key.color])
                : '未录入'
            }
          </p>
          {key.image && (
            <img
              src={`${import.meta.env.BASE_URL}${key.image}`}
              alt={key.name}
              style={{
                width: '220px',
                maxWidth: '100%',
                borderRadius: '6px'
              }}
            />
          )}
        </Popup>
      </CircleMarker>
    )
  })}


          {clickedPoint && (
            <CircleMarker
              center={[
                SIZE - clickedPoint.y,
                clickedPoint.x
              ]}
              radius={5}
              pathOptions={{ color: '#00ffcc' }}
            >
              <Popup>
                X: {clickedPoint.x}
                Y: {clickedPoint.y}
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </main>

      {import.meta.env.DEV && (
        <footer className="footer">
          {clickedPoint ? (
            <div className="coordinate-tools">
              <span>
                X: {clickedPoint.x} |
                Y: {clickedPoint.y}
              </span>

              <button onClick={copyCoordinates}>
                复制坐标
              </button>
            </div>
          ) : (
            <span>点击地图获取坐标</span>
          )}
        </footer>
      )}
    </div>
  )
}

export default App

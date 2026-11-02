import { MapContainer, Popup, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

function MapViewport({ userLocation, selectedShop, centerOnUserLocation }) {
  const map = useMap()

  useEffect(() => {
    const target = centerOnUserLocation && userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : selectedShop
        ? [Number(selectedShop.latitude), Number(selectedShop.longitude)]
        : null

    if (target) {
      map.setView(target, centerOnUserLocation && userLocation ? 13 : 15, { animate: true })
      const mapContainer = map.getContainer()
      mapContainer.dataset.centerLatitude = String(target[0])
      mapContainer.dataset.centerLongitude = String(target[1])
    }
  }, [centerOnUserLocation, map, selectedShop, userLocation])

  return null
}

function ShopMap({ userLocation = null, centerOnUserLocation = true, shops, selectedShopId, onSelectShop }) {
  const mappableShops = shops.filter((shop) => shop.latitude !== null
    && shop.latitude !== ''
    && shop.longitude !== null
    && shop.longitude !== ''
    && Number.isFinite(Number(shop.latitude))
    && Number(shop.latitude) >= -90
    && Number(shop.latitude) <= 90
    && Number.isFinite(Number(shop.longitude))
    && Number(shop.longitude) >= -180
    && Number(shop.longitude) <= 180)
  const selectedShop = mappableShops.find((shop) => shop.id === selectedShopId)
  const initialCenter = !centerOnUserLocation && selectedShop
      ? [Number(selectedShop.latitude), Number(selectedShop.longitude)]
      : userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : selectedShop
          ? [Number(selectedShop.latitude), Number(selectedShop.longitude)]
          : null

  if (!initialCenter) {
    return <div className="shop-map-wrap"><div className="empty-results"><MapPin size={24} /><p>Map coordinates are not available for this location.</p></div></div>
  }

  return (
    <div className="shop-map-wrap" data-user-latitude={userLocation?.latitude ?? ''} data-user-longitude={userLocation?.longitude ?? ''}>
      <MapContainer center={initialCenter} zoom={centerOnUserLocation && userLocation ? 13 : 15} scrollWheelZoom className="shop-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport userLocation={userLocation} selectedShop={selectedShop} centerOnUserLocation={centerOnUserLocation} />

        {userLocation && <CircleMarker
          center={[userLocation.latitude, userLocation.longitude]}
          radius={10}
          pathOptions={{ color: '#14213d', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
        >
          <Popup>Your detected location<br />{userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}</Popup>
        </CircleMarker>}

        {mappableShops.map((shop) => {
          const isRegistered = shop.isRegistered !== false
          const isSelected = shop.id === selectedShopId
          const markerStyle = isRegistered
            ? {
                color: isSelected ? '#f59e0b' : '#166534',
                fillColor: isSelected ? '#14213d' : '#22c55e',
              }
            : {
                color: isSelected ? '#f59e0b' : '#d97706',
                fillColor: isSelected ? '#14213d' : '#fbbf24',
              }

          return (
            <CircleMarker
              key={shop.id}
              center={[Number(shop.latitude), Number(shop.longitude)]}
              radius={isSelected ? 12 : 9}
              pathOptions={{ ...markerStyle, fillOpacity: 0.9 }}
              eventHandlers={{ click: () => onSelectShop(shop.id) }}
            >
              <Popup>
                <strong>{shop.name}</strong>
                <br />
                {shop.address || 'Nearby print shop'}
                <br />
                {shop.distance !== null && shop.distance !== undefined && Number.isFinite(Number(shop.distance))
                  ? `${Number(shop.distance).toFixed(2)} km away`
                  : 'Distance unavailable'}
                <br />
                <em>{isRegistered ? 'XeroQ registered shop' : 'Not registered on XeroQ'}</em>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="map-legend" aria-label="Map legend">
        {userLocation && <span><i className="map-legend-user" />Your location</span>}
        {mappableShops.some((shop) => shop.isRegistered !== false) && <span><i className="map-legend-shop" />XeroQ shop</span>}
        {selectedShop && <span><i className="map-legend-selected" />Selected shop</span>}
        {mappableShops.some((shop) => shop.isRegistered === false) && <span><i className="map-legend-nearby" />Nearby place</span>}
      </div>
    </div>
  )
}

export default ShopMap

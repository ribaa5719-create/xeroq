import { MapPin, X } from 'lucide-react'

const lowestValue = (shops, field) => Math.min(...shops.map((shop) => Number(shop[field])))

function ComparisonValue({ value, isHighlighted }) {
  return <span className={isHighlighted ? 'comparison-highlight' : ''}>{value}</span>
}

function ShopComparison({ shops, onRemove, onClose }) {
  const lowestBwPrice = lowestValue(shops, 'bwPrice')
  const lowestColorPrice = lowestValue(shops, 'colorPrice')
  const distances = shops
    .map((shop) => shop.distance)
    .filter((distance) => distance !== null && distance !== undefined && Number.isFinite(Number(distance)))
    .map(Number)
  const nearestDistance = distances.length ? Math.min(...distances) : null
  const hasDistanceData = nearestDistance !== null

  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <div className="comparison-header">
        <div>
          <span className="card-kicker">Side-by-side view</span>
          <h2 id="comparison-title">Compare shops</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close comparison" title="Close comparison">
          <X size={18} />
        </button>
      </div>

      <div className="comparison-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th scope="col">Details</th>
              {shops.map((shop) => (
                <th scope="col" key={shop.id}>
                  <div className="comparison-shop-heading">
                    <strong>{shop.name}</strong>
                    <button type="button" onClick={() => onRemove(shop.id)} aria-label={`Remove ${shop.name}`} title={`Remove ${shop.name}`}>
                      <X size={15} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row"><MapPin size={15} /> Distance</th>
              {shops.map((shop) => {
                const hasDistance = shop.distance !== null && shop.distance !== undefined && Number.isFinite(Number(shop.distance))
                return <td key={shop.id}><ComparisonValue
                  value={hasDistance ? `${Number(shop.distance).toFixed(2)} km` : 'Unavailable'}
                  isHighlighted={hasDistance && Number(shop.distance) === nearestDistance}
                /></td>
              })}
            </tr>
            <tr>
              <th scope="row">B/W price</th>
              {shops.map((shop) => <td key={shop.id}><ComparisonValue value={`₹${shop.bwPrice}/page`} isHighlighted={Number(shop.bwPrice) === lowestBwPrice} /></td>)}
            </tr>
            <tr>
              <th scope="row">Colour price</th>
              {shops.map((shop) => <td key={shop.id}><ComparisonValue value={`₹${shop.colorPrice}/page`} isHighlighted={Number(shop.colorPrice) === lowestColorPrice} /></td>)}
            </tr>
            <tr>
              <th scope="row">Availability</th>
              {shops.map((shop) => <td key={shop.id}><span className={`availability-label ${shop.availability}`}>{shop.availability}</span></td>)}
            </tr>
            <tr>
              <th scope="row">Working hours</th>
              {shops.map((shop) => <td key={shop.id}>{shop.openingTime} to {shop.closingTime}</td>)}
            </tr>
            <tr>
              <th scope="row">Address</th>
              {shops.map((shop) => <td key={shop.id}>{shop.address}, {shop.city}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="comparison-note">Highlighted values show the lowest available prices{hasDistanceData ? ' and nearest shop' : ''}. Queue and travel-time data are not exposed for public shop listings, so fastest-shop and best-overall recommendations are unavailable.</p>
    </section>
  )
}

export default ShopComparison

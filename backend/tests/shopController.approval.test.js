const test = require('node:test')
const assert = require('node:assert/strict')

const Shop = require('../models/Shop')
const User = require('../models/User')
const { createShop, getNearbyShops } = require('../controllers/shopController')

const makeResponse = () => ({
  statusCode: 200,
  payload: null,
  status(code) {
    this.statusCode = code
    return this
  },
  json(payload) {
    this.payload = payload
    return this
  },
})

test('createShop leaves new profiles pending admin approval', async () => {
  const originalFindById = User.findById
  const originalFindOne = Shop.findOne
  const originalCreate = Shop.create
  let createdPayload

  User.findById = async () => ({ role: 'shop_owner' })
  Shop.findOne = async () => null
  Shop.create = async (payload) => {
    createdPayload = payload
    return { _id: 'new-shop-id', ...payload }
  }

  try {
    const req = {
      user: { id: 'shop-owner-id' },
      body: {
        name: 'New Print Shop',
        address: '1 Market Road',
        city: 'Sample City',
        phone: '1234567890',
        latitude: 12.5,
        longitude: 77.5,
        openingTime: '09:00',
        closingTime: '18:00',
        bwPrice: 2,
        colorPrice: 5,
      },
    }
    const res = makeResponse()

    await createShop(req, res, (error) => {
      throw error
    })

    assert.equal(res.statusCode, 201)
    assert.equal(createdPayload.approvalStatus, 'pending')
    assert.equal(res.payload.shop.approvalStatus, 'pending')
  } finally {
    User.findById = originalFindById
    Shop.findOne = originalFindOne
    Shop.create = originalCreate
  }
})

test('getNearbyShops queries only admin-approved shops', async () => {
  const originalFind = Shop.find
  const query = { approvalStatus: 'approved' }
  const approvedShop = {
    _id: 'approved-shop-id',
    name: 'Approved Shop',
    address: '1 Market Road',
    city: 'Sample City',
    phone: '1234567890',
    latitude: 12.5,
    longitude: 77.5,
    bwPrice: 2,
    colorPrice: 5,
    ratingAverage: null,
    ratingCount: 0,
    availability: 'available',
    openingTime: '09:00',
    closingTime: '18:00',
    approvalStatus: 'approved',
  }
  let selectedFields

  Shop.find = (filter) => {
    assert.deepEqual(filter, query)
    return {
      select: async (fields) => {
        selectedFields = fields
        return [approvedShop]
      },
    }
  }

  try {
    const req = { query: { latitude: '12.5', longitude: '77.5', radius: '5' } }
    const res = makeResponse()

    await getNearbyShops(req, res, (error) => {
      throw error
    })

    assert.equal(res.statusCode, 200)
    assert.equal(res.payload.count, 1)
    assert.deepEqual(res.payload.shops.map((shop) => shop.name), ['Approved Shop'])
    assert.match(selectedFields, /approvalStatus/)
  } finally {
    Shop.find = originalFind
  }
})

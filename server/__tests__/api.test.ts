import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import session from 'express-session'
import { registerRoutes } from '../routes'

// Create test app
const createTestApp = async () => {
  const app = express()
  app.use(express.json())
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }))
  
  await registerRoutes(app)
  return app
}

describe('API Endpoints', () => {
  let app: express.Express

  beforeEach(() => {
    app = await createTestApp()
  })

  describe('GET /api/products', () => {
    it('returns list of products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('name')
        expect(response.body[0]).toHaveProperty('price')
      }
    })

    it('filters products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=sunflowers')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('searches products by query', async () => {
      const response = await request(app)
        .get('/api/products?search=crochet')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('GET /api/categories', () => {
    it('returns list of categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('name')
      }
    })
  })

  describe('Cart endpoints', () => {
    it('GET /api/cart returns empty cart initially', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('POST /api/cart adds item to cart', async () => {
      const cartItem = {
        productId: 1,
        quantity: 2
      }

      const response = await request(app)
        .post('/api/cart')
        .send(cartItem)
        .expect(201)

      expect(response.body).toHaveProperty('id')
    })

    it('POST /api/cart validates required fields', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('PATCH /api/cart/:id updates cart item quantity', async () => {
      // First add an item
      const addResponse = await request(app)
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 })

      const cartItemId = addResponse.body.id

      // Then update it
      const response = await request(app)
        .patch(`/api/cart/${cartItemId}`)
        .send({ quantity: 3 })
        .expect(200)

      expect(response.body).toHaveProperty('quantity', 3)
    })

    it('DELETE /api/cart/:id removes cart item', async () => {
      // First add an item
      const addResponse = await request(app)
        .post('/api/cart')
        .send({ productId: 1, quantity: 1 })

      const cartItemId = addResponse.body.id

      // Then delete it
      await request(app)
        .delete(`/api/cart/${cartItemId}`)
        .expect(200)
    })
  })

  describe('Wishlist endpoints', () => {
    it('GET /api/wishlist returns empty wishlist initially', async () => {
      const response = await request(app)
        .get('/api/wishlist')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('POST /api/wishlist adds item to wishlist', async () => {
      const wishlistItem = {
        productId: 1
      }

      const response = await request(app)
        .post('/api/wishlist')
        .send(wishlistItem)
        .expect(201)

      expect(response.body).toHaveProperty('id')
    })

    it('POST /api/wishlist validates productId', async () => {
      const response = await request(app)
        .post('/api/wishlist')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('DELETE /api/wishlist/:id removes wishlist item', async () => {
      // First add an item
      const addResponse = await request(app)
        .post('/api/wishlist')
        .send({ productId: 1 })

      const wishlistItemId = addResponse.body.id

      // Then delete it
      await request(app)
        .delete(`/api/wishlist/${wishlistItemId}`)
        .expect(200)
    })
  })

  describe('Contact endpoints', () => {
    it('POST /api/contact creates contact submission', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message'
      }

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201)

      expect(response.body).toHaveProperty('id')
    })

    it('POST /api/contact validates required fields', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })
  })
})
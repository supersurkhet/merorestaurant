import { z } from 'zod'

export const phoneSchema = z
	.string()
	.regex(/^(\+977)?[9][6-8]\d{8}$/, 'Invalid Nepali phone number')

export const emailSchema = z.string().email()

export const orderNoteSchema = z.string().max(500).optional()

export const tableNumberSchema = z.number().int().positive().max(100)

export const priceSchema = z.number().int().min(0) // price in paisa

/**
 * Input validation helpers for Convex mutations.
 * Convex `v` validators handle type safety, these add business-logic constraints.
 */

/** Validate a phone number (Nepal format: 98XXXXXXXX or 97XXXXXXXX, 10 digits) */
export function validatePhone(phone: string | undefined): void {
  if (!phone) return;
  const cleaned = phone.replace(/[\s-]/g, "");
  if (!/^(98|97)\d{8}$/.test(cleaned)) {
    throw new Error(
      "Invalid phone number. Must be 10 digits starting with 97 or 98.",
    );
  }
}

/** Validate a restaurant slug (lowercase alphanumeric + hyphens) */
export function validateSlug(slug: string): void {
  if (!/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slug)) {
    throw new Error(
      "Invalid slug. Must be 3-50 characters, lowercase letters, numbers, and hyphens only.",
    );
  }
}

/** Validate item quantity (positive integer, max 99) */
export function validateQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error("Quantity must be a whole number between 1 and 99.");
  }
}

/** Validate price (positive, max 100,000 NPR) */
export function validatePrice(price: number): void {
  if (price < 0 || price > 100_000) {
    throw new Error("Price must be between 0 and 100,000 NPR.");
  }
}

/** Validate payment amount (positive, max 1,000,000 NPR) */
export function validatePaymentAmount(amount: number): void {
  if (amount <= 0 || amount > 1_000_000) {
    throw new Error("Payment amount must be between 1 and 1,000,000 NPR.");
  }
}

/** Validate table seats (1-30) */
export function validateSeats(seats: number): void {
  if (!Number.isInteger(seats) || seats < 1 || seats > 30) {
    throw new Error("Seats must be a whole number between 1 and 30.");
  }
}

/** Validate table number (1-999) */
export function validateTableNumber(num: number): void {
  if (!Number.isInteger(num) || num < 1 || num > 999) {
    throw new Error("Table number must be between 1 and 999.");
  }
}

/** Validate string length */
export function validateStringLength(
  value: string | undefined,
  field: string,
  max: number,
): void {
  if (value && value.length > max) {
    throw new Error(`${field} must be ${max} characters or less.`);
  }
}

/** Validate SSID (1-32 chars) */
export function validateSsid(ssid: string): void {
  if (ssid.length < 1 || ssid.length > 32) {
    throw new Error("SSID must be between 1 and 32 characters.");
  }
}

/** Validate email */
export function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address.");
  }
}

/** Max items per order */
export function validateOrderItems(itemCount: number): void {
  if (itemCount > 50) {
    throw new Error("Maximum 50 items per order.");
  }
}

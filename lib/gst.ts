import { TaxBreakdown } from './types'

/**
 * Calculate GST based on shipping state
 * If same state as business: CGST 9% + SGST 9% = 18%
 * If different state: IGST 18%
 */
export function calculateGST(
  subtotal: number,
  shippingState: string,
  businessState: string = 'Karnataka'
): { taxAmount: number; taxBreakdown: TaxBreakdown } {
  const GST_RATE = 0.18 // 18% GST
  const taxAmount = subtotal * GST_RATE

  // Check if same state
  const isSameState = shippingState.toLowerCase() === businessState.toLowerCase()

  if (isSameState) {
    // Intrastate: CGST + SGST
    return {
      taxAmount,
      taxBreakdown: {
        cgst: taxAmount / 2,
        sgst: taxAmount / 2,
        rate: 18
      }
    }
  } else {
    // Interstate: IGST
    return {
      taxAmount,
      taxBreakdown: {
        igst: taxAmount,
        rate: 18
      }
    }
  }
}

/**
 * Calculate total order amount including taxes and shipping
 */
export function calculateOrderTotal(
  subtotal: number,
  shippingCost: number,
  shippingState: string,
  businessState?: string
): {
  subtotal: number
  shippingCost: number
  taxAmount: number
  taxBreakdown: TaxBreakdown
  total: number
} {
  const { taxAmount, taxBreakdown } = calculateGST(subtotal, shippingState, businessState)
  const total = subtotal + shippingCost + taxAmount

  return {
    subtotal,
    shippingCost,
    taxAmount,
    taxBreakdown,
    total
  }
}

/**
 * Format tax breakdown for display
 */
export function formatTaxBreakdown(taxBreakdown: TaxBreakdown): string {
  if (taxBreakdown.cgst && taxBreakdown.sgst) {
    return `CGST (9%): ₹${taxBreakdown.cgst.toFixed(2)} + SGST (9%): ₹${taxBreakdown.sgst.toFixed(2)}`
  } else if (taxBreakdown.igst) {
    return `IGST (18%): ₹${taxBreakdown.igst.toFixed(2)}`
  }
  return ''
}

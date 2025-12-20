'use client'

import { useState, useEffect } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import type { StoreConfig, CustomCharge, BlockedPincode } from '@/lib/types'

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<StoreConfig | null>(null)
  const [blockedPincodes, setBlockedPincodes] = useState<BlockedPincode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state for new charge
  const [newCharge, setNewCharge] = useState({ label: '', amount: 0 })
  const [newPincode, setNewPincode] = useState({ pincode: '', reason: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch store config
      const { data: configData } = await supabaseAdmin
        .from('store_config')
        .select('*')
        .limit(1)
        .single()

      if (configData) {
        setConfig(configData)
      }

      // Fetch blocked pincodes
      const { data: pincodesData } = await supabaseAdmin
        .from('blocked_pincodes')
        .select('*')
        .order('created_at', { ascending: false })

      if (pincodesData) {
        setBlockedPincodes(pincodesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const { error } = await supabaseAdmin
        .from('store_config')
        .update(config)
        .eq('id', config.id)

      if (error) throw error

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const addCustomCharge = () => {
    if (!config || !newCharge.label || newCharge.amount <= 0) {
      alert('Please enter valid charge details')
      return
    }

    const updatedCharges = [...(config.custom_charges || []), newCharge]
    setConfig({ ...config, custom_charges: updatedCharges })
    setNewCharge({ label: '', amount: 0 })
  }

  const removeCustomCharge = (index: number) => {
    if (!config) return

    const updatedCharges = config.custom_charges.filter((_, i) => i !== index)
    setConfig({ ...config, custom_charges: updatedCharges })
  }

  const addBlockedPincode = async () => {
    if (!newPincode.pincode || newPincode.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    try {
      const { error } = await supabaseAdmin
        .from('blocked_pincodes')
        .insert({
          pincode: newPincode.pincode,
          reason: newPincode.reason || 'Blocked by admin',
          blocked_by: 'admin',
        })

      if (error) throw error

      fetchData()
      setNewPincode({ pincode: '', reason: '' })
      alert('Pincode blocked successfully!')
    } catch (error) {
      console.error('Error blocking pincode:', error)
      alert('Failed to block pincode')
    }
  }

  const removeBlockedPincode = async (id: string) => {
    try {
      const { error } = await supabaseAdmin
        .from('blocked_pincodes')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchData()
      alert('Pincode unblocked successfully!')
    } catch (error) {
      console.error('Error removing pincode:', error)
      alert('Failed to remove pincode')
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>
  }

  if (!config) {
    return <div className="p-8">Failed to load settings</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Store Settings</h1>
          <p className="text-gray-600">Control charges, referrals, and blocked areas</p>
        </div>

        {/* Flexible Charge System */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">💰 Flexible Charge System</h2>
          
          <div className="mb-6">
            <label className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={config.extra_charges_enabled}
                onChange={(e) => setConfig({ ...config, extra_charges_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">Enable Extra Charges</span>
            </label>

            {config.extra_charges_enabled && (
              <div>
                <h3 className="font-semibold mb-3">Custom Charges</h3>
                
                {/* Add New Charge */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Label (e.g., Packaging)"
                    value={newCharge.label}
                    onChange={(e) => setNewCharge({ ...newCharge, label: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={newCharge.amount || ''}
                    onChange={(e) => setNewCharge({ ...newCharge, amount: parseFloat(e.target.value) || 0 })}
                    className="w-32 px-4 py-2 border rounded"
                  />
                  <button
                    onClick={addCustomCharge}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    Add Charge
                  </button>
                </div>

                {/* List of Charges */}
                <div className="space-y-2">
                  {config.custom_charges && config.custom_charges.map((charge, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">{charge.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 font-semibold">₹{charge.amount}</span>
                        <button
                          onClick={() => removeCustomCharge(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Referral System */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🎁 Referral System</h2>
          
          <label className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              checked={config.is_referral_enabled}
              onChange={(e) => setConfig({ ...config, is_referral_enabled: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="font-semibold">
              {config.is_referral_enabled ? '✅ Referrals ENABLED' : '❌ Referrals DISABLED'}
            </span>
          </label>

          {config.is_referral_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select
                  value={config.referral_discount_type}
                  onChange={(e) => setConfig({ ...config, referral_discount_type: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Value</label>
                <input
                  type="number"
                  value={config.referral_discount_value}
                  onChange={(e) => setConfig({ ...config, referral_discount_value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Referrer Credit (₹)</label>
                <input
                  type="number"
                  value={config.referral_credit_amount}
                  onChange={(e) => setConfig({ ...config, referral_credit_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={config.min_order_for_referral}
                  onChange={(e) => setConfig({ ...config, min_order_for_referral: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Blocked Pincodes (COD Filter) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🚫 Block COD by Pincode</h2>
          
          {/* Add Blocked Pincode */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="6-digit pincode"
              value={newPincode.pincode}
              onChange={(e) => setNewPincode({ ...newPincode, pincode: e.target.value })}
              maxLength={6}
              className="w-40 px-4 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={newPincode.reason}
              onChange={(e) => setNewPincode({ ...newPincode, reason: e.target.value })}
              className="flex-1 px-4 py-2 border rounded"
            />
            <button
              onClick={addBlockedPincode}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Block Pincode
            </button>
          </div>

          {/* List of Blocked Pincodes */}
          <div className="space-y-2">
            {blockedPincodes.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div>
                  <span className="font-semibold">{item.pincode}</span>
                  {item.reason && <span className="text-sm text-gray-600 ml-3">{item.reason}</span>}
                </div>
                <button
                  onClick={() => removeBlockedPincode(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Unblock
                </button>
              </div>
            ))}
            {blockedPincodes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No blocked pincodes</p>
            )}
          </div>
        </div>

        {/* Fraud Protection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">🛡️ Fraud Protection</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.require_unboxing_video}
                onChange={(e) => setConfig({ ...config, require_unboxing_video: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">Require Unboxing Video (Recommended)</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Abandoned Order Timeout (minutes)</label>
              <input
                type="number"
                value={config.abandoned_order_timeout_minutes}
                onChange={(e) => setConfig({ ...config, abandoned_order_timeout_minutes: parseInt(e.target.value) || 15 })}
                className="w-48 px-4 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Orders marked abandoned if payment not received within this time
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

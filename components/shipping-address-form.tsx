"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { allCountries } from "country-region-data"

// List of countries we ship to (from the checkout session)
const SHIPPING_COUNTRIES = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'GR', name: 'Greece' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'MT', name: 'Malta' },
  { code: 'LU', name: 'Luxembourg' },
  
  // Asia-Pacific
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'IN', name: 'India' },
  
  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'IL', name: 'Israel' },
  { code: 'TR', name: 'Turkey' },
  { code: 'ZA', name: 'South Africa' },
  
  // Americas (South & Central)
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'CO', name: 'Colombia' },
].sort((a, b) => a.name.localeCompare(b.name))

// Extract country codes for the whitelist
// const COUNTRY_WHITELIST = SHIPPING_COUNTRIES.map(country => country.code)

export interface ShippingAddress {
  email: string
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface ShippingAddressFormProps {
  onSubmit: (address: ShippingAddress) => void
  onBack: () => void
  isSubmitting?: boolean
}

export function ShippingAddressForm({ onSubmit, onBack, isSubmitting = false }: ShippingAddressFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    email: '',
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})

  // Get regions for the selected country
  const regions = useMemo(() => {
    if (!formData.country) return []
    
    // Handle both object and array formats
    if (Array.isArray(allCountries)) {
      // Check if it's array of arrays (ES6 format) or array of objects (JSON format)
      const firstItem = allCountries[0]
      if (Array.isArray(firstItem)) {
        // ES6 format: [CountryName, CountrySlug, Region[]]
        const countryData = allCountries.find((c: [string, string, Array<[string, string]>]) => c[1] === formData.country)
        if (countryData && countryData[2]) {
          return countryData[2].map((region: [string, string]) => ({
            name: region[0],
            shortCode: region[1]
          }))
        }
      } else {
        // JSON format: {countryName, countryShortCode, regions}
        const countryData = allCountries.find((c: { countryName: string; countryShortCode: string; regions: Array<{ name: string; shortCode: string }> }) => c.countryShortCode === formData.country)
        return countryData?.regions || []
      }
    }
    
    return []
  }, [formData.country])

  // Prepare country data with priority ordering
  const countryOptions = useMemo(() => {
    const priorityCountries = ['US', 'CA', 'GB']
    
    // Sort with priority countries first
    return SHIPPING_COUNTRIES.sort((a, b) => {
      const aPriority = priorityCountries.indexOf(a.code)
      const bPriority = priorityCountries.indexOf(b.code)
      
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority
      }
      if (aPriority !== -1) return -1
      if (bPriority !== -1) return 1
      
      return a.name.localeCompare(b.name)
    })
  }, [])

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Clear state/province when country changes since regions are country-specific
      if (field === 'country' && value !== prev.country) {
        updated.state = ''
      }
      
      return updated
    })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.line1.trim()) {
      newErrors.line1 = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required'
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal/ZIP code is required'
    }

    if (!formData.country) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const getShippingPrice = () => {
    if (!formData.country) return null
    if (formData.country === 'US') return '$4.99'
    if (formData.country === 'CA') return '$11.99'
    return '$16.99'
  }

  const shippingPrice = getShippingPrice()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Shipping Information</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-cyber-cyan">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
              errors.email ? 'border-red-400 focus:border-red-400' : ''
            }`}
            placeholder="your@email.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name" className="text-sm font-medium text-cyber-cyan">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
              errors.name ? 'border-red-400 focus:border-red-400' : ''
            }`}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="line1" className="text-sm font-medium text-cyber-cyan">
            Address Line 1
          </Label>
          <Input
            id="line1"
            type="text"
            value={formData.line1}
            onChange={(e) => handleInputChange('line1', e.target.value)}
            className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
              errors.line1 ? 'border-red-400 focus:border-red-400' : ''
            }`}
            placeholder="123 Main Street"
            disabled={isSubmitting}
          />
          {errors.line1 && (
            <p className="text-xs text-red-400 mt-1">{errors.line1}</p>
          )}
        </div>

        <div>
          <Label htmlFor="line2" className="text-sm font-medium text-cyber-cyan">
            Address Line 2 <span className="text-gray-400">(Optional)</span>
          </Label>
          <Input
            id="line2"
            type="text"
            value={formData.line2}
            onChange={(e) => handleInputChange('line2', e.target.value)}
            className="mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan"
            placeholder="Apartment, suite, etc."
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-cyber-cyan">
              Country
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleInputChange('country', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger 
                id="country"
                className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
                  errors.country ? 'border-red-400 focus:border-red-400' : ''
                }`}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-cyber-cyan/50 max-h-[300px] z-[200]">
                <SelectGroup>
                  <SelectLabel className="text-cyber-cyan text-xs">Priority Countries</SelectLabel>
                  {countryOptions.slice(0, 3).map(country => (
                    <SelectItem 
                      key={country.code} 
                      value={country.code}
                      className="text-white hover:bg-cyber-cyan/20"
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator className="my-1 h-px bg-cyber-cyan/20" />
                <SelectGroup>
                  <SelectLabel className="text-cyber-cyan text-xs">All Countries</SelectLabel>
                  {countryOptions.slice(3).map(country => (
                    <SelectItem 
                      key={country.code} 
                      value={country.code}
                      className="text-white hover:bg-cyber-cyan/20"
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-red-400 mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state" className="text-sm font-medium text-cyber-cyan">
              State/Province
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleInputChange('state', value)}
              disabled={isSubmitting || !formData.country}
            >
              <SelectTrigger 
                id="state"
                className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
                  errors.state ? 'border-red-400 focus:border-red-400' : ''
                }`}
              >
                <SelectValue placeholder={!formData.country ? "Select country first" : "Select state/province"} />
              </SelectTrigger>
              <SelectContent className="bg-cyber-dark border-cyber-cyan/50 max-h-[200px] z-[200]">
                {regions.length > 0 ? (
                  regions.map(region => (
                    <SelectItem 
                      key={region.shortCode || region.name} 
                      value={region.shortCode || region.name}
                      className="text-white hover:bg-cyber-cyan/20"
                    >
                      {region.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-gray-400">
                    No regions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-xs text-red-400 mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-cyber-cyan">
              City
            </Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
                errors.city ? 'border-red-400 focus:border-red-400' : ''
              }`}
              placeholder="New York"
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="text-xs text-red-400 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postal_code" className="text-sm font-medium text-cyber-cyan">
              ZIP/Postal Code
            </Label>
            <Input
              id="postal_code"
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              className={`mt-1 bg-cyber-dark/80 border-cyber-cyan/50 text-white focus:border-cyber-cyan ${
                errors.postal_code ? 'border-red-400 focus:border-red-400' : ''
              }`}
              placeholder="10001"
              disabled={isSubmitting}
            />
            {errors.postal_code && (
              <p className="text-xs text-red-400 mt-1">{errors.postal_code}</p>
            )}
          </div>
        </div>
      </div>

      {shippingPrice && (
        <div className="bg-cyber-dark/40 rounded-lg p-3 border border-cyber-cyan/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Shipping to {formData.country}:</span>
            <span className="text-sm font-bold text-cyber-green">{shippingPrice}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 bg-cyber-dark/80 border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan hover:text-cyber-cyan"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-cyber-cyan" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 cyber-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
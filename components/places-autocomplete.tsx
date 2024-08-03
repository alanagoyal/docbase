import { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import usePlacesAutocomplete from "use-places-autocomplete"
import { UseFormReturn } from "react-hook-form"
import { formDescriptions } from "@/utils/form-descriptions"

interface PlacesAutocompleteProps {
  form: UseFormReturn<any>
  streetName: string
  cityStateZipName: string
  disabled?: boolean
  onAddressChange: (street: string, cityStateZip: string) => void
  initialStreet?: string
  initialCityStateZip?: string
}

export function PlacesAutocomplete({
  form,
  streetName,
  cityStateZipName,
  disabled = false,
  onAddressChange,
  initialStreet,
  initialCityStateZip,
}: PlacesAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const streetInputRef = useRef<HTMLInputElement>(null)
  const [street, setStreet] = useState(initialStreet || "")
  const [cityStateZip, setCityStateZip] = useState(initialCityStateZip || "")
  const [showSuggestions, setShowSuggestions] = useState(false)

  console.log("disabled", disabled)
  const {
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    defaultValue: `${initialStreet || ''}, ${initialCityStateZip || ''}`,
  })

  useEffect(() => {
    if (initialStreet !== undefined) setStreet(initialStreet)
    if (initialCityStateZip !== undefined) setCityStateZip(initialCityStateZip)
  }, [initialStreet, initialCityStateZip])

  useEffect(() => {
    if (value) {
      const parts = value.split(', ')
      setStreet(parts[0] || '')
      setCityStateZip(parts.slice(1).join(', ') || '')
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status !== "OK") return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(data[selectedIndex])
        }
        break
    }
  }

  const handleSelect = ({ description }: { description: string }) => {
    setValue(description, false)
    clearSuggestions()

    const parts = description.split(', ')
    const newStreet = parts[0] || ''
    const newCityStateZip = parts.slice(1).join(', ') || ''
    
    setStreet(newStreet)
    setCityStateZip(newCityStateZip)
    form.setValue(streetName, newStreet)
    form.setValue(cityStateZipName, newCityStateZip)
    onAddressChange(newStreet, newCityStateZip)
  }

  const handleInputChange = (newValue: string, isStreet: boolean) => {
    if (isStreet) {
      setStreet(newValue)
      setValue(newValue + (cityStateZip ? `, ${cityStateZip}` : ''))
      form.setValue(streetName, newValue)
    } else {
      setCityStateZip(newValue)
      setValue(street + (newValue ? `, ${newValue}` : ''))
      form.setValue(cityStateZipName, newValue)
    }
    onAddressChange(isStreet ? newValue : street, isStreet ? cityStateZip : newValue)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <>
      <FormField
        control={form.control}
        name={streetName}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel htmlFor={`${streetName}-input`}>Street Address</FormLabel>
            <FormControl>
              <Input
                {...field}
                ref={streetInputRef}
                id={`${streetName}-input`}
                className="w-full text-sm mb-2"
                disabled={disabled}
                value={street}
                onChange={(e) => handleInputChange(e.target.value, true)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </FormControl>
            <FormDescription>{formDescriptions.street}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={cityStateZipName}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel htmlFor={`${cityStateZipName}-input`}>City, State, ZIP</FormLabel>
            <FormControl>
              <Input
                {...field}
                id={`${cityStateZipName}-input`}
                className="w-full text-sm"
                disabled={disabled}
                value={cityStateZip}
                onChange={(e) => handleInputChange(e.target.value, false)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </FormControl>
            <FormDescription>{formDescriptions.cityStateZip}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {status === "OK" && showSuggestions && (
        <ul className="mt-2 bg-white border rounded-md shadow-lg">
          {data.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              className={`p-2 cursor-pointer hover:bg-gray-100 text-sm ${
                index === selectedIndex ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
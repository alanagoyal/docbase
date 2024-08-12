export async function parseSignatureBlock(file: File): Promise<{
    entity_name?: string
    name?: string
    title?: string
    street?: string
    city_state_zip?: string
    state_of_incorporation?: string
    type?: 'fund' | 'company'
  }> {
    try {
      console.log('Starting parseSignatureBlock function')
      const base64Image = await fileToBase64(file)
      console.log('File converted to base64')
      console.log(base64Image)
  
      const response = await fetch('/api/parse-signature-block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      })
  
      console.log('API Response status:', response.status)
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to parse signature block: ${response.status} ${errorText}`)
      }
  
      const data = await response.json()
      console.log('Parsed data:', data)
      return data
    } catch (error) {
      console.error('Error in parseSignatureBlock:', error)
      throw error
    }
  }
  
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1])
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    console.log('API route: POST request received')
    const { image } = await request.json()

    if (!image) {
      console.error('API route: No image provided')
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log('API route: Calling OpenAI API')
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set')

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI trained to parse signature blocks from text representations of images. Extract the following information: entity_name, byline, street, city_state_zip, name, title. Return the result as a JSON object. The image data will be truncated, so focus on extracting what information you can from the available data."
        },
        {
          role: "user",
          content: `Here's a truncated base64 encoded image of a signature block. Please parse it and extract the required information: ${image}`
        }
      ],
      max_tokens: 300,
    })

    console.log('API route: OpenAI API response received')
    console.log('Raw response content:', response.choices[0].message.content)

    let parsedData
    try {
      parsedData = JSON.parse(response.choices[0].message.content || '{}')
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      return NextResponse.json({ error: 'Error parsing OpenAI response', details: response.choices[0].message.content }, { status: 500 })
    }

    console.log('API route: Parsed data:', parsedData)
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('API route: Detailed error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Error parsing signature block', details: error.message, stack: error.stack }, { status: 500 })
    } else {
      return NextResponse.json({ error: 'Unknown error occurred', details: String(error) }, { status: 500 })
    }
  }
}
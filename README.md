This is a [Next.js](https://nextjs.org) project with Google Gemini AI image generation API.

## Features

- **AI Image Generation**: Generate images using Google's Gemini 2.0 Flash model
- **REST API**: Simple POST endpoint for image generation
- **Base64 Response**: Returns generated images as base64 encoded data

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Get your Google Generative AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add your API key to `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

3. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Usage

### Generate Image

**Endpoint**: `POST /api`

**Request Body**:
```json
{
  "prompt": "A 3D rendered image of a pig with wings and a top hat flying over a futuristic sci-fi city with lots of greenery"
}
```

**Response**:
```json
{
  "success": true,
  "image": "base64_encoded_image_data"
}
```

**Example Usage**:
```bash
curl -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset over mountains"}'
```

**JavaScript Example**:
```javascript
const response = await fetch('/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A 3D rendered image of a pig with wings and a top hat flying over a futuristic sci-fi city with lots of greenery'
  }),
});

const data = await response.json();
if (data.success) {
  // data.image contains the base64 encoded image
  console.log('Generated image:', data.image);
}
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

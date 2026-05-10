import { ColorFamily, YarnWeight, FiberType } from '../types/yarn';

const API_URL = 'https://api.anthropic.com/v1/messages';

export interface YarnAnalysis {
  colorFamily: ColorFamily;
  weight: YarnWeight;
  fiberType: FiberType;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export async function analyzeYarnPhoto(params: {
  apiKey: string;
  photoUri: string;
}): Promise<YarnAnalysis> {
  const { apiKey, photoUri } = params;

  // Read the image as base64 via fetch + FileReader
  const fileResponse = await fetch(photoUri);
  const blob = await fileResponse.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Determine media type from URI
  const extension = photoUri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const mediaType = extension === 'png' ? 'image/png' : 'image/jpeg';

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Analyze this photo of yarn. Return ONLY valid JSON with these exact fields, no other text:

{
  "colorFamily": one of: "red", "orange", "yellow", "green", "blue", "purple", "pink", "white", "black", "gray", "brown", "multicolor",
  "weight": one of: "lace", "fingering", "sport", "DK", "worsted", "aran", "bulky", "super-bulky",
  "fiberType": one of: "wool", "merino", "mohair", "cotton", "acrylic", "alpaca", "silk", "blend", "unknown",
  "confidence": one of: "high", "medium", "low",
  "notes": a brief description of what you see (e.g. "Variegated blue-green wool, appears to be a worsted weight skein with a label showing merino content")
}

If you can see a yarn label, use it to determine weight and fiber. If not, estimate based on the yarn's appearance (thickness, twist, sheen).`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid Claude API key. Check your key in src/config/local.ts');
    }
    throw new Error(`Claude API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';

  // Extract JSON from the response (handle potential markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  const analysis: YarnAnalysis = JSON.parse(jsonMatch[0]);
  return analysis;
}

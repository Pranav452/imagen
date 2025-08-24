import { GoogleGenAI, Modality } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

// Define the Slack file upload response type
interface SlackFileUploadResponse {
  file?: {
    id: string;
    url_private?: string;
    name?: string;
    title?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get the prompt from the request body
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Initialize Google GenAI with API key from environment variables
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Set responseModalities to include "Image" so the model can generate an image
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Extract the image data from the response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    const content = candidates[0]?.content;
    if (!content || !content.parts) {
      return NextResponse.json(
        { error: "No content in response" },
        { status: 500 }
      );
    }

    const parts = content.parts;
    let imageData = null;

    // Find the image part in the response
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Initialize Slack client
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    const slackChannelId = process.env.SLACK_CHANNEL_ID;

    let slackUploadResult = null;

    // Send image to Slack if credentials are available
    if (process.env.SLACK_BOT_TOKEN && slackChannelId && slackChannelId !== 'C1234567890') {
      try {
        // Convert base64 to buffer for Slack upload
        const imageBuffer = Buffer.from(imageData, 'base64');

        // Upload image to Slack
        const uploadResult = await slack.files.uploadV2({
          channel_id: slackChannelId,
          file: imageBuffer,
          filename: `generated-image-${Date.now()}.png`,
          title: `Generated Image: ${prompt}`,
          initial_comment: `🎨 Generated image for prompt: "${prompt}"`,
        });

        const typedUploadResult = uploadResult as SlackFileUploadResponse;

        slackUploadResult = {
          success: true,
          fileId: typedUploadResult.file?.id,
          fileUrl: typedUploadResult.file?.url_private,
        };

        console.log('Image uploaded to Slack successfully:', typedUploadResult.file?.id);
      } catch (slackError) {
        console.error('Error uploading to Slack:', slackError);
        slackUploadResult = {
          success: false,
          error: slackError instanceof Error ? slackError.message : 'Failed to upload to Slack',
        };
      }
    } else {
      console.log('Slack credentials not configured, skipping Slack upload');
    }

    // Return the base64 image data along with Slack upload status
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${imageData}`, // This is already base64 encoded
      slackUpload: slackUploadResult,
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

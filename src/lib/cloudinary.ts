import crypto from "crypto";

/**
 * Uploads a base64 image string to Cloudinary using a signed server-side REST API call.
 * Falls back to returning the original base64 string if credentials are missing or the upload fails.
 */
export async function uploadToCloudinary(base64Image: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    // If credentials aren't configured, fall back to base64 storage in database
    return base64Image;
  }

  try {
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    
    // Generate Cloudinary SHA-1 signature
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", errorText);
      return base64Image; // fallback to base64 if Cloudinary API rejects
    }

    const data = await response.json();
    return data.secure_url || base64Image;

  } catch (err) {
    console.error("Cloudinary upload error, using base64 fallback:", err);
    return base64Image;
  }
}

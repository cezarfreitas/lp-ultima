import { Request, Response } from "express";
import crypto from "crypto";
import mysql from "mysql2/promise";
import { dbConfig } from "../database/config";

interface ConversionPayload {
  pixel_id: string;
  event_name: string;
  user_data: {
    email?: string;
    phone?: string;
    external_id?: string;
    [key: string]: any;
  };
  event_time: number;
  custom_data?: { [key: string]: any };
}

export async function sendMetaConversion(req: Request, res: Response) {
  try {
    const { pixel_id, event_name, user_data, event_time, custom_data } =
      req.body as ConversionPayload;

    // Get access token from database
    const connection = await mysql.createConnection(dbConfig);
    let access_token: string | null = null;

    try {
      const [rows] = await connection.execute(
        "SELECT access_token FROM pixels WHERE pixel_id = ? AND type = ? AND enabled = TRUE LIMIT 1",
        [pixel_id, "meta_conversions"],
      );

      const results = rows as { access_token: string }[];
      if (results.length > 0) {
        access_token = results[0].access_token;
      }
    } finally {
      await connection.end();
    }

    if (!access_token) {
      return res
        .status(400)
        .json({ error: "Access token not found for this pixel" });
    }

    // Hash user data for privacy
    const hashedUserData: any = {};

    if (user_data.email) {
      hashedUserData.em = hashData(user_data.email.toLowerCase().trim());
    }

    if (user_data.phone) {
      // Remove all non-numeric characters and add +55 for Brazil
      const cleanPhone = user_data.phone.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("55")
        ? `+${cleanPhone}`
        : `+55${cleanPhone}`;
      hashedUserData.ph = hashData(fullPhone);
    }

    if (user_data.external_id) {
      hashedUserData.external_id = hashData(user_data.external_id);
    }

    // Prepare event data
    const eventData = {
      data: [
        {
          event_name,
          event_time,
          action_source: "website",
          user_data: hashedUserData,
          custom_data: custom_data || {},
          event_source_url:
            req.headers.referer ||
            req.headers.origin ||
            "https://sejaum.lojista.ecko.com.br",
        },
      ],
    };

    // Send to Meta Conversions API
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pixel_id}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(eventData),
      },
    );

    const metaResult = await metaResponse.json();

    if (metaResponse.ok) {
      console.log("Meta Conversion sent successfully:", metaResult);
      res.json({ success: true, result: metaResult });
    } else {
      console.error("Meta Conversion error:", metaResult);
      res
        .status(400)
        .json({ error: "Failed to send conversion", details: metaResult });
    }
  } catch (error) {
    console.error("Meta Conversion API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

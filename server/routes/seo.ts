import { Request, Response } from "express";
import { z } from "zod";
import mysql from "mysql2/promise";
import { dbConfig } from "../database/config";

// Import types and data inline to avoid module resolution issues
interface SEOData {
  id?: number;
  title: string;
  description: string;
  keywords: string;
  canonical_url?: string;
  og_title: string;
  og_description: string;
  og_image?: string;
  og_type: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image?: string;
  robots: string;
  author: string;
  language: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SEO_DATA: SEOData = {
  title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva | Ecko Brasil",
  description:
    "🏪 Torne-se um lojista oficial Ecko! Acesso a produtos exclusivos, preços especiais e suporte completo. Junte-se à maior rede de streetwear do Brasil. Cadastre-se agora!",
  keywords:
    "lojista ecko, franquia ecko, parceria ecko, revenda ecko, streetwear brasil, roupas urbanas, moda jovem, distribuidor ecko, negócio próprio, empreendedorismo, marca famosa",
  canonical_url: "https://sejaum.lojista.ecko.com.br",
  og_title: "Seja um Lojista Oficial Ecko - Oportunidade Única de Negócio",
  og_description:
    "💰 Descubra como se tornar um lojista oficial Ecko. Produtos exclusivos, margem atrativa e suporte completo para seu negócio crescer no mercado de streetwear. Cadastre-se gratuitamente!",
  og_image: "https://sejaum.lojista.ecko.com.br/images/og-lojista-ecko.jpg",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_title: "Seja um Lojista Oficial Ecko - Parceria Exclusiva",
  twitter_description:
    "🚀 Torne-se parceiro oficial Ecko. Acesso a produtos exclusivos, preços especiais e suporte completo para seu negócio decolar!",
  twitter_image:
    "https://sejaum.lojista.ecko.com.br/images/twitter-lojista-ecko.jpg",
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  author: "Ecko Brasil",
  language: "pt-BR",
};

const SEOSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().min(1).max(320),
  keywords: z.string().min(1).max(500),
  canonical_url: z.string().url().optional(),
  og_title: z.string().min(1).max(100),
  og_description: z.string().min(1).max(300),
  og_image: z.string().url().optional(),
  og_type: z.string().min(1).max(50),
  twitter_card: z.string().min(1).max(50),
  twitter_title: z.string().min(1).max(100),
  twitter_description: z.string().min(1).max(300),
  twitter_image: z.string().url().optional(),
  robots: z.string().min(1).max(100),
  author: z.string().min(1).max(100),
  language: z.string().min(1).max(10),
});

export async function getSEO(req: Request, res: Response) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM seo_data ORDER BY id DESC LIMIT 1",
      );
      const seoArray = rows as SEOData[];

      if (seoArray.length === 0) {
        // Return default data if no SEO data in database
        return res.json(DEFAULT_SEO_DATA);
      }

      res.json(seoArray[0]);
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    // Return default data in case of error
    res.json(DEFAULT_SEO_DATA);
  }
}

export async function updateSEO(req: Request, res: Response) {
  try {
    const validatedData = SEOSchema.parse(req.body);
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Check if SEO data exists
      const [existing] = await connection.execute(
        "SELECT id FROM seo_data LIMIT 1",
      );
      const existingArray = existing as { id: number }[];

      if (existingArray.length === 0) {
        // Insert new SEO data
        const [result] = await connection.execute(
          `INSERT INTO seo_data (
            title, description, keywords, canonical_url, og_title, og_description, 
            og_image, og_type, twitter_card, twitter_title, twitter_description, 
            twitter_image, robots, author, language, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            validatedData.title,
            validatedData.description,
            validatedData.keywords,
            validatedData.canonical_url || null,
            validatedData.og_title,
            validatedData.og_description,
            validatedData.og_image || null,
            validatedData.og_type,
            validatedData.twitter_card,
            validatedData.twitter_title,
            validatedData.twitter_description,
            validatedData.twitter_image || null,
            validatedData.robots,
            validatedData.author,
            validatedData.language,
          ],
        );

        const insertResult = result as mysql.ResultSetHeader;
        const newSEO: SEOData = {
          id: insertResult.insertId,
          ...validatedData,
        };

        res.json(newSEO);
      } else {
        // Update existing SEO data
        await connection.execute(
          `UPDATE seo_data SET 
            title = ?, description = ?, keywords = ?, canonical_url = ?, 
            og_title = ?, og_description = ?, og_image = ?, og_type = ?, 
            twitter_card = ?, twitter_title = ?, twitter_description = ?, 
            twitter_image = ?, robots = ?, author = ?, language = ?, 
            updated_at = NOW()
          WHERE id = ?`,
          [
            validatedData.title,
            validatedData.description,
            validatedData.keywords,
            validatedData.canonical_url || null,
            validatedData.og_title,
            validatedData.og_description,
            validatedData.og_image || null,
            validatedData.og_type,
            validatedData.twitter_card,
            validatedData.twitter_title,
            validatedData.twitter_description,
            validatedData.twitter_image || null,
            validatedData.robots,
            validatedData.author,
            validatedData.language,
            existingArray[0].id,
          ],
        );

        const updatedSEO: SEOData = {
          id: existingArray[0].id,
          ...validatedData,
        };

        res.json(updatedSEO);
      }
    } finally {
      await connection.end();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.errors,
      });
    }

    console.error("Error updating SEO data:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
}

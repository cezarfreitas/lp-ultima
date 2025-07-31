import { RequestHandler } from "express";
import { pool } from "../database/config";
import { z } from "zod";

// Schema for validation
const LeadCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  has_cnpj: z.enum(["sim", "nao"]),
  store_type: z
    .enum(["fisica", "online", "fisica_online", "midias_sociais"])
    .optional(),
  cep: z.string().optional(),
});

const LeadUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  whatsapp: z.string().optional(),
  has_cnpj: z.enum(["sim", "nao"]).optional(),
  store_type: z
    .enum(["fisica", "online", "fisica_online", "midias_sociais"])
    .optional(),
  cep: z.string().optional(),
  status: z
    .enum(["new", "contacted", "qualified", "converted", "lost"])
    .optional(),
});

// Webhook function
async function sendWebhook(
  lead: any,
  type: "lojista" | "consumidor" = "lojista",
) {
  try {
    // Get webhook settings from database
    const [settingsRows] = await pool.execute(
      "SELECT * FROM webhook_settings LIMIT 1",
    );
    const settings = (settingsRows as any[])[0];

    if (!settings || !settings.webhook_enabled || !settings.webhook_url) {
      return;
    }

    const response = await fetch(settings.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": settings.webhook_secret || "",
      },
      body: JSON.stringify({
        event: type === "lojista" ? "new_lead" : "consumer_detected",
        type: type,
        data: lead,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok && type === "lojista") {
      await pool.execute("UPDATE leads SET webhook_sent = TRUE WHERE id = ?", [
        lead.id,
      ]);
    } else if (!response.ok && type === "lojista") {
      await pool.execute(
        "UPDATE leads SET webhook_attempts = webhook_attempts + 1 WHERE id = ?",
        [lead.id],
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    if (type === "lojista") {
      await pool.execute(
        "UPDATE leads SET webhook_attempts = webhook_attempts + 1 WHERE id = ?",
        [lead.id],
      );
    }
  }
}

// Create new lead
export const createLead: RequestHandler = async (req, res) => {
  try {
    const validation = LeadCreateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const { name, whatsapp, has_cnpj, store_type, cep } = validation.data;

    // Get client info
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get("User-Agent");

    const [result] = await pool.execute(
      `
      INSERT INTO leads (name, whatsapp, has_cnpj, store_type, cep, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        whatsapp,
        has_cnpj,
        store_type || null,
        cep || null,
        ip_address,
        user_agent,
      ],
    );

    const insertId = (result as any).insertId;

    // Get the created lead
    const [rows] = await pool.execute("SELECT * FROM leads WHERE id = ?", [
      insertId,
    ]);
    const newLead = (rows as any[])[0];

    // Send webhook asynchronously
    sendWebhook(newLead).catch(console.error);

    res.status(201).json({
      message: "Lead criado com sucesso!",
      id: insertId,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get all leads (admin)
export const getLeads: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let whereClause = "";
    let params: any[] = [];

    if (status && status !== "all") {
      whereClause = "WHERE status = ?";
      params.push(status);
    }

    // Ensure limit and offset are integers for the query
    const [rows] = await pool.execute(
      `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM leads ${whereClause}`,
      params,
    );

    const total = (countRows as any[])[0].total;

    res.json({
      leads: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get single lead
export const getLead: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [rows] = await pool.execute("SELECT * FROM leads WHERE id = ?", [id]);
    const lead = (rows as any[])[0];

    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }

    res.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Update lead
export const updateLead: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const validation = LeadUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validation.error.errors,
      });
    }

    const data = validation.data;
    const updateFields = Object.keys(data);

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar" });
    }

    // Build dynamic update query
    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map(
      (field) => data[field as keyof typeof data],
    );

    await pool.execute(
      `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    // Return updated data
    const [rows] = await pool.execute("SELECT * FROM leads WHERE id = ?", [id]);
    const updatedLead = (rows as any[])[0];

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }

    res.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Delete lead
export const deleteLead: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const [result] = await pool.execute("DELETE FROM leads WHERE id = ?", [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }

    res.json({ message: "Lead deletado com sucesso" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Send consumer webhook
export const sendConsumerWebhook: RequestHandler = async (req, res) => {
  try {
    const { name, whatsapp } = req.body;

    if (!name || !whatsapp) {
      return res
        .status(400)
        .json({ error: "Nome e WhatsApp são obrigatórios" });
    }

    // Send webhook asynchronously
    sendWebhook({ name, whatsapp }, "consumidor").catch(console.error);

    res.json({ message: "Webhook de consumidor enviado" });
  } catch (error) {
    console.error("Error sending consumer webhook:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Get leads statistics
export const getLeadsStats: RequestHandler = async (req, res) => {
  try {
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) as total FROM leads",
    );
    const [statusRows] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
    `);
    const [recentRows] = await pool.execute(`
      SELECT COUNT(*) as recent
      FROM leads
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    const total = (totalRows as any[])[0].total;
    const recent = (recentRows as any[])[0].recent;
    const byStatus = (statusRows as any[]).reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    res.json({
      total,
      recent,
      byStatus,
    });
  } catch (error) {
    console.error("Error fetching leads stats:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

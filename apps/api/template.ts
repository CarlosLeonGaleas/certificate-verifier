import { Hono } from 'hono';
import { supabase } from './supabaseClient';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { z } from 'zod';
import { ErrorResponses } from './common';
import { ErrorCodes } from './error';

export const template = new Hono();

interface CachedTemplate {
  html: string;
  timestamp: number;
}

// In-memory cache for resolved templates and fetched font base64 data
const templateCache = new Map<string, CachedTemplate>();
const fontCache = new Map<string, string>();

// TTL configuration (2 hours = 120 minutes)
const CACHE_TTL_MS = 120 * 60 * 1000;

/**
 * Retrieve font base64 data from Supabase and cache them.
 */
async function getFontData(fontCodes: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const missingCodes: string[] = [];

  // Check cache first
  for (const code of fontCodes) {
    if (fontCache.has(code)) {
      result.set(code, fontCache.get(code)!);
    } else {
      missingCodes.push(code);
    }
  }

  // Fetch missing fonts from DB
  if (missingCodes.length > 0) {
    console.log(`[API TEMPLATE] Fetching missing fonts from database: ${missingCodes.join(', ')}`);
    const { data, error } = await supabase
      .from('Font')
      .select('font_code, font_base64_data')
      .in('font_code', missingCodes);

    if (error) {
      console.error('[API TEMPLATE] Error retrieving fonts from Supabase:', error.message);
      throw new Error(`Database error retrieving fonts: ${error.message}`);
    }

    if (data) {
      for (const font of data) {
        fontCache.set(font.font_code, font.font_base64_data);
        result.set(font.font_code, font.font_base64_data);
      }
    }
  }

  return result;
}

/**
 * Scan HTML template and inject fonts data in place of placeholders.
 */
async function injectFonts(htmlTemplate: string): Promise<string> {
  const fontRegex = /\{\{FONT_([a-zA-Z0-9_-]+)\}\}/g;
  const matches = [...htmlTemplate.matchAll(fontRegex)];

  if (matches.length === 0) {
    return htmlTemplate;
  }

  const requiredFontCodes = Array.from(new Set(matches.map((match) => match[1])));
  const fontMap = await getFontData(requiredFontCodes);

  let resolvedHtml = htmlTemplate;
  for (const fontCode of requiredFontCodes) {
    const base64Data = fontMap.get(fontCode);
    if (base64Data) {
      const placeholder = new RegExp(`\\{\\{FONT_${fontCode}\\}\\}`, 'g');
      resolvedHtml = resolvedHtml.replace(placeholder, base64Data);
    } else {
      console.warn(`[API TEMPLATE] Font '${fontCode}' was required by template but not found in database.`);
    }
  }

  return resolvedHtml;
}

// Endpoint to retrieve HTML templates based on backgroundCode
template.get(
  '/:backgroundCode',
  describeRoute({
    tags: ['Certificate Template'],
    summary: 'Obtener plantilla HTML por BACKGROUND_CODE',
    description: 'Recupera el HTML de la plantilla y realiza la inyección de fuentes desde la base de datos.',
    responses: {
      200: {
        description: 'Plantilla HTML recuperada exitosamente',
        content: {
          'application/json': {
            schema: resolver(
              z.object({
                data: z.object({
                  html: z.string()
                })
              })
            )
          }
        }
      },
      404: ErrorResponses[404],
      500: ErrorResponses[500]
    }
  }),
  async (c) => {
    const backgroundCode = c.req.param('backgroundCode');
    const type = c.req.query('type');
    const cacheKey = `${backgroundCode}_${type || ''}`;
    const now = Date.now();

    // Check memory cache
    const cached = templateCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[API TEMPLATE] Using cached template for key: ${cacheKey}`);
      return c.json({ data: { html: cached.html } }, 200);
    }

    try {
      let dbTemplateCode = backgroundCode;
      let shouldReplaceBackground = false;

      // Unify layout resolutions & fallback mapping logic
      switch (backgroundCode) {
        case 'BACKGROUND001':
          dbTemplateCode = 'BACKGROUND001';
          break;
        case 'BACKGROUND002':
          dbTemplateCode = 'BACKGROUND001';
          shouldReplaceBackground = true;
          break;
        case 'BACKGROUND003':
          dbTemplateCode = 'BACKGROUND003';
          break;
        case 'BACKGROUND004':
          dbTemplateCode = 'BACKGROUND003';
          break;
        case 'BACKGROUND005':
          dbTemplateCode = 'BACKGROUND005';
          break;
        case 'BACKGROUND006':
          dbTemplateCode = type === 'PROYECTO' ? 'BACKGROUND005' : 'BACKGROUND006';
          break;
        case 'BACKGROUND007':
          dbTemplateCode = 'BACKGROUND005';
          shouldReplaceBackground = true;
          break;
        case 'BACKGROUND008':
          dbTemplateCode = 'BACKGROUND008';
          break;
        case 'BACKGROUND009':
          dbTemplateCode = 'BACKGROUND009';
          break;
        case 'BACKGROUND010':
          dbTemplateCode = 'BACKGROUND010';
          break;
        case 'BACKGROUND011':
          dbTemplateCode = 'BACKGROUND011';
          shouldReplaceBackground = true;
          break;
        case 'BACKGROUND012':
          dbTemplateCode = 'BACKGROUND011';
          shouldReplaceBackground = true;
          break;
        default:
          dbTemplateCode = 'BACKGROUND005';
          break;
      }

      console.log(`[API TEMPLATE] Querying database for template code: ${dbTemplateCode} (Requested: ${backgroundCode})`);

      // Fetch the template HTML from Supabase
      const { data, error } = await supabase
        .from('Template')
        .select('template_html')
        .eq('template_code', dbTemplateCode)
        .single();

      if (error || !data || !data.template_html) {
        console.warn(`[API TEMPLATE] Template not found in database for code: ${dbTemplateCode}`);
        return c.json(
          {
            type: 'not_found',
            code: ErrorCodes.NotFound.RESOURCE_NOT_FOUND,
            message: `Template not found for code: ${backgroundCode}`
          },
          404
        );
      }

      let html = data.template_html;

      // Handle BACKGROUND placeholder replacement
      if (shouldReplaceBackground) {
        html = html.replace(/\{\{BACKGROUND\}\}/g, backgroundCode);
      }

      // Inject fonts data
      html = await injectFonts(html);

      // Save to memory cache
      templateCache.set(cacheKey, {
        html,
        timestamp: now
      });

      return c.json({ data: { html } }, 200);

    } catch (error) {
      console.error('[API TEMPLATE] Error processing template request:', error);
      return c.json(
        {
          type: 'internal',
          code: ErrorCodes.Server.INTERNAL_ERROR,
          message: `Error interno en el servidor: ${error instanceof Error ? error.message : String(error)}`
        },
        500
      );
    }
  }
);

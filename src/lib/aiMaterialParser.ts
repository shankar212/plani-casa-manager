import { NewMaterial } from "@/hooks/useMaterials";

export interface ParsedMaterialRequest {
    material_name?: string;
    quantity?: number;
    unit?: string;
    estimated_total_cost?: number;
    status?: "requested" | "delivered" | "used";
    delivery_date?: string;
    project_name?: string;
    stage_name?: string;
    supplier_name?: string;
    intent?: "add_material" | "project_info";
    confidence: number;
}

export const parseMaterialRequest = (text: string): ParsedMaterialRequest => {
    const lowerText = text.toLowerCase();

    let quantity = 1;
    let unit: string | undefined;
    let materialName = '';
    let estimated_total_cost: number | undefined;
    let status: "requested" | "delivered" | "used" | undefined;
    let delivery_date: string | undefined;
    let confidence = 0.5;

    // 1. Extract Quantity
    const quantityMatch = lowerText.match(/(\d+([.,]\d+)?)/);
    if (quantityMatch) {
        // Check if this number is likely a cost (preceded by R$ or followed by reais)
        const isCost = /r\$\s*\d/.test(lowerText) || /\d+\s*reais/.test(lowerText);

        if (!isCost) {
            quantity = parseFloat(quantityMatch[0].replace(',', '.'));
            confidence += 0.2;
        }
    }

    // 2. Extract Cost
    const costMatch = lowerText.match(/(?:r\$|custo|valor)\s*(\d+([.,]\d+)?)/) || lowerText.match(/(\d+([.,]\d+)?)\s*reais/);
    if (costMatch) {
        estimated_total_cost = parseFloat(costMatch[1].replace(',', '.'));
        confidence += 0.1;
    }

    // 3. Extract Status
    if (lowerText.includes('entregue') || lowerText.includes('recebido')) {
        status = 'delivered';
    } else if (lowerText.includes('usado') || lowerText.includes('utilizado')) {
        status = 'used';
    } else {
        status = 'requested';
    }

    // 4. Extract Date (simple DD/MM/YYYY or keywords)
    const dateMatch = lowerText.match(/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/);
    if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year = dateMatch[4] ? (dateMatch[4].length === 2 ? `20${dateMatch[4]}` : dateMatch[4]) : new Date().getFullYear().toString();
        delivery_date = `${year}-${month}-${day}`;
    } else if (lowerText.includes('hoje')) {
        delivery_date = new Date().toISOString().split('T')[0];
    } else if (lowerText.includes('amanhã') || lowerText.includes('amanha')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        delivery_date = tomorrow.toISOString().split('T')[0];
    }

    // 5. Extract Unit
    const units = ['kg', 'g', 'l', 'ml', 'm', 'cm', 'mm', 'm2', 'm3', 'un', 'pc', 'pç', 'saco', 'sacos', 'caixa', 'caixas', 'fardo', 'fardos', 'ton', 'tonelada', 'toneladas', 'metro', 'metros', 'litro', 'litros'];

    for (const u of units) {
        const unitRegex = new RegExp(`\\b${u}\\b`, 'i');
        if (unitRegex.test(lowerText)) {
            unit = u;
            if (unit.endsWith('s') && unit.length > 2) unit = unit.slice(0, -1);
            if (unit === 'pç') unit = 'pc';
            if (unit === 'metro') unit = 'm';
            if (unit === 'litro') unit = 'l';
            confidence += 0.2;
            break;
        }
    }

    // 6. Extract Material Name
    let remainingText = lowerText;

    // Remove extracted parts to isolate name
    if (quantityMatch) remainingText = remainingText.replace(quantityMatch[0], '');
    if (costMatch) remainingText = remainingText.replace(costMatch[0], '');
    if (dateMatch) remainingText = remainingText.replace(dateMatch[0], '');

    const unitRegex = new RegExp(`\\b${unit}(s)?\\b`, 'i');
    remainingText = remainingText.replace(unitRegex, '');

    // Remove common words
    remainingText = remainingText.replace(/\b(de|do|da|dos|das|com|para|em|no|na|nos|nas)\b/g, '');
    remainingText = remainingText.replace(/\b(adicionar|add|cadastrar|novo|nova|comprar|preciso|quero|custo|valor|reais|r\$|entregue|recebido|usado|utilizado|hoje|amanhã|amanha|give|show|list|details|info|infor|information|informacao|informação|project|projeto|obra|resumo)\b/g, '');

    // Clean up
    materialName = remainingText.replace(/\s+/g, ' ').trim();
    materialName = materialName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    if (materialName.length > 2) {
        confidence += 0.1;
    } else {
        confidence -= 0.2;
    }

    // 7. Detect Intent
    // 7. Detect Intent
    let intent: "add_material" | "project_info" = "add_material";
    const infoKeywords = ["quanto", "custo", "gastei", "resumo", "info", "total", "give", "show", "list", "details", "status"];
    const projectKeywords = ["projeto", "obra", "project"];

    const hasInfoKeyword = infoKeywords.some(k => lowerText.includes(k));
    const hasProjectKeyword = projectKeywords.some(k => lowerText.includes(k));

    if (hasInfoKeyword && hasProjectKeyword) {
        intent = "project_info";
        confidence = 0.9;
    } else if (lowerText.startsWith("resumo") || lowerText.startsWith("info") || lowerText.startsWith("give project")) {
        // Fallback for direct commands
        intent = "project_info";
        confidence = 0.8;
    }

    return {
        intent,
        material_name: materialName,
        quantity,
        unit,
        estimated_total_cost,
        status,
        delivery_date,
        project_name: intent === 'project_info' ? materialName : undefined,
        confidence: Math.min(confidence, 1.0)
    };
};

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Check, X, Loader2, Zap, ArrowRight } from "lucide-react";
import { parseMaterialRequest, ParsedMaterialRequest } from "@/lib/aiMaterialParser";
import { NewMaterial, Material } from "@/hooks/useMaterials";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AIChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMaterialCreate: (material: NewMaterial) => Promise<void>;
    userId: string | undefined;
    projects?: Array<{ id: string; name: string }>;
    stages?: Array<{ id: string; name: string; project_id: string }>;
    suppliers?: Array<{ id: string; name: string }>;
    materials?: Material[];
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    parsedData?: ParsedMaterialRequest;
    options?: Array<{ label: string; value: string; type: "project" | "stage" | "supplier" | "action" }>;
}

type ConversationState = "IDLE" | "COLLECTING_PROJECT" | "COLLECTING_STAGE" | "COLLECTING_SUPPLIER" | "COLLECTING_UNIT" | "COLLECTING_DATE" | "COLLECTING_COST" | "CONFIRMING" | "COLLECTING_PROJECT_INFO_NAME";

export const AIChatDialog: React.FC<AIChatDialogProps> = ({
    open,
    onOpenChange,
    onMaterialCreate,
    userId,
    projects = [],
    stages = [],
    suppliers = [],
    materials = [],
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Olá! Eu sou seu assistente de almoxarifado. Diga-me o que você precisa adicionar. Exemplo: '50 sacos de cimento'",
            timestamp: new Date(),
            options: []
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingMaterial, setPendingMaterial] = useState<ParsedMaterialRequest | null>(null);
    const [conversationState, setConversationState] = useState<ConversationState>("IDLE");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const addMessage = (role: "user" | "assistant", content: string, options?: Message["options"], parsedData?: ParsedMaterialRequest) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                role,
                content,
                timestamp: new Date(),
                options,
                parsedData,
            },
        ]);
    };

    const handleOptionClick = (option: { label: string; value: string; type: string }) => {


        if (option.type === "action" && (option.value === "un" || option.value === "m" || option.value === "kg" || option.value === "sacos" || option.value === "caixas")) {
            if (pendingMaterial) {
                const updated = { ...pendingMaterial, unit: option.value };
                setPendingMaterial(updated);
                addMessage("user", option.label);
                processNextStep(updated, "COLLECTING_UNIT");
            }
            return;
        }

        if (option.type === "action" && (option.value === "today" || option.value === "tomorrow" || option.value === "skip")) {
            if (pendingMaterial) {
                let date = undefined;
                if (option.value === "today") date = new Date().toISOString().split('T')[0];
                if (option.value === "tomorrow") {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    date = d.toISOString().split('T')[0];
                }
                const updated = { ...pendingMaterial, delivery_date: date };
                setPendingMaterial(updated);
                addMessage("user", option.label);
                processNextStep(updated, "COLLECTING_DATE");
            }
            return;
        }



        // Handle selection options (Project, Stage, Supplier)
        if (pendingMaterial) {
            const updatedMaterial = { ...pendingMaterial };

            if (option.type === "project") {
                updatedMaterial.project_name = option.label;
                // Also store ID if possible, but parser uses names. We'll map back later or store in a separate state if needed.
                // For now, let's assume we just need the name for display/confirmation and ID mapping happens at creation.
                setPendingMaterial(updatedMaterial);
                addMessage("user", option.label);
                processNextStep(updatedMaterial, "COLLECTING_PROJECT");
            } else if (option.type === "stage") {
                updatedMaterial.stage_name = option.label;
                setPendingMaterial(updatedMaterial);
                addMessage("user", option.label);
                processNextStep(updatedMaterial, "COLLECTING_STAGE");
            } else if (option.type === "supplier") {
                updatedMaterial.supplier_name = option.label;
                setPendingMaterial(updatedMaterial);
                addMessage("user", option.label);
                processNextStep(updatedMaterial, "COLLECTING_SUPPLIER");
            }
        }
    };

    const processNextStep = (currentMaterial: ParsedMaterialRequest, lastState: ConversationState) => {
        setIsProcessing(true);
        setTimeout(() => {
            // Logic to determine next question based on missing fields

            // 1. Check Project
            if (!currentMaterial.project_name && lastState !== "COLLECTING_PROJECT" && projects.length > 0) {
                setConversationState("COLLECTING_PROJECT");
                addMessage("assistant", "Para qual projeto é este material?",
                    projects.map(p => ({ label: p.name, value: p.id, type: "project" as const }))
                );
                setIsProcessing(false);
                return;
            }

            // 2. Check Stage (Skip if no project selected)
            // We need to know the project ID to filter stages, or just show all if none selected (but that's messy).
            // Let's try to find the project ID from the name
            const selectedProject = projects.find(p => p.name === currentMaterial.project_name);

            if (selectedProject && !currentMaterial.stage_name && lastState !== "COLLECTING_STAGE") {
                const projectStages = stages.filter(s => s.project_id === selectedProject.id);
                if (projectStages.length > 0) {
                    setConversationState("COLLECTING_STAGE");
                    addMessage("assistant", "Para qual etapa?",
                        projectStages.map(s => ({ label: s.name, value: s.id, type: "stage" as const }))
                    );
                    setIsProcessing(false);
                    return;
                }
            }

            // 3. Check Supplier
            if (!currentMaterial.supplier_name && lastState !== "COLLECTING_SUPPLIER" && suppliers.length > 0) {
                setConversationState("COLLECTING_SUPPLIER");
                addMessage("assistant", "Qual o fornecedor?",
                    [
                        ...suppliers.map(s => ({ label: s.name, value: s.id, type: "supplier" as const })),
                        { label: "Pular", value: "skip", type: "supplier" as const } // Option to skip
                    ]
                );
                setIsProcessing(false);
                return;
            }

            // 4. Check Unit
            if (!currentMaterial.unit && lastState !== "COLLECTING_UNIT") {
                setConversationState("COLLECTING_UNIT");
                addMessage("assistant", "Qual a unidade de medida?",
                    [
                        { label: "Unidade (un)", value: "un", type: "action" as const },
                        { label: "Metros (m)", value: "m", type: "action" as const },
                        { label: "Quilos (kg)", value: "kg", type: "action" as const },
                        { label: "Sacos", value: "sacos", type: "action" as const },
                        { label: "Caixas", value: "caixas", type: "action" as const }
                    ]
                );
                setIsProcessing(false);
                return;
            }

            // 5. Check Date
            if (!currentMaterial.delivery_date && lastState !== "COLLECTING_DATE") {
                setConversationState("COLLECTING_DATE");
                addMessage("assistant", "Qual a data de entrega/pagamento? (DD/MM/AAAA)",
                    [
                        { label: "Hoje", value: "today", type: "action" as const },
                        { label: "Amanhã", value: "tomorrow", type: "action" as const },
                        { label: "Pular", value: "skip", type: "action" as const }
                    ]
                );
                setIsProcessing(false);
                return;
            }

            // 6. Check Cost (Always ask if missing)
            if (!currentMaterial.estimated_total_cost && lastState !== "COLLECTING_COST") {
                setConversationState("COLLECTING_COST");
                addMessage("assistant", "Qual o custo total estimado? (Digite 0 se não souber)");
                setIsProcessing(false);
                return;
            }

            // All done -> Confirm
            setConversationState("CONFIRMING");
            addMessage("assistant", `Entendi! Vamos confirmar os detalhes de **${currentMaterial.material_name}**.`, undefined, currentMaterial);
            setIsProcessing(false);

        }, 600);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue("");
        addMessage("user", userText);
        setIsProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            if (conversationState === "IDLE") {
                // Initial parsing
                const parsed = parseMaterialRequest(userText);

                if (parsed.intent === "project_info") {
                    // Handle Project Info Query
                    const projectName = parsed.material_name; // In info mode, material_name might be project name

                    // Try to find project with better matching logic
                    const searchName = projectName?.toLowerCase() || "";
                    let targetProject = undefined;

                    if (searchName.length > 0) {
                        targetProject = projects.find(p => p.name.toLowerCase() === searchName); // Exact match
                        if (!targetProject) {
                            targetProject = projects.find(p => p.name.toLowerCase().startsWith(searchName)); // Starts with
                        }
                        if (!targetProject) {
                            targetProject = projects.find(p => p.name.toLowerCase().includes(searchName)); // Contains
                        }
                    }

                    // If no project name provided or not found, ask for it? 
                    // Or if user just said "resumo", maybe show all projects? 
                    // Let's assume if no specific project found, we ask or show general info.

                    if (targetProject) {
                        // Calculate stats
                        const projectMaterials = materials.filter(m => m.project_id === targetProject?.id);
                        const totalCost = projectMaterials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
                        const totalItems = projectMaterials.length;

                        addMessage("assistant", `📊 **Resumo do Projeto: ${targetProject.name}**\n\n` +
                            `• Total de Materiais: ${totalItems}\n` +
                            `• Custo Total Estimado: R$ ${totalCost.toFixed(2)}\n\n` +
                            `Posso ajudar com mais alguma coisa?`);
                    } else {
                        // If user didn't specify a project, maybe list all?
                        // "Resumo de todos os projetos"
                        if (userText.toLowerCase().includes("todos") || userText.toLowerCase().includes("geral")) {
                            const totalCost = materials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
                            const totalItems = materials.length;
                            addMessage("assistant", `📊 **Resumo Geral (Todos os Projetos)**\n\n` +
                                `• Total de Materiais: ${totalItems}\n` +
                                `• Custo Total Estimado: R$ ${totalCost.toFixed(2)}`);
                        } else {
                            addMessage("assistant", "De qual projeto você quer saber o resumo? (Ex: 'Resumo do projeto Casa Silva')");
                            setConversationState("COLLECTING_PROJECT_INFO_NAME");
                        }
                    }
                    setIsProcessing(false);
                    return;
                }

                if (parsed.confidence > 0.4) {
                    setPendingMaterial(parsed);
                    // Start the flow
                    processNextStep(parsed, "IDLE");
                } else {
                    addMessage("assistant", "Desculpe, não entendi. Tente algo como '10 sacos de cimento' ou 'Resumo do projeto X'.");
                    setIsProcessing(false);
                }
            } else if (conversationState === "COLLECTING_PROJECT_INFO_NAME") {
                // User provided project name for info
                const searchName = userText.toLowerCase();
                let matchedProject = projects.find(p => p.name.toLowerCase() === searchName);
                if (!matchedProject) {
                    matchedProject = projects.find(p => p.name.toLowerCase().startsWith(searchName));
                }
                if (!matchedProject) {
                    matchedProject = projects.find(p => p.name.toLowerCase().includes(searchName));
                }

                if (matchedProject) {
                    const projectMaterials = materials.filter(m => m.project_id === matchedProject.id);
                    const totalCost = projectMaterials.reduce((sum, m) => sum + (m.estimated_total_cost || 0), 0);
                    const totalItems = projectMaterials.length;

                    addMessage("assistant", `📊 **Resumo do Projeto: ${matchedProject.name}**\n\n` +
                        `• Total de Materiais: ${totalItems}\n` +
                        `• Custo Total Estimado: R$ ${totalCost.toFixed(2)}\n\n` +
                        `Posso ajudar com mais alguma coisa?`);
                    setConversationState("IDLE");
                } else {
                    addMessage("assistant", "Não encontrei um projeto com esse nome. Tente novamente ou diga 'cancelar'.");
                    // Keep state as COLLECTING_PROJECT_INFO_NAME unless user cancels
                    if (userText.toLowerCase().includes("cancelar") || userText.toLowerCase().includes("sair")) {
                        setConversationState("IDLE");
                        addMessage("assistant", "Cancelado. O que mais você precisa?");
                    }
                }
                setIsProcessing(false);
            } else if (conversationState === "COLLECTING_PROJECT") {
                // Try to match project name
                const matchedProject = projects.find(p => p.name.toLowerCase().includes(userText.toLowerCase()));
                if (matchedProject && pendingMaterial) {
                    const updated = { ...pendingMaterial, project_name: matchedProject.name };
                    setPendingMaterial(updated);
                    processNextStep(updated, "COLLECTING_PROJECT");
                } else {
                    addMessage("assistant", "Não encontrei esse projeto. Por favor, selecione uma das opções ou tente novamente.");
                    setIsProcessing(false);
                }
            } else if (conversationState === "COLLECTING_STAGE") {
                // Try to match stage name
                const matchedStage = stages.find(s => s.name.toLowerCase().includes(userText.toLowerCase()));
                if (matchedStage && pendingMaterial) {
                    const updated = { ...pendingMaterial, stage_name: matchedStage.name };
                    setPendingMaterial(updated);
                    processNextStep(updated, "COLLECTING_STAGE");
                } else {
                    addMessage("assistant", "Não encontrei essa etapa. Por favor, selecione uma das opções ou tente novamente.");
                    setIsProcessing(false);
                }
            } else if (conversationState === "COLLECTING_SUPPLIER") {
                // Try to match supplier name
                const matchedSupplier = suppliers.find(s => s.name.toLowerCase().includes(userText.toLowerCase()));
                if (matchedSupplier && pendingMaterial) {
                    const updated = { ...pendingMaterial, supplier_name: matchedSupplier.name };
                    setPendingMaterial(updated);
                    processNextStep(updated, "COLLECTING_SUPPLIER");
                } else if (userText.toLowerCase().includes("pular") || userText.toLowerCase().includes("skip")) {
                    // Skip supplier
                    const updated = { ...pendingMaterial!, supplier_name: undefined }; // Explicitly undefined to move on? No, parser uses undefined to mean missing. 
                    // Wait, if we skip, we should probably mark it as skipped or just leave it undefined but move state forward.
                    // But processNextStep checks if !supplier_name. So we need a way to say "user skipped".
                    // Let's just leave it undefined but pass the state so it doesn't ask again?
                    // Ah, processNextStep checks `lastState !== "COLLECTING_SUPPLIER"`. So if we pass "COLLECTING_SUPPLIER", it won't ask again.
                    processNextStep(pendingMaterial!, "COLLECTING_SUPPLIER");
                } else {
                    addMessage("assistant", "Não encontrei esse fornecedor. Por favor, selecione uma das opções ou tente novamente.");
                    setIsProcessing(false);
                }
            } else if (conversationState === "COLLECTING_COST") {
                // Parse cost from input
                const costMatch = userText.match(/(\d+([.,]\d+)?)/);
                if (costMatch && pendingMaterial) {
                    const cost = parseFloat(costMatch[0].replace(',', '.'));
                    const updated = { ...pendingMaterial, estimated_total_cost: cost };
                    setPendingMaterial(updated);
                    processNextStep(updated, "COLLECTING_COST");
                } else {
                    // Could not parse cost, ask again or skip? Let's assume text might be "não sei" -> 0
                    if (userText.toLowerCase().includes("não") || userText.toLowerCase().includes("skip")) {
                        const updated = { ...pendingMaterial!, estimated_total_cost: 0 };
                        setPendingMaterial(updated);
                        processNextStep(updated, "COLLECTING_COST");
                    } else {
                        addMessage("assistant", "Não entendi o valor. Digite apenas o número (ex: 500) ou '0' para pular.");
                        setIsProcessing(false);
                    }
                }
            } else if (conversationState === "COLLECTING_UNIT") {
                const unit = userText.toLowerCase().trim();
                const updated = { ...pendingMaterial!, unit };
                setPendingMaterial(updated);
                processNextStep(updated, "COLLECTING_UNIT");
            } else if (conversationState === "COLLECTING_DATE") {
                // Parse date
                let date = userText;
                if (userText.toLowerCase() === "hoje" || userText === "today") {
                    date = new Date().toISOString().split('T')[0];
                } else if (userText.toLowerCase() === "amanhã" || userText === "tomorrow") {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    date = d.toISOString().split('T')[0];
                } else if (userText.toLowerCase() === "pular" || userText === "skip") {
                    date = ""; // Skip
                } else {
                    // Try to parse DD/MM/YYYY
                    const dateMatch = userText.match(/(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?/);
                    if (dateMatch) {
                        const day = dateMatch[1].padStart(2, '0');
                        const month = dateMatch[2].padStart(2, '0');
                        const year = dateMatch[4] ? (dateMatch[4].length === 2 ? `20${dateMatch[4]}` : dateMatch[4]) : new Date().getFullYear().toString();
                        date = `${year}-${month}-${day}`;
                    }
                }

                const updated = { ...pendingMaterial!, delivery_date: date || undefined };
                setPendingMaterial(updated);
                processNextStep(updated, "COLLECTING_DATE");
            } else {
                // Fallback for other states if user types instead of clicking options
                // For now, just try to parse again or treat as refinement
                const parsed = parseMaterialRequest(userText);
                // Merge with existing
                const updated = { ...pendingMaterial, ...parsed };
                setPendingMaterial(updated);
                processNextStep(updated, conversationState);
            }
        }, 800);
    };

    const handleConfirmMaterial = async () => {
        if (!pendingMaterial || !userId) return;

        setIsProcessing(true);
        try {
            // Map names back to IDs
            const project = projects.find(p => p.name === pendingMaterial.project_name);
            const stage = stages.find(s => s.name === pendingMaterial.stage_name && s.project_id === project?.id);
            const supplier = suppliers.find(s => s.name === pendingMaterial.supplier_name);

            const newMaterial: NewMaterial = {
                material_name: pendingMaterial.material_name || "Material Desconhecido",
                quantity: pendingMaterial.quantity || 1,
                unit: pendingMaterial.unit || "un",
                status: pendingMaterial.status || "requested",
                estimated_total_cost: pendingMaterial.estimated_total_cost || 0,
                estimated_unit_cost: 0,
                project_id: project?.id || null,
                stage_id: stage?.id || null,
                supplier_id: supplier?.id || null,
                user_id: userId,
                delivery_date: pendingMaterial.delivery_date || null,
                notes: "Adicionado via Assistente IA",
            };

            // Calculate unit cost
            if (newMaterial.estimated_total_cost && newMaterial.quantity) {
                newMaterial.estimated_unit_cost = newMaterial.estimated_total_cost / newMaterial.quantity;
            }

            await onMaterialCreate(newMaterial);

            addMessage("assistant", "✅ Material adicionado com sucesso! Mais alguma coisa?");
            setPendingMaterial(null);
            setConversationState("IDLE");
        } catch (error) {
            addMessage("assistant", "❌ Erro ao adicionar. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelMaterial = () => {
        addMessage("assistant", "Cancelado. O que mais você precisa?");
        setPendingMaterial(null);
        setConversationState("IDLE");
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            // Reset state when closing
            setConversationState("IDLE");
            setPendingMaterial(null);
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Olá! Eu sou seu assistente de almoxarifado. Diga-me o que você precisa adicionar. Exemplo: '50 sacos de cimento'",
                    timestamp: new Date(),
                    options: []
                },
            ]);
            setInputValue("");
            setIsProcessing(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 w-full h-[100dvh] border-0 rounded-none sm:left-[50%] sm:top-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-[500px] sm:h-[650px] sm:max-h-[90vh] sm:rounded-lg sm:border flex flex-col p-0 gap-0 overflow-hidden shadow-xl z-50">
                <DialogHeader className="px-6 py-4 border-b bg-muted/30">
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-5 w-5" />
                            Assistente IA
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Adição detalhada com validação de campos.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className="space-y-2 max-w-[85%]">
                                    <div
                                        className={`p-3 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Options Chips */}
                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.options.map((option) => (
                                                <Button
                                                    key={option.value}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-7 bg-background hover:bg-accent"
                                                    onClick={() => handleOptionClick(option)}
                                                    disabled={isProcessing || conversationState === "CONFIRMING" || msg !== messages[messages.length - 1]}
                                                >
                                                    {option.label}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Confirmation Card */}
                                    {msg.role === "assistant" && msg.parsedData && msg === messages[messages.length - 1] && pendingMaterial && (
                                        <Card className="border-primary/20 bg-primary/5 animate-in fade-in zoom-in-95 duration-300 mt-2">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                                                    <span className="font-semibold text-sm">Resumo do Material</span>
                                                    <Badge variant="secondary" className="text-xs">{pendingMaterial.status === 'delivered' ? 'Entregue' : 'Solicitado'}</Badge>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Material</Label>
                                                            <p className="font-medium truncate" title={pendingMaterial.material_name}>{pendingMaterial.material_name}</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-muted-foreground">Quantidade</Label>
                                                            <p className="font-medium">{pendingMaterial.quantity} {pendingMaterial.unit}</p>
                                                        </div>
                                                        {pendingMaterial.estimated_total_cost !== undefined && pendingMaterial.estimated_total_cost > 0 && (
                                                            <div>
                                                                <Label className="text-xs text-muted-foreground">Custo Total</Label>
                                                                <p className="font-medium">R$ {pendingMaterial.estimated_total_cost.toFixed(2)}</p>
                                                            </div>
                                                        )}
                                                        {pendingMaterial.delivery_date && (
                                                            <div>
                                                                <Label className="text-xs text-muted-foreground">Data</Label>
                                                                <p className="font-medium">{new Date(pendingMaterial.delivery_date).toLocaleDateString('pt-BR')}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {(pendingMaterial.project_name || pendingMaterial.supplier_name) && (
                                                        <>
                                                            <Separator className="bg-primary/10" />
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                                {pendingMaterial.project_name && (
                                                                    <div className="col-span-2">
                                                                        <Label className="text-xs text-muted-foreground">Projeto / Etapa</Label>
                                                                        <p className="font-medium truncate">
                                                                            {pendingMaterial.project_name}
                                                                            {pendingMaterial.stage_name ? ` > ${pendingMaterial.stage_name}` : ''}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {pendingMaterial.supplier_name && (
                                                                    <div className="col-span-2">
                                                                        <Label className="text-xs text-muted-foreground">Fornecedor</Label>
                                                                        <p className="font-medium truncate">{pendingMaterial.supplier_name}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={handleConfirmMaterial}
                                                        disabled={isProcessing}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Confirmar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={handleCancelMaterial}
                                                        disabled={isProcessing}
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Cancelar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isProcessing && !pendingMaterial && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted text-foreground p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-xs text-muted-foreground">Processando...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-4 border-t bg-background">
                    <form
                        className="flex w-full gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                    >
                        <Input
                            placeholder={
                                conversationState === "COLLECTING_COST"
                                    ? "Digite o valor (ex: 500)..."
                                    : "Digite aqui... (ex: 10m de areia)"
                            }
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isProcessing || (conversationState === "CONFIRMING")}
                            className="flex-1"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isProcessing || !inputValue.trim() || (conversationState === "CONFIRMING")}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

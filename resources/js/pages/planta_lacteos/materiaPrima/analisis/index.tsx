import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Printer, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { type ReactNode, useState } from 'react';
import { route } from 'ziggy-js';
import { useAuth } from '@/hooks/useAuth';
import ReporteAnalisisMateriaPrima from '../../../../pdf/ReporteAnalisisMateriaPrima';

interface Analisis {
    id: number;
    numero_muestra: number;
    created_at: string | null;
    // Todos los campos posibles
    lote: string | null;
    temperatura: number | null;
    ph: number | null;
    solidos: number | null;
    viscosidad: number | null;
    densidad: number | null;
    acidez: number | null;
    color: boolean | null;
    olor: boolean | null;
    sabor: boolean | null;
    aspecto: boolean | null;
    textura: boolean | null;
    sin_material_extraño: boolean | null;
    conformidad: boolean | null;
    observaciones: string | null;
    numero_bobina: string | null;
    peso_neto: number | null;
    adherencia: boolean | null;
    frotacion: boolean | null;
    texto: boolean | null;
    sentido_embobinado: boolean | null;
    largo_envase: number | null;
    ancho_envase: number | null;
    largo_taca: number | null;
    ancho_taca: number | null;
    distancia_taca_borde: number | null;
    largo_superior: string | null;
    largo_inferior: string | null;
    ancho: string | null;
    densidad_lineal: number | null;
    numero_paquete: string | null;
    peso_unitario: number | null;
    largo_total: number | null;
    ancho_total: number | null;
    ancho_plegado: number | null;
    micronaje: string | null;
    resistencia_envase: boolean | null;
    transparencia: boolean | null;
    calidad_impresion: boolean | null;
    numero_embalaje: string | null;
    espesor: number | null;
    altura_total: number | null;
    diametro_medio: number | null;
    altura_etiqueta: number | null;
    perimetro_etiqueta: number | null;
    diametro_cuello: number | null;
    altura_plegada: number | null;
    diametro_externo_base: number | null;
    diametro_interno: number | null;
    acabado_fino: boolean | null;
    sin_deformidad: boolean | null;
    resistencia_base: boolean | null;
    tiempo_analisis: string | null;
    user?: { name: string; apellido: string };
}

type PageProps = {
    recepcion: {
        id: number;
        tiempo: string;
        item_materia_prima: { nombre: string; categoriaMateriaPrima?: { nombre: string } };
        proveedor_materia_prima: { nombre: string };
        user: { name: string; apellido: string };
        unidades: number;
        estado_revision_id?: number | null;
        estado_revision?: { id: number; nombre: string } | null;
        revisor_id?: number | null;
        revisor?: { name: string; apellido: string } | null;
    };
    analisis: Analisis[];
    categoria?: { nombre: string };
} & Record<string, unknown>;

type AnalisisFieldKey = Exclude<keyof Analisis, 'user'>;

type FieldConfig = {
    key: AnalisisFieldKey;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'datetime-local' | 'textarea';
};

type ViewConfig = {
    id: string;
    title: string;
    tableColumns: Array<{
        key: AnalisisFieldKey;
        label: string;
        render?: (item: Analisis) => string | number | ReactNode | null;
    }>;
    dialogSections: Array<{
        title: string;
        fields: FieldConfig[];
    }>;
};

const booleanFieldNames = [
    'color',
    'olor',
    'sabor',
    'aspecto',
    'textura',
    'sin_material_extraño',
    'conformidad',
    'adherencia',
    'frotacion',
    'texto',
    'sentido_embobinado',
    'resistencia_envase',
    'transparencia',
    'calidad_impresion',
    'acabado_fino',
    'sin_deformidad',
    'resistencia_base',
] as const;

// Función para convertir cadena decimal (con coma o punto) a número
const parseDecimal = (value: string): number | null => {
    if (value === '' || value === null || value === undefined) return null;
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
};

export default function Index() {
    const { recepcion, analisis, categoria } = usePage<PageProps>().props;
    const { isAdmin } = useAuth();

    const [editingAnalisis, setEditingAnalisis] = useState<Analisis | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Analisis>>({});
    const [saving, setSaving] = useState(false);
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [eliminandoAnalisis, setEliminandoAnalisis] = useState(false);
    const [marcandoRevisado, setMarcandoRevisado] = useState(false);
    const urlPdf = route('analisis-materia-prima.pdf', { recepcion: recepcion.id });

    // Determina si el botón de PDF debe estar habilitado
    const pdfHabilitado = isAdmin || recepcion.estado_revision?.nombre === 'Revisado';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Recepciones de materia prima',
            href: route('recepciones-materia-prima.index2'),
        },
        {
            title: `Análisis - Recepción #${recepcion.id}`,
            href: route('recepciones-materia-prima.analisis.index', recepcion.id),
        },
    ];

    const normalizeFormData = (analisisItem: Analisis): Partial<Analisis> => {
        const normalized = { ...analisisItem } as Partial<Analisis> & Record<string, boolean | null>;

        booleanFieldNames.forEach((field) => {
            if (normalized[field] === null || normalized[field] === undefined) {
                normalized[field] = true;
            }
        });

        // Convertir números a string para que se muestren correctamente en inputs de texto
        // (solo los campos que son number en la definición)
        const numberFields: (keyof Analisis)[] = [
            'temperatura', 'ph', 'solidos', 'viscosidad', 'densidad', 'acidez',
            'peso_neto', 'largo_envase', 'ancho_envase', 'largo_taca', 'ancho_taca',
            'distancia_taca_borde', 'densidad_lineal', 'peso_unitario', 'largo_total',
            'ancho_total', 'ancho_plegado', 'espesor', 'altura_total', 'diametro_medio',
            'altura_etiqueta', 'perimetro_etiqueta', 'diametro_cuello', 'altura_plegada',
            'diametro_externo_base', 'diametro_interno'
        ];
        numberFields.forEach((field) => {
            if (normalized[field] !== undefined && normalized[field] !== null) {
                // Convertir a string
                (normalized as any)[field] = String(normalized[field]);
            }
        });

        return normalized;
    };

    const openEditDialog = (analisisItem: Analisis) => {
        setEditingAnalisis(analisisItem);
        setFormData(normalizeFormData(analisisItem));
        setDialogOpen(true);
    };

    const handleInputChange = (field: keyof Analisis, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleBooleanChange = (field: keyof Analisis, value: string) => {
        let boolValue: boolean | null = null;
        if (value === 'true') boolValue = true;
        else if (value === 'false') boolValue = false;
        setFormData((prev) => ({ ...prev, [field]: boolValue }));
    };

    const handleSave = () => {
        if (!editingAnalisis) return;
        setSaving(true);

        // Convertir los campos numéricos (que están como string) a número antes de enviar
        const dataToSend = { ...formData } as Partial<Record<keyof Analisis, any>>;
        const numberFields: (keyof Analisis)[] = [
            'temperatura', 'ph', 'solidos', 'viscosidad', 'densidad', 'acidez',
            'peso_neto', 'largo_envase', 'ancho_envase', 'largo_taca', 'ancho_taca',
            'distancia_taca_borde', 'densidad_lineal', 'peso_unitario', 'largo_total',
            'ancho_total', 'ancho_plegado', 'espesor', 'altura_total', 'diametro_medio',
            'altura_etiqueta', 'perimetro_etiqueta', 'diametro_cuello', 'altura_plegada',
            'diametro_externo_base', 'diametro_interno'
        ];
        numberFields.forEach((field) => {
            const val = dataToSend[field];
            if (val !== undefined && val !== null && val !== '') {
                if (typeof val === 'string') {
                    dataToSend[field] = parseDecimal(val);
                }
            } else {
                dataToSend[field] = null;
            }
        });

        router.put(
            route('analisis-materia-prima.update', editingAnalisis.id),
            dataToSend,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setSaving(false);
                },
                onError: () => setSaving(false),
            }
        );
    };

    const fetchDatosPdf = async () => {
        const params = new URLSearchParams();
        // Pedimos todos los análisis de la recepción actual filtrando por la vista activa
        params.append('view_id', currentViewId);

        const response = await fetch(`${urlPdf}?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText.substring(0, 500));
        }

        return response.json();
    };

    const handleMostrarPdf = async () => {
        setGenerandoPdf(true);
        try {
            const data = await fetchDatosPdf();
            if (!data.analisis || data.analisis.length === 0) {
                alert('No hay análisis para esta recepción');
                return;
            }
            setDatosPdf(data);
            setMostrarPdf(true);
        } catch (error: any) {
            console.error(error);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const handleEliminarTodosAnalisis = () => {
        if (!confirm('¿Eliminar todos los análisis de esta recepción? Esta acción no se puede deshacer.')) {
            return;
        }

        setEliminandoAnalisis(true);
        router.delete(route('recepciones-materia-prima.analisis.destroy-all', recepcion.id), {
            preserveScroll: true,
            onFinish: () => setEliminandoAnalisis(false),
        });
    };

    const handleMarcarRevisado = () => {
        setMarcandoRevisado(true);
        router.post(
            route('recepciones-materia-prima.marcar-revisado', recepcion.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setMarcandoRevisado(false),
            }
        );
    };

    // ================== CONFIGURACIÓN DE VISTAS ==================
    // Aquí defines las 4 vistas con sus nombres personalizados.
    // Puedes cambiar los títulos y los campos mostrados en cada una.
    const views: Record<string, ViewConfig> = {
        // 1. VISTA INSUMOS (antes "básica")
        insumos: {
            id: 'insumos',
            title: 'Insumos',
            tableColumns: [
                { key: 'created_at', label: 'Fecha análisis', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('es-BO') : 'N/A' },
                { key: 'lote', label: 'Lote' },
                { key: 'temperatura', label: 'Temp. [°C]' },
                { key: 'ph', label: 'pH' },
                { key: 'solidos', label: 'Sólidos [°Bx]' },
                { key: 'viscosidad', label: 'Viscosidad [s]' },
                { key: 'densidad', label: 'Densidad [g/mL]' },
                { key: 'acidez', label: 'Acidez [% ácido láctico]' },
                { key: 'color', label: 'Color', render: (item) => renderBoolean(item.color) },
                { key: 'olor', label: 'Olor', render: (item) => renderBoolean(item.olor) },
                { key: 'sabor', label: 'Sabor', render: (item) => renderBoolean(item.sabor) },
                { key: 'aspecto', label: 'Aspecto', render: (item) => renderBoolean(item.aspecto) },
                { key: 'textura', label: 'Textura', render: (item) => renderBoolean(item.textura) },
                { key: 'sin_material_extraño', label: 'Sin mat. extraño', render: (item) => renderBoolean(item.sin_material_extraño) },
                { key: 'conformidad', label: 'Conformidad', render: (item) => renderBoolean(item.conformidad) },
                { key: 'observaciones', label: 'Observaciones' },
            ],
            dialogSections: [
                {
                    title: 'General',
                    fields: [
                        { key: 'lote', label: 'Lote', type: 'text' },
                        { key: 'temperatura', label: 'Temperatura (°C)', type: 'number' },
                        { key: 'ph', label: 'pH', type: 'number' },
                        { key: 'solidos', label: 'Sólidos (°Brix)', type: 'number' },
                        { key: 'viscosidad', label: 'Viscosidad (s)', type: 'number' },
                        { key: 'densidad', label: 'Densidad (g/ml)', type: 'number' },
                        { key: 'acidez', label: 'Acidez (%Ácido láctico)', type: 'number' },
                        { key: 'color', label: 'Color', type: 'boolean' },
                        { key: 'olor', label: 'Olor', type: 'boolean' },
                        { key: 'sabor', label: 'Sabor', type: 'boolean' },
                        { key: 'aspecto', label: 'Aspecto', type: 'boolean' },
                        { key: 'textura', label: 'Textura', type: 'boolean' },
                        { key: 'sin_material_extraño', label: 'Sin material extraño', type: 'boolean' },
                        { key: 'conformidad', label: 'Conformidad', type: 'boolean' },
                        { key: 'observaciones', label: 'Observaciones', type: 'textarea' }
                    ],
                },
            ],
        },

        // 2. VISTA EMPAQUE (antes "organoléptica")
        empaque: {
            id: 'empaque',
            title: 'Empaque',
            tableColumns: [
                { key: 'created_at', label: 'Fecha análisis', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('es-BO') : 'N/A' },
                { key: 'numero_paquete', label: 'N° Paquete' },
                { key: 'peso_neto', label: 'Peso neto [kg]' },
                { key: 'peso_unitario', label: 'Peso unitario [g]' },
                { key: 'largo_total', label: 'Largo total [cm]' },
                { key: 'ancho_total', label: 'Ancho total [cm]' },
                { key: 'ancho_plegado', label: 'Ancho plegado [mm]' },
                { key: 'micronaje', label: 'Micronaje [µm]' },
                { key: 'resistencia_envase', label: 'Res. envase', render: (item) => renderBoolean(item.resistencia_envase) },
                { key: 'transparencia', label: 'Transparencia', render: (item) => renderBoolean(item.transparencia) },
                { key: 'calidad_impresion', label: 'Calidad impresión', render: (item) => renderBoolean(item.calidad_impresion) },
                { key: 'olor', label: 'Olor', render: (item) => renderBoolean(item.olor) },
                { key: 'sin_material_extraño', label: 'Sin mat. extraño', render: (item) => renderBoolean(item.sin_material_extraño) },
                { key: 'conformidad', label: 'Conformidad', render: (item) => renderBoolean(item.conformidad) },
                { key: 'observaciones', label: 'Observaciones' },
            ],
            dialogSections: [
                {
                    title: 'Sensorial',
                    fields: [
                        { key: 'numero_paquete', label: 'N° Paquete', type: 'text' },
                        { key: 'peso_neto', label: 'Peso neto (Kg)', type: 'number' },
                        { key: 'peso_unitario', label: 'Peso unitario (g)', type: 'number' },
                        { key: 'largo_total', label: 'Largo total (cm)', type: 'number' },
                        { key: 'ancho_total', label: 'Ancho total (cm)', type: 'number' },
                        { key: 'ancho_plegado', label: 'Ancho plegado (mm)', type: 'number' },
                        { key: 'micronaje', label: 'Micronaje (µ)', type: 'text' },
                        { key: 'resistencia_envase', label: 'Resistencia envase', type: 'boolean' },
                        { key: 'transparencia', label: 'Transparencia', type: 'boolean' },
                        { key: 'calidad_impresion', label: 'Calidad impresión', type: 'boolean' },
                        { key: 'olor', label: 'Olor', type: 'boolean' },
                        { key: 'sin_material_extraño', label: 'Sin material extraño', type: 'boolean' },
                        { key: 'conformidad', label: 'Conformidad', type: 'boolean' },
                        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
                    ],
                },
            ],
        },

        // 3. VISTA BOBINA (antes "envase")
        bobina: {
            id: 'bobina',
            title: 'Bobina',
            tableColumns: [
                { key: 'created_at', label: 'Fecha análisis', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('es-BO') : 'N/A' },
                { key: 'numero_bobina', label: 'N° Bobina' },
                { key: 'peso_neto', label: 'Peso neto' },
                { key: 'adherencia', label: 'Adherencia', render: (item) => renderBoolean(item.adherencia) },
                { key: 'frotacion', label: 'Frotación', render: (item) => renderBoolean(item.frotacion) },
                { key: 'color', label: 'Color', render: (item) => renderBoolean(item.color) },
                { key: 'texto', label: 'Texto', render: (item) => renderBoolean(item.texto) },
                { key: 'olor', label: 'Olor', render: (item) => renderBoolean(item.olor) },
                { key: 'sentido_embobinado', label: 'Sentido embobinado', render: (item) => renderBoolean(item.sentido_embobinado) },
                { key: 'largo_envase', label: 'Largo envase [cm]' },
                { key: 'ancho_envase', label: 'Ancho envase [cm]' },
                { key: 'largo_taca', label: 'Largo taca [mm]' },
                { key: 'ancho_taca', label: 'Ancho taca [mm]' },
                { key: 'distancia_taca_borde', label: 'Distancia taca-borde [cm]' },
                { key: 'largo_superior', label: 'Largo superior [µm]' },
                { key: 'largo_inferior', label: 'Largo inferior [µm]' },
                { key: 'ancho', label: 'Ancho superior [µm]' },
                { key: 'densidad_lineal', label: 'Gramaje [g/m²]' },
                { key: 'conformidad', label: 'Conformidad', render: (item) => renderBoolean(item.conformidad) },
                { key: 'observaciones', label: 'Observaciones' },
            ],
            dialogSections: [
                {
                    title: 'Datos de Bobina',
                    fields: [
                        { key: 'numero_bobina', label: 'N° Bobina', type: 'text' },
                        { key: 'peso_neto', label: 'Peso Neto', type: 'number' },
                        { key: 'adherencia', label: 'Adherencia', type: 'boolean' },
                        { key: 'frotacion', label: 'Frotación', type: 'boolean' },
                        { key: 'color', label: 'Color', type: 'boolean' },
                        { key: 'texto', label: 'Texto', type: 'boolean' },
                        { key: 'olor', label: 'Olor', type: 'boolean' },
                        { key: 'sentido_embobinado', label: 'Sentido embobinado', type: 'boolean' },
                        { key: 'largo_envase', label: 'Largo envase (cm)', type: 'number' },
                        { key: 'ancho_envase', label: 'Ancho envase (cm)', type: 'number' },
                        { key: 'largo_taca', label: 'Largo taca (mm)', type: 'number' },
                        { key: 'ancho_taca', label: 'Ancho taca (mm)', type: 'number' },
                        { key: 'distancia_taca_borde', label: 'Distancia taca-borde (cm)', type: 'number' },
                        { key: 'largo_superior', label: 'Largo superior (µm)', type: 'text' },
                        { key: 'largo_inferior', label: 'Largo inferior (µm)', type: 'text' },
                        { key: 'ancho', label: 'Ancho superior (µm)', type: 'text' },

                        { key: 'densidad_lineal', label: 'Gramaje (g/m²)', type: 'number' },
                        { key: 'conformidad', label: 'Conformidad', type: 'boolean' },
                        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
                    ],
                },
            ],
        },

        // 4. VISTA ACCESORIOS (antes "fisicoquimica")
        accesorios: {
            id: 'accesorios',
            title: 'Accesorios',
            tableColumns: [
                { key: 'created_at', label: 'Fecha análisis', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('es-BO') : 'N/A' },
                { key: 'numero_embalaje', label: 'N° Embalaje' },
                { key: 'peso_unitario', label: 'Peso unitario [g]' },
                { key: 'espesor', label: 'Espesor [mm]' },
                { key: 'altura_total', label: 'Altura total [mm]' },
                { key: 'diametro_medio', label: 'Diámetro medio [mm]' },
                { key: 'altura_etiqueta', label: 'Altura etiqueta [mm]' },
                { key: 'perimetro_etiqueta', label: 'Perímetro etiqueta [mm]' },
                { key: 'diametro_cuello', label: 'Diámetro cuello [mm]' },
                { key: 'largo_total', label: 'Largo total [mm]' },
                { key: 'ancho_total', label: 'Ancho total [mm]' },
                { key: 'altura_plegada', label: 'Altura plegada [mm]' },
                { key: 'diametro_externo_base', label: 'Diámetro ext. base [mm]' },
                { key: 'diametro_interno', label: 'Diámetro interno [mm]' },
                { key: 'acabado_fino', label: 'Acabado fino', render: (item) => renderBoolean(item.acabado_fino) },
                { key: 'sin_deformidad', label: 'Sin deformidad', render: (item) => renderBoolean(item.sin_deformidad) },
                { key: 'resistencia_base', label: 'Resistencia base', render: (item) => renderBoolean(item.resistencia_base) },
                { key: 'olor', label: 'Olor', render: (item) => renderBoolean(item.olor) },
                { key: 'color', label: 'Color', render: (item) => renderBoolean(item.color) },
                { key: 'texto', label: 'Texto', render: (item) => renderBoolean(item.texto) },
                { key: 'sin_material_extraño', label: 'Sin mat. extraño', render: (item) => renderBoolean(item.sin_material_extraño) },
                { key: 'conformidad', label: 'Conformidad', render: (item) => renderBoolean(item.conformidad) },
                { key: 'observaciones', label: 'Observaciones' },
            ],
            dialogSections: [
                {
                    title: 'Físico-Químicos',
                    fields: [
                        { key: 'numero_embalaje', label: 'N° Embalaje', type: 'text' },
                        { key: 'peso_unitario', label: 'Peso unitario (g)', type: 'number' },
                        { key: 'espesor', label: 'Espesor (mm)', type: 'number' },
                        { key: 'altura_total', label: 'Altura total (mm)', type: 'number' },
                        { key: 'diametro_medio', label: 'Diámetro medio (mm)', type: 'number' },
                        { key: 'altura_etiqueta', label: 'Altura etiqueta (mm)', type: 'number' },
                        { key: 'perimetro_etiqueta', label: 'Perímetro etiqueta (mm)', type: 'number' },
                        { key: 'diametro_cuello', label: 'Diámetro cuello (mm)', type: 'number' },
                        { key: 'largo_total', label: 'Largo total (mm)', type: 'number' },
                        { key: 'ancho_total', label: 'Ancho total (mm)', type: 'number' },
                        { key: 'altura_plegada', label: 'Altura plegada (mm)', type: 'number' },
                        { key: 'diametro_externo_base', label: 'Diámetro ext. base (mm)', type: 'number' },
                        { key: 'diametro_interno', label: 'Diámetro interno (mm)', type: 'number' },
                        { key: 'acabado_fino', label: 'Acabado fino', type: 'boolean' },
                        { key: 'sin_deformidad', label: 'Sin deformidad', type: 'boolean' },
                        { key: 'resistencia_base', label: 'Resistencia base', type: 'boolean' },
                        { key: 'olor', label: 'Olor', type: 'boolean' },
                        { key: 'color', label: 'Color', type: 'boolean' },
                        { key: 'texto', label: 'Texto', type: 'boolean' },
                        { key: 'sin_material_extraño', label: 'Sin material extraño', type: 'boolean' },
                        { key: 'conformidad', label: 'Conformidad', type: 'boolean' },
                        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
                    ],
                },
            ],
        },
    };

    // ================== MAPEO CATEGORÍAS → VISTAS ==================
    const categoryViewMap: Record<string, string> = {
        'Aditivos': 'insumos',
        'Cereales': 'insumos',
        'Colorantes': 'insumos',
        'Conservantes': 'insumos',
        'Cultivos': 'insumos',
        'Edulcorantes': 'insumos',
        'Enturbiantes': 'insumos',
        'Esencias': 'insumos',
        'Estabilizantes': 'insumos',
        'Fortificantes': 'insumos',
        'Harinas': 'insumos',
        'Pulpas': 'insumos',
        'Reguladores de acidez': 'insumos',
        'Sustituto lácteo': 'insumos',
        'Sustancias químicas': 'insumos',
        'Envases': 'bobina',
        'Detergentes': 'accesorios',
    };

    const defaultViewId = 'insumos';

    const getDefaultViewId = () => {
        const catName = categoria?.nombre || '';
        return categoryViewMap[catName] || defaultViewId;
    };

    const [currentViewId, setCurrentViewId] = useState<string>(getDefaultViewId());
    const currentView = views[currentViewId] || views[defaultViewId];

    // ================== FUNCIONES AUXILIARES ==================
    const renderBoolean = (value: boolean | null) => {
        if (value === null || value === undefined) return 'N/A';
        return value ? 'C.' : 'N.C.';
    };

    const formatNumber = (value: any) => {
        if (value === null || value === undefined || value === '') return 'N/A';
        // If already a number, normalize it
        if (typeof value === 'number') return Number(value).toString();
        // If string, try to parse as number
        if (typeof value === 'string') {
            const parsed = Number(value.replace(',', '.'));
            if (!isNaN(parsed) && isFinite(parsed)) {
                return parsed.toString();
            }
            return value;
        }
        return String(value);
    };

    const getDisplayValue = (item: Analisis, column: { key: AnalisisFieldKey; render?: (item: Analisis) => string | number | ReactNode | null }) => {
        if (column.render) return column.render(item);
        const value = item[column.key];
        if (value === null || value === undefined || value === '') {
            return column.key === 'observaciones' ? '-' : 'N/A';
        }
        if (typeof value === 'boolean') return renderBoolean(value);
        if (typeof value === 'number') return formatNumber(value);
        if (typeof value === 'string') {
            // Try to normalize numeric-looking strings (e.g. ".2" or "0.2000")
            const parsed = Number(value.replace(',', '.'));
            if (!isNaN(parsed) && isFinite(parsed)) return formatNumber(parsed);
            return value;
        }
        return String(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Análisis de Recepción #${recepcion.id}`} />
            <div className="space-y-4 p-4">
                {/* Botón volver */}
                <Button
                    variant="outline"
                    onClick={() => router.visit(route('recepciones-materia-prima.index2'))}
                    className="mb-2"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a recepciones
                </Button>

                {/* Información de la recepción */}
                <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Recepción</span>
                            <p className="font-medium">#{recepcion.id}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Fecha</span>
                            <p className="font-medium">{new Date(recepcion.tiempo).toLocaleDateString('es-BO')}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Materia Prima</span>
                            <p className="font-medium">{recepcion.item_materia_prima.nombre}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Categoría</span>
                            <p className="font-medium">{categoria?.nombre || '-'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Proveedor</span>
                            <p className="font-medium">{recepcion.proveedor_materia_prima.nombre}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Usuario</span>
                            <p className="font-medium">{recepcion.user.name} {recepcion.user.apellido}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Unidades</span>
                            <p className="font-medium">{recepcion.unidades || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Selector de vistas (tabs) */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                    {Object.values(views).map((view) => (
                        <Button
                            key={view.id}
                            variant={currentViewId === view.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentViewId(view.id)}
                        >
                            {view.title}
                        </Button>
                    ))}
                </div>

                {/* Controles de reporte */}
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleEliminarTodosAnalisis}
                        disabled={eliminandoAnalisis || analisis.length === 0}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        {eliminandoAnalisis ? 'Eliminando...' : 'Eliminar todos'}
                    </Button>
                    <div className="flex gap-2">
                        {!isAdmin && recepcion.estado_revision?.nombre !== 'Revisado' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarcarRevisado}
                                disabled={marcandoRevisado}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {marcandoRevisado ? 'Marcando...' : 'Marcar como Revisado'}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMostrarPdf}
                            disabled={generandoPdf || !pdfHabilitado}
                            className="flex items-center gap-2"
                            title={!pdfHabilitado ? 'Debe marcar como revisado para ver el PDF' : ''}
                        >
                            <Printer className="h-4 w-4" />
                            {generandoPdf ? 'Generando...' : `Reporte ${currentView.title}`}
                        </Button>
                    </div>
                </div>

                {/* Tabla de análisis */}
                <div className="rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead># Muestra</TableHead>
                                    {currentView.tableColumns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={column.label.includes('[') ? 'normal-case' : undefined}
                                        >
                                            {column.label}
                                        </TableHead>
                                    ))}
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analisis.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="py-8 text-center text-muted-foreground">
                                            No hay muestras de análisis para esta recepción.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analisis.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.numero_muestra}</TableCell>
                                            {currentView.tableColumns.map((column) => (
                                                <TableCell key={`${item.id}-${String(column.key)}`}>
                                                    {getDisplayValue(item, column)}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditDialog(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                        >
                            <span className="sr-only">Cerrar</span>
                            ×
                        </button>
                        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border bg-muted px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Reporte {currentView.title}</p>
                                    <p className="text-xs text-muted-foreground">Recepción #{recepcion.id}</p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            >
                                <ReporteAnalisisMateriaPrima
                                    viewId={currentViewId}
                                    recepcion={datosPdf.recepcion || recepcion}
                                    data={datosPdf.analisis}
                                    usuariosInvolucrados={datosPdf.usuarios_involucrados}
                                    filtros={{}}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Análisis - Muestra #{editingAnalisis?.numero_muestra}</DialogTitle>
                        <DialogDescription>
                            Vista activa: <strong>{currentView.title}</strong>.
                            Puedes cambiar de vista usando los botones superiores.
                        </DialogDescription>
                    </DialogHeader>

                    {editingAnalisis && (
                        <div className="space-y-4">
                            {currentView.dialogSections.map((section) => (
                                <div key={section.title} className="border-b border-border pb-4">
                                    <h3 className="mb-3 text-lg font-semibold">{section.title}</h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {section.fields.map((field) => {
                                            const value = formData[field.key as keyof Analisis];
                                            // Para booleanos, el valor puede ser booleano o string?
                                            const inputValue = value === null || value === undefined ? '' : typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);

                                            if (field.type === 'boolean') {
                                                return (
                                                    <div key={field.key}>
                                                        <Label htmlFor={String(field.key)}>{field.label}</Label>
                                                        <Select
                                                            value={value === false ? 'false' : 'true'}
                                                            onValueChange={(val) => handleBooleanChange(field.key as keyof Analisis, val)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="true">Sí</SelectItem>
                                                                <SelectItem value="false">No</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            } else if (field.type === 'datetime-local') {
                                                return (
                                                    <div key={field.key}>
                                                        <Label htmlFor={String(field.key)}>{field.label}</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id={String(field.key)}
                                                            value={inputValue}
                                                            onChange={(e) => handleInputChange(field.key as keyof Analisis, e.target.value)}
                                                        />
                                                    </div>
                                                );
                                            } else if (field.type === 'textarea') {
                                                return (
                                                    <div key={field.key} className="md:col-span-2 lg:col-span-3">
                                                        <Label htmlFor={String(field.key)}>{field.label}</Label>
                                                        <Textarea
                                                            id={String(field.key)}
                                                            value={inputValue}
                                                            onChange={(e) => handleInputChange(field.key as keyof Analisis, e.target.value)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                // Para campos de texto o numéricos: usamos type="text" + inputMode="decimal" para numéricos
                                                const isNumber = field.type === 'number';
                                                return (
                                                    <div key={field.key}>
                                                        <Label htmlFor={String(field.key)}>{field.label}</Label>
                                                        <Input
                                                            type="text"
                                                            inputMode={isNumber ? 'decimal' : undefined}
                                                            id={String(field.key)}
                                                            value={inputValue}
                                                            onChange={(e) => {
                                                                // Para números, almacenamos el string tal cual
                                                                // Para texto, también
                                                                handleInputChange(field.key as keyof Analisis, e.target.value);
                                                            }}
                                                            // Añadimos step solo para referencia, pero no se usa
                                                            step={isNumber ? 'any' : undefined}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" />Guardar</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

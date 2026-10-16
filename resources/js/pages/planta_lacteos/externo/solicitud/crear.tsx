// // resources/js/Pages/PlantaLacteos/LaboratorioExterno/Solicitudes/Create.tsx
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form';
// import { Toast } from '@/components/ui/toast';
// import AppLayout from '@/layouts/app-layout';
// import { type BreadcrumbItem } from '@/types';
// import { Head, Link, router } from '@inertiajs/react';
// import {
//     Plus,
//     Trash2,
//     Save,
//     ArrowLeft,
//     Calendar,
//     Hash,
//     FileText,
//     Package,
//     Beaker,
//     User,
//     AlertCircle
// } from 'lucide-react';
// import { route } from 'ziggy-js';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';

// const breadcrumbs: BreadcrumbItem[] = [
//     { title: "Planta Lácteos", href: route('laboratorio-externo.solicitudes.index') },
//     { title: "Laboratorio Externo", href: route('laboratorio-externo.solicitudes.index') },
//     { title: "Solicitudes", href: route('laboratorio-externo.solicitudes.index') },
//     { title: "Nueva Solicitud", href: route('laboratorio-externo.solicitudes.create') },
// ];

// // Esquema de validación
// const detalleSchema = z.object({
//     tipo_muestra_id: z.string().min(1, 'Seleccione un tipo de muestra'),
//     tipo: z.enum(['Microbiologico', 'Fisicoquimico'], {
//         required_error: 'Seleccione el tipo de análisis',
//     }),
//     item_type: z.enum(['user', 'item_materia_prima', 'producto_terminado', 'otros'], {
//         required_error: 'Seleccione el tipo de item',
//     }),
//     user_id: z.string().optional(),
//     item_materia_prima_id: z.string().optional(),
//     producto_terminado_id: z.string().optional(),
//     otros: z.string().optional(),
//     lote: z.string().optional(),
//     fecha_elaboracion: z.string().optional(),
//     fecha_vencimiento: z.string().optional(),
//     fecha_muestreo: z.string().optional(),
//     observacion: z.string().optional(),
// }).refine((data) => {
//     // Validar que solo un campo de item esté lleno según item_type
//     switch (data.item_type) {
//         case 'user':
//             return !!data.user_id;
//         case 'item_materia_prima':
//             return !!data.item_materia_prima_id;
//         case 'producto_terminado':
//             return !!data.producto_terminado_id;
//         case 'otros':
//             return !!data.otros && data.otros.trim().length > 0;
//         default:
//             return false;
//     }
// }, {
//     message: 'Debe seleccionar un item válido',
//     path: ['item_type'],
// });

// const formSchema = z.object({
//     observacion: z.string().optional(),
//     detalles: z.array(detalleSchema).min(1, 'Agregue al menos un detalle'),
// });

// type FormValues = z.infer<typeof formSchema>;

// interface CreatePageProps {
//     tiposMuestra: Array<{ id: number; nombre: string; norma_microbiologico?: string; norma_fisicoquimico?: string }>;
//     productosTerminados: Array<{ id: number; nombre: string; codigo: string }>;
//     materiasPrimas: Array<{ id: number; nombre: string; codigo: string }>;
//     usuarios: Array<{ id: number; name: string; email: string }>;
//     ubicacion: { id: number; nombre: string };
// }

// export default function Create({ tiposMuestra, productosTerminados, materiasPrimas, usuarios, ubicacion }: CreatePageProps) {
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     const form = useForm<FormValues>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             observacion: '',
//             detalles: [{
//                 tipo_muestra_id: '',
//                 tipo: 'Microbiologico',
//                 item_type: 'producto_terminado',
//                 user_id: '',
//                 item_materia_prima_id: '',
//                 producto_terminado_id: '',
//                 otros: '',
//                 lote: '',
//                 fecha_elaboracion: '',
//                 fecha_vencimiento: '',
//                 fecha_muestreo: '',
//                 observacion: '',
//             }],
//         },
//     });

//     const detalles = form.watch('detalles');

//     const addDetalle = () => {
//         if (detalles.length >= 10) {
//             alert('Máximo 10 detalles por solicitud');
//             return;
//         }

//         const newDetalle = {
//             tipo_muestra_id: '',
//             tipo: 'Microbiologico' as const,
//             item_type: 'producto_terminado' as const,
//             user_id: '',
//             item_materia_prima_id: '',
//             producto_terminado_id: '',
//             otros: '',
//             lote: '',
//             fecha_elaboracion: '',
//             fecha_vencimiento: '',
//             fecha_muestreo: '',
//             observacion: '',
//         };

//         const currentDetalles = form.getValues('detalles');
//         form.setValue('detalles', [...currentDetalles, newDetalle]);
//     };

//     const removeDetalle = (index: number) => {
//         if (detalles.length <= 1) {
//             alert('Debe haber al menos un detalle');
//             return;
//         }

//         const currentDetalles = form.getValues('detalles');
//         form.setValue('detalles', currentDetalles.filter((_, i) => i !== index));
//     };

//     const onSubmit = async (data: FormValues) => {
//         setIsSubmitting(true);

//         try {
//             router.post(route('laboratorio-externo.solicitudes.store'), data);
//         } catch (error) {
//             console.error('Error al enviar:', error);
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <AppLayout breadcrumbs={breadcrumbs}>
//             <Head title="Nueva Solicitud - Laboratorio Externo" />
//             <div className="px-2 sm:px-6 py-2">
//                 <Toast />

//                 {/* Header */}
//                 <div className="mb-6">
//                     <div className="flex items-center gap-2 mb-2">
//                         <Link href={route('laboratorio-externo.solicitudes.index')}>
//                             <Button variant="ghost" size="sm">
//                                 <ArrowLeft className="h-4 w-4 mr-1" />
//                                 Volver
//                             </Button>
//                         </Link>
//                         <h1 className="text-2xl font-bold">Nueva Solicitud de Laboratorio</h1>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                         Ubicación: {ubicacion.nombre}
//                     </p>
//                 </div>

//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                         {/* Observación General */}
//                         <div className="bg-card rounded-lg border p-4">
//                             <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
//                                 <FileText className="h-5 w-5" />
//                                 Información General
//                             </h2>
//                             <FormField
//                                 control={form.control}
//                                 name="observacion"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Observación General (Opcional)</FormLabel>
//                                         <FormControl>
//                                             <Textarea
//                                                 placeholder="Ingrese una observación general para la solicitud..."
//                                                 className="min-h-[100px]"
//                                                 {...field}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

//                         {/* Detalles */}
//                         <div className="bg-card rounded-lg border p-4">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-lg font-semibold flex items-center gap-2">
//                                     <Beaker className="h-5 w-5" />
//                                     Detalles de Muestras ({detalles.length}/10)
//                                 </h2>
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={addDetalle}
//                                     disabled={detalles.length >= 10}
//                                 >
//                                     <Plus className="h-4 w-4 mr-1" />
//                                     Agregar Muestra
//                                 </Button>
//                             </div>

//                             <div className="space-y-6">
//                                 {detalles.map((detalle, index) => (
//                                     <div key={index} className="border rounded-lg p-4 bg-muted/10">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <h3 className="font-semibold">Muestra #{index + 1}</h3>
//                                             {detalles.length > 1 && (
//                                                 <Button
//                                                     type="button"
//                                                     variant="ghost"
//                                                     size="sm"
//                                                     onClick={() => removeDetalle(index)}
//                                                     className="text-destructive"
//                                                 >
//                                                     <Trash2 className="h-4 w-4" />
//                                                 </Button>
//                                             )}
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             {/* Tipo de Muestra */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.tipo_muestra_id`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Tipo de Muestra *</FormLabel>
//                                                         <Select
//                                                             value={field.value}
//                                                             onValueChange={field.onChange}
//                                                         >
//                                                             <FormControl>
//                                                                 <SelectTrigger>
//                                                                     <SelectValue placeholder="Seleccione un tipo de muestra" />
//                                                                 </SelectTrigger>
//                                                             </FormControl>
//                                                             <SelectContent>
//                                                                 {tiposMuestra.map((tipo) => (
//                                                                     <SelectItem key={tipo.id} value={tipo.id.toString()}>
//                                                                         {tipo.nombre}
//                                                                     </SelectItem>
//                                                                 ))}
//                                                             </SelectContent>
//                                                         </Select>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Tipo de Análisis */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.tipo`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Tipo de Análisis *</FormLabel>
//                                                         <Select
//                                                             value={field.value}
//                                                             onValueChange={field.onChange}
//                                                         >
//                                                             <FormControl>
//                                                                 <SelectTrigger>
//                                                                     <SelectValue placeholder="Seleccione el tipo" />
//                                                                 </SelectTrigger>
//                                                             </FormControl>
//                                                             <SelectContent>
//                                                                 <SelectItem value="Microbiologico">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <div className="h-3 w-3 rounded-full bg-blue-500"></div>
//                                                                         Microbiologico (MB)
//                                                                     </div>
//                                                                 </SelectItem>
//                                                                 <SelectItem value="Fisicoquimico">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <div className="h-3 w-3 rounded-full bg-green-500"></div>
//                                                                         Fisicoquimico (FQ)
//                                                                     </div>
//                                                                 </SelectItem>
//                                                             </SelectContent>
//                                                         </Select>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Tipo de Item */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.item_type`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel>Tipo de Item *</FormLabel>
//                                                         <Select
//                                                             value={field.value}
//                                                             onValueChange={field.onChange}
//                                                         >
//                                                             <FormControl>
//                                                                 <SelectTrigger>
//                                                                     <SelectValue placeholder="Seleccione el tipo de item" />
//                                                                 </SelectTrigger>
//                                                             </FormControl>
//                                                             <SelectContent>
//                                                                 <SelectItem value="producto_terminado">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <Package className="h-4 w-4" />
//                                                                         Producto Terminado
//                                                                     </div>
//                                                                 </SelectItem>
//                                                                 <SelectItem value="item_materia_prima">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <Beaker className="h-4 w-4" />
//                                                                         Materia Prima
//                                                                     </div>
//                                                                 </SelectItem>
//                                                                 <SelectItem value="user">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <User className="h-4 w-4" />
//                                                                         Usuario
//                                                                     </div>
//                                                                 </SelectItem>
//                                                                 <SelectItem value="otros">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <AlertCircle className="h-4 w-4" />
//                                                                         Otros
//                                                                     </div>
//                                                                 </SelectItem>
//                                                             </SelectContent>
//                                                         </Select>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Campo dinámico según tipo de item */}
//                                             {detalle.item_type === 'producto_terminado' && (
//                                                 <FormField
//                                                     control={form.control}
//                                                     name={`detalles.${index}.producto_terminado_id`}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel>Producto Terminado *</FormLabel>
//                                                             <Select
//                                                                 value={field.value}
//                                                                 onValueChange={field.onChange}
//                                                             >
//                                                                 <FormControl>
//                                                                     <SelectTrigger>
//                                                                         <SelectValue placeholder="Seleccione un producto" />
//                                                                     </SelectTrigger>
//                                                                 </FormControl>
//                                                                 <SelectContent>
//                                                                     {productosTerminados.map((producto) => (
//                                                                         <SelectItem key={producto.id} value={producto.id.toString()}>
//                                                                             {producto.nombre} ({producto.codigo})
//                                                                         </SelectItem>
//                                                                     ))}
//                                                                 </SelectContent>
//                                                             </Select>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             )}

//                                             {detalle.item_type === 'item_materia_prima' && (
//                                                 <FormField
//                                                     control={form.control}
//                                                     name={`detalles.${index}.item_materia_prima_id`}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel>Materia Prima *</FormLabel>
//                                                             <Select
//                                                                 value={field.value}
//                                                                 onValueChange={field.onChange}
//                                                             >
//                                                                 <FormControl>
//                                                                     <SelectTrigger>
//                                                                         <SelectValue placeholder="Seleccione una materia prima" />
//                                                                     </SelectTrigger>
//                                                                 </FormControl>
//                                                                 <SelectContent>
//                                                                     {materiasPrimas.map((materia) => (
//                                                                         <SelectItem key={materia.id} value={materia.id.toString()}>
//                                                                             {materia.nombre} ({materia.codigo})
//                                                                         </SelectItem>
//                                                                     ))}
//                                                                 </SelectContent>
//                                                             </Select>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             )}

//                                             {detalle.item_type === 'user' && (
//                                                 <FormField
//                                                     control={form.control}
//                                                     name={`detalles.${index}.user_id`}
//                                                     render={({ field }) => (
//                                                         <FormItem>
//                                                             <FormLabel>Usuario *</FormLabel>
//                                                             <Select
//                                                                 value={field.value}
//                                                                 onValueChange={field.onChange}
//                                                             >
//                                                                 <FormControl>
//                                                                     <SelectTrigger>
//                                                                         <SelectValue placeholder="Seleccione un usuario" />
//                                                                     </SelectTrigger>
//                                                                 </FormControl>
//                                                                 <SelectContent>
//                                                                     {usuarios.map((usuario) => (
//                                                                         <SelectItem key={usuario.id} value={usuario.id.toString()}>
//                                                                             {usuario.name} ({usuario.email})
//                                                                         </SelectItem>
//                                                                     ))}
//                                                                 </SelectContent>
//                                                             </Select>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             )}

//                                             {detalle.item_type === 'otros' && (
//                                                 <FormField
//                                                     control={form.control}
//                                                     name={`detalles.${index}.otros`}
//                                                     render={({ field }) => (
//                                                         <FormItem className="md:col-span-2">
//                                                             <FormLabel>Descripción *</FormLabel>
//                                                             <FormControl>
//                                                                 <Input
//                                                                     placeholder="Ingrese una descripción del item..."
//                                                                     {...field}
//                                                                 />
//                                                             </FormControl>
//                                                             <FormMessage />
//                                                         </FormItem>
//                                                     )}
//                                                 />
//                                             )}
//                                         </div>

//                                         {/* Campos opcionales */}
//                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//                                             {/* Lote */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.lote`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className="flex items-center gap-1">
//                                                             <Hash className="h-3 w-3" />
//                                                             Lote (Opcional)
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input placeholder="Número de lote" {...field} />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Fecha Elaboración */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.fecha_elaboracion`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className="flex items-center gap-1">
//                                                             <Calendar className="h-3 w-3" />
//                                                             Fecha Elaboración
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input type="date" {...field} />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Fecha Muestreo */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.fecha_muestreo`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className="flex items-center gap-1">
//                                                             <Calendar className="h-3 w-3" />
//                                                             Fecha Muestreo
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input type="date" {...field} />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />

//                                             {/* Fecha Vencimiento */}
//                                             <FormField
//                                                 control={form.control}
//                                                 name={`detalles.${index}.fecha_vencimiento`}
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                         <FormLabel className="flex items-center gap-1">
//                                                             <Calendar className="h-3 w-3" />
//                                                             Fecha Vencimiento
//                                                         </FormLabel>
//                                                         <FormControl>
//                                                             <Input
//                                                                 type="date"
//                                                                 {...field}
//                                                                 min={detalle.fecha_elaboracion || undefined}
//                                                             />
//                                                         </FormControl>
//                                                         <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         </div>

//                                         {/* Observación del detalle */}
//                                         <FormField
//                                             control={form.control}
//                                             name={`detalles.${index}.observacion`}
//                                             render={({ field }) => (
//                                                 <FormItem className="mt-4">
//                                                     <FormLabel>Observación (Opcional)</FormLabel>
//                                                     <FormControl>
//                                                         <Textarea
//                                                             placeholder="Observación específica para esta muestra..."
//                                                             className="min-h-[80px]"
//                                                             {...field}
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Botones de acción */}
//                         <div className="flex justify-end gap-3">
//                             <Link href={route('laboratorio-externo.solicitudes.index')}>
//                                 <Button type="button" variant="outline">
//                                     Cancelar
//                                 </Button>
//                             </Link>
//                             <Button type="submit" disabled={isSubmitting}>
//                                 {isSubmitting ? (
//                                     <>
//                                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
//                                         Creando...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save className="h-4 w-4 mr-2" />
//                                         Crear Solicitud
//                                     </>
//                                 )}
//                             </Button>
//                         </div>
//                     </form>
//                 </Form>
//             </div>
//         </AppLayout>
//     );
// }

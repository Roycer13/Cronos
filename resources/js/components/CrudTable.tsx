import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import FilterSelect from '@/components/ui/filter-select';
import FormInput from '@/components/ui/form-input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface CrudTableProps {
    title: string;
    data: any[];
    endpoint: string;
    foreignKeyOptions?: Record<string, any[]>;
    setFlash?: (flash: { success?: string; error?: string }) => void;
}

export default function CrudTable({
    title,
    data,
    endpoint,
    foreignKeyOptions,
    setFlash,
}: CrudTableProps) {
    const [rows, setRows] = useState<any[]>(data);
    const [newRow, setNewRow] = useState<any>({});
    const [editRow, setEditRow] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    useEffect(() => setRows(data), [data]);

    const columns = rows[0]
        ? Object.keys(rows[0]).filter((col) => !col.endsWith('_id'))
        : [];

    const handleAdd = async () => {
        try {
            const res = await axios.post(endpoint, newRow);
            setRows([...rows, res.data]);
            setNewRow({});
            setCreateErrors({});
            if (setFlash)
                setFlash({ success: `${title} agregado exitosamente.` });
        } catch (err: any) {
            if (err.response?.status === 422)
                setCreateErrors(err.response.data.errors);
            else if (setFlash)
                setFlash({ error: err.message || 'Error al agregar' });
        }
    };

    const handleEditSave = async () => {
        if (!editRow) return;
        try {
            const res = await axios.put(`${endpoint}/${editRow.id}`, editRow);
            setRows(rows.map((r) => (r.id === editRow.id ? res.data : r)));
            setIsDialogOpen(false);
            setEditRow(null);
            setEditErrors({});
            if (setFlash)
                setFlash({ success: `${title} actualizado correctamente.` });
        } catch (err: any) {
            if (err.response?.status === 422)
                setEditErrors(err.response.data.errors);
            else if (setFlash)
                setFlash({ error: err.message || 'Error al actualizar' });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${endpoint}/${id}`);
            setRows(rows.filter((r) => r.id !== id));
            if (setFlash)
                setFlash({ success: `${title} eliminado exitosamente.` });
        } catch (err: any) {
            if (setFlash)
                setFlash({ error: err.message || 'Error al eliminar' });
        }
    };

    const handleEditOpen = (row: any) => {
        setEditRow(row);
        setEditErrors({});
        setIsDialogOpen(true);
    };

    const handleChange = (col: string, value: any, isEdit = false) => {
        if (isEdit) setEditRow({ ...editRow, [col]: value });
        else setNewRow({ ...newRow, [col]: value });
    };

    const cleanPlaceholder = (col: string) => col.replace(/_id$/, '');

    return (
        <div className="space-y-6">
            {/* === CREAR === */}
            <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                        {title}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                        {rows.length} registros
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {Object.keys(rows[0] || {})
                        .filter((col) => col !== 'id')
                        .map((col) => {
                            const hasForeignKeyForCol =
                                foreignKeyOptions &&
                                Object.keys(foreignKeyOptions).some((fk) =>
                                    col.startsWith(fk.replace('_id', '')),
                                );

                            if (foreignKeyOptions && foreignKeyOptions[col]) {
                                return (
                                    <div key={col} className="min-w-0">
                                        <FilterSelect
                                            value={newRow[col]?.toString() || ''}
                                            onChange={(val) =>
                                                handleChange(col, val)
                                            }
                                            placeholder={`Seleccionar ${cleanPlaceholder(col)}`}
                                            options={foreignKeyOptions[col].map(
                                                (opt) => ({
                                                    value: opt.id.toString(),
                                                    label: opt.nombre,
                                                }),
                                            )}
                                            error={createErrors[col]}
                                        />
                                    </div>
                                );
                            } else if (
                                !col.endsWith('_id') &&
                                !hasForeignKeyForCol
                            ) {
                                return (
                                    <div key={col} className="min-w-0">
                                        <FormInput
                                            id={col}
                                            label={col}
                                            value={newRow[col] || ''}
                                            onChange={(e) =>
                                                handleChange(col, e.target.value)
                                            }
                                            placeholder={col}
                                            error={createErrors[col]}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    
                    <div className="flex items-end">
                        <Button 
                            onClick={handleAdd} 
                            size="sm"
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                        </Button>
                    </div>
                </div>
            </div>

            {/* === TABLA === */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col} className="capitalize">
                                        {col.replace(/_/g, ' ')}
                                    </TableHead>
                                ))}
                                <TableHead className="w-20">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + 1}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-muted p-3 mb-2">
                                                <Plus className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium text-foreground">
                                                No hay datos
                                            </p>
                                            <p className="text-sm">
                                                Agrega el primer registro
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-muted/50">
                                        {columns.map((col) => {
                                            const value = row[col];
                                            if (
                                                typeof value === 'object' &&
                                                value !== null
                                            )
                                                return (
                                                    <TableCell key={col}>
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">
                                                            {value.nombre}
                                                        </span>
                                                    </TableCell>
                                                );
                                            return (
                                                <TableCell key={col} className="text-sm">
                                                    {value}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditOpen(row)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    <span className="sr-only">Editar</span>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `¿Estás seguro de eliminar esta ${title.toLowerCase()}?`,
                                                            )
                                                        ) {
                                                            handleDelete(row.id);
                                                        }
                                                    }}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* === DIALOG DE EDICIÓN === */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Editar {title}
                        </DialogTitle>
                    </DialogHeader>
                    {editRow && (
                        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.keys(editRow).map((col) => {
                                const hasForeignKeyForCol =
                                    foreignKeyOptions &&
                                    Object.keys(foreignKeyOptions).some((fk) =>
                                        col.startsWith(fk.replace('_id', '')),
                                    );

                                if (
                                    foreignKeyOptions &&
                                    foreignKeyOptions[col]
                                ) {
                                    return (
                                        <div key={col} className="min-w-0">
                                            <FilterSelect
                                                value={
                                                    editRow[col]?.toString() || ''
                                                }
                                                onChange={(val) =>
                                                    handleChange(col, val, true)
                                                }
                                                placeholder={`Seleccionar ${cleanPlaceholder(col)}`}
                                                options={foreignKeyOptions[col].map(
                                                    (opt) => ({
                                                        value: opt.id.toString(),
                                                        label: opt.nombre,
                                                    }),
                                                )}
                                                error={editErrors[col]}
                                            />
                                        </div>
                                    );
                                } else if (
                                    !col.endsWith('_id') &&
                                    !hasForeignKeyForCol
                                ) {
                                    return (
                                        <div key={col} className="min-w-0">
                                            <FormInput
                                                id={`edit-${col}`}
                                                label={col}
                                                value={editRow[col] || ''}
                                                onChange={(e) =>
                                                    handleChange(
                                                        col,
                                                        e.target.value,
                                                        true,
                                                    )
                                                }
                                                placeholder={col}
                                                error={editErrors[col]}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                    <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="sm:w-32 w-full order-2 sm:order-1"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleEditSave}
                            className="sm:w-32 w-full order-1 sm:order-2"
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
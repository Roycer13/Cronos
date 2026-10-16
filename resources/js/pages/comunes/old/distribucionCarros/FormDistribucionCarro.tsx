import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface FormularioProps {
    initialData: any;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
    placas?: string[]; // Nueva prop para autocompletado
}

// Lista de destinos predefinidos (ajusta según necesidad)
const DESTINOS = [
    'La Paz',
    'El Alto',
    'Achocalla',
    'Viacha',
    'Santa Cruz',
    'Cochabamba',
    'Oruro',
    'Potosí',
    'Sucre',
    'Quillacollo',
    'Sacaba',
    'Municipios', // opción para escribir destino personalizado
];

export default function FormDistribucionCarro({ 
    initialData, 
    onSubmit, 
    processing, 
    errors, 
    onCancel,
    placas = [],
}: FormularioProps) {
    const [localData, setLocalData] = useState(initialData);
    const [showCustomDestino, setShowCustomDestino] = useState(
        !DESTINOS.includes(initialData.destino) && initialData.destino !== ''
    );

    const handleChange = (field: string, value: any) => {
        setLocalData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleDestinoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'Otro') {
            setShowCustomDestino(true);
            handleChange('destino', '');
        } else {
            setShowCustomDestino(false);
            handleChange('destino', value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convertir set_temperatura vacío a null para que sea nullable
        const dataToSend = { ...localData };
        if (dataToSend.set_temperatura === '' || dataToSend.set_temperatura === null) {
            dataToSend.set_temperatura = null;
        }
        onSubmit(dataToSend);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Fecha y Hora *</Label>
                    <Input 
                        type="datetime-local" 
                        value={localData.fecha} 
                        onChange={(e) => handleChange('fecha', e.target.value)} 
                    />
                    {errors.fecha && <p className="text-sm text-red-500">{errors.fecha}</p>}
                </div>

                {/* Select para Destino */}
                <div className="space-y-2">
                    <Label>Destino</Label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={showCustomDestino ? 'Otro' : localData.destino}
                        onChange={handleDestinoChange}
                    >
                        <option value="">Seleccione un destino</option>
                        {DESTINOS.map((destino) => (
                            <option key={destino} value={destino}>
                                {destino}
                            </option>
                        ))}
                    </select>
                    {showCustomDestino && (
                        <Input
                            className="mt-2"
                            value={localData.destino}
                            onChange={(e) => handleChange('destino', e.target.value)}
                            placeholder="Especifique otro destino"
                        />
                    )}
                    {errors.destino && <p className="text-sm text-red-500">{errors.destino}</p>}
                </div>

                {/* Placa con autocompletado */}
                <div className="space-y-2">
                    <Label>Placa</Label>
                    <Input 
                        list="placas-sugeridas"
                        value={localData.placa || ''} 
                        onChange={(e) => handleChange('placa', e.target.value)} 
                        placeholder="Placa del vehículo" 
                    />
                    <datalist id="placas-sugeridas">
                        {placas.map((placa, index) => (
                            <option key={index} value={placa} />
                        ))}
                    </datalist>
                    {errors.placa && <p className="text-sm text-red-500">{errors.placa}</p>}
                </div>

                {/* Set Temperatura (nullable) */}
                <div className="space-y-2">
                    <Label>Set Temperatura (°C)</Label>
                    <Input 
                        type="number" 
                        step="0.01" 
                        value={localData.set_temperatura ?? ''} 
                        onChange={(e) => handleChange('set_temperatura', e.target.value)} 
                        placeholder="0.00" 
                    />
                    {errors.set_temperatura && <p className="text-sm text-red-500">{errors.set_temperatura}</p>}
                </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Verificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="paredes_externas" checked={localData.paredes_externas} onCheckedChange={(c) => handleChange('paredes_externas', c)} />
                        <Label htmlFor="paredes_externas">Paredes Externas OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="limpieza_interno" checked={localData.limpieza_interno} onCheckedChange={(c) => handleChange('limpieza_interno', c)} />
                        <Label htmlFor="limpieza_interno">Limpieza Interna OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="ausencia_objetos_olores" checked={localData.ausencia_objetos_olores} onCheckedChange={(c) => handleChange('ausencia_objetos_olores', c)} />
                        <Label htmlFor="ausencia_objetos_olores">Ausencia de Objetos y Olores</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="bph_chofer" checked={localData.bph_chofer} onCheckedChange={(c) => handleChange('bph_chofer', c)} />
                        <Label htmlFor="bph_chofer">BPH Chofer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="bph_ayudante" checked={localData.bph_ayudante} onCheckedChange={(c) => handleChange('bph_ayudante', c)} />
                        <Label htmlFor="bph_ayudante">BPH Ayudante</Label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea value={localData.observaciones || ''} onChange={(e) => handleChange('observaciones', e.target.value)} placeholder="Observaciones adicionales" />
                </div>
                <div className="space-y-2">
                    <Label>Correcciones</Label>
                    <Textarea value={localData.correciones || ''} onChange={(e) => handleChange('correciones', e.target.value)} placeholder="Correcciones realizadas" />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Cancelar</Button>
                <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar Registro'}</Button>
            </div>
        </form>
    );
}
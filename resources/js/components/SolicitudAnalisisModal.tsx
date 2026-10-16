import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlaskConical } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SolicitudAnalisisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (peso: number) => void;
    tanqueNombre: string;
}

export default function SolicitudAnalisisModal({
    isOpen,
    onClose,
    onConfirm,
    tanqueNombre,
}: SolicitudAnalisisModalProps) {
    const [peso, setPeso] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setPeso('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const pesoNum = parseFloat(peso);
        if (isNaN(pesoNum) || pesoNum <= 0) {
            alert('Por favor ingrese un peso válido.');
            return;
        }
        onConfirm(pesoNum);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-blue-600" />
                        Solicitar Análisis - {tanqueNombre}
                    </DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de que desea enviar una solicitud de
                        análisis para este estado? Por favor, ingrese el peso
                        del producto en este momento.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="peso" className="text-right">
                            Peso (gramos)
                        </Label>
                        <Input
                            id="peso"
                            type="number"
                            step="0.01"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            className="col-span-3"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm}>Enviar Solicitud</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

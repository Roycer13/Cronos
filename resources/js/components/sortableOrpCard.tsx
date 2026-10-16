// js/components/sortableOrpCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableOrpCard = ({ orp }: { orp: any }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: orp.id.toString(),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`touch-none bg-white dark:bg-gray-800 rounded border border-border p-2 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-lg dark:shadow-xl rotate-1' : ''
                }`}
        >
            <div className="flex justify-between items-start mb-1">
                <div className='flex gap-2 items-center'>
                    <span className=" text-xs font-bold text-foreground">
                        {orp.codigo}
                    </span>
                    <p className="text-2xs text-muted-foreground truncate font-light">
                        {orp.producto_terminado?.codigo_sap || 'N/A'}
                    </p>
                </div>
                {orp.prioridad && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${orp.prioridad === 'alta' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            orp.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {orp.prioridad}
                    </span>
                )}
            </div>

            <div className="mb-1">
                <p className="text-2xs font-light text-foreground truncate leading-tight">
                    {orp.producto_terminado?.nombre_comercial || 'Producto no disponible'}
                </p>

            </div>

            <div className="flex justify-between items-center text-2xs">
                <div>
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="font-medium ml-1">{orp.lote / 1}</span>
                </div>
                {orp.cantidad_programada && orp.cantidad_programada > 0 && (
                    <div className="text-right">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-3xs">
                                {Math.min(Math.round(((orp.cantidad_producida || 0) / orp.cantidad_programada) * 100), 100)}%
                            </span>
                            <div className="w-12 bg-muted dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${Math.min(((orp.cantidad_producida || 0) / orp.cantidad_programada) * 100, 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortableOrpCard;

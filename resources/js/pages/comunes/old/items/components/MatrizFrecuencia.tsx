const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const turnos = [1, 2, 3];

const colores = {
    o: 'bg-blue-500',
    l: 'bg-yellow-500',
    d: 'bg-green-500',
};

export default function MatrizFrecuencia({ form, setForm }: any) {

    const toggle = (key: string) => {
        setForm({
            ...form,
            [key]: !form[key]
        });
    };

    const renderCelda = (dia: string, turno: number, tipo: string) => {
        const key = `${dia}_${turno}_${tipo}`;
        const activo = form[key];

        return (
            <div
                onClick={() => toggle(key)}
                className={`
                    w-6 h-6 rounded cursor-pointer flex items-center justify-center text-white text-[10px]
                    ${activo ? colores[tipo] : 'bg-gray-200'}
                `}
            >
                {tipo.toUpperCase()}
            </div>
        );
    };

    return (
        <div className="space-y-3">

            <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500"/> O = Orden</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500"/> L = Limpieza</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500"/> D = Desinfección</span>
            </div>

            {dias.map(dia => (
                <div key={dia} className="border p-2 rounded">

                    <div className="font-semibold mb-2 uppercase">{dia}</div>

                    <div className="flex gap-6">
                        {turnos.map(turno => (
                            <div key={turno}>
                                <div className="text-[10px] text-center mb-1">T{turno}</div>

                                <div className="flex gap-1">
                                    {renderCelda(dia, turno, 'o')}
                                    {renderCelda(dia, turno, 'l')}
                                    {renderCelda(dia, turno, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            ))}

        </div>
    );
}
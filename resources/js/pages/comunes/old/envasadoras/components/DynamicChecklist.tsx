export default function DynamicChecklist({ tipo, value = {}, onChange, config }: any) {

    if (!tipo || !config) return null

    const tipoConfig = config[tipo] || {}
    
    // 🔧 Aplanar la estructura: general + extras
    const lista: string[] = [
        ...(tipoConfig.general || []),
        ...(tipoConfig.extras || [])
    ]

    const toggle = (key: string) => {
        onChange({
            ...value,
            [key]: !value[key]
        })
    }

    // 🎯 Formatear labels (reemplazar guiones por espacios y capitalizar)
    const formatLabel = (key: string): string => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className="grid md:grid-cols-2 gap-3">

            {lista.map((item: any) => {
                const key = typeof item === 'string' ? item : item.key
                const label = typeof item === 'string' ? formatLabel(item) : item.label

                return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value[key]}
                            onChange={() => toggle(key)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">{label}</span>
                    </label>
                )
            })}

        </div>
    )
}
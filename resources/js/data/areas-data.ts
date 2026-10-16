import {
    LayoutGrid, UserStar, LockKeyholeOpen, Users, Milk, Wrench, Factory,
    StickyNote, Settings, FileCheck, Package, Microscope, Boxes, FlaskConical,
    SprayCan, BookOpenCheck, PencilRuler, ThermometerSnowflake, Ambulance,
    ListCheck, Hospital, Bug, BugOff, Rabbit, TreePalm,
    Drone, ScrollText, BrushCleaning, ClipboardPlus, Thermometer, ShieldCheck, Droplet
} from "lucide-react"
import { dashboard } from "@/routes"
import { type NavItem } from "@/types"

export interface Area {
    name: string
    logo: any
    plan?: string
    navMain: NavItem[]
    navByRole?: Record<string, NavItem[]>
}

export const ubicacionesData: Area[] = [
    {
        name: "Lácteos",
        logo: Milk,
        plan: "Producción",
        navMain: [
            { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
            { title: "ORP's", href: "/orps", permission: "r_orp", icon: Factory },
            { title: "Arranques de línea", href: "/arranques-linea", permission: "r_arranqueLinea", icon: Factory },
            { title: "Desinfeccion", href: "/planta-lacteos/movimientos-desinfeccion", permission: "r_desinfeccion", icon: SprayCan },
            { title: "Aditivos Químicos", href: "/planta-lacteos/aditivos-quimicos", permission: "r_aditivosQuimicos", icon: FlaskConical },
            { title: "Control Físico-Químico", href: "/planta-lacteos/control-fisicoquimico-organoleptico", permission: "r_controlFisicoQuimico", icon: Microscope },
            { title: "Tratamiento de agua", href: "/planta-lacteos/tratamiento-agua", permission: "r_tratamientoAgua", icon: Droplet },
            { title: "Parametros Linea", href: "/planta-lacteos/parametros-linea", permission: "r_parametrosLinea", icon: BookOpenCheck },
            { title: "Sustancias Quimica", href: "/sustancias-quimicas", permission: "r_sustanciasQuimicas", icon: FlaskConical },
            // { title: "Usuarios", href: "/usuarios", permission: "r_usuaris", icon: Users },
            {
                title: "Leches",
                href: "#",
                icon: Milk,
                items: [
                    { title: "Recepción de Leche", href: "/planta-lacteos/recepciones-leche", permission: "r_recepcionLeche" },
                    { title: "Análisis de Leche", href: "/planta-lacteos/analisis-leche", permission: "r_analisisLeche" },
                    { title: "Higiene de Acopio", href: "/planta-lacteos/higiene-acopio", permission: "r_higieneAcopio" },
                    { title: "Gráficas de Análisis de Leche", href: "/planta-lacteos/analisis-leche/graficas", permission: "r_graficaLeche" },
                ],
            },
            {
                title: "Materia Prima",
                href: "#",
                icon: Boxes,
                items: [
                    { title: "Recepción de Materia Prima", href: "/recepciones-materia-prima", permission: "r_recepcionMateriaPrima3" },
                    { title: "Recepción de Materia Prima lacteos", href: "/recepciones-materia-prima2", permission: "r_recepcionMateriaPrima2" },
                    { title: "Administrar Materia Prima", href: "/admin/materia-prima", permission: "r_adminMateriaPrima" },
                    { title: "Informe de Materia Prima", href: "/informes/materia-prima", permission: "r_recepcionMateriaPrima" },
                ],
            },
            { title: "Solicitudes OT", href: "/mantenimiento/solicitudOts", icon: StickyNote, permission: "r_solicitudOt" },
            {
                title: "Producción",
                href: "#",
                icon: Milk,
                items: [
                    { title: "Estado Planta", href: "/planta-lacteos/estados-planta", permission: "r_estadosPlanta" },
                    { title: "Dashboard Planta", href: "/planta-lacteos/dashboardPlanta", permission: "r_dashboardPlanta" },
                    { title: "Dashboard Planta (Antiguo)", href: "/planta-lacteos/dashboardPlantaOld", permission: "r_dashboardPlanta" },
                ],
            },
            {
                title: "Documentacion",
                href: "#",
                icon: BookOpenCheck,
                items: [
                    { title: "Administración de documentacion", href: "/documentacion/administracion", permission: "r_documentacionAdministracion" },
                    { title: "solicitudes", href: "/documentacion/solicitudes", permission: "r_documentacionSolicitud" },
                    // { title: "Distribucion", href: "/documentacion/distribucion", permission: "r_documentacionDistribucion" },
                ],
            },
            { title: "Dispositivos de medición", href: "/planta-lacteos/verificaciones-dispositivos", permission: "r_verificacionesDispositivos", icon: PencilRuler },
            { title: "UHT", href: "/planta-lacteos/uht", permission: "r_uht", icon: Factory },
            { title: "HTST", href: "/planta-lacteos/htst", permission: "r_htst", icon: Factory },
            { title: "Contadores", href: "/planta-lacteos/conteos", permission: "r_conteos", icon: Boxes },
            { title: "Ambiente frio", href: "/planta-lacteos/ambiente-frio", permission: "r_ambienteFrio", icon: ThermometerSnowflake },
            { title: "Analisis Linea", href: "/planta-lacteos/analisis-linea", icon: FlaskConical, permission: "r_analisisLinea" },
            {
                title: "Producto Terminado",
                href: "#",
                icon: Package,
                items: [
                    { title: "Productos", href: "/productos/productos-terminados", permission: "r_productoTerminados" },
                    // { title: "Fichas Técnicas", href: "/productos/fichas-tecnicas" },
                ],
            },
            {
                title: "Microbiologia",
                href: "#",
                icon: Microscope,
                items: [
                    { title: "Seguimiento HTST", href: "/planta-lacteos/seguimiento-htst", permission: "r_seguimientoHtst" },
                    { title: "Seguimiento UHT", href: "/planta-lacteos/seguimiento-uht", permission: "r_seguimientoUht" },
                ],
            },
            { title: "Utensilios", href: "/planta-lacteos/utensilios", permission: "r_utensilios", icon: Wrench },
            { title: "Acrílicos", href: "/planta-lacteos/acrilicos", permission: "r_acrilicos", icon: Wrench },
            {
                //cambios de permiso en esta seccion, antes era c_higienePersonal
                title: "BPH's",
                href: "#",
                icon: ClipboardPlus,
                items: [
                    { title: "Higiene Personal", href: "/higiene", permission: "r_higienePersonal" },
                    { title: "Control de Visitas", href: "/higiene/control-visitas", permission: "r_controlVisitas" },
                    { title: "Inspeccion de Casilleros", href: "/higiene/inspeccion-casilleros", permission: "r_inspeccionCasilleros" },
                    { title: "Dotacion de Guantes", href: "/higiene/dotacion-guantes", permission: "r_dotacionGuantes" },
                    { title: "Hisopados", href: "/planta-lacteos/hisopado", permission: "r_hisopado", icon: FlaskConical },

                ],
            },
            {
                title: "OLD's",
                href: "#",
                icon: BrushCleaning,
                items: [
                    { title: "Areas", href: "/old/areas", permission: "r_oldAreas" },
                    { title: "Subareas", href: "/old/subareas", permission: "r_oldSubareas" },
                    { title: "Items", href: "/old/items", permission: "r_oldItems" },
                    { title: "Registros", href: "/old/registros", permission: "r_oldRegistros" },
                    { title: "Envasadoras", href: "/old/envasadoras", permission: "r_oldEnvasadoras" },
                    { title: "Distribucion Carros", href: "/old/distribucion-carros", permission: "r_oldDistribucionCarros" },
                ],
            },
            {
                title: "Plagas",
                href: "#",
                icon: Bug,
                items: [
                    { title: "Dashboard Plagas", href: "/plagas/dashboard", icon: LayoutGrid, permission: "r_plagas_dashboard" }, // Opcional
                    { title: "Barreras", href: "/plagas/barreras", icon: BugOff, permission: "r_plagas_barreras" },
                    { title: "Control Barreras", href: "/plagas/control-barreras", icon: ScrollText, permission: "r_plagas_control_barreras" },
                    { title: "Presencia de Vectores", href: "/plagas/presencia-vectores", icon: TreePalm, permission: "r_plagas_presencia_vectores" },
                    { title: "Trampas", href: "/plagas/trampas", icon: Rabbit, permission: "r_plagas_trampas" },
                    { title: "Control Trampas", href: "/plagas/control-trampas", icon: ScrollText, permission: "r_plagas_control_trampas" },
                    { title: "Arranque Fumigación", href: "/plagas/arranque-fumigacion", icon: SprayCan, permission: "r_plagas_arranque_fumigacion" },
                    { title: "Insectocaptores", href: "/plagas/insectocaptores", icon: Drone, permission: "r_plagas_insectocaptores" },
                    { title: "Registro Insectos", href: "/plagas/registro-insectos", icon: FlaskConical, permission: "r_plagas_registro_insectos" },
                ],
            },
            {
                title: "Externo",
                href: "#",
                icon: Microscope, // o FlaskConical, puedes elegir otro
                items: [
                    { title: "Tipos de Muestra", href: "/externo/tipos-muestra", permission: "r_tiposMuestra" },
                    { title: "Solicitudes", href: "/externo/solicitudes", permission: "r_solicitudesExterno" },
                    { title: "Microbiología", href: "/externo/microbiologia", permission: "r_microbiologiaExterno" },
                    { title: "Actividad de Agua", href: "/externo/actividad-agua", permission: "r_actividadAgua" },
                    { title: "Agua Físico", href: "/externo/agua-fisico", permission: "r_aguaFisico" },
                ],
            },
            {
                title: "Control de Temperatura",
                href: "#",
                icon: Thermometer,
                items: [
                    {
                        title: "Lugares de Control", href: "/planta-lacteos/lugares-control-temperatura", permission: "r_lugarControlTemperatura",
                    },
                    {
                        title: "Temperaturas Almacén", href: "/planta-lacteos/temperaturas-almacen-congelador", permission: "r_temperaturaAlmacenCongelador",
                    },
                    {
                        title: "Servicios de Frío", href: "/planta-lacteos/servicios-frios", permission: "r_servicioFrio",
                    },
                    {
                        title: "Agua Helada", href: "/planta-lacteos/agua-helada", permission: "r_aguaHelada"
                    },
                ],
            },
            {
                title: "Infraestructura BPM",
                href: "#",
                icon: ShieldCheck,  // no olvides importarlo de lucide-react
                items: [
                    { title: "Áreas", href: "/planta-lacteos/infraestructuras", permission: "r_infraestructura" },
                    { title: "Inspecciones", href: "/planta-lacteos/inspecciones", permission: "r_inspeccionInfra" },
                    { title: "Acciones", href: "/planta-lacteos/acciones-infraestructura", permission: "r_accionInfra" },
                ],
            },
        ],
        navByRole: {
            JefeCalidad: [
                { title: "Dashboard", href: dashboard(), icon: LayoutGrid },

                {

                    title: "Materia Prima",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //materia prima
                        { title: "Recepción de Materia Prima", href: "/recepciones-materia-prima", permission: "r_recepcionMateriaPrima3" },
                        { title: "Recepción de Materia Prima lacteos", href: "/recepciones-materia-prima2", permission: "r_recepcionMateriaPrima2" },
                        { title: "Administrar Materia Prima", href: "/admin/materia-prima", permission: "r_adminMateriaPrima" },
                        { title: "Informe de Materia Prima", href: "/informes/materia-prima", permission: "r_recepcionMateriaPrima" },
                        //Leche
                        { title: "Recepción de Leche", href: "/planta-lacteos/recepciones-leche", permission: "r_recepcionLeche" },
                        { title: "Análisis de Leche", href: "/planta-lacteos/analisis-leche", permission: "r_analisisLeche" },
                        { title: "Higiene de Acopio", href: "/planta-lacteos/higiene-acopio", permission: "r_higieneAcopio" },
                        { title: "Gráficas de Análisis de Leche", href: "/planta-lacteos/analisis-leche/graficas", permission: "r_graficaLeche" },
                        //aditivos quimicos
                        { title: "Aditivos Químicos", href: "/planta-lacteos/aditivos-quimicos", permission: "r_aditivosQuimicos", icon: FlaskConical },
                        //sustancias quimicas
                        { title: "Sustancias Quimica", href: "/sustancias-quimicas", permission: "r_sustanciasQuimicas", icon: FlaskConical },



                    ],
                },

                {

                    title: "Requisitos Generales del Establecimiento",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //infraestreuctura
                        { title: "Áreas", href: "/planta-lacteos/infraestructuras", permission: "r_infraestructura" },
                        { title: "Inspecciones", href: "/planta-lacteos/inspecciones", permission: "r_inspeccionInfra" },
                        { title: "Acciones", href: "/planta-lacteos/acciones-infraestructura", permission: "r_accionInfra" },
                        //mantenimiento
                        { title: "Solicitudes", href: "/mantenimiento/solicitudOts", icon: StickyNote, permission: "r_solicitudOt" },


                    ],
                },
                {

                    title: "Higiene personal",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //OLD
                        { title: "Areas", href: "/old/areas", permission: "r_oldAreas" },
                        { title: "Subareas", href: "/old/subareas", permission: "r_oldSubareas" },
                        { title: "Items", href: "/old/items", permission: "r_oldItems" },
                        { title: "Registros", href: "/old/registros", permission: "r_oldRegistros" },
                        { title: "Envasadoras", href: "/old/envasadoras", permission: "r_oldEnvasadoras" },
                        { title: "Distribucion Carros", href: "/old/distribucion-carros", permission: "r_oldDistribucionCarros" },

                        //plagas
                        { title: "Dashboard Plagas", href: "/plagas/dashboard", icon: LayoutGrid, permission: "r_plagas_dashboard" }, // Opcional
                        { title: "Barreras", href: "/plagas/barreras", icon: BugOff, permission: "r_plagas_barreras" },
                        { title: "Control Barreras", href: "/plagas/control-barreras", icon: ScrollText, permission: "r_plagas_control_barreras" },
                        { title: "Presencia de Vectores", href: "/plagas/presencia-vectores", icon: TreePalm, permission: "r_plagas_presencia_vectores" },
                        { title: "Trampas", href: "/plagas/trampas", icon: Rabbit, permission: "r_plagas_trampas" },
                        { title: "Control Trampas", href: "/plagas/control-trampas", icon: ScrollText, permission: "r_plagas_control_trampas" },
                        { title: "Arranque Fumigación", href: "/plagas/arranque-fumigacion", icon: SprayCan, permission: "r_plagas_arranque_fumigacion" },
                        { title: "Insectocaptores", href: "/plagas/insectocaptores", icon: Drone, permission: "r_plagas_insectocaptores" },
                        { title: "Registro Insectos", href: "/plagas/registro-insectos", icon: FlaskConical, permission: "r_plagas_registro_insectos" },

                        //utensilios
                        { title: "Utensilios", href: "/planta-lacteos/utensilios", permission: "r_utensilios", icon: Wrench },

                        //acrilicos
                        { title: "Acrílicos", href: "/planta-lacteos/acrilicos", permission: "r_acrilicos", icon: Wrench },

                        //desinfeccion
                        { title: "Desinfeccion", href: "/planta-lacteos/movimientos-desinfeccion", permission: "r_desinfeccion", icon: SprayCan },

                    ],
                },
                {

                    title: "Requisitos Sanitarios y de higiene del Personal  ",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //BPHS
                        { title: "Higiene Personal", href: "/higiene", permission: "r_higienePersonal" },
                        { title: "Control de Visitas", href: "/higiene/control-visitas", permission: "r_controlVisitas" },
                        { title: "Inspeccion de Casilleros", href: "/higiene/inspeccion-casilleros", permission: "r_inspeccionCasilleros" },
                        { title: "Dotacion de Guantes", href: "/higiene/dotacion-guantes", permission: "r_dotacionGuantes" },
                        { title: "Hisopados", href: "/planta-lacteos/hisopado", permission: "r_hisopado", icon: FlaskConical },



                    ],
                },

                {

                    title: "Requisitos de higiene en la Elaboracion  ",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //Produccion
                        { title: "Estado Planta", href: "/planta-lacteos/estados-planta", permission: "r_estadosPlanta" },
                        { title: "Dashboard Planta", href: "/planta-lacteos/dashboardPlanta", permission: "r_dashboardPlanta" },
                        { title: "Dashboard Planta (Antiguo)", href: "/planta-lacteos/dashboardPlantaOld", permission: "r_dashboardPlanta" },
                        //Lineas
                        { title: "UHT", href: "/planta-lacteos/uht", permission: "r_uht", icon: Factory },
                        { title: "HTST", href: "/planta-lacteos/htst", permission: "r_htst", icon: Factory },
                        //parametros
                        { title: "Parametros Linea", href: "/planta-lacteos/parametros-linea", permission: "r_parametrosLinea", icon: BookOpenCheck },

                        //tratamiento de aguas
                        { title: "Tratamiento de agua", href: "/planta-lacteos/tratamiento-agua", permission: "r_tratamientoAgua", icon: Droplet },

                        //analisis lineas
                        { title: "Analisis Linea", href: "/planta-lacteos/analisis-linea", icon: FlaskConical, permission: "r_analisisLinea" },


                    ],
                },

                {

                    title: "Almacenamiento y transporte de materia prima y producto terminado ",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //Ambiente frio
                        { title: "Ambiente frio", href: "/planta-lacteos/ambiente-frio", permission: "r_ambienteFrio", icon: ThermometerSnowflake },

                        // control de temperaturas
                        {
                            title: "Lugares de Control", href: "/planta-lacteos/lugares-control-temperatura", permission: "r_lugarControlTemperatura",
                        },
                        {
                            title: "Temperaturas Almacén", href: "/planta-lacteos/temperaturas-almacen-congelador", permission: "r_temperaturaAlmacenCongelador",
                        },
                        {
                            title: "Servicios de Frío", href: "/planta-lacteos/servicios-frios", permission: "r_servicioFrio",
                        },
                        {
                            title: "Agua Helada", href: "/planta-lacteos/agua-helada", permission: "r_aguaHelada"
                        },

                        //producto terminado
                        { title: "Productos", href: "/productos/productos-terminados", permission: "r_productoTerminados" },




                    ],
                },



                {

                    title: "Control de Alimentos",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //Control Fisico Quimico
                        { title: "Control Físico-Químico", href: "/planta-lacteos/control-fisicoquimico-organoleptico", permission: "r_controlFisicoQuimico", icon: Microscope },

                        //microbiologia

                        { title: "Seguimiento HTST", href: "/planta-lacteos/seguimiento-htst", permission: "r_seguimientoHtst" },
                        { title: "Seguimiento UHT", href: "/planta-lacteos/seguimiento-uht", permission: "r_seguimientoUht" },

                        //contadores
                        { title: "Contadores", href: "/planta-lacteos/conteos", permission: "r_conteos", icon: Boxes },


                    ],
                },


                {

                    title: "Otros requisitos de Calidad",
                    href: "#",
                    icon: Boxes,
                    items: [
                        //Dispositivos de medicion
                        { title: "Dispositivos de medición", href: "/planta-lacteos/verificaciones-dispositivos", permission: "r_verificacionesDispositivos", icon: PencilRuler },

                    ],
                },
                {
                    title: "Documentacion",
                    href: "#",
                    icon: BookOpenCheck,
                    items: [
                        { title: "Administración de documentacion", href: "/documentacion/administracion", permission: "r_documentacionAdministracion" },
                        { title: "solicitudes", href: "/documentacion/solicitudes", permission: "r_documentacionSolicitud" },
                        // { title: "Distribucion", href: "/documentacion/distribucion", permission: "r_documentacionDistribucion" },
                    ],


                },
            ],
        },
    },
    {
        name: "Soya",
        logo: Milk,
        plan: "Producción",
        navMain: [
            { title: "ORP's", href: "/orps", permission: "r_orp", icon: Factory },
            { title: "Desinfeccion", href: "/planta-lacteos/movimientos-desinfeccion", permission: "r_desinfeccion", icon: SprayCan },

        ],
    },
    {
        name: "Mantenimiento",
        logo: Wrench,
        plan: "Técnico",
        navMain: [
            // { title: "Dashboard", href: "/mantenimiento/dashboard", icon: LayoutGrid },
            { title: "Solicitudes", href: "/mantenimiento/solicitudOts", icon: StickyNote, permission: "r_solicitudOt" },
            { title: "Ordenes", href: "/mantenimiento/ots", icon: FileCheck, permission: "r_ot" },
            { title: "Repuestos", href: "/mantenimiento/repuestos", icon: Wrench, permission: "r_repuesto" },
            { title: "Almacen", href: "/mantenimiento/almacen/movimientos", icon: Boxes, permission: "r_almacenMovimiento" },

            { title: "Configuración", href: "/sistemas/configuracion", icon: Settings, permission: "r_configuracion" },

        ],
    },
    {
        name: "Sistemas",
        logo: LayoutGrid,
        plan: "Tecnología",
        navMain: [
            // { title: "Dashboard", href: "/sistemas/dashboard", icon: LayoutGrid },
            { title: "Usuarios", href: "/sistemas/usuarios", icon: Users, permission: "r_usuario" },
            { title: "Permisos", href: "/sistemas/roles-permissions", icon: LockKeyholeOpen, permission: "r_usuario" },
            { title: "Admnistracion", href: "/sistemas/administracion", icon: UserStar, permission: "r_administracion" },
            { title: "Configuración", href: "/sistemas/configuracion", icon: Settings, permission: "r_configuracion" },

            // {
            //     title: "Producto Terminado",
            //     href: "#",
            //     icon: Package,
            //     items: [
            //         { title: "Productos", href: "/productos/productos-terminados" },
            //         { title: "Fichas Técnicas", href: "/productos/fichas-tecnicas" },
            //     ],
            // },
        ],
    },
    {
        name: "Sanidad",
        logo: Hospital,
        plan: "Tecnología",
        navMain: [
            { title: "Usuarios", href: "/sanidad/usuarios", icon: Users, permission: "r_sanidadUsuario" },
            { title: "Examen Medico", href: "/sanidad/examenes-ocupacionales", icon: ListCheck, permission: "r_sanidadExamenMedico" },
            { title: "Atencion Medica", href: "/sanidad/atenciones-medicas", icon: Ambulance, permission: "r_sanidadAtencionMedica" },
        ]
    },

    // {
    //     name: "Plagas",
    //     logo: Bug,          // Ícono representativo
    //     plan: "Control",
    //     navMain: [
    //         { title: "Dashboard Plagas", href: "/plagas/dashboard", icon: LayoutGrid, permission: "r_plagas_dashboard" }, // Opcional
    //         { title: "Barreras", href: "/plagas/barreras", icon: BugOff, permission: "r_plagas_barreras" },
    //         { title: "Control Barreras", href: "/plagas/control-barreras", icon: ScrollText, permission: "r_plagas_control_barreras" },
    //         { title: "Presencia de Vectores", href: "/plagas/presencia-vectores", icon: TreePalm, permission: "r_plagas_presencia_vectores" },
    //         { title: "Trampas", href: "/plagas/trampas", icon: Rabbit, permission: "r_plagas_trampas" },
    //         { title: "Control Trampas", href: "/plagas/control-trampas", icon: ScrollText, permission: "r_plagas_control_trampas" },
    //         { title: "Arranque Fumigación", href: "/plagas/arranque-fumigacion", icon: SprayCan, permission: "r_plagas_arranque_fumigacion" },
    //         { title: "Insectocaptores", href: "/plagas/insectocaptores", icon: Drone, permission: "r_plagas_insectocaptores" },
    //         { title: "Registro Insectos", href: "/plagas/registro-insectos", icon: FlaskConical, permission: "r_plagas_registro_insectos" },
    //     ],
    // },
]

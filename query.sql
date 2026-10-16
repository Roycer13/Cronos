INSERT INTO plag_trampas (id, man_sector_id, codigo, estado, tipo) VALUES
(1, ALMACEN MATERIA PRIMA 3, 'LI-1', 1, 'Trampa de pegamento'),
(2, ALMACEN MATERIA PRIMA 3, 'LI-2', 1, 'Trampa de pegamento'),
(3, ALMACEN MATERIA PRIMA 3, 'LI-3', 1, 'Trampa de pegamento'),
(4, ALMACEN MATERIA PRIMA 3, 'LI-4', 1, 'Trampa de pegamento'),
(5, ALMACEN MATERIA PRIMA 3, 'LI-5', 1, 'Trampa de pegamento'),
(6, ALMACEN MATERIA PRIMA 3, 'LI-6', 1, 'Trampa de pegamento'),
(7, ALMACEN MATERIA PRIMA 3, 'LI-7', 1, 'Trampa de pegamento'),
(8, ALMACEN MATERIA PRIMA 3, 'LI-8', 1, 'Trampa de pegamento'),
(9, ALMACEN MATERIA PRIMA 3, 'LI-9', 1, 'Trampa de pegamento'),
(10, PASILLO DE PLANTA, 'LI-10', 1, 'Trampa de pegamento'),
(11, PASILLO DE PLANTA, 'LI-11', 1, 'Trampa de pegamento'),
(12, ALMACEN PRODUCTO TERMINADO 1, 'LI-16', 1, 'Trampa de pegamento'),
(13, ALMACEN PRODUCTO TERMINADO 1, 'LI-17', 1, 'Trampa de pegamento'),
(14, ALMACEN PRODUCTO TERMINADO 1, 'LI-15', 1, 'Trampa de pegamento'),
(15, ALMACEN PRODUCTO TERMINADO 1, 'LI-14', 1, 'Trampa de pegamento'),
(16, ALMACEN PRODUCTO TERMINADO 2 , 'LI-18', 1, 'Trampa de pegamento'),
(17, ALMACEN PRODUCTO TERMINADO 2 , 'LI-19', 1, 'Trampa de pegamento'),
(18, ALMACEN PRODUCTO TERMINADO 2 , 'LI-20', 1, 'Trampa de pegamento'),
(19, ALMACEN PRODUCTO TERMINADO 2 , 'LI-21', 1, 'Trampa de pegamento'),
(20, ALMACEN PRODUCTO TERMINADO 2 , 'LI-22', 1, 'Trampa viva'),
(21, ALMACEN PRODUCTO TERMINADO 2 , 'LI-23', 1, 'Trampa viva'),
(22, ALMACEN PRODUCTO TERMINADO 2 , 'LI-24', 1, 'Trampa viva'),
(23,  SALA DE CALDERO, 'LE-23', 1, 'Trampa de cebo'),
(24,  SALA DE CALDERO, 'LE-22', 1, 'Trampa de cebo'),
(25,  SALA DE CALDERO, 'LE-24', 1, 'Trampa de cebo'),
(26, PASILLO AREA AGUA RESIDUALES, 'LE-25', 1, 'Trampa de cebo'),
(27, PASILLO AREA AGUA RESIDUALES, 'LE-26', 1, 'Trampa de cebo'),
(28, PASILLO AREA AGUA RESIDUALES, 'LE-27', 1, 'Trampa de cebo'),
(29, PASILLO AREA AGUA RESIDUALES, 'LE-21', 1, 'Trampa de cebo'),
(30, PASILLO AREA AGUA RESIDUALES, 'LE-20', 1, 'Trampa de cebo'),
(31, PASILLO AREA AGUA RESIDUALES, 'LE-19', 1, 'Trampa de cebo'),
(32, PASILLO AREA AGUA RESIDUALES, 'LE-18', 1, 'Trampa de cebo'),
(33, ALMACEN PRODUCTO TERMINADO 2 , 'LI-25', 1, 'Trampa viva'),
(34, ALMACEN PRODUCTO TERMINADO 2 , 'LI-26', 1, 'Trampa viva'),
(35, ALMACEN PRODUCTO TERMINADO 1, 'LI-12', 1, 'Trampa viva'),
(36, ALMACEN PRODUCTO TERMINADO 1, 'LI-13', 1, 'Trampa viva'),
(37, PATIO DE DESPACHO PRODUCTO TERMINADO, 'LI-27', 1, 'Trampa viva'),
(38, PATIO DE DESPACHO PRODUCTO TERMINADO, 'LI-28', 1, 'Trampa viva'),
(39, PATIO DE DESPACHO PRODUCTO TERMINADO, 'LE-10', 1, 'Trampa de cebo'),
(40, PATIO FRONTAL , 'LE-9', 1, 'Trampa de cebo'),
(41, PATIO FRONTAL, 'LE-8', 1, 'Trampa de cebo'),
(42, PATIO FRONTAL, 'LE-7', 1, 'Trampa de cebo'),
(43, PATIO FRONTAL, 'LE-6', 1, 'Trampa de cebo'),
(44, PATIO FRONTAL, 'LE-5', 1, 'Trampa de cebo'),
(45, PATIO FRONTAL, 'LE-1', 1, 'Trampa de cebo'),
(46, PATIO FRONTAL, 'LE-4', 1, 'Trampa de cebo'),
(47, PATIO FRONTAL, 'LE-2', 1, 'Trampa de cebo'),
(48, PATIO FRONTAL, 'LE-3', 1, 'Trampa de cebo');

INSERT INTO pll_lugar_control_temperaturas (id, nombre, tipo, alias, estado) VALUES
(1, 'Almacén de Producto Terminado 1 (PLL-A20)', 'Almacén', 'APT1', 1),
(2, 'Almacén de Materia Prima 1 (PLL-A19)', 'Almacén', 'AMP1', 1),
(3, 'Congelador de Materia Prima', 'Almacén', 'CMP', 1),
(5, 'Cámara de refrigeración Soya 1', 'Cámara de frio', 'CRS1', 1),
(6, 'Cámara de refrigeración Soya 2', 'Cámara de frio', 'CRS2', 1),
(7, 'Cámara de refrigeración Soya 3', 'Cámara de frio', 'CRS3', 1),
(8, 'Cámara de refrigeración Soya 4', 'Cámara de frio', 'CRS4', 1),
(9, 'Cámara de refrigeración 1', 'Cámara de frio', 'CR1', 1),
(10, 'Cámara de refrigeración 2', 'Cámara de frio', 'CR2', 1),
(11, 'Cámara de refrigeración 3', 'Cámara de frio', 'CR3', 1),
(12, 'Cámara de refrigeración 4', 'Cámara de frio', 'CR4', 1),
(13, 'Cámara de refrigeración 5', 'Cámara de frio', 'CR5', 1),
(14, 'Ambiente de frio termokin 4 ', 'Cámara de frio', 'AEA4', 1);




++++++++++++++++++++++++++++++++++++++++
UPDATE sustancias_movs
SET area = CASE id
    WHEN 500 THEN 'PRODUCCION, DESAGUES'
    WHEN 499 THEN 'PRODUCCION, HORNOS'
    WHEN 498 THEN 'ALMACEN'
    WHEN 497 THEN 'LABORATORIO'
    -- ...
END
WHERE id IN (500, 499, 498, 497);
INSERT INTO infraestructuras (ubicacion_id, nombre, nivel, periodicidad_dias, ultima_inspeccion, usa_pisos, usa_paredes, usa_techos, usa_puertas, usa_ventanas, usa_drenajes, usa_iluminacion, usa_ventilacion, usa_lavamanos, usa_servicios_sanitarios, usa_almacenamiento, usa_senalizacion, activo, created_at, updated_at)
VALUES 
(1, 'ALMACEN DE MATERIA PRIMA 2 (PLS-A17)', 'azul', 365, '2026-01-06', 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, NULL, NULL),
(1, 'PATIO FRONTAL AREA DE LACTEOS (PLL-A52)', 'azul', 365, '2026-01-06', 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'AREA DE RESIDUOS SOLIDOS', 'azul', 365, '2026-01-06', 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'RECEPCION DE DEVOLICIONES PT (PLL-A16)', 'azul', 365, '2026-01-06', 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE SERVICIOS 2', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'VESTIDORES DE PERSONAL OBRERO (PLL-A41)(PLL-A40)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'PASILLO DE VESTIDOR DEL PERSONAL OBRERO (PLL-A45)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'BAÑOS OBREROS (PLL-A48)(PLL-A49)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, NULL, NULL),
(1, 'VESTIDORES DE PERSONAL ADMINISTRATIVO (PLL-A43)(PLL-A42)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'BAÑOS ADMINISTRATIVO (PLL-A50)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, NULL, NULL),
(1, 'PASILLO INGRESO A PLANTA (PLL-A44)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, NULL, NULL),
(1, 'LABORATORIO DE CONTROL DE CALIDAD (PLL-29)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE MUESTRAS DE PT (PLL-A54)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, NULL, NULL),
(1, 'LABORATORIO DE MCROBIOLOGIA (PLL-A17,A18, A31, A30)', 'verde', 180, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'ALMACEN DE MATERIA PRIMA 3 (PLL-A19)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'SALA DE RECEPCION DE LECHE (PLL-A01)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'PASILLO DE PLANTA (PLL-A16)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'CAMARA DE REFRIGERACION 1 (PLL-A22)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, NULL, NULL),
(1, 'ALMACEN DE PRODUCTO TERMINADO 1 (PLL-A20)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'ALMACEN DE PRODUCTO TERMINADO 3 -DESPACHO (PLL-A27)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'CAMARA DE REFRIGERACION 5 (PLL-A26)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'ALMACEN DE PRODUCTO TERMINADO 2 (PLLA-21)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'CAMARA DE REFRIGERACION 2 (PLL-A23)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, NULL, NULL),
(1, 'CAMARA DE REFRIGERACION 3 (PLL-A24)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, NULL, NULL),
(1, 'CAMARA DE REFRIGERACION 4 (PLL-A25)', 'Amarillo', 90, '2026-07-21', 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, NULL, NULL),
(1, 'SALA ENVASADO VASOS (PLL-A11)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE ENVASADO UHT (PLL-A10)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE ENVASADO HTST (PLL-A09)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE ENVASADO UHT - VIDRIO (PLL-A62)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE ULTRAPASTEURIZADO (PLL-A08)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE SABORIZADO (PLL-A07)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE PASTEURIZADO (PLL-A03)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL),
(1, 'SALA DE PREPARACIONES Y MEZCLAS (PLL-A05)', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, NULL, NULL),
(1, 'SALA DE FREACCIONADO', 'Rojo', 60, '2026-07-21', 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, NULL, NULL);
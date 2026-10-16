-- 1. Borrar todos los datos
DELETE FROM PLL_item_materia_primas;

-- 2. Reiniciar el contador IDENTITY a 1
DBCC CHECKIDENT ('PLL_item_materia_primas', RESEED, 0);


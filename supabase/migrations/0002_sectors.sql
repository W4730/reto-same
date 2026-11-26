-- Sectores PROVISIONALES de la playa de Same (pregunta 7 del handout pendiente).
-- Tramos de la línea de costa con 400 m de ancho a cada lado. Reemplazar por los nombres que usa Alan.
insert into public.sectors (id, name, sort, geom)
select id, name, sort,
  extensions.st_buffer(
    extensions.st_makeline(extensions.st_setsrid(extensions.st_point(lng1, lat1), 4326),
                           extensions.st_setsrid(extensions.st_point(lng2, lat2), 4326))::extensions.geography,
    400, 'endcap=flat')::extensions.geometry
from (values
  ('same-sur',    'Same Sur · hacia Tonchigüe', 1, 0.8276, -79.9504, 0.8373, -79.9363),
  ('same-centro', 'Same Centro',                2, 0.8373, -79.9363, 0.8471, -79.9221),
  ('same-norte',  'Same Norte · Casablanca',    3, 0.8471, -79.9221, 0.8568, -79.9080)
) v(id, name, sort, lat1, lng1, lat2, lng2);

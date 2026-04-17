// Minimal MapLibre style using OSM raster tiles.
// Service worker caches tile.openstreetmap.org — previously visited tiles work offline.
// Faz 1.2'de PMTiles ile tam-offline vector style geçilecek.

export const osmRasterStyle = {
  version: 8,
  glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap',
      minzoom: 0,
      maxzoom: 19
    }
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#0A0A08' } },
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.85,
        'raster-contrast': 0.1,
        'raster-saturation': -0.3
      }
    }
  ]
}

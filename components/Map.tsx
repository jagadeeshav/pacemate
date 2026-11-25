'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RunMap({ center = [12.9716, 77.5946], zoom = 12, markers = [], pick, onPick }: any) {
  const el = useRef<HTMLDivElement>(null);
  const s = useRef<any>({});
  useEffect(() => {
    const m = L.map(el.current!).setView(center, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(m);
    s.current = { m, g: L.layerGroup().addTo(m) };
    m.on('click', (e: any) => onPick?.(e.latlng.lat, e.latlng.lng));
    return () => { m.remove(); };
  }, []);
  useEffect(() => {
    const { g } = s.current;
    g.clearLayers();
    markers.forEach((k: any) =>
      L.circleMarker([k.lat, k.lng], { radius: 9, color: '#0a1f44', weight: 2, fillColor: '#ff5a1f', fillOpacity: 0.9 })
        .bindPopup(`<a href="/run/${k.id}"><b>${k.title}</b></a><br/>${k.sub}`).addTo(g));
    if (pick) L.circleMarker(pick, { radius: 10, color: '#0a1f44', weight: 3, fillColor: '#2f7bff', fillOpacity: 0.9 }).addTo(g);
  }, [markers, pick]);
  return <div ref={el} className="map" />;
}

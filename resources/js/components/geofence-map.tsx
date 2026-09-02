import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
    latitude: number | null;
    longitude: number | null;
    radius: number;
    onChange: (latitude: number, longitude: number) => void;
};

export default function GeofenceMap({ latitude, longitude, radius, onChange }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const initial: L.LatLngExpression = [latitude ?? 18.061, longitude ?? 120.519];
        const map = L.map(containerRef.current).setView(initial, 17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        map.on('click', (event) => onChange(event.latlng.lat, event.latlng.lng));
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || latitude === null || longitude === null) return;

        const point: L.LatLngExpression = [latitude, longitude];

        if (!markerRef.current) markerRef.current = L.marker(point).addTo(map);
        else markerRef.current.setLatLng(point);

        if (!circleRef.current) circleRef.current = L.circle(point, { radius }).addTo(map);
        else {
            circleRef.current.setLatLng(point);
            circleRef.current.setRadius(radius);
        }

        map.panTo(point);
    }, [latitude, longitude, radius]);

    return <div ref={containerRef} className="h-[380px] w-full rounded-xl" />;
}

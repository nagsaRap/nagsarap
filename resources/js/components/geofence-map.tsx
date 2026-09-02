import { useEffect, useRef } from 'react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

type Props = {
    latitude: number | null;
    longitude: number | null;
    radius: number;

    onChange: (
        latitude: number,
        longitude: number
    ) => void;
};

export default function GeofenceMap({
    latitude,
    longitude,
    radius,
    onChange,
}: Props) {

    const mapContainerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef =
        useRef<L.Map | null>(null);

    const markerRef =
        useRef<L.Marker | null>(null);

    const circleRef =
        useRef<L.Circle | null>(null);

    useEffect(() => {

        if (
            !mapContainerRef.current ||
            mapRef.current
        ) {
            return;
        }

        const initialLat =
            latitude ?? 18.061;

        const initialLng =
            longitude ?? 120.519;

        const map = L.map(
            mapContainerRef.current
        ).setView(
            [initialLat, initialLng],
            17
        );

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 20,
                attribution:
                    '&copy; OpenStreetMap contributors',
            }
        ).addTo(map);

        map.on('click', (event) => {

            onChange(
                event.latlng.lat,
                event.latlng.lng
            );

        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };

    }, []);

    useEffect(() => {

        const map = mapRef.current;

        if (
            !map ||
            latitude === null ||
            longitude === null
        ) {
            return;
        }

        const coordinates:
            L.LatLngExpression =
            [latitude, longitude];

        if (!markerRef.current) {

            markerRef.current =
                L.marker(coordinates)
                    .addTo(map);

        } else {

            markerRef.current
                .setLatLng(coordinates);
        }

        if (!circleRef.current) {

            circleRef.current =
                L.circle(coordinates, {
                    radius,
                }).addTo(map);

        } else {

            circleRef.current
                .setLatLng(coordinates);

            circleRef.current
                .setRadius(radius);
        }

    }, [
        latitude,
        longitude,
        radius
    ]);

    return (
        <div
            ref={mapContainerRef}
            className="h-[400px] w-full rounded-xl"
        />
    );
}
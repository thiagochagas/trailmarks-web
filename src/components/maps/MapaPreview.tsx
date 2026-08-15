"use client";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { MapPin } from "lucide-react";

interface MapaPreviewProps {
  latitude: number;
  longitude: number;
}

export function MapaPreview({ latitude, longitude }: MapaPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [longitude, latitude], scale: 200 }}
        width={320}
        height={180}
      >
        <Geographies geography="/world-atlas/countries-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="fill-muted stroke-border outline-none"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        <Marker coordinates={[longitude, latitude]}>
          <MapPin
            width={28}
            height={28}
            x={-14}
            y={-28}
            className="fill-orange-500 stroke-white drop-shadow-md"
            strokeWidth={1.5}
          />
        </Marker>
      </ComposableMap>
    </div>
  );
}

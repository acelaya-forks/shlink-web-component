import { CardModal } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import type { MapContainerProps } from 'react-leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { CityStats } from '../types';

interface MapModalProps {
  toggle: () => void;
  isOpen: boolean;
  title: string;
  locations?: CityStats[];
}

const OpenStreetMapTile: FC = () => (
  <TileLayer
    attribution='&amp;copy <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
);

const calculateMapProps = (locations: CityStats[]): MapContainerProps => {
  if (locations.length === 0) {
    return {};
  }

  if (locations.length > 1) {
    return { bounds: locations.map(({ latLong }) => latLong) };
  }

  // When there's only one location, an error is thrown if trying to calculate the bounds.
  // When that happens, we use "zoom" and "center" as a workaround
  const [{ latLong: center }] = locations;

  return { zoom: 10, center };
};

export const MapModal = ({ toggle, isOpen, title, locations = [] }: MapModalProps) => (
  <CardModal open={isOpen} onClose={toggle} title={title} variant="cover">
    <MapContainer {...calculateMapProps(locations)} className="h-full w-full">
      <OpenStreetMapTile />
      {locations.map(({ cityName, latLong, count }, index) => (
        <Marker key={index} position={latLong}>
          <Popup><b>{count}</b> visit{count > 1 ? 's' : ''} from <b>{cityName}</b></Popup>
        </Marker>
      ))}
    </MapContainer>
  </CardModal>
);

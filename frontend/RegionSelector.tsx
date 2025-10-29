import React from 'react';

export type Region = 'us-central1' | 'europe-west1';

interface RegionSelectorProps {
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onRegionChange }) => {
  return (
    <div className="region-selector">
      <label htmlFor="region-select">Data Region:</label>
      <select
        id="region-select"
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value as Region)}
        className="btn btn-secondary"
        title="Simulates compliance-aware traffic steering. API requests will target this region."
      >
        <option value="us-central1">US (us-central1)</option>
        <option value="europe-west1">EU (europe-west1)</option>
      </select>
    </div>
  );
};
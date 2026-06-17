export interface ClusterInput {
  id: string;
  lat: number;
  lng: number;
  type: 'activity' | 'restaurant';
  data: any; // Activity | Restaurant
}

export interface Cluster {
  centroid: { lat: number; lng: number };
  items: ClusterInput[];
  dayRecommendation: number; // suggested day number (1-indexed)
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function clusterItems(items: ClusterInput[], numDays: number): Cluster[] {
  if (items.length === 0) return [];
  if (items.length <= numDays * 4) {
    return [
      {
        centroid: {
          lat: items.reduce((sum, item) => sum + item.lat, 0) / items.length,
          lng: items.reduce((sum, item) => sum + item.lng, 0) / items.length,
        },
        items,
        dayRecommendation: 1,
      },
    ];
  }

  // Initialize centroids spread across the bounding box
  let minLat = items[0].lat;
  let maxLat = items[0].lat;
  let minLng = items[0].lng;
  let maxLng = items[0].lng;

  for (const item of items) {
    if (item.lat < minLat) minLat = item.lat;
    if (item.lat > maxLat) maxLat = item.lat;
    if (item.lng < minLng) minLng = item.lng;
    if (item.lng > maxLng) maxLng = item.lng;
  }

  let centroids: { lat: number; lng: number }[] = [];
  for (let i = 0; i < numDays; i++) {
    const fraction = numDays === 1 ? 0.5 : i / (numDays - 1);
    centroids.push({
      lat: minLat + (maxLat - minLat) * fraction,
      lng: minLng + (maxLng - minLng) * fraction,
    });
  }

  let clusters: Cluster[] = [];

  for (let iter = 0; iter < 10; iter++) {
    // Assign items to nearest centroid
    clusters = centroids.map((c) => ({ centroid: c, items: [], dayRecommendation: 0 }));

    for (const item of items) {
      let minDist = Infinity;
      let closestIdx = 0;
      for (let i = 0; i < centroids.length; i++) {
        const dist = haversineDistance(item.lat, item.lng, centroids[i].lat, centroids[i].lng);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      clusters[closestIdx].items.push(item);
    }

    // Recalculate centroids
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].items.length > 0) {
        const sumLat = clusters[i].items.reduce((sum, item) => sum + item.lat, 0);
        const sumLng = clusters[i].items.reduce((sum, item) => sum + item.lng, 0);
        centroids[i] = {
          lat: sumLat / clusters[i].items.length,
          lng: sumLng / clusters[i].items.length,
        };
      }
    }
  }

  // Filter out empty clusters and sort west to east
  const validClusters = clusters
    .filter((c) => c.items.length > 0)
    .sort((a, b) => a.centroid.lng - b.centroid.lng);

  // Assign day recommendations
  for (let i = 0; i < validClusters.length; i++) {
    validClusters[i].dayRecommendation = i + 1;
  }

  return validClusters;
}

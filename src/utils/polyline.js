// src/utils/polyline.js
// Decodes Google's encoded polyline algorithm format into a lat/lng array.
// No npm package needed — this is the full reference algorithm.
export function decodePolyline(encoded) {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        lat += result & 1 ? ~(result >> 1) : result >> 1;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        lng += result & 1 ? ~(result >> 1) : result >> 1;

        points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
}

// Maps a Google Directions "maneuver" string to a MaterialCommunityIcons name.
// Falls back to a straight arrow when Google omits maneuver (common on the
// first/last step of a route).
export function maneuverToIcon(maneuver) {
    const map = {
        'turn-left': 'arrow-left-bold',
        'turn-right': 'arrow-right-bold',
        'turn-slight-left': 'arrow-top-left-bold',
        'turn-slight-right': 'arrow-top-right-bold',
        'turn-sharp-left': 'arrow-bottom-left-bold',
        'turn-sharp-right': 'arrow-bottom-right-bold',
        'uturn-left': 'u-turn-left',
        'uturn-right': 'u-turn-right',
        'ramp-left': 'arrow-top-left-bold',
        'ramp-right': 'arrow-top-right-bold',
        merge: 'arrow-up-bold',
        'fork-left': 'arrow-top-left-bold',
        'fork-right': 'arrow-top-right-bold',
        'roundabout-left': 'rotate-left',
        'roundabout-right': 'rotate-right',
        straight: 'arrow-up-bold',
    };
    return map[maneuver] ?? 'arrow-up-bold';
}
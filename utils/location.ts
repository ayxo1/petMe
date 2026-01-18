import * as Location from 'expo-location';

export interface Coordinates {
    lat: number;
    lng: number;
}

interface LocationData {
    city: string;
    coordinates: Coordinates
}

// location request + retrieval of GPS position
export const getCurrentLocation = async (): Promise<Coordinates> => {
    try {
        // permission request
        const { status } = await Location.requestForegroundPermissionsAsync();

        if(status !== 'granted') throw new Error('location request denied');

        // get location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
        });

        console.log(location);
        
        return {
            lat: location.coords.latitude,
            lng: location.coords.longitude
        }

    } catch (error) {
        console.log(error, 'error retrieving location');
        throw error;
    }
}

// coordinates -> city
export const getCityFromCoordinates = async (coordinates: Coordinates): Promise<LocationData | null> => {
    try {
        const [result] = await Location.reverseGeocodeAsync({
            latitude: coordinates.lat,
            longitude: coordinates.lng
        });

        if(!result) return null;

        return {
            city: result.city || result.subregion || 'unknown',
            coordinates
        };

    } catch (error) {
        console.log(error, 'reverse geocode error');
        return null;
    };
}

// city -> coordinates
export const getCoordinatesFromCity = async (city: string): Promise<Coordinates | null> => {
    try {
        const results = await Location.geocodeAsync(city);

        if(results.length === 0) return null;

        return {
            lat: results[0].latitude,
            lng: results[0].longitude
        }
    } catch (error) {
        console.log(error, 'geocode error');
        return null;
    }
}

const toRad = (degrees: number) => degrees * (Math.PI / 180);

// distance between 2 coordinates calc
export const calculateDistance = (
    coordinates1: Coordinates,
    coordinates2: Coordinates
): number => {

    // a = sin²(Δφ/2) ⋅ sin²(Δλ/2) + cos φ₁ ⋅ cos φ₂  
    // c = 2 ⋅ atan2( √a, √(1−a) )
    // d = R ⋅ c

    // φ (phi): Latitude of the two points.
    // λ (lambda): Longitude of the two points.

    const R = 6371; //Earth R km

    const dLat = toRad(coordinates2.lat - coordinates1.lat);
    const dLng = toRad(coordinates2.lng - coordinates1.lng);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coordinates1.lat)) * Math.cos(toRad(coordinates2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}



export const findNearestCoordinate = (coordinates, targetCoordinate) => {
    // Знайдіть відстань між кожною координатою в масиві та заданою координатою.
    const distances = coordinates.map((coordinate) => {
      const distance = Math.sqrt(
        Math.pow(coordinate.lat - targetCoordinate.lat, 2) +
        Math.pow(coordinate.lon - targetCoordinate.lon, 2)
      );
      return { coordinate, distance };
    });
  
    // Відсортуйте координати за відстанню від заданої координати.
    const sortedCoordinates = distances.sort((a, b) => a.distance - b.distance);
  
    // Поверніть найближчу координату.
    return sortedCoordinates[0].coordinate;
  }
mapboxgl.accessToken = 'pk.eyJ1IjoiYmVsbGFhcHJtdCIsImEiOiJjbTNtc3RoODAxMGwyMnJzOWtsNjFtcmZwIn0.c9pUs9c9eDUehpXlK90WIA';
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/navigation-day-v1',
  center: [106.8132037, -6.2258056],
  zoom: 20,
  pitch: 0,
  bearing: 100,
  antialias: true,
  maxZoom: 22,
  minZoom: 17,
});

// Disable default map keyboard function
map.keyboard.disable();

map.addControl(new mapboxgl.NavigationControl());
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
);

const floors = Array.from({length: 6}, (_, i) => {
  if (i >= 4) {
    return (++i).toString();
  }

  return i === 0 ? 'Ground' : i.toString();
}).reverse();

$(document).ready(function () {
  map.on('load', () => {
    for (var i = 0; i < floors.length; i++) {
      const floor = floors[i];
      map.addLayer({
        'id': `Lantai ${floor}`,
        'type': 'fill',
        'source': {
          type: 'geojson',
          'data': `./F${floor}.geojson`
        },
        layout: {
          visibility: i === (floors.length - 1) ? 'visible' : 'none',
        },
        'paint': {
          'fill-color': ['get', 'colour'],
          'fill-opacity': 0.5
        },
      });
      map.addLayer({
        'id': `Lantai ${floor} symbol`,
        'type': 'symbol',
        'source': {
          type: 'geojson',
          'data': `./F${floor}.geojson`
        },
        layout: {
          visibility: i === (floors.length - 1) ? 'visible' : 'none',
          'text-field': ['get', 'description'],
          'text-radial-offset': 0,
          'text-justify': 'center',
          'symbol-placement': 'point',
          'text-variable-anchor': ['bottom'],
        },
        paint: {
          'text-color': ['get', 'text-color'],
        }
      })
      map.setPaintProperty(`Lantai ${floor}`, 'fill-color', [
        'interpolate',
        // Set the exponential rate of change to 0.5
        ['exponential', 0.5],
        ['zoom'],
        // When zoom is 18, buildings will be beige.
        18,
        '#FFB69C',
        // When zoom is 19 or higher, buildings will be yellow.
        19,
        ['get', 'colour'],
      ]);

    }
  });
  for (let i = 0; i < floors.length; i++) {
    const floor = floors[i];

    const link = document.createElement('a');
    link.href = '#';
    link.className = `menu-button ${i === (floors.length - 1) ? 'active' : ''}`;
    link.setAttribute(`data-nomorlantai`, floor);
    link.id = `btn-lantai-${floor}`;
    link.textContent = `${floor === 'Ground'? 'G' : floor}`;

    link.onclick = function (e) {
      const mapClickedLayer = "Lantai " + this.getAttribute("data-nomorlantai");
      e.preventDefault();
      e.stopPropagation();

      floors.forEach(floor => {
        const floorLayer = `Lantai ${floor}`;
        const symbolLayer = `${floorLayer} symbol`;
        map.setLayoutProperty(floorLayer, 'visibility', 'none');
        map.setLayoutProperty(symbolLayer, 'visibility', 'none');
      });
      $(".menu-button").removeClass('active');
      $(this).addClass('active');
      map.setLayoutProperty(mapClickedLayer, 'visibility', 'visible');
      map.setLayoutProperty(`${mapClickedLayer} symbol`, 'visibility', 'visible');
      $('.icons').remove();

      if (floor === 'Ground') {
        $.ajax({
          type: 'GET',
          url: './FGpoint.geojson',
          success: function (data) {
            data.features.forEach(feature => {
              let { name } = feature.properties;
              if (name.includes('parkingspace')) {
                name = 'parkingarea'
              }
              const { coordinates } = feature.geometry;
              d = document.createElement('div');
              $(d).css('background-image', `url('./icons/${name}.png')`);
              $(d).css('background-size', `100%`);
              $(d).addClass('icons');
              const zoom = (map.getZoom() - 18) * 100 / 100;
              $(d).width(zoom * 8).height(zoom * 8);

              new mapboxgl.Marker(d)
                .setLngLat(coordinates)
                .addTo(map);
            });
          },
          error: function (err) {
            console.log(err);
          }
        });
      }

      $.ajax({
        type: 'GET',
        url: `./F${floor}Point.geojson`,
        success: function (data) {
          console.log(data);
          data.features.forEach(feature => {
            let { name } = feature.properties;

            if (name === 'wall' || name.includes('parkingarea')) {
              return;
            }
            const { coordinates } = feature.geometry;
            d = document.createElement('div');
            $(d).css('background-image', `url('./icons/${name}.png')`);
            $(d).css('background-size', `100%`);
            $(d).addClass('icons');
            const zoom = (map.getZoom() - 18) * 100 / 100;
            $(d).width(zoom * 8).height(zoom * 8);

            new mapboxgl.Marker(d)
              .setLngLat(coordinates)
              .addTo(map);
          });
        },
        error: function (err) {
          console.log(err);
        }
      });
    };

    const layers = document.getElementById('menu');
    layers.appendChild(link);
  }

  $.ajax({
    type: 'GET',
    url: './FGpoint.geojson',
    success: function (data) {
      data.features.forEach(feature => {
        let { name } = feature.properties;
        if (name.includes('parkingspace')) {
          name = 'parkingarea'
        }
        const { coordinates } = feature.geometry;
        d = document.createElement('div');
        $(d).css('background-image', `url('./icons/${name}.png')`);
        $(d).css('background-size', `100%`);
        $(d).addClass('icons');
        const zoom = (map.getZoom() - 18) * 100 / 100;
        $(d).width(zoom * 8).height(zoom * 8);

        new mapboxgl.Marker(d)
          .setLngLat(coordinates)
          .addTo(map);
      });
    },
    error: function (err) {
      console.log(err);
    }
  });
  $.ajax({
    type: 'GET',
    url: `./FGroundPoint.geojson`,
    success: function (data) {
      console.log(data);
      data.features.forEach(feature => {
        let { name } = feature.properties;

        if (name === 'wall' || name.includes('parkingarea')) {
          return;
        }
        const { coordinates } = feature.geometry;
        d = document.createElement('div');
        $(d).css('background-image', `url('./icons/${name}.png')`);
        $(d).css('background-size', `100%`);
        $(d).addClass('icons');
        const zoom = (map.getZoom() - 18) * 100 / 100;
        $(d).width(zoom * 8).height(zoom * 8);

        new mapboxgl.Marker(d)
          .setLngLat(coordinates)
          .addTo(map);
      });
    },
    error: function (err) {
      console.log(err);
    }
  });

  map.on('zoom', (e) => {
    const zoom = (map.getZoom() - 18) * 100 / 100;
    $('.icons').width(zoom * 8).height(zoom * 8);
  });
})

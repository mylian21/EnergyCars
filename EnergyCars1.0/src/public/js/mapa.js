// MAPA INTERACTIVO
document.addEventListener('DOMContentLoaded', () => {
    //INICIAR EL MAPA
    const map = L.map('map').setView([-34.6037, -58.3816], 13);

    //AGREGAR CAPA BASE
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //UBICACION DEL USUARIO
    map.locate({enableHighAccuracy: true});
    map.on('locationfound', e => {
        const coords = [e.latlng.lat, e.latlng.lng];
        const marker = L.marker(coords);
        map.addLayer(marker);
    }); 
    
    //ICONO ENERGYCARS
    let iconEnergy = L.icon({
        iconUrl: '/img/energy.png',
        iconSize: [60, 60],
        iconAnchor: [25, 60]
    });

    //AGREGAR MARCADORES.
    fetch('/estaciones')
        .then(response => response.json())
        .then(estacionesMapa => {
            estacionesMapa.forEach(estacion => {
                const marker = L.marker([estacion.ESTC_LATITUD, estacion.ESTC_LONGITUD], {icon: iconEnergy})
                    .addTo(map)
                    .bindPopup(`
                        <div class = "container">
                            <h3>${estacion.ESTC_NOMBRE}</h3>
                            <h4>${estacion.ESTC_DIRECCION}</h4>
                            <h5>${estacion.ESTC_LOCALIDAD}</h5>
                            <p>Cantidad de surtidores: ${estacion.cantidad_surtidores}</p>
                            <form action="/reserva/estacion/${estacion.ID_ESTC}"> <button class="btn btn-success">RESERVAR</button> </form>
                        </div>
                    `);
            });
        });
    
    //L.marker([-34,5813188, -58,4217869], {icon: iconEnergy}).addTo(map);
});





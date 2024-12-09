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
                        <div class = "">
                            <h4 class= "colorGreen">${estacion.ESTC_NOMBRE}</h4>
                            <h6>${estacion.ESTC_DIRECCION}</h6>
                            <h6>${estacion.ESTC_LOCALIDAD}</h6>
                            <h6>Cantidad de surtidores: ${estacion.cantidad_surtidores}</h6>
                            <form action="/reserva/estacion/${estacion.ID_ESTC}"> <button class="btn btn-success">Reservar</button> </form>
                        </div>
                    `);
            });
        });
});





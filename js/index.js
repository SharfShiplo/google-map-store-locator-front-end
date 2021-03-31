let map;
let infoWindow;
let markers = [];
const createMarker = (latlng, name, OpenStatus, phone, address, storeNumber) => {
    let html = `
    <div class="store-info-window">
        <div class="store-info-name">${name}</div>
        <div class="store-info-open-status">${OpenStatus}</div>
        <div class="store-info-address"><div class="icon"><i class="fas fa-location-arrow"></i></div><span>${address}</span></div>
        <div class="store-info-phone"><div class="icon"><i class="fas fa-phone-alt"></i></div><span><a href="tel:${phone}">${phone}</a></span></div>
    </div>
    `
    let marker = new google.maps.Marker({
        position: latlng,
        map: map,
        label: `${storeNumber}`,
    });

    google.maps.event.addListener(marker, 'click', () => {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    })
    markers.push(marker)
}

function initMap() {
    let myLatLng = { lat: 23.7013, lng: 90.3975 }
    map = new google.maps.Map(document.getElementById("map"), {
        center: myLatLng,
        zoom: 11,
    });
    infoWindow = new google.maps.InfoWindow();
}

const onEnter = (e) => {
    if (e.key == 'Enter') {
        getStores();
    }
}

const getStores = () => {
    const zipCode = document.getElementById('zip-code').value;
    if (!zipCode) {
        return;
    }
    const API_URL = 'http://localhost:3000/api/stores';
    const full_url = `${API_URL}?zip_code=${zipCode}`;
    fetch(full_url).then((response) => {
        if (response.status == 200) {
            return response.json();
        }
    }).then((resData) => {
        if (resData.length > 0) {
            clearLocations();
            searchLocationsNear(resData);
            setStoresList(resData);
            setOnClickListener();
        } else {
            clearLocations();
            noStoresFound()
        }
    }).catch((error) => {
        console.log(error);
    })
}

const clearLocations = () => {
    infoWindow.close();
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}

const setOnClickListener = () => {
    let storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach((elem, index) => {
        elem.addEventListener('click', () => {
            google.maps.event.trigger(markers[index], 'click');
        })
    })
}

const setStoresList = (stroes) => {
    let storesHtml = ''
    stroes.forEach((store, index) => {
        storesHtml += `
        <div class="store-container">
                <div class="store-info-container">
                    <div class="store-address">
                        <p>${store.addressLines[0]}</p>
                        <p>${store.addressLines[1]}</p>
                    </div>
                    <div class="store-phone-number">${store.phoneNumber}</div>
                </div>
                <div class="store-number-container"><span>${index + 1}</span></div>
            </div>
        `
    });
    document.querySelector('.stores-list') = storesHtml;
}

const searchLocationsNear = (stores) => {
    let bounds = new google.maps.LatLngBounds();
    stores.forEach((store, index) => {
        let latlng = new google.maps.LatLng(
            store.location.coordinates[1],
            store.location.coordinates[0],
        )
        let name = store.storeName;
        let address = store.addressLines[0];
        let OpenStatus = store.OpenStatusText;
        let phone = store.phoneNumber;
        bounds.extend(latlng);
        createMarker(latlng, name, OpenStatus, phone, address, index + 1);
    });
    map.fitBounds(bounds);
}

const noStoresFound = () => {
    const html = `
    <div class="no-stores-found"><span>No Stores Found</span></div>
    `
    document.querySelector('.stores-list').innerHTML = html;
}
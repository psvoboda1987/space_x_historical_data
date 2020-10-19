window.onload = () => {

    initApp();

};

function initApp() {

    let getDataBtn = document.getElementById('get-data');

    getDataBtn.addEventListener('click', (event) => {

        event.preventDefault();

        getData();

    });

}

function getData() {

    let baseUrl = 'https://api.spacexdata.com/v3';
    let endpoint = document.getElementById('data-type').value;

    getAjax(
        `php/proxy.php?url=${baseUrl}/${endpoint}`,

        (reply) => {

            let data = JSON.parse(reply);
            let controler = getController();
            let endpoint = document.getElementById('data-type').value;

            if (typeof controler[endpoint] !== 'function') {

                console.log('not a function');

                return;

            }
                
            let html = controler[endpoint](data);

            showReply(html);
        
        }

    );

}

function getController() {

    return {
        capsules: getCapsulesTemplate,
        cores: getCoresTemplate,
        dragons: getDragonsTemplate,
        history: getHistoryTemplate,
        info: getInfoTemplate,
        landpads: getLandpadsTemplate,
        launches: getLaunchesTemplate,
        missions: getMissionsTemplate,
        payloads: getPayloadsTemplate,
        roadster: getRoadsterTemplate,
        rockets: getRocketsTemplate,
        ships: getShipsTemplate,
    };

}

function showReply(html) {

    document.getElementById('result').innerHTML = html;
    
}

function getRoadsterTemplate(data) {

    let {name, launch_date_utc, details, launch_mass_kg, speed_kph, flickr_images, wikipedia, video} = data;

    let html = `
        <div class="item">
            <h3>${name}</h3>
            <p>${new Date(launch_date_utc).toUTCString()}</p>
            <p>${details}</p>
            <p><b>Mass</b>: ${launch_mass_kg}</p>
            <p><b>Speed</b>: ${speed_kph} km/h</p>
            <p><img src="${flickr_images[0]}"></p>
            <p><a href="${wikipedia}">Wiki link</a></p>
            <p><a href="${video}">Video link</a></p>
        </div>
    `;

    return html;

}

function getRocketsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let engineData = Object.entries(item.engines);
        let engineHtml = '';

        engineData.map((engine) => {
            engine.includes('layout') ? engineHtml += `${engine.layout} layout` : '';
            engine.includes('type') ? engineHtml += `${engine.layout}` : '';
            engine.includes('propellant_1') ? engineHtml += `${engine.layout}` : '';
            engine.includes('propellant_2') ? engineHtml += `${engine.layout} propellant` : '';
            engine.includes('thrust_sea_level.kN') ? engineHtml += `${engine.thrust_sea_level.kN} kN` : '';
        });

        let {rocket_name, first_flight, country, cost_per_launch, description, wikipedia} = item;

        html += `
            <div class="item">
                <h3>${rocket_name}</h3>
                <p><b>Diameter</b>: ${item.diameter.meters} m</p>
                <p><b>Mass</b>: ${item.mass.kg} kg</p>
                <p><b>Height</b>: ${item.height.meters} m</p>
                <p><b>First flight</b>: ${first_flight}</p>
                <p><b>Country</b>: ${country}</p>
                <p><b>Cost per launch</b>: $${cost_per_launch}</p>
                <p>${description}</p>
                <p>${engineHtml}</p>
                <p><a href="${wikipedia}">Wiki link</a></p>
            </div>
        `;

    });

    return html;

}

function getShipsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {ship_name, home_port, nationality, weight_kg, year_built, url, image} = item;

        html += `
            <div class="item">
                <h3>${ship_name}</h3>
                <p><b>Home port</b>: ${home_port}</p>
                ${nationality ? `<p><b>Nationality</b>: ${nationality}</p>` : ''}
                ${weight_kg ? `<p><b>Weight</b>: ${weight_kg} kg</p>` : ''}
                ${year_built ? `<p><b>Year build</b>: ${year_built}</p>` : ''}
                <p><a href="${url}"><img src="${image}" alt="${ship_name}"></a></p>
            </div>
        `;

    });

    return html;

}

function getPayloadsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {payload_id, payload_type, nationality, manufacturer, payload_mass_kg} = item;
        let {apoapsis_km, inclination_deg} = item.orbit_params;

        html += `
            <div class="item">
                <h3>${payload_id}</h3>
                <p><b>Type</b>: ${payload_type}</p>
                ${nationality ? `<p><b>Nationality</b>: ${nationality}</p>` : ''}
                ${manufacturer ? `<p><b>Manufacturer</b>: ${manufacturer}</p>` : ''}
                ${payload_mass_kg ? `<p><b>Mass</b>: ${payload_mass_kg}</p>` : ''}
                ${apoapsis_km ? `<p><b>Orbit</b>: ${apoapsis_km} km apoapsis` : '<p><b>Orbit</b>: '}
                ${inclination_deg ? `, ${inclination_deg}° incline</p>` : '</p>'}                
            </div>
        `;

    });

    return html;

}

function getMissionsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let manufacturersHtml = '';
        let {mission_name, mission_id, description, website, wikipedia, manufacturers} = item;
        let i = 0;

        for (i; i < manufacturers.length; i++) {

            manufacturersHtml += `${manufacturers[i]}`;

        }

        html += `
            <div class="item">
                <h3>${mission_name} (${mission_id})</h3>
                <p>${description}</p>
                <p><b>Manufacturers: </b>${manufacturersHtml}</p>
                <p><a href="${website}">Web link</a></p>
                <p><a href="${wikipedia}">Wiki link</a></p>
            </div>
        `;

    });

    return html;

}

function getLaunchesTemplate(data) {

    let html = '';
    let i = 0;

    data.forEach((item) => {

        if (i === 20) return html;

        let {mission_name, details, launch_date_utc, successful_landings} = item;
        let {mission_patch_small, wikipedia, video_link} = item.links;
        let {site_name_long} = item.launch_site;

        html += `
            <div class="item">
                <h3>${mission_name}</h3>
                ${details ? `<p>${details}</p>` : ''}
                <p><b>Launch date</b>: ${new Date(launch_date_utc).toUTCString()}</p>
                <p><b>Launch site</b>: ${site_name_long}</p>
                <p><img src="${mission_patch_small}" alt="${mission_name}"></p>
                ${successful_landings ? `<p><b>Successful landings: </b>${successful_landings}</p>` : ''}
                <p><a href="${wikipedia}">Wiki link</a></p>
                <p><a href="${video_link}">Video link</a></p>
            </div>
        `;

        i++;

    });

    return html;

}

function getLandpadsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {full_name, details, successful_landings, wikipedia} = item;
        let {name, region, latitude, longitude} = item.location;

        html += `
            <div class="item">
                <h3>${full_name}</h3>
                <p>${details}</p>
                <p>
                    <b>Location: </b>${name}, ${region}, 
                    latitude: ${latitude},
                    longitude: ${longitude}
                </p>
                <p><b>Successful landings: </b>${successful_landings}</p>
                <p><a href="${wikipedia}">Wiki link</a></p>
            </div>
        `;

    });

    return html;

}

function getInfoTemplate(data) {

    let html = '';
    let {ceo, coo, cto, employees, summary, address, city, state} = data;

    html += `
        <div class="item">
            <h3 class="text-center">SpaceX info</h3>
            <p><b>CEO</b>: ${ceo}</p>
            <p><b>COO</b>: ${coo}</p>
            <p><b>CTO</b>: ${cto}</p>
            <p><b>Employess: </b>${employees}</p>
            <p>${summary}</p>
            ${address ? `<p><b>Headquarters:</b> ${address}${city}, ${state}</p>` : ''}
            <p><a href="${data.links.website}">Website</a></p>
        </div>
    `;

    return html;

}

function getDragonsTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {name, description, crew_capacity, dry_mass_kg, first_flight, wikipedia} = item;

        html += `
            <div class="item">
                <h3>${name}</h3>
                <p>${description}</p>
                <p><b>Crew capacity: </b>${crew_capacity}</p>
                <p><b>Dry mass: </b>${dry_mass_kg} kg</p>
                <p><b>First flight: </b>${new Date(first_flight).toUTCString()}</p>
                <p><a href="${wikipedia}">Wiki link</a></p>
            </div>
        `;

    });

    return html;

}

function getCoresTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let missionsHtml = '';

        item.missions.forEach((mission) => {

            missionsHtml += `${mission.name}, `;

        });

        let {core_serial, details, original_launch, status} = item;

        html += `
            <div class="item">
                <h3>${core_serial}</h3>
                ${details ? `<p>${details}</p>` : ''}
                <p><b>Date: </b>${new Date(original_launch).toUTCString()}</p>
                <p><b>Missions: </b>${missionsHtml}</p>
                <p><b>Status: </b>${status}</p>
            </div>
        `;

    });

    return html;

}

function getCapsulesTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {capsule_serial, details, landings, type, status, original_launch} = item;

        html += `
            <div class="item">
                <h3>${capsule_serial}</h3>
                ${details ? `<p>${details}</p>` : ''}
                <p><b>Landings: </b>${landings}</p>
                <p><b>Type: </b>${type}</p>
                <p><b>Status: </b>${status}</p>
                <p><b>Date: </b>${new Date(original_launch).toUTCString()}</p>
            </div>
        `;

    });

    return html;

}

function getHistoryTemplate(data) {

    let html = '';

    data.forEach((item) => {

        let {title, details, event_date_utc} = item;
        let {article, wikipedia} = item.links;

        html += `
            <div class="item">
                <h3>${title}</h3>
                <p>${details.substring(0, 225)}</p>
                <p><b>Date: </b>${new Date(event_date_utc).toUTCString()}</p>
                <p><a href="${article}">Web article</a></p>
                <p><a href="${wikipedia}">Wiki article</a></p>
            </div>
        `;

    });

    return html;

}

function getAjax(url, success = null, fail = null) {
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200 && typeof success == 'function') {
            success(xhr.responseText);
        }
        else {
            if (typeof fail == 'function') fail();
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
    return xhr;
}
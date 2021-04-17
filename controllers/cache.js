const servers_list = require("../public/servers_list.json");

const cache = {
    positions: {},
    status: {},
    skillboost: {
        fetching: false,
        timestamp: 0,
        data: null
    },
    ip_logs: {},
    vehicles_cache: {
        fetching: false, //add this
        timestamp: 0,
        sorted_vehicles: null,
        sorted_classes: null
    },
    charges: 0,
    // last_working_server: null
};

for (const server_ip in servers_list) {
    cache.positions[server_ip] = {
        ip: server_ip,
        name: servers_list[server_ip],
        data: null,
        timestamp: 0,
        fetching: false
    }

    cache.status[server_ip] = {
        ip: server_ip,
        name: servers_list[server_ip],
        data: null,
        timestamp: 0,
        fetching: false,
    }
};

// cache.last_working_server = Object.values(cache.positions)[0];

module.exports = cache;
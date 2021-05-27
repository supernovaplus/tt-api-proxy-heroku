const servers_list = require("../public/servers_list.json");

const cache = {
    positions_cache: {},
    status_cache: {},
    skillboost_cache: {
        fetching: false,
        timestamp: 0,
        data: null
    },
    vehicles_cache: {
        fetching: false,
        timestamp: 0,
        sorted_vehicles: null,
        sorted_classes: null
    },
    ip_log_cache: {},
    charges: 5,
    set_charges: (num) => this.charges = num,
    get_charges: () => this.charges,
    // last_working_server: null
};

cache.get_charges.bind(cache);
cache.set_charges.bind(cache);

for (const server_endpoint in servers_list) {
    cache.positions_cache[server_endpoint] = {
        endpoint: server_endpoint,
        name: servers_list[server_endpoint],
        data: null,
        timestamp: 0,
        fetching: false
    }

    cache.status_cache[server_endpoint] = {
        endpoint: server_endpoint,
        name: servers_list[server_endpoint],
        data: null,
        timestamp: 0,
        fetching: false,
    }
};
// cache.last_working_server = Object.values(cache.positions)[0];
module.exports = cache;
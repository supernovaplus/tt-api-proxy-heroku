const { vehicles_cache, positions_cache } = require("./cache");
const fetch_position = require("./fetch_position");

module.exports = fetch_vehicles = () => {
    vehicles_cache.fetching = true;

    return new Promise(async resolve => {
        const temp_vehicles = {};
        const temp_classes = {};
        const temp_object = {
            timestamp: Date.now(),
            sorted_vehicles: [],
            sorted_classes: []
        };
        const servers_list = Object.values(positions_cache) || [];

        await Promise.all(
            servers_list.map(server => 
                server.timestamp < Date.now() - 300000 ? 
                    fetch_position(server) : undefined ))

        servers_list.forEach(server => {
            (server?.data?.players || []).forEach(player => {
                // vehicle_name : players[i][4].vehicle_name
                // vehicle_label: players[i][4].vehicle_label,
                // vehicle_class: players[i][4].vehicle_class,
                // vehicle_model: vehicle_model,
                // vehicle_spawn: players[i][4].vehicle_spawn,
                // vehicle_type: players[i][4].vehicle_type,

                const { vehicle_model = -1, vehicle_class, vehicle_name = "None" } = player[4];

                //models
                if(!(vehicle_model in temp_vehicles)){
                    temp_vehicles[vehicle_model] = [(vehicle_name === "None" ? "None, On Foot" : vehicle_name), 1];
                }else{
                    temp_vehicles[vehicle_model][1]++;
                }

                //classes
                if(!(vehicle_class in temp_classes)){
                    temp_classes[vehicle_class] = 1;
                }else{
                    temp_classes[vehicle_class]++;
                }
            });
        });

        if(temp_vehicles){
            temp_object.sorted_vehicles = Object.values(temp_vehicles).sort((a,b) => b[1] - a[1])
            temp_object.sorted_classes = Object.entries(temp_classes).sort((a,b) => b[1] - a[1]).map(v=>[parseInt(v[0]), v[1]]);
        }

        Object.assign(vehicles_cache, temp_object);
        vehicles_cache.fetching = false;
        resolve();
    })

};

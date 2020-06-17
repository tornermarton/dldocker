/**
 * MIDDLEWARE
 * Send infos to init view
 */

const si = require('systeminformation');
const { exec } = require("child_process");

module.exports = function (objectRepository) {
    return function (req, res, next) {
        let valueObject = {
            cpu: "*",
            mem: "*",
            graphics: "controllers"
        };

        si.get(valueObject)
            .then(data => {
                let nvidia_data = [];

                const nvidia_stats = exec("nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory --format=csv,noheader,nounits");

                nvidia_stats.stdout.on("data", result_str => {
                    result_str.split('\n').forEach(e => {
                        if (e !== "") {
				e = e.split(', ')
				nvidia_data[nvidia_data.length] = {
                            		"name": e[0],
                            		"temperature": e[1],
                            		"utilization_gpu": e[2],
                            		"utilization_memory": e[3]
				}
                        }
                    });
                });

                nvidia_stats.on("close", code => {
                    data["gpus"] = nvidia_data;

                    res.tpl.monitoring = data;
                    return next();
                });
            })
            .catch(error => console.error(error));
    }
};

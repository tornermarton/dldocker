/**
 * MIDDLEWARE
 * Send system statistics via SSE periodically
 */

const si = require('systeminformation');
const { exec } = require("child_process");

module.exports = function (objectRepository) {
    return function (req, res) {
        let interval = setInterval(() => {
            let valueObject = {
                currentLoad: "cpus",
                mem: "*",
            };

            si.get(valueObject)
                .then(si_data => {
                    let nvidia_data = [];

                    const nvidia_stats = exec("nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory --format=csv,noheader,nounits");

                    nvidia_stats.stdout.on("data", result_str => {
                        result_str.split('\n').forEach(e => {
                            if (e !== "") {
				e = e.split(", ");
				nvidia_data[nvidia_data.length] = {
                                	"name": e[0],
                                	"temperature": e[1],
                                	"utilization_gpu": e[2],
                                	"utilization_memory": e[3]
				}
				console.log(nvidia_data);
			    }
                        });
                    });

                    // nvidia_stats.stderr.on("data", data => {
                    //     console.log(`stderr: ${data}`);
                    // });
                    //
                    // nvidia_stats.on('error', (error) => {
                    //     console.log(`error: ${error.message}`);
                    // });

                    nvidia_stats.on("close", code => {
                        si_data["gpus"] = nvidia_data;

                        res.sse("data: " + JSON.stringify(si_data) + "\n\n");
                    });

                })
                .catch(error => console.error(error));
        }, 1000);

        res.on('close', () => {
            console.log('client dropped me');
            clearInterval(interval);
            res.end();
        });
    }
};

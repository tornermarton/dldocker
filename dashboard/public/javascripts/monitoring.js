const es = new EventSource('/monitoring/stream');

es.onmessage = function (event) {
    const data = JSON.parse(event.data);

    for (let i = 0; i < data.currentLoad.cpus.length; ++i) {
        const load = data.currentLoad.cpus[i].load.toFixed(2);
        $("#cpu-" + i + "-progressbar").css("width", load + "%");
        $("#cpu-" + i + "-progress").text(load + " %");
    }

    let mem_total = (data.mem.total/1024/1024/1024).toFixed(2);
    let mem_used = (data.mem.used/1024/1024/1024).toFixed(2);
    let mem_free = (data.mem.free/1024/1024/1024).toFixed(2);
    let mem_percent = (mem_used/mem_total*100).toFixed(2);

    $("#mem-total").text(mem_total);
    $("#mem-used").text(mem_used);
    $("#mem-free").text(mem_free);
    $("#mem-progressbar").css("width", mem_percent + "%").text(mem_percent + " %");

    if ("gpus" in data) {
        for (let i = 0; i < data.gpus.length; ++i) {
	    const util_gpu = data.gpus[i].utilization_gpu;
            const util_mem = data.gpus[i].utilization_memory;
            $("#gpu-" + i + "-load-progressbar").css("width", util_gpu + "%").text(util_gpu + " %");
            $("#gpu-" + i + "-vram-progressbar").css("width", util_mem + "%").text(util_mem + " %");
        }
    }
};

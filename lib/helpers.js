exports.sleep = async function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

exports.deviceAutoComplete = async function (ctx, query, type = 'light_temperature') {
    let devices = Object.values(await ctx._api.devices.getDevices());
    devices = devices.filter((c) => c.class === 'light' || (c.virtualClass === 'light') && c.capabilitiesObj && c.capabilitiesObj[type]);

    devices = devices.sort((a, b) => (a.order > b.order ? 1 : -1)).map((z) => ({ id: z.id, name: z.name }));

    return devices.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
};

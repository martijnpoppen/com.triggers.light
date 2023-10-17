const { deviceAutoComplete } = require('../helpers');

exports.init = async function (ctx) {
    ctx.homey.app.trigger_DEVICE_TEMP = ctx.homey.flow
        .getTriggerCard(`trigger_DEVICE_TEMP`)
        .registerArgumentAutocompleteListener('device', async (query) => deviceAutoComplete(ctx, query, 'light_temperature'))
        .registerRunListener(async (args, state) => args.device.id === state.device);

    ctx.homey.app.trigger_DEVICE_HUE = ctx.homey.flow
        .getTriggerCard(`trigger_DEVICE_HUE`)
        .registerArgumentAutocompleteListener('device', async (query) => deviceAutoComplete(ctx, query, 'light_hue'))
        .registerRunListener(async (args, state) => args.device.id === state.device);

    ctx.homey.app.trigger_DEVICE_SATURATION = ctx.homey.flow
        .getTriggerCard(`trigger_DEVICE_SATURATION`)
        .registerArgumentAutocompleteListener('device', async (query) => deviceAutoComplete(ctx, query, 'light_saturation'))
        .registerRunListener(async (args, state) => args.device.id === state.device);
};

const { deviceAutoComplete } = require('../helpers');

exports.init = async function (ctx) {
    try {
        ctx.homey.app.action_DEVICE_ANY = ctx.homey.flow
            .getActionCard('action_DEVICE_ANY')
            .registerArgumentAutocompleteListener('device', async (query) => deviceAutoComplete(ctx, query, 'onoff'))
            .registerRunListener(async (args, state) => {
                const device = ctx.homey.app.DEVICES.find((d) => d.id === args.device.id);
                let value = state.value;

                if (state.capability === 'onoff') {
                    value = Boolean(value);
                }

                if(!state || Object.keys(state).length === 0) { throw new Error('Can only run with a Light Triggers Then card in front'); }
                ctx.homey.app.log(`[action_DEVICE_ANY] TO - ${args.device.name}' | FROM - ${state.device.name}, ${state.capability}, ${value}`);

                return await device.setCapabilityValue(state.capability, value).catch(e => homey.app.error(`[action_DEVICE_ANY]`, e));
            });
    } catch (error) {
        ctx.homey.app.error(`[actions]`, error);
    }
};

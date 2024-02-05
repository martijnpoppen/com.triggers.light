'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('homey-api');

const flowTriggers = require('./lib/flows/triggers');
const flowActions = require('./lib/flows/actions');

class App extends Homey.App {
    log() {
        console.log.bind(this, '[log]').apply(this, arguments);
    }

    error() {
        console.error.bind(this, '[error]').apply(this, arguments);
    }

    // -------------------- INIT ----------------------

    async onInit() {
        this.log(`${this.homey.manifest.id} - ${this.homey.manifest.version} started...`);

        this._api = await HomeyAPI.createAppAPI({
            homey: this.homey,
            debug: false
        });

        this.DEVICES = Object.values(await this._api.devices.getDevices());
        this.ONOFF_DEVICES = [];

        await flowTriggers.init(this);
        await flowActions.init(this);
        await this.setDeviceListeners();
    }

    // -------------------- FUNCTIONS ----------------------

    async setDeviceListeners() {
        this.error(`[Device][setDeviceListeners]`, 'Setting device listeners');

        for (const device of this.DEVICES) {
            try {
                if (device.class === 'light' || (device.virtualClass === 'light' && device.capabilitiesObj)) {
                    if (device.capabilitiesObj && device.capabilitiesObj.light_temperature) {
                        device.makeCapabilityInstance('light_temperature', (value) => {
                            this.triggerFlow(device, 'light_temperature', value, 'DEVICE_TEMP');
                        });
                    }

                    if (device.capabilitiesObj && device.capabilitiesObj.light_saturation) {
                        device.makeCapabilityInstance('light_saturation', (value) => {
                            this.triggerFlow(device, 'light_saturation', value, 'DEVICE_SATURATION');
                        });
                    }

                    if (device.capabilitiesObj && device.capabilitiesObj.light_hue) {
                        device.makeCapabilityInstance('light_hue', (value) => {
                            this.triggerFlow(device, 'light_hue', value, 'DEVICE_HUE');
                        });
                    }

                    if (device.capabilitiesObj && device.capabilitiesObj.onoff) {
                        device.makeCapabilityInstance('onoff', (value) => {
                            this.triggerFlow(device, 'onoff', value);
                        });
                    }

                    if (device.capabilitiesObj && device.capabilitiesObj.dim) {
                        device.makeCapabilityInstance('dim', (value) => {
                            this.triggerFlow(device, 'dim', value);
                        });
                    }
                }
            } catch (error) {
                this.error(`[Device][setDeviceListeners]`, error);
            }
        }
    }

    triggerFlow(device, capability, value, flowName = null) {
        this.log(`[Device][triggerFlow]`, device.name, capability, value);

        if (flowName) {
            this.homey.app.trigger_[flowName]
                .trigger({ name: device.name, id: device.id, value: value, capability }, { name: device.name, id: device.id, value: value, device: device, capability })
                .catch((err) => this.error(`[Device][trigger_${flowName}]`, err))
                .then(this.log(`[trigger_DEVICE_HUE] - Triggered - ${device.name} - ${value}`));
        }

        if(capability === 'onoff') {
            value = Number(value);
        }

        this.homey.app.trigger_DEVICE_ANY
            .trigger({ name: device.name, id: device.id, value: value, capability }, { name: device.name, id: device.id, value: value, device: device, capability })
            .catch((err) => this.error(`[Device][trigger_DEVICE_ANY]`, err))
            .then(this.log(`[trigger_DEVICE_ANY] - Triggered - ${device.name} - ${value}`));
    }
}

module.exports = App;

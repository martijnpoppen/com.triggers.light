'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('homey-api');

const flowTriggers = require('./lib/flows/triggers');

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

        await flowTriggers.init(this);
        await this.setCheckZoneOnOffInterval();
    }

    // -------------------- FUNCTIONS ----------------------

    async setCheckZoneOnOffInterval() {
        const devices = Object.values(await this._api.devices.getDevices());

        for (const device of devices) {
            if (device.class === 'light' || (device.virtualClass === 'light' && device.capabilitiesObj)) {
                if (device.capabilitiesObj.light_temperature) {
                    device.makeCapabilityInstance('light_temperature', (value) => {
                        this.homey.app.trigger_DEVICE_TEMP
                            .trigger({ name: device.name, id: device.id, value: value }, { device: device.id })
                            .catch(err => this.error(`[Device][trigger_DEVICE_TEMP]`, err))
                            .then(this.log(`[trigger_DEVICE_TEMP] - Triggered - ${device.name} - ${value}`));
                    });
                }

                if (device.capabilitiesObj.light_saturation) {
                    device.makeCapabilityInstance('light_saturation', (value) => {
                        this.homey.app.trigger_DEVICE_SATURATION
                            .trigger({ name: device.name, id: device.id, value: value }, { device: device.id })
                            .catch(err => this.error(`[Device][trigger_DEVICE_SATURATION]`, err))
                            .then(this.log(`[trigger_DEVICE_SATURATION] - Triggered - ${device.name} - ${value}`));
                    });
                }

                if (device.capabilitiesObj.light_hue) {
                    device.makeCapabilityInstance('light_hue', (value) => {
                        this.homey.app.trigger_DEVICE_HUE
                            .trigger({ name: device.name, id: device.id, value: value }, { device: device.id })
                            .catch(err => this.error(`[Device][trigger_DEVICE_HUE]`, err))
                            .then(this.log(`[trigger_DEVICE_HUE] - Triggered - ${device.name} - ${value}`));
                    });
                }
            }
        }
    }
}

module.exports = App;

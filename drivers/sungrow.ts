import Homey, { Device } from 'homey';

export interface Measurement {
    value: string;
    scale: string;
    label: string;
}

export class Sungrow extends Homey.Device {

    inputRegisters: Object = {


        "totaldcpower":   [5016,  2, 'UINT32', "Total DC power", 0],
        "battery_power":  [13021, 1, 'UINT16', "battery_power",0],


        "loadpower":               [13007, 2, 'INT32', "Load power", 0],
        "exportpower":             [13009, 2, 'INT32', "Export power", 0],

        "outputPower":              [5002, 1, 'UINT16', "Daily Output Energy pv + batt discharge", 0],
        "active_power_limit":       [5000, 1, 'UINT16', "Nominal active power", -1],    

        "pvTodayEnergy":            [13001, 1, 'UINT16', "Daily PV Generation", -1],

        // "TotalOutputEnergy":        [5003, 2, 'UINT32', "Total Output Energy pv & battery discharge", 0],
        "pvTotalEnergy":            [13002, 2, 'UINT32', "Total PV Generation", 0],

        "temperature":              [5007, 1, 'INT16', "temperature",-1],

        "battsoc":                  [13022, 1, 'UINT16', "battery_level",0],
        "bmshealth":                [13023, 1, 'UINT16', "battery_state_of_health",0],
        "batttemperature":          [13024, 1, 'INT16', "battery_temperature",-1],

        "today_battery_output_energy":  [13025, 1, 'UINT16', "Daily battery discharge energy",-1],
        "total_battery_output_energy":  [13026, 2, 'UINT32', "Total battery discharge energy",-1],
        "today_battery_input_energy":   [13039, 1, 'UINT16', "Daily battery charge energy",-1],
        "total_battery_input_energy":   [13040, 2, 'UINT32', "Total battery charge energy",-1],

        "today_grid_import":  [13035, 1, 'UINT16', "Daily import energy",-1],
        "today_grid_export":  [13036, 2, 'UINT32', "Total import energy",-1],

        "total_grid_import":  [13044, 1, 'UINT16', "Daily export energy",-1],
        "total_grid_export":  [13045, 2, 'UINT32', "Total export energy",-1],

    };


    holdingRegistersBattery: Object = {





    };   


    processResult(result: Record<string, Measurement>) {
        if (result) {

            // result
            for (let k in result) {
                console.log(k, result[k].value, result[k].scale, result[k].label)
            }

            if (result['totaldcpower'] && result['totaldcpower'].value != 'xxx') {
                this.addCapability('measure_power');
                var dcPower = Number(result['totaldcpower'].value) * (Math.pow(10, Number(result['totaldcpower'].scale)));
                this.setCapabilityValue('measure_power', Math.round(dcPower));
            }

            if (result['battery_power'] && result['battery_power'].value != 'xxx') {
                this.addCapability('measure_power.battery');
                var dcPower = Number(result['battery_power'].value) * (Math.pow(10, Number(result['battery_power'].scale)));
                this.setCapabilityValue('measure_power.battery', Math.round(dcPower));
            }

            if (result['active_power_limit'] && result['active_power_limit'].value != 'xxx') {
                this.addCapability('activepowerlimit');
                var power_limit = Number(result['active_power_limit'].value);
                this.setCapabilityValue('activepowerlimit', power_limit);
            }

            if (result['pvTodayEnergy'] && result['pvTodayEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pvTodayEnergy');
                var pvTodayEnergy = Number(result['pvTodayEnergy'].value) * (Math.pow(10, Number(result['pvTodayEnergy'].scale)));
                this.setCapabilityValue('meter_power.daily', pvTodayEnergy);
            }

            if (result['pvTotalEnergy'] && result['pvTotalEnergy'].value != 'xxx') {
                this.addCapability('meter_power.pvTotalEnergy');
                var pvTotalEnergy = Number(result['pvTotalEnergy'].value) * (Math.pow(10, Number(result['pvTotalEnergy'].scale)));
                this.setCapabilityValue('meter_power', pvTotalEnergy);
            }

            if (result['temperature'] && result['temperature'].value != 'xxx') {
                this.addCapability('measure_temperature.invertor');
                var temperature = Number(result['temperature'].value) * (Math.pow(10, Number(result['temperature'].scale)));
                this.setCapabilityValue('measure_temperature.invertor', temperature);
            }

            if (result['batttemperature'] && result['batttemperature'].value != 'xxx' && this.hasCapability('measure_temperature.battery')) {
                this.addCapability('measure_temperature.battery');
                var temperature = Number(result['batttemperature'].value) * (Math.pow(10, Number(result['batttemperature'].scale)));
                this.setCapabilityValue('measure_temperature.battery', temperature);
            }

            if (result['battsoc'] && result['battsoc'].value != 'xxx' && this.hasCapability('measure_battery')) {
                this.addCapability('battery');
                this.addCapability('measure_battery');
                var soc = Number(result['battsoc'].value) * (Math.pow(10, Number(result['battsoc'].scale)));
                this.setCapabilityValue('battery', soc);
                this.setCapabilityValue('measure_battery', soc);
            }

            if (result['bmshealth'] && result['bmshealth'].value != 'xxx' && this.hasCapability('batterysoh')) {
                this.addCapability('batterysoh');
                var soh = Number(result['bmshealth'].value) * (Math.pow(10, Number(result['bmshealth'].scale)));
                this.setCapabilityValue('batterysoh', soh);
            }

            if (result['loadpower'] && result['loadpower'].value != 'xxx' && this.hasCapability('measure_power.load')) {
                this.addCapability('measure_power.load');
                var soc = Number(result['loadpower'].value) * (Math.pow(10, Number(result['loadpower'].scale)));
                this.setCapabilityValue('measure_power.load', soc);
            }

            if (result['exportpower'] && result['exportpower'].value != 'xxx' && this.hasCapability('measure_power.grid_import')) {
                this.addCapability('measure_power.grid_import');
                this.addCapability('measure_power.grid_export');

                var exportpower = Number(result['exportpower'].value) * (Math.pow(10, Number(result['exportpower'].scale)));
                if ( exportpower >= 0 ) {
                    this.setCapabilityValue('measure_power.grid_export', exportpower);
                    this.setCapabilityValue('measure_power.grid_import', 0);
                } else {
                    this.setCapabilityValue('measure_power.grid_export', 0);
                    this.setCapabilityValue('measure_power.grid_import', exportpower); 
                }
            }

            if (result['total_battery_output_energy'] && result['total_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_output')) {
                this.addCapability('meter_power.battery_output');
                var total_battery_output_energy = Number(result['total_battery_output_energy'].value) * (Math.pow(10, Number(result['total_battery_output_energy'].scale)));
                this.setCapabilityValue('meter_power.battery_output', total_battery_output_energy);
            }

            if (result['today_battery_output_energy'] && result['today_battery_output_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_output')) {
                this.addCapability('meter_power.today_batt_output');
                var today_battery_output_energy = Number(result['today_battery_output_energy'].value) * (Math.pow(10, Number(result['today_battery_output_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_output', today_battery_output_energy);
            }

            if (result['total_battery_input_energy'] && result['total_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.battery_input')) {
                this.addCapability('meter_power.battery_input');
                var total_battery_input_energy = Number(result['total_battery_input_energy'].value) * (Math.pow(10, Number(result['total_battery_input_energy'].scale)));
                this.setCapabilityValue('meter_power.battery_input', total_battery_input_energy);
            }

            if (result['today_battery_input_energy'] && result['today_battery_input_energy'].value != 'xxx' && this.hasCapability('meter_power.today_batt_input')) {
                this.addCapability('meter_power.today_batt_input');
                var today_battery_input_energy = Number(result['today_battery_input_energy'].value) * (Math.pow(10, Number(result['today_battery_input_energy'].scale)));
                this.setCapabilityValue('meter_power.today_batt_input', today_battery_input_energy);
            }            

            if (result['today_grid_import'] && result['today_grid_import'].value != 'xxx' && this.hasCapability('meter_power.today_grid_import')) {
                this.addCapability('meter_power.today_grid_import');
                var today_grid_import = Number(result['today_grid_import'].value) * (Math.pow(10, Number(result['today_grid_import'].scale)));
                this.setCapabilityValue('meter_power.today_grid_import', today_grid_import);
            }

            if (result['today_grid_export'] && result['today_grid_export'].value != 'xxx' && this.hasCapability('meter_power.today_grid_export')) {
                this.addCapability('meter_power.today_grid_export');
                var today_grid_export = Number(result['today_grid_export'].value) * (Math.pow(10, Number(result['today_grid_export'].scale)));
                this.setCapabilityValue('meter_power.today_grid_export', today_grid_export);
            }

            if (result['total_grid_import'] && result['total_grid_import'].value != 'xxx' && this.hasCapability('meter_power.grid_import')) {
                this.addCapability('meter_power.grid_import');
                var total_grid_import = Number(result['total_grid_import'].value) * (Math.pow(10, Number(result['total_grid_import'].scale)));
                this.setCapabilityValue('meter_power.grid_import', total_grid_import);
            }

            if (result['total_grid_export'] && result['total_grid_export'].value != 'xxx' && this.hasCapability('meter_power.grid_export')) {
                this.addCapability('meter_power.grid_export');
                var total_grid_export = Number(result['total_grid_export'].value) * (Math.pow(10, Number(result['total_grid_export'].scale)));
                this.setCapabilityValue('meter_power.grid_export', total_grid_export);
            }            


        }
    }
}

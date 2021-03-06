import {API} from "homebridge";
import {ACCESSORY_NAME} from "./settings";
import {LgAirCoolerAccessory} from "./lg-airco-accessory";

export = (api: API) => {
    api.registerAccessory('homebridge-lg-airco', ACCESSORY_NAME, LgAirCoolerAccessory);
}

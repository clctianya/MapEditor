/*
 * @Author: Justin
 * @Date: 2021-01-12 14:10:24
 * @LastEditTime: 2021-01-12 17:32:17
 * @Description: 第三方库，由 onfire.js 改为 ts 文件
 */

class onfire {
    private __onfireEvents = {};
    private __cnt = 0; // evnet counter
    private string_str = 'string';
    private function_str = 'function';

    private static _instance: onfire = null;

    public static getInstance(): onfire {
        if (onfire._instance == null) {
            onfire._instance = new onfire();
        }
        return onfire._instance;
    }

    public getEvents() {
        console.log("xxxx", JSON.stringify(Object.keys(this.__onfireEvents)));
    }

    private _bind(eventName, callback, is_one, context) {
        if (typeof eventName !== this.string_str || typeof callback !== this.function_str) {
            throw new Error('args: ' + this.string_str + ', ' + this.function_str + '');
        }
        // if (!this.hasOwnKey(this.__onfireEvents, eventName)) {
        if (!this.__onfireEvents.hasOwnProperty(eventName)) {
            this.__onfireEvents[eventName] = {};
        }
        this.__onfireEvents[eventName][++this.__cnt] = [callback, is_one, context];

        return [eventName, this.__cnt];
    }

    private _each(obj, callback) {
        for (var key in obj) {
            // if (this.hasOwnKey(obj, key)) callback(key, obj[key]);
            if (obj.hasOwnProperty(key)) callback(key, obj[key]);
        }
    }
    /**
     *  onfire.on( event, func, context ) -> Object
     *  - event (String): The event name to subscribe / bind to
     *  - func (Function): The function to call when a new event is published / triggered
     *  Bind / subscribe the event name, and the callback function when event is triggered, will return an event Object
    **/
    public on(eventName, callback, context) {
        return this._bind(eventName, callback, 0, context);
    }

    /**
     *  onfire.one( event, func, context ) -> Object
     *  - event (String): The event name to subscribe / bind to
     *  - func (Function): The function to call when a new event is published / triggered
     *  Bind / subscribe the event name, and the callback function when event is triggered only once(can be triggered for one time), will return an event Object
    **/
    private one(eventName, callback, context) {
        return this._bind(eventName, callback, 1, context);
    }
    private _fire_func(eventName, args) {
        // if (this.hasOwnKey(this.__onfireEvents, eventName)) {
        if (this.__onfireEvents.hasOwnProperty(eventName)) {
            this._each(this.__onfireEvents[eventName], function (key, item) {
                item[0].apply(item[2], args); // do the function
                if (item[1]) delete this.__onfireEvents[eventName][key]; // when is one, delete it after triggle
            });
        }
    }
    /**
     *  onfire.fire( event[, data1 [,data2] ... ] )
     *  - event (String): The event name to publish
     *  - data...: The data to pass to subscribers / callbacks
     *  Async Publishes / fires the the event, passing the data to it's subscribers / callbacks
    **/
    public fire(eventName, ...params: any[]) {
        // fire events
        // var args = this.slice(params, 1);
        var args = params.slice(0);
        // var arg1 = params.slice(0);
        // console.log("args=", args, typeof (args), arg1, typeof (arg1));
        // setTimeout(function () {
        this._fire_func(eventName, args);
        // });
    }
    /**
     *  onfire.fireSync( event[, data1 [,data2] ... ] )
     *  - event (String): The event name to publish
     *  - data...: The data to pass to subscribers / callbacks
     *  Sync Publishes / fires the the event, passing the data to it's subscribers / callbacks
    **/
    private fireSync(eventName, ...params: any[]) {
        // this._fire_func(eventName, this.slice(arguments, 1));
        this._fire_func(eventName, params.slice(1));
    }
    /**
     * onfire.un( event ) -> Boolean
     *  - event (String / Object): The message to publish
     * When passed a event Object, removes a specific subscription.
     * When passed event name String, removes all subscriptions for that event name(hierarchy)
    *
    * Unsubscribe / unbind an event or event object.
    *
    * Examples
    *
    *  // Example 1 - unsubscribing with a event object
    *  var event_object = onfire.on('my_event', myFunc);
    *  onfire.un(event_object);
    *
    *  // Example 2 - unsubscribing with a event name string
    *  onfire.un('my_event');
    **/
    private un(event) {
        var eventName, key, r = false, type = typeof event;
        if (type === this.string_str) {
            // cancel the event name if exist
            // if (this.hasOwnKey(this.__onfireEvents, event)) {
            if (this.__onfireEvents.hasOwnProperty(event)) {
                delete this.__onfireEvents[event];
                return true;
            }
            return false;
        }
        else if (type === 'object') {
            eventName = event[0];
            key = event[1];
            // if (this.hasOwnKey(this.__onfireEvents, eventName) && this.hasOwnKey(this.__onfireEvents[eventName], key)) {
            if (this.__onfireEvents.hasOwnProperty(eventName) && this.__onfireEvents[eventName].hasOwnProperty(key)) {
                delete this.__onfireEvents[eventName][key];
                return true;
            }
            // can not find this event, return false
            return false;
        }
        else if (type === this.function_str) {
            this._each(this.__onfireEvents, function (key_1, item_1) {
                this._each(item_1, function (key_2, item_2) {
                    if (item_2[0] === event) {
                        delete this.__onfireEvents[key_1][key_2];
                        r = true;
                    }
                });
            });
            return r;
        }
        return true;
    }
    /**
     *  onfire.clear()
     *  Clears all subscriptions
    **/
    private clear() {
        this.__onfireEvents = {};
    }
}

const OnFire = onfire.getInstance();
export default OnFire;
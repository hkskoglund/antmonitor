﻿/* global define: true */

// Main viewmodel class
define(['logger', 'profiles/Page', 'vm/genericVM', 'profiles/spdcad/deviceProfile_SPDCAD'], function (Logger, GenericPage, GenericVM, deviceProfileSPDCAD) {
    'use strict';

    function SPDCADVM(configuration) {

        GenericVM.call(this, configuration);

        this._page = undefined;

        this.sensorId = ko.observable();

        this.number = ko.observable();

        this.timestamp = ko.observable();

        this.formattedTimestamp = ko.computed({

            read: function () {
                if (this.timestamp && this.timestamp())
                    return (new Date(this.timestamp())).toLocaleTimeString();
            }.bind(this)
        });

        //this.distance = ko.observable();

        this.speed = ko.observable();

        // Access via prototype object, deviceProfileSPDCAD reference to the constructor function. not to an instance so its deviceProfileSPDCAD.WHEEL_CIRCUMFERENCE will return undefined
        this.wheelCircumference = ko.observable(deviceProfileSPDCAD.prototype.WHEEL_CIRCUMFERENCE); // meters

        this.cadence = ko.observable();

        this.formattedCadence = ko.computed({

            read: function () {
                if (this.cadence() !== undefined)
                    return Math.round(this.cadence());
                else
                    return '--.-';

            }.bind(this)
        });

      
        // Additional properties based on pages

        this.cumulativeDistance = ko.observable(0);

        // Distance mode metric/mile
        this.distanceMode = ko.observable(SPDCADVM.prototype.DISTANCE_MODE.METRIC);

        this.formattedCumulativeDistance = ko.computed({

            read: function () {

                var distStr = '-.--';

                if (this.cumulativeDistance() !== undefined) {

                    switch (this.distanceMode()) {

                        case SPDCADVM.prototype.DISTANCE_MODE.MILE_INTERNATIONAL:

                            if (this.cumulativeDistance() > SPDCADVM.prototype.CONVERSION_FACTOR.INTERNATIONAL)
                                distStr = (this.cumulativeDistance() / SPDCADVM.prototype.CONVERSION_FACTOR.INTERNATIONAL).toFixed(2);
                            else
                                distStr = (this.cumulativeDistance() / SPDCADVM.prototype.CONVERSION_FACTOR.INTERNATIONAL).toFixed(3);

                            break;

                        default:

                            if (this.cumulativeDistance() < 1000)
                                distStr = (this.cumulativeDistance() / 1000).toFixed(3);
                            else
                                distStr = (this.cumulativeDistance() / 1000).toFixed(2);
                            break;
                    }
                }

                return distStr;

            }.bind(this)
        });

        this.speedMode = ko.observable(SPDCADVM.prototype.SPEED_MODE.SPEED);

        this.formattedSpeed = ko.computed({

            read: function () {

                var speedStr = '--.-',
                    speed = this.speed();

                if (speed !== undefined) {

                    switch (this.speedMode()) {

                        //case SPDCADVM.prototype.SPEED_MODE.TEMPO:

                        //    break;

                        

                        default:

                            speedStr = this.speed().toFixed(1);
                            break;
                    }
                }

                return speedStr;

            }.bind(this)
        });



    }

    SPDCADVM.prototype = Object.create(GenericVM.prototype);
    SPDCADVM.prototype.constructor = SPDCADVM;

    SPDCADVM.prototype.SPEED_MODE = {
        TEMPO: 1, // min/km, min/mi
        SPEED: 2 // km/h, mi/h
    };

    SPDCADVM.prototype.DISTANCE_MODE = {
        METRIC: 1,
        MILE_INTERNATIONAL: 2

    };

    SPDCADVM.prototype.CONVERSION_FACTOR = {
        INTERNATIONAL: 1609.344,
      //  US: 1609.347219
    }


    SPDCADVM.prototype.updateFromPage = function (page) {

        // For debugging, i.e inspect broadcast data
        this._page = page;

        // Update view model

        if (page.broadcast && page.broadcast.channelId)
            this.sensorId(page.broadcast.channelId.sensorId);

        if (page.number !== undefined)
            this.number(page.number);

        if (page.timestamp)
            this.timestamp(page.timestamp);

        if (page.unCalibratedSpeed !== undefined) {
            if (this.distanceMode() === 1) // km/h
                this.speed(3.6 * this.wheelCircumference() * page.unCalibratedSpeed);
            else if (this.distanceMode() ===2) // mph
                this.speed(2.2369362920544 * this.wheelCircumference() * page.unCalibratedSpeed)
        }

        if (page.cadence !== undefined)
            this.cadence(page.cadence);

        // Distance

        if (page.relativeCumulativeSpeedRevolutionCount !== undefined)
        {
            // this.cumulativeDistance(this.cumulativeDistance() + this.wheelCircumference() * page.relativeCumulativeSpeedRevolutionCount);
            // Update based on timer state === started
            this.emit('newRelativeDistance', this.cumulativeDistance, this.wheelCircumference() * page.relativeCumulativeSpeedRevolutionCount);
        }

        //if (page.profile.hasCommonPages)
        //    this.updateCommonPage(page);


    };

    SPDCADVM.prototype.getTemplateName = function (item) {
        // return undefined;
        return "spdcad-template";
    };

    SPDCADVM.prototype.reset = function () {
        this.sensorId(undefined);
        this.number(undefined);
        this.timestamp(undefined);
        this.speed(undefined);
        this.cadence(undefined);
        this.cumulativeDistance(0);

    }

   return SPDCADVM;
   
});

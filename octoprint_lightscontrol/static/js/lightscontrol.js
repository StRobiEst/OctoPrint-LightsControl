$(function() {
    function LightsControlViewModel(parameters) {
        var self = this;

        self.settingsViewModel = parameters[0]
        self.loginState = parameters[1];
        self.settings = undefined;
        self.hasGPIO = ko.observable(undefined);
        self.isLightsOn = ko.observable(undefined);
        self.lights_indicator = $("#lightscontrol_indicator");

        self.onBeforeBinding = function() {
            self.settings = self.settingsViewModel.settings;
        };

        self.onStartup = function () {
            self.isLightsOn.subscribe(function() {
                if (self.isLightsOn()) {
                    self.lights_indicator.removeClass("off").addClass("on");
                } else {
                    self.lights_indicator.removeClass("on").addClass("off");
                }   
            });
            
            $.ajax({
                url: API_BASEURL + "plugin/lightscontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "getLightsState"
                }),
                contentType: "application/json; charset=UTF-8"
            }).done(function(data) {
                self.isLightsOn(data.isLightsOn);
            });
        }

        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != "lightscontrol") {
                return;
            }

            self.hasGPIO(data.hasGPIO);
            self.isLightsOn(data.isLightsOn);
        };

        self.toggleLights = function() {
            if (self.isLightsOn()) {
                if (self.settings.plugins.lightscontrol.enablePowerOffWarningDialog()) {
                    showConfirmationDialog({
                        message: "You are about to turn off the Lights.",
                        onproceed: function() {
                            self.turnLightsOff();
                        }
                    });
                } else {
                    self.turnLightsOff();
                }
            } else {
                self.turnLightsOn();
            }
        };

        self.turnLightsOn = function() {
            $.ajax({
                url: API_BASEURL + "plugin/lightscontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnLightsOn"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };

    	self.turnLightsOff = function() {
            $.ajax({
                url: API_BASEURL + "plugin/lightscontrol",
                type: "POST",
                dataType: "json",
                data: JSON.stringify({
                    command: "turnLightsOff"
                }),
                contentType: "application/json; charset=UTF-8"
            })
        };   
    }

    ADDITIONAL_VIEWMODELS.push([
        LightsControlViewModel,
        ["settingsViewModel", "loginStateViewModel"],
        ["#navbar_plugin_lightscontrol", "#settings_plugin_lightscontrol"]
    ]);
});

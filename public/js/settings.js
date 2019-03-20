/**
 * @type {PluginController}
 */
let pluginController = ClientManager.getOrCreateClientManager(window, t, PLUGIN_CONFIGURATION).init().getPluginController();

t.render(function () {

    return pluginController.getPluginConfiguration()
        .then(function (data) {
            let moduleSettingsController = ModuleSettingsController.create(t, pluginController, t.arg("module"), t.arg("editable"), document);

            return moduleSettingsController.render.call(moduleSettingsController, data)
                .then(function() {
                    return t.sizeTo("#content").done();
                });
        });
});
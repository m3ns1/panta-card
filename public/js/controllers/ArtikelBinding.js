/**
 * This artikel binding class binds an artikel with the view/layout
 */
class ArtikelBinding extends Binding {

    /**
     * Get the german name for that region
     * @param region
     * @returns {*}
     */
    static getRegionMapping(region) {
        switch (region) {
            case "nord":
            case "north":
                return "Nord";
            case "south":
                return "Süd";
            default:
                return region;
        }
    }

    /**
     * Get the german name for that 'tag' (day)
     * @param tag
     * @returns {*}
     */
    static getTagMapping(tag) {
        return tag;
    }

    constructor(document, entity, action, context, configuration) {
        super(document, entity, action, context, configuration);
    }


    /**
     * This is called when a property has changed and thus the form needs an update. All fields of the panta.Artikel are updated
     * @param artikel
     * @param configuration
     * @returns {ArtikelBinding}
     */
    update(artikel, configuration) {
        // first update the properties with the entity
        this._topic.update(artikel);
        this._from.update(artikel);
        this._author.update(artikel);
        this._text.update(artikel);
        this._pagina.update(artikel);
        this._layout.update(artikel);
        this._total.update(artikel);
        this._tags.update(artikel);
        this._visual.update(artikel);
        this._region.update(artikel);
        this._season.update(artikel);
        this._form.update(artikel);
        this._location.update(artikel);

        // if there's a configuration change apply it after all property updates
        if (configuration) {
            this.updateConfiguration(configuration);
        }
        return this;
    }

    /**
     * Do the binding resp. render the panta.Artikel
     * @returns {ArtikelBinding}
     */
    bind() {
        let params = {'context': this._context, 'artikel': this._entity};
        let valueHolder = {'data': this._entity};
        this.onLayout(valueHolder, params);
        return this;
    }

    onLayout(valueHolder, params) {
        let virtual = this.document.createElement('div');
        virtual.innerHTML = template_artikel;
        let templ = virtual.cloneNode(true);
        this._switchContent(templ);

        let aconfig = this.getConfigurationFor("field.a");
        this._topic = this.document.newMultiLineInput(valueHolder, "pa.topic", 'topic', aconfig.label, params, this._action, 2, aconfig.editable.placeholder, aconfig.editable.visible);
        // this is a beschiss because the order of the elements matter to correctly compute height
        let fconfig = this.getConfigurationFor("field.f");
        this._layout = this.document.newSingleLineInput(valueHolder, 'pa.layout', 'layout', fconfig.label, params, this._action, fconfig.editable.placeholder, 'number', false, aconfig.editable.visible);

        // from is a dynamic field (field.a)
        let bconfig = this.getConfigurationFor("field.b");
        this._from = this.document.newSingleLineInput(valueHolder, 'pa.input-from', 'from', bconfig.label, params, this._action, bconfig.editable.placeholder, "text", false, bconfig.editable.visible);

        // author is a dynamic field: (field.b)
        let cconfig = this.getConfigurationFor("field.c");
        this._author = this.document.newSingleLineInput(valueHolder, 'pa.author', 'author', cconfig.label, params, this._action, cconfig.editable.placeholder, "text", false, cconfig.editable.visible);

        let gconfig = this.getConfigurationFor("field.g");
        this._total = this.document.newSingleLineInput(valueHolder, 'pa.total', 'total', gconfig.label, params, this._action, gconfig.editable.placeholder, 'number', true, gconfig.editable.visible)
            .addClass('bold');

        // text is a dynamic field: (field.c)
        let dconfig = this.getConfigurationFor("field.d");
        this._text = this.document.newMultiLineInput(valueHolder, 'pa.text', 'text', dconfig.label, params, this._action, 2, dconfig.editable.placeholder, dconfig.editable.visible);

        /**
         * @type {HTMLElement|PInput}
         * @private
         */
        let econfig = this.getConfigurationFor("field.e");
        this._pagina = this.document.newSingleLineInput(valueHolder, 'pa.pagina', 'pagina', econfig.label, params, this._action, econfig.editable.placeholder, 'number', false, econfig.editable.visible)
            .addClass('pagina')
            .addClass('bold');

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._tags = this.doLayout("pa.tags", "tags", valueHolder, params, "online");

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._visual = this.doLayout("pa.visual", "visual", valueHolder, params);

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._region = this.doLayout("pa.region", "region", valueHolder, params);

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._season = this.doLayout("pa.season", "season", valueHolder, params);

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._form = this.doLayout("pa.form", "form", valueHolder, params);

        /**
         * @type {SingleSelectInput}
         * @private
         */
        this._location = this.doLayout("pa.location", "location", valueHolder, params, "place");
    }

    detach() {
        let container = this.document.getElementById("pa.artikel.content");
        if (container) {
            container.removeChildren();
            container.removeSelf();
        }
    }

    /**
     * Switch content by removing any previous content first, resetting UI states and then set the new tab content
     * @param forms
     * @param templ
     * @private
     */
    _switchContent(templ) {
        let content = this._initLayout();
        content.removeChildren();
        content.appendChild(templ);
    }

    _initLayout() {
        let container = this.document.getElementById("pa.artikel.content") || this.document.createElement("span");
        if (!container.getAttribute("id")) {
            let form = this.document.createElement("form");
            form.setAttribute("autocomplete", "off");
            form.setAttribute("id", "panta.form");
            container.setAttribute("id", "pa.artikel.content");
            form.appendChild(container);
            this.document.getElementById("panta.content").appendChild(form);
        }
        return container;
    }

    /**
     * @param target the target HTML element id
     * @param id the property id
     * @param valueHolder
     * @param params
     * @param configurationId if the property id differs from the configuration id you can pass the configuration id separately
     * @return {SingleSelectInput|PInput}
     */
    doLayout(target, id, valueHolder, params, configurationId) {
        let configuration = this.getConfigurationFor(configurationId || id);
        return this.document.newSingleSelect(valueHolder, target, id, configuration.label, params, this._action, 'Liste-Tag',
            newOption("-1", "…"), configuration.options, configuration.editable.visible);
    }

    updateConfiguration(configuration) {
        this._configuration = configuration;

        this.updateField(this._topic, "field.a");
        this.updateField(this._from, "field.b");
        this.updateField(this._author, "field.c");
        this.updateField(this._text, "field.d");
        this.updateField(this._pagina, "field.e");
        this.updateField(this._layout, "field.f");
        this.updateField(this._total, "field.g");

        this.updateField(this._tags, "online");
        this.updateField(this._visual, "visual");
        this.updateField(this._region, "region");
        this.updateField(this._season, "season");
        this.updateField(this._form, "form");
        this.updateField(this._location, "place");
    }
}
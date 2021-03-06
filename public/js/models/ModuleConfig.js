class ModuleConfig {

    static get VERSION() {
        return 2;
    }

    /**
     * @param jsonObj
     * @param configuration the configuration that is used to get the right layout for the sections if the section is empty
     * @returns {ModuleConfig}
     */
    static create(jsonObj, configuration) {
        let sections = JsonSerialization.getProperty(jsonObj, 'sections') || {};
        let id = JsonSerialization.getProperty(jsonObj, 'id');
        return new ModuleConfig(id,
            {
                'onsite': CommonBeteiligt.create(sections.onsite, ModuleConfig._getSectionFactory(configuration, "onsite")),
                'text': CommonBeteiligt.create(sections.text, ModuleConfig._getSectionFactory(configuration, "text")),
                'photo': CommonBeteiligt.create(sections.photo, ModuleConfig._getSectionFactory(configuration, "photo")),
                'video': CommonBeteiligt.create(sections.video, ModuleConfig._getSectionFactory(configuration, "video")),
                'illu': CommonBeteiligt.create(sections.illu, ModuleConfig._getSectionFactory(configuration, "illu")),
                'ad': CommonBeteiligt.create(sections.ad, ModuleConfig._getSectionFactory(configuration, "ad"))
            });
    }

    /**
     * Get the section factory depending on the id and configuration
     *
     * @param {PluginModuleConfig} configuration
     * @param id
     * @returns {function(): CommonBeteiligt}
     * @private
     */
    static _getSectionFactory(configuration, id) {
        if (!configuration || !configuration.config || !configuration.config.editables) {
            return function (jsonObj) {
                return OtherBeteiligt.create(jsonObj);
            };
        }
        const editable = configuration.config.editables
            .filter(function (editable) {
                return editable.id === id;
            })[0];
        if (editable.layout === 'regular') {
            return function (jsonObj) {
                return OtherBeteiligt.create(jsonObj);
            };
        } else if (editable.layout === "blog") {
            return function (jsonObj) {
                return BlogBeteiligt.create(jsonObj);
            };
        } else {
            return function (jsonObj) {
                return AdBeteiligt.create(jsonObj);
            };
        }
    }

    constructor(id, sections) {
        this._id = id || uuid();
        /**
         * @type {{onsite: CommonBeteiligt, text: CommonBeteiligt, photo: CommonBeteiligt, video: CommonBeteiligt, illu: CommonBeteiligt, ad: CommonBeteiligt}}
         */
        this._sections = sections;
        this._version = CommonBeteiligt.VERSION;
    }

    /**
     * Get the number of sections that have content
     *
     * @return {number}
     */
    getContentCount() {
        return Object.values(this.sections).filter(function (section) {
            return !section.isEmpty();
        }).length;
    }

    /**
     * @return {{onsite: CommonBeteiligt, text: CommonBeteiligt, photo: CommonBeteiligt, video: CommonBeteiligt, illu: CommonBeteiligt, ad: CommonBeteiligt}}
     */
    get sections() {
        return this._sections;
    }

    set sections(value) {
        this._sections = value;
    }
}

class CommonBeteiligt {

    static get VERSION() {
        return 2;
    }

    /**
     * Create the beteiligt entity depending on its type
     * @param jsonObj
     * @param factory to get a default beteiligt instance
     * @returns {CommonBeteiligt}
     */
    static create(jsonObj, factory) {
        // the factory accepts a json object and passes it to the actual model class
        return factory ? factory.call(this, jsonObj) : null;
    }

    constructor(id, name, social, address, notes) {
        this._id = id || uuid();
        this._name = name;
        this._social = social;
        this._address = address;
        this._notes = notes;
        this._version = CommonBeteiligt.VERSION;
        this._type = null;
        this._id = id;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get social() {
        return this._social;
    }

    set social(value) {
        this._social = value;
    }

    get address() {
        return this._address;
    }

    set address(value) {
        this._address = value;
    }

    get notes() {
        return this._notes;
    }

    set notes(value) {
        this._notes = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    isEmpty() {
        return isBlank(this.name) && isBlank(this.social) && isBlank(this.address) && isBlank(this.notes);
    }

    get version() {
        return this._version;
    }

    set version(value) {
        this._version = value;
    }

    /**
     * @param {string} editable
     */
    getByEditable(editable) {
        return `<${editable}>`;
    }
}

class OtherBeteiligt extends CommonBeteiligt {

    /**
     * @param jsonObj
     * @returns {CommonBeteiligt}
     */
    static create(jsonObj) {
        return this._create(jsonObj);
    }

    /**
     * @param jsonObj
     * @returns {OtherBeteiligt}
     * @private
     */
    static _create(jsonObj) {
        if (jsonObj) {
            return new OtherBeteiligt(
                JsonSerialization.getProperty(jsonObj, 'id'),
                JsonSerialization.getProperty(jsonObj, 'name'),
                JsonSerialization.getProperty(jsonObj, 'social'),
                JsonSerialization.getProperty(jsonObj, 'address'),
                JsonSerialization.getProperty(jsonObj, 'notes'),
                JsonSerialization.getProperty(jsonObj, 'duedate'),
                JsonSerialization.getProperty(jsonObj, 'fee'),
                JsonSerialization.getProperty(jsonObj, 'charges'),
                JsonSerialization.getProperty(jsonObj, 'project'),
                JsonSerialization.getProperty(jsonObj, 'capOnDepenses')
            )
        } else {
            return new OtherBeteiligt();
        }
    }

    constructor(id, name, social, address, notes, duedate, fee, charges, project, capOnDepenses) {
        super(id, name, social, address, notes);
        this._duedate = duedate;
        this._fee = fee;
        this._charges = charges;
        this._project = project;
        this._capOnDepenses = capOnDepenses;
        this.type = "other";
    }

    get duedate() {
        return this._duedate;
    }

    set duedate(value) {
        this._duedate = value;
    }

    get fee() {
        return this._fee;
    }

    set fee(value) {
        this._fee = value;
    }

    get charges() {
        return this._charges;
    }

    set charges(value) {
        this._charges = value;
    }

    get project() {
        return this._project;
    }

    set project(value) {
        this._project = value;
    }

    get capOnDepenses() {
        return this._capOnDepenses;
    }

    set capOnDepenses(value) {
        this._capOnDepenses = value;
    }

    isEmpty() {
        return super.isEmpty() && !this.duedate && !this.fee && !this.charges;
    }

    getByEditable(editable) {
        switch (editable) {
            case 'field.id':
                return this.id;
            case 'field.name':
                return this.name;
            case 'field.social':
                return this.social;
            case 'field.address':
                return this.address;
            case 'field.notes':
                return this.notes;
            case 'field.deadline':
                return this.duedate;
            case 'field.a':
                return this.fee;
            case 'field.b':
                return this.charges;
            case 'field.c':
                return this.project;
            default:
                return super.getByEditable(editable);
        }
    }
}

class AdBeteiligt extends CommonBeteiligt {

    /**
     * @param jsonObj
     * @returns {CommonBeteiligt}
     */
    static create(jsonObj) {
        return this._create(jsonObj);
    }

    /**
     *
     * @param jsonObj
     * @returns {AdBeteiligt}
     * @private
     */
    static _create(jsonObj) {
        if (jsonObj) {
            let model = new AdBeteiligt(
                JsonSerialization.getProperty(jsonObj, 'id'),
                JsonSerialization.getProperty(jsonObj, 'name'),
                JsonSerialization.getProperty(jsonObj, 'social'),
                JsonSerialization.getProperty(jsonObj, 'address'),
                JsonSerialization.getProperty(jsonObj, 'notes'),
                JsonSerialization.getProperty(jsonObj, 'format'),
                JsonSerialization.getProperty(jsonObj, 'placement'),
                JsonSerialization.getProperty(jsonObj, 'price')
            );
            return model;
        } else {
            return new AdBeteiligt();
        }
    }

    constructor(id, name, social, address, notes, format, placement, price) {
        super(id, name, social, address, notes);
        this._format = format;
        this._placement = placement;
        this._price = price;
        this._total = 0;
        this.type = "ad";
    }

    get format() {
        return this._format;
    }

    set format(value) {
        this._format = value;
    }

    get placement() {
        return this._placement;
    }

    set placement(value) {
        this._placement = value;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        this._price = value;
    }

    get total() {
        return this._total;
    }

    set total(value) {
        this._total = value;
    }

    isEmpty() {
        return super.isEmpty() && !this.format && !this.placement && !this.price;
    }

    getByEditable(editable) {
        switch (editable) {
            case 'field.id':
                return this.id;
            case 'field.sujet':
                return this.notes;
            case 'field.format':
                return this.format;
            case 'field.placement':
                return this.placement;
            case 'field.price':
                return this.price;
            case 'field.total':
                return this.total;
            case 'field.name':
                return this.name;
            case 'field.social':
                return this.social;
            case 'field.address':
                return this.address;
            default:
                return super.getByEditable(editable);
        }
    }
}

class BlogBeteiligt extends CommonBeteiligt {

    /**
     * @param jsonObj
     * @returns {CommonBeteiligt}
     */
    static create(jsonObj) {
        return this._create(jsonObj);
    }

    /**
     *
     * @param jsonObj
     * @returns {BlogBeteiligt}
     * @private
     */
    static _create(jsonObj) {
        if (jsonObj) {
            return new BlogBeteiligt(
                JsonSerialization.getProperty(jsonObj, 'id'),
                JsonSerialization.getProperty(jsonObj, 'address'),
                JsonSerialization.getProperty(jsonObj, 'notes'));
        } else {
            return new BlogBeteiligt();
        }
    }

    constructor(id, address, notes) {
        super(id, "", null, address, notes);
        this.type = "blog";
    }

    isEmpty() {
        return super.isEmpty() && isBlank(this.date);
    }


    getByEditable(editable) {
        switch (editable) {
            case 'field.id':
                return this.id;
            case 'field.notes':
                return this.notes;
            case 'field.link':
                return this.address;
            default:
                return super.getByEditable(editable);
        }
    }
}
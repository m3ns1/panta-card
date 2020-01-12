class AdminController {

    /**
     * The name of the property bag in trello
     * @returns {string}
     * @constructor
     */
    static get PROPERTY_BAG_NAME() {
        return "panta.Admin.PropertyBag";
    }

    static create(trello, document, adminService, loggingService) {
        return new AdminController(trello, adminService, document, loggingService);
    }


    /**
     * @param trello
     * @param {AdminService} adminService
     * @param {Document} document
     * @param {LoggingService} loggingService
     */
    constructor(trello, adminService, document, loggingService) {
        this._trello = trello;
        /**
         * @type {AdminService}
         */
        this._adminService = adminService;
        /**
         * @type {Document}
         */
        this._document = document;
        /**
         * @type {ClientManager}
         */
        this._clientManager = ClientManager.getInstance(window);

        /**
         * @type {PluginController}
         */
        this._pluginController = this._clientManager.getPluginController();

        /**
         * @type {Import}
         * @private
         */
        this._model = null;

        /**
         * A property bag that can be used to store just plain old values
         * @type {{}}
         * @private
         */
        this._propertyBag = {};

        this._loggingService = loggingService;
    }

    /**
     * @param {{configuration: ImportConfiguration, page: string?, error: string?, error_details: string?}} data
     * @return {Promise<boolean | never>}
     */
    render(data) {
        this._context = data.page || 'home';
        this._document.querySelectorAll('.js-content').forEach(it => it.removeChildren())
        if (this._context === 'import') {
            return this.importPage(data.configuration)
        } else if (this._context === 'export') {
            return this.exportPage(data.configuration);
        } else if (this._context === 'error') {
            return this.errorPage(data.error, data.error_details);
        } else {
            return this.homePage();
        }
    }

    errorPage(error, error_details) {
        const that = this;
        const page = createByTemplate(template_admin_errorpage, template_admin_errorpage);
        this._document.querySelectorAll('.js-content').forEach(it => it.appendChild(page));
        this._document.querySelectorAll('.js-content').forEach(it => it.removeClass('hidden'));
        this._showErrors(page, `<h5>${error}</h5><p>${error_details}</p>`);
        this._document.querySelector('#btn-reset').setEventListener('click', (e) => {
            that._pluginController.resetAdminConfiguration();
        });
        return Promise.resolve(true);
    }

    homePage() {
        const that = this;
        const page = createByTemplate(template_admin_actions, template_admin_actions);
        this._document.querySelectorAll('.js-content').forEach(it => it.appendChild(page));
        this._document.querySelectorAll('.js-content').forEach(it => it.removeClass('hidden'));
        this._document.querySelector('#btn-action-import').setEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            that._trello.modal({
                title: 'Administration - Import',
                url: "admin.html",
                accentColor: 'blue',
                fullscreen: true,
                actions: [{
                    icon: './assets/ic_arrow_back.png',
                    callback: (t) => {
                        t.modal({
                            title: "Administration",
                            url: "admin.html",
                            accentColor: 'blue'
                        })
                    },
                    alt: 'Zurück',
                    position: 'left',
                }],
                args: {
                    "page": 'import'
                },
            });
        });
        // TODO import and export are almost the same
        this._document.querySelector('#btn-action-export').setEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            that._trello.modal({
                title: 'Administration - Export',
                url: "admin.html",
                accentColor: 'blue',
                fullscreen: true,
                actions: [{
                    icon: './assets/ic_arrow_back.png',
                    callback: (t) => {
                        t.modal({
                            title: "Administration",
                            url: "admin.html",
                            accentColor: 'blue'
                        })
                    },
                    alt: 'Zurück',
                    position: 'left',
                }],
                args: {
                    "page": 'export'
                },
            });
        });
        return Promise.resolve(true);
    }

    exportPage(config) {
        const that = this;
        this._model = null;
        const page = createByTemplate(template_admin_export, template_admin_export);
        this._document.querySelectorAll('.js-content').forEach(it => it.appendChild(page));
        this._clearContent();

        return this._pluginController.getEnabledModules()
            .then(its => {
                return Promise.all(its.map(it => {
                    return that._adminService.getCurrentCard()
                        .then(card => {
                            return that._clientManager.getController(it.id).fetchByCard(card, it);
                        })
                }));
            })
            .then(() => {
                return this.renderActions(config)
                    .then(() => {
                        // Sample data
                        const model = Import.create('Sample', sampleImport);
                        const sample1 = new DataNode(1);
                        const header = model.header;
                        sample1.set(header.get(0), {v: 'Test Liste', t: 's'});
                        sample1.set(header.get(1), {v: 43830, w: '31/12/2019', t: 'n'});
                        sample1.set(header.get(2), {v: 'me@m3ns1.com', t: 's'});
                        sample1.set(header.get(3), {v: 1, t: 'n'});
                        sample1.set(header.get(4), {v: 1, t: 'n'});
                        sample1.set(header.get(5), {v: 1, t: 'n'});
                        sample1.set(header.get(6), {v: 1, t: 'n'});
                        sample1.set(header.get(7), {v: 1, t: 'n'});
                        sample1.set(header.get(8), {v: 1, t: 'n'});
                        sample1.set(header.get(9), {v: 1, t: 'n'});
                        sample1.set(header.get(10), {v: 1, t: 'n'});
                        sample1.set(header.get(11), {v: 1, t: 'n'});
                        sample1.set(header.get(12), {v: 1, t: 'n'});
                        sample1.set(header.get(13), {v: 'A cocktail a day', t: 's'});
                        sample1.set(header.get(14), {v: 'https://a-cocktail-a-day.com/', t: 's'});
                        sample1.set(header.get(15), {v: '3.Begriff', t: 's'});
                        sample1.set(header.get(16), {v: '', t: 's'});
                        sample1.set(header.get(17), {v: '', t: 's'});
                        sample1.set(header.get(18), {v: '', t: 's'});
                        sample1.set(header.get(19), {v: '', t: 's'});
                        sample1.set(header.get(20), {v: 'Blog zum Thema: Reisen, Lifestyle, Fliegen', t: 's'});
                        sample1.set(header.get(21), {v: 'Kristina', t: 's'});
                        sample1.set(header.get(22), {v: 'Roder', t: 's'});
                        sample1.set(header.get(23), {v: 'Test Notiz', t: 's'});
                        sample1.set(header.get(24), {v: 'kristina@a-cocktail-a-day.com', t: 's'});
                        sample1.set(header.get(25), {v: 'n.a.', t: 's'});
                        sample1.set(header.get(26), {v: '', t: 's'});
                        sample1.set(header.get(27), {v: 'Offen für Kooperationen', t: 's'});
                        sample1.set(header.get(28), {v: '', t: 's'});
                        sample1.set(header.get(29), {v: 'https://facebook.com', t: 's'});
                        sample1.set(header.get(30), {v: 'https://instagram.com', t: 's'});
                        sample1.set(header.get(31), {v: 'https://twitter.com', t: 's'});
                        sample1.set(header.get(32), {v: 'https://youtube.com', t: 's'});
                        sample1.set(header.get(33), {v: 'https://flickr.com', t: 's'});
                        model.data.push(sample1);
                        that.renderModel(model, config);
                        return true;
                    });

            });
    }

    /**
     * @param {ImportConfiguration} previousConfig
     * @return {Promise<boolean | never>}
     */
    importPage(previousConfig) {
        const that = this;
        this._model = null;
        const page = createByTemplate(template_admin_import, template_admin_import);
        this._document.querySelectorAll('.js-content').forEach(it => it.appendChild(page));
        this._clearContent();
        return this.renderActions(previousConfig)
            .then(it => {
                // Sample data
                const model = Import.create('Sample', sampleImport);
                const sample1 = new DataNode(1);
                const header = model.header;
                sample1.set(header.get(0), {v: 'Test Liste', t: 's'});
                sample1.set(header.get(1), {v: 43830, w: '31/12/2019', t: 'n'});
                sample1.set(header.get(2), {v: 'me@m3ns1.com', t: 's'});
                sample1.set(header.get(3), {v: '', t: 'n'});
                sample1.set(header.get(4), {v: 1, t: 'n'});
                sample1.set(header.get(5), {v: 1, t: 'n'});
                sample1.set(header.get(6), {v: 1, t: 'n'});
                sample1.set(header.get(7), {v: 1, t: 'n'});
                sample1.set(header.get(8), {v: 1, t: 'n'});
                sample1.set(header.get(9), {v: 1, t: 'n'});
                sample1.set(header.get(10), {v: 1, t: 'n'});
                sample1.set(header.get(11), {v: 1, t: 'n'});
                sample1.set(header.get(12), {v: 1, t: 'n'});
                sample1.set(header.get(13), {v: 'A cocktail a day', t: 's'});
                sample1.set(header.get(14), {v: 'https://a-cocktail-a-day.com/', t: 's'});
                sample1.set(header.get(15), {v: '3.Begriff', t: 's'});
                sample1.set(header.get(16), {v: '', t: 's'});
                sample1.set(header.get(17), {v: '', t: 's'});
                sample1.set(header.get(18), {v: '', t: 's'});
                sample1.set(header.get(19), {v: '', t: 's'});
                sample1.set(header.get(20), {v: 'Blog zum Thema: Reisen, Lifestyle, Fliegen', t: 's'});
                sample1.set(header.get(21), {v: 'Kristina', t: 's'});
                sample1.set(header.get(22), {v: 'Roder', t: 's'});
                sample1.set(header.get(23), {v: 'Test Notiz', t: 's'});
                sample1.set(header.get(24), {v: 'kristina@a-cocktail-a-day.com', t: 's'});
                sample1.set(header.get(25), {v: 'n.a.', t: 's'});
                sample1.set(header.get(26), {v: '', t: 's'});
                sample1.set(header.get(27), {v: 'Offen für Kooperationen', t: 's'});
                sample1.set(header.get(28), {v: '', t: 's'});
                sample1.set(header.get(29), {v: 'https://facebook.com', t: 's'});
                sample1.set(header.get(30), {v: 'https://instagram.com', t: 's'});
                sample1.set(header.get(31), {v: 'https://twitter.com', t: 's'});
                sample1.set(header.get(32), {v: 'https://youtube.com', t: 's'});
                sample1.set(header.get(33), {v: 'https://flickr.com', t: 's'});
                model.data.push(sample1);
                that.renderModel(model, previousConfig);
                return true;
            });
    }

    /**
     *
     * @param previousConfiguration
     * @return {Promise<boolean>}
     */
    renderActions(previousConfiguration) {
        const that = this;
        this._document.querySelectorAll(".js-content")
            .forEach(it => {
                it.removeClass("hidden");
                if (it.querySelector("#btn-export")) {
                    it.querySelector("#btn-export").setEventListener('click', function (e) {
                        console.debug(`Do export`);
                        // Promise.resolve(that._adminService.hasLabel("Panta Cards", "green"))
                        //     .then(result => {
                        //         if (result) {
                        //             console.debug("Contains label");
                        //         } else {
                        //             console.debug("Nope");
                        //             // create it
                        //             if (Promise.resolve(that._adminService.createLabel("Panta Cards", "green"))) {
                        //                 console.log("Yep");
                        //             }
                        //         }
                        //     });

                    });
                }
                if (it.querySelector("#btn-load")) {
                    it.querySelector("#btn-load").setEventListener('click', function (e) {
                        e.preventDefault();
                        const button = e.target;
                        that._hideErrors(it);
                        that._hideWarnings(it);
                        button.disabled = true;

                        const files = that._document.querySelector("#file-import").files;
                        try {
                            that._adminService.load(files)
                                .then(imports => {
                                    imports.forEach(it => {
                                        that.renderModel(it.model, previousConfiguration);
                                    });
                                })
                                .catch(err => {
                                    that._showErrors(it, `Unerwarteter Fehler beim Importieren der Datei «${err.name}»`);
                                })
                                .finally(() => {
                                    button.disabled = false;
                                });
                        } catch (ex) {
                            that._showErrors(it, `Schwerwiegender Fehler beim Importieren: ${ex}`);
                            button.disabled = false;
                        }
                    });
                }
                if (it.querySelector('#btn-load-config')) {
                    it.querySelector('#btn-load-config').setEventListener('click', (e) => {
                        e.preventDefault();
                        const button = e.target;
                        const config = prompt('Bitte gib hier die Konfiguration als Base64 Text ein: ');
                        if (isString(config) && !isBlank(config)) {
                            that._pluginController.parseAdminConfiguration(config)
                                .then(it => {
                                    that.renderModel(that._model, it.configuration);
                                });
                        }
                    });
                }
                const btnImport = it.querySelector('#btn-import');
                if (btnImport) {
                    btnImport.setEventListener('update', e => {
                        const configuration = that._readConfiguration(that._model);
                        if (configuration.isValid()) {
                            that._hideWarnings(document);
                            btnImport.removeAttribute('disabled');
                            btnImport.removeAttribute('title');
                            btnImport.removeAttribute('data-validation');
                        } else if (!btnImport.hasAttribute('data-validation')) {
                            const validations = configuration.getValidationErrors();
                            const errors = validations.map(it => it.id).join('<br/>');
                            btnImport.setAttribute('disabled', 'disabled');
                            btnImport.setAttribute('data-validation', 'invalid');
                            btnImport.setAttribute('title', 'Es sind noch nicht alle notwendingen Felder konfiguriert.');
                            console.warn(`Validation errors`, validations);
                            that._showWarnings(document, `Es sind noch nicht alle notwendingen Felder konfiguriert.<br/>${errors}`);
                        }
                    });
                    btnImport.setEventListener('click', function (e) {
                        // read configuration
                        e.preventDefault();
                        const button = e.target;
                        button.setAttribute('disabled', 'disabled');
                        const model = that._model;
                        if (model) {
                            /**
                             * @type {ImportConfiguration}
                             */
                            const configuration = that._readConfiguration(model);
                            if (configuration.isValid()) {
                                that._adminService.importCards(model, configuration)
                                    .then(success => {
                                        if (success) {
                                            that._loggingService.i(`Import Datei(en) wurde(n) erfolgreich importiert`);
                                            that._propertyBag['configuration'] = configuration;
                                            that._loggingService.d(`Die Konfiguration wird für zukünftige Imports gespeichert: ${JSON.stringify(that._propertyBag)}`);
                                            return that._pluginController.setAdminConfiguration(that._propertyBag);
                                        } else {
                                            that._loggingService.i(`Es konnten nicht alle Import Dateien korrekt importiert werden`);
                                            return Promise.reject(`See log for more details`);
                                        }
                                    })
                                    .then(it => {
                                        that._loggingService.d(`Folgende komprimierte Konfiguration wurde gespeichert: (Base64) ${it}`);
                                    })
                                    .catch(it => {
                                        that._loggingService.e(`Es trat folgender Fehler auf: ${it.stack}`);
                                        console.error(it.stack);
                                    })
                                    .finally(() => {
                                        button.removeAttribute('disabled');
                                        const file = that._loggingService.flush();
                                        that._adminService.getCurrentCard()
                                            .then(card => {
                                                return that._adminService.uploadFileToCard(card, file);
                                            })
                                            .catch(err => {
                                                console.error(`Konnte Log Datei nicht hochladen`, err);
                                            });
                                    });
                            } else {
                                const validations = configuration.getValidationErrors();
                                const errors = validations.join('<br/>');
                                that._showWarnings(document, `Die Konfiguration ist unvollständig. Bitte korrigieren sie die Konfiguration und versuchen sie es erneut.<br/>${errors}`);
                            }
                        }
                    });
                }

            });
        return Promise.resolve(true);
    }

    /**
     * @param model
     * @return {ImportConfiguration}
     * @private
     */
    _readConfiguration(model) {
        const that = this;
        return Object.values(model.getNormalizedHeaders()).map(it => {
            /**
             * @type {HTMLSelectElement}
             */
            const select = that._document.querySelector(`#field-mapping-${it.getAddressAsText()}`);
            const option = select.item(select.selectedIndex);
            if (option === null) {
                return null;
            }
            const type = option.getAttribute('data-type');
            const multi = option.getAttribute('data-multi') === 'true';
            return that._createFieldOfType(type, it, option.value, multi);
        }).filter(it => it != null)
            .reduce((prev, cur) => {
                prev.mapping.push(cur);
                return prev;
            }, new ImportConfiguration());
    }

    /**
     * Create the field for the given type
     * @param type
     * @param {HeaderNode} header
     * @param value
     * @param {boolean} multi true if the field can be used multiple times in the configuration otherwise false
     * @return {AbstractField}
     * @private
     */
    _createFieldOfType(type, header, value, multi) {
        switch (type) {
            case "boolean":
                return new BooleanField(header.label, value, new HeaderNode(null, header.label, header.address, header.comments), multi);
            case 'date':
                return new DateField(header.label, value, new HeaderNode(null, header.label, header.address, header.comments), multi);
            case 'array':
                return new ArrayField(header.label, value, new HeaderNode(null, header.label, header.address, header.comments), multi);
            default:
                return new TextField(header.label, value, new HeaderNode(null, header.label, header.address, header.comments), multi);
        }
    }

    /**
     * @param {Import} model
     * @param {ImportConfiguration} previousConfiguration
     */
    renderModel(model, previousConfiguration) {
        const that = this;
        that._clearContent();
        if (!model) {
            return;
        }
        this._document.getElementsByClassName("mapping-content-header").forEach(it => {
            it.removeClass("hidden");
        });
        const all = [];
        this._document.getElementsByClassName("mapping-content").forEach(container => {
            container.removeClass('hidden');
            Object.entries(model.getNormalizedHeaders()).forEach(entry => {
                const header = entry[1];
                const row = that._document.createElement('div');
                row.addClass('row space full');

                all.push(that._createChipsSection(header)
                    .then(it => {
                        row.appendChild(it);
                        return that._createFieldMappingSection(header, previousConfiguration);
                    })
                    .then(it => {
                        row.appendChild(it);
                        return that._createPreviewSection(header, model, previousConfiguration);
                    })
                    .then(it => {
                        row.appendChild(it);
                        return that._createMore(header);
                    })
                    .then(it => {
                        row.appendChild(it);
                        return row;
                    })
                    .then(it => {
                        container.appendChild(it);
                        return Array.from(it.querySelectorAll('select').values());
                    })
                    .then(its => {
                        that._model = model;
                        its.forEach(it => {
                            it.dispatchEvent(new Event('change'));
                        });
                        return Array.from(row.querySelectorAll('.js-preview').values());
                    })
                    .then(its => {
                        its.forEach(it => {
                            it.dispatchEvent(new Event('update'));
                        });
                        return container;
                    })
                );

            });
        });
        Promise.all(all).then(it => that._trello.sizeTo('#content'));

    }

    /**
     *
     * @param header
     * @return {HTMLElement | HTMLDivElement | any}
     * @private
     */
    _createMore(header) {
        const that = this;
        const more = that._document.createElement('div');
        more.setAttribute('id', `more-${header.getAddressAsText()}`);
        more.addClass('col-2');
        return more;
    }

    /**
     * @param {HeaderNode} header
     * @return {Promise<HTMLDivElement>}
     * @private
     */
    _createChipsSection(header) {
        const that = this;
        const chips = that._document.createElement('div');
        chips.addClass('col-3');
        header.getPathItems().map((it, index, arr) => {
            let chip = that._document.createElement('div');
            chip.setAttribute('id', `chip-${header.getAddressAsText()}-${index + 1 < arr.length ? index : 'last'}`);
            chip.addClass('panta-chip');
            if (index + 2 < arr.length) {
                chip.addClass('panta-chip-grandpa');
            } else if (index + 1 < arr.length) {
                chip.addClass('panta-chip-parent');
            }
            it.comments.forEach((it, index, arr) => {
                chip.addClass(`panta-bgcolor-${it.t.toLowerCase()}`);
            });
            let label = that._document.createElement('p');
            label.appendChild(that._document.createTextNode(it.label));
            chip.appendChild(label);
            return chip;
        }).forEach((it, index) => {
            if (that._adminService.excelService.treatFirstRowAsRoot || index > 0) {
                chips.appendChild(it);
            }
        });
        return Promise.resolve(chips);
    }

    /**
     * @param {HeaderNode} header
     * @param {Import} model
     * @param {ImportConfiguration} configuration
     * @return {Promise<HTMLDivElement>}
     * @private
     */
    _createPreviewSection(header, model, configuration) {
        const that = this;
        const preview = that._document.createElement('div');
        preview.setAttribute('id', `preview-${header.getAddressAsText()}`);
        preview.addClass(`col-3 js-preview`);
        preview.setEventListener('update', e => {
            const field = e.item || configuration.mapping.find(it => it.source.isSameAddress(header.address));

            const sample = that._context === 'import' ? model.getSample(header).then(it => {
                return model.getSampleHtml(it, that._document, field) || '<p>&nbsp;</p>';
            }) : that._getBoardSample(header, field);
            sample.then(it => {
                preview.innerHTML = it;
            });
        });
        preview.innerHTML = '<p>&nbsp;</p>';
        return Promise.resolve(preview);
    }

    /**
     * @param {HeaderNode} header
     * @param {AbstractField} field
     * @return {Promise<string>}
     * @private
     */
    _getBoardSample(header, field) {
        const that = this;
        if (!field) {
            return Promise.resolve('&lt;leer&gt;');
        }
        return that._trello.card('id', 'name', 'desc', 'due', 'members', 'labels', 'idList')
            .then(it => {
                console.debug(`${field.reference}: Got card ${JSON.stringify(it)}`);
                // TODO use same mapping bean as in adminservice
                switch (field.reference) {
                    case 'trello.title':
                        return it.name;
                    case 'trello.description':
                        return it.desc;
                    case 'trello.duedate':
                        return it.due;
                    case 'trello.members':
                        return it.members.map(it => `${it.fullName} (${it.username})`).join('<br/>');
                    case 'trello.labels':
                        return it.labels
                            .filter(it => it.name === header.label && it.color === header.color)
                            .map(it => `${it.name} (${it.color})`)
                            .join('<br/>') || '&nbsp;';
                    case 'trello.list':
                        return that._trello.list('id', 'name')
                            .then(it => {
                                return it.name;
                            });
                    default:
                        return that._getPantaFieldItems()
                            .then(its => {
                                /**
                                 * @type {{id: string, desc: string, visible: boolean, type: string, values?: string[]}}
                                 */
                                const it = its
                                    .flatMap(its => its)
                                    .map(it => {
                                        const groupId = it.groupId;
                                        const moduleId = it.moduleId;
                                        const found = it.fields.find(it => `${groupId}.${it.id}` === field.reference);
                                        if (found) {
                                            const controller = that._clientManager.getController(moduleId);
                                            return that._adminService.getCurrentCard()
                                                .then(card => {
                                                    const entity = controller.getByCard(card);
                                                    console.debug(`Current card is ${card.id}`, found, entity);
                                                    return controller.getPropertyByName(entity, found.id, '&lt;leer&gt;');
                                                });
                                        }
                                        return null;
                                    })
                                    .find(it => it !== null);
                                return it ? it : '&lt;leer&gt;';
                            });
                }
            });
    }

    /**
     * Render the field mapping dropdown
     * @param {HeaderNode} header the header node
     * @param {ImportConfiguration} configuration
     * @return {Promise<HTMLDivElement>}
     * @private
     */
    _createFieldMappingSection(header, configuration) {
        const that = this;
        const linking = that._document.createElement('div');
        linking.addClass('col-4');

        const fields = that._document.createElement('select');
        fields.setAttribute('id', `field-mapping-${header.getAddressAsText()}`);
        fields.setEventListener('change', e => {
            this._onFieldMappingChange(e.target.item(e.target.selectedIndex), header);
        });
        const none = that._document.createElement('option');
        none.setAttribute('value', '-1');
        none.innerText = 'Feld auswählen...';
        fields.appendChild(none);

        return that._getTrelloFields(header, configuration)
            .then(it => {
                fields.appendChild(it);
                return fields;
            })
            .then(it => {
                return that._getPantaFields(header, configuration)
                    .then(its => {
                        return its.reduce((prev, cur) => {
                            prev.appendChild(cur);
                            return prev;
                        }, fields);
                    });
            })
            .then(it => {
                linking.appendChild(fields);
                const field = configuration.mapping.find(it => it.source.isSameAddress(header.address));
                fields.value = field && field.reference ? field.reference : '-1';
                if (isBlank(fields.value)) {
                    fields.value = '-1';
                }
                return linking;
            });
    }

    /**
     * @param {HTMLOptionElement} item
     * @param {HeaderNode} header
     * @private
     */
    _onFieldMappingChange(item, header) {
        if (item === null) {
            return;
        }
        const that = this;
        const address = header.getAddressAsText();
        const more = that._document.querySelector(`#more-${address}`);
        let event = new Event('update');
        more.removeChildren();
        if (item.getAttribute('value') === 'trello.labels') {
            event.item = new BooleanField(item);
            const colorPicker = that._createColorPicker(header.color);
            colorPicker.setEventListener('change', e => {
                const item = e.target.item(e.target.selectedIndex);
                const color = item.getAttribute('value');
                const lastchip = that._document.querySelector(`#chip-${address}-last`);
                lastchip.removeClassByPrefix('panta-bgcolor-');
                if (color !== '0') {
                    lastchip.addClass(`panta-bgcolor-${color}`);

                }
                header.color = color;
            });
            more.appendChild(colorPicker);
        }
        const multi = item.getAttribute('data-multi') === 'true';
        event.item = this._createFieldOfType(item.getAttribute('data-type'), header, item.value, multi);
        that._document.querySelector(`#preview-${address}`).dispatchEvent(event);

        that._getActionButton().dispatchEvent(event);
    }

    _getActionButton() {
        return this._document.querySelector(`#${this._context === 'import' ? 'btn-import' : 'btn-export'}`);
    }

    /**
     * Create the colorpicker dropdown
     * @param selected
     * @return {HTMLElement | HTMLSelectElement | any}
     * @private
     */
    _createColorPicker(selected = null) {
        const that = this;
        const colorPicker = that._document.createElement('select');
        colorPicker.appendChild(that._createColorOption('Farbe wählen...', '0', selected));
        Object.entries(TRELLO_COLORS).map(it => that._createColorOption(it[0], it[1], selected))
            .forEach(it => colorPicker.appendChild(it));
        return colorPicker;
    }

    /**
     * Create a color option for the dropdown
     * @param color
     * @param value
     * @param selected
     * @return {HTMLElement | HTMLOptionElement | any}
     * @private
     */
    _createColorOption(color, value, selected) {
        const opt = this._document.createElement('option');
        opt.setAttribute('value', value);
        opt.selected = selected === value;
        opt.innerText = color;
        return opt;
    }

    /**
     *
     * @param {HeaderNode} header
     * @param {ImportConfiguration} previousConfiguration
     * @return {PromiseLike<HTMLOptGroupElement>}
     * @private
     */
    _getTrelloFields(header, previousConfiguration) {
        const that = this;
        const group = this._document.createElement('optgroup');
        group.setAttribute('label', 'Trello Felder');
        return Promise.resolve(TRELLO_FIELDS.map(it => that._createFieldOption(header, it.id, __(it.desc), it.type, it.multi, previousConfiguration))
            .reduce((prev, cur) => {
                prev.appendChild(cur);
                return prev;
            }, group));
    }

    /**
     * Create an option element for the field mappings
     * @param header
     * @param fieldId
     * @param description
     * @param type
     * @param multi if the field can be used multiple times (default is false)
     * @param configuration
     * @return {HTMLElement | HTMLOptionElement | any}
     * @private
     */
    _createFieldOption(header, fieldId, description, type, multi, configuration) {
        const that = this;
        const option = that._document.createElement('option');
        option.setAttribute('value', fieldId);
        option.innerText = description;
        option.setAttribute('data-type', type || 'text');
        option.setAttribute('data-multi', multi || 'false');
        return option;
    }

    /**
     *
     * @param {HeaderNode} header
     * @param {ImportConfiguration} previousConfiguration
     * @return {PromiseLike<HTMLOptGroupElement>}
     * @private
     */
    _getPantaFields(header, previousConfiguration) {
        // get the fields from the controllers
        const that = this;
        return this._pluginController.getEnabledModules()
            .then(its => {
                return its.flatMap(it => {
                    const modulename = it.name;
                    const controller = that._clientManager.getController(it.id);
                    return controller.getFields(it)
                        .flatMap(its => {
                            return its.map(it => {
                                const groupId = it.groupId;
                                const subgrp = that._document.createElement('optgroup');
                                subgrp.setAttribute('label', `${modulename}: ${it.group}`);
                                return it.fields
                                    .map(it => that._createFieldOption(header, `${groupId}.${it.id}`, it.label, it.type, 'false', previousConfiguration))
                                    .reduce((prev, cur) => {
                                        prev.appendChild(cur);
                                        return prev;
                                    }, subgrp);
                            });
                        });
                });
            });
    }

    /**
     *
     * @return {PromiseLike<{group: string, groupId: string, fields: {id: string, desc: string, visible: boolean, type: string, values?: string[]}[]}[][] | never> | Promise<{group: string, groupId: string, fields: {id: string, desc: string, visible: boolean, type: string, values?: string[]}[]}[][] | never>}
     * @private
     */
    _getPantaFieldItems() {
        const that = this;
        return this._pluginController.getEnabledModules()
            .then(its => {
                return its.flatMap(it => {
                    const controller = that._clientManager.getController(it.id);
                    return controller.getFields(it);
                });
            });
    }

    /**
     * Clear the content of the settings page completely by removing all child nodes from the
     * container
     */
    _clearContent() {
        this._document.getElementsByClassName("mapping-content").forEach(it => it.removeChildren());
    }

    _showErrors(holder, message) {
        return this._show(holder, holder.querySelectorAll('.error-messages'), message, '#error-message');
    }

    _showWarnings(holder, message) {
        return this._show(holder, holder.querySelectorAll('.warning-messages'), message, '#warning-message');
    }

    _hideWarnings(holder) {
        return this._hide(holder.querySelectorAll('.warning-messages'), '#warning-message');
    }

    _hideErrors(holder) {
        return this._hide(holder.querySelectorAll('.error-messages'), '#error-message');
    }

    _show(holder, container, message, messageId) {
        container.forEach(errorMessageContainer => {
            errorMessageContainer.removeClass('hidden');
            const errorMessage = errorMessageContainer.querySelector(messageId);
            errorMessage.innerHTML = message;
        });
        return container;
    }

    _hide(container, messageId) {
        container.forEach(errorMessageContainer => {
            errorMessageContainer.addClass('hidden');
            const errorMessage = errorMessageContainer.querySelector(messageId);
            errorMessage.innerHTML = '';
        });
        return container;
    }
}
class ArtikelController {

    static get SHARED_NAME() {
        return "panta.Artikel";
    }

    constructor(document, trelloApi) {
        /**
         * @type {HTMLDocument}
         */
        this.document = document;
        this.trelloApi = trelloApi;
        /**
         * @type {Artikel}
         * @private
         */
        this._artikel = null;

        /**
         * @type {ArtikelBinding}
         * @private
         */
        this._artikelBinding = null;

        /**
         * @type {BeteiligtBinding}
         * @private
         */
        this._beteiligtBinding = null;

        /**
         * @type {ArtikelRepository}
         * @private
         */
        this._repository = new ArtikelRepository();
    }

    /**
     * @param {Artikel} artikel
     * @param {Trello.Card} card
     */
    insert(artikel, card) {
        if (artikel && this._repository.isNew(artikel)) {
            this._repository.add(artikel);
        } else if (artikel) {
            this._repository.replace(artikel, card);
        }
    }

    /**
     * Get the artikel for the passed trello card
     * @param card
     * @returns {*}
     */
    getByCard(card) {
        return this._repository.get(card);
    }

    /**
     * Get the region mapping in german
     * @param region
     * @returns {string|*}
     */
    getRegionMapping(region) {
        return ArtikelBinding.getRegionMapping(region);
    }

    /**
     * Get the human readable name of that 'tag' (german)
     * @param tag
     * @returns {string|*}
     */
    getTagMapping(tag) {
        return ArtikelBinding.getTagMapping(tag);
    }

    /**
     * Get all artikels currently known
     * @returns {Array}
     */
    list() {
        return this._repository.all();
    }

    /**
     * Check if the passed artikel is already managed or not
     * @param artikel
     * @returns {boolean}
     */
    isManaged(artikel) {
        return artikel.id !== null;
    }

    /**
     * Make the artikel managed by setting the ID of the artikel
     * @param artikel
     * @returns {Artikel}
     */
    manage(artikel) {
        artikel.id = uuid();
        return artikel;
    }

    /**
     * Called when the artikel has changed and the controller should re-compute dynamic properties (totals)
     */
    update() {
        // calc total
        this._artikel.total = this.getTotalPageCount();

        // calc price in involved
        this._artikel.getInvolvedFor('ad').total = this.getTotalPrice();

        this._artikelBinding.update(this._artikel);
        this._beteiligtBinding.update(this._artikel);
    }

    /**
     * Compute the total price over all artikels in the "ad"-involved section
     * @returns {number}
     */
    getTotalPrice() {
        return this._repository.all().map(function (item, index) {
            return item.getInvolvedFor('ad');
        }).filter(function (item, index) {
            return item instanceof AdBeteiligt && !isNaN(parseFloat(item.price));
        }).map(function (item, index) {
            return item.price;
        }).reduce(function (previousValue, currentValue) {
            return parseFloat(previousValue) + parseFloat(currentValue);
        }, 0.0);
    }

    /**
     * Compute the total page count over all artikels
     * @returns {int}
     */
    getTotalPageCount() {
        return this._repository.all().map(function (item, index) {
            let number = parseInt(item.layout);
            if (isNaN(number)) {
                return 0;
            }
            return number;
        }).reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        }, 0);
    }

    /**
     * @param (Artikel) artikel
     */
    render(artikel) {
        this._artikel = artikel ? artikel : Artikel.create();
        this._artikelBinding = this._artikelBinding ? this._artikelBinding.update(this._artikel) : new ArtikelBinding(this.document, this._artikel, this.onArtikelChanged, this).bind();
        this._beteiligtBinding = this._beteiligtBinding ? this._beteiligtBinding.update(this._artikel) : new BeteiligtBinding(this.document, this._artikel, this.onDataInvolvedChanged, this).bind();
    }

    /**
     * Called when the data in panta.Beteiligt has changed
     * @param source the source input element
     * @param args a dictionary object with 'context', 'valueHolder' and 'artikel'
     */
    onDataInvolvedChanged(source, args) {
        source.setProperty();

        let ctx = args['context'];
        let valueHolder = args['valueHolder'];
        let artikel = args['artikel'];
        let involved = source.getBinding();

        // update the involved part of the artikel
        artikel.putInvolved(valueHolder['involved-in'], involved);
        ctx._persistArtikel(ctx.trelloApi, artikel);
        console.log("Stored: " + source.getBoundProperty() + " = " + source.getValue());
    }

    /**
     * Called when the panta.Artikel part has changed
     * @param source the source input element
     * @param ctx dictionary object with 'context' and 'artikel'
     */
    onArtikelChanged(source, ctx) {
        source.setProperty();
        ctx['context']._persistArtikel(ctx['context'].trelloApi, source.getBinding());
        console.log("Stored: " + source.getBoundProperty() + " = " + source.getValue());
    }

    /**
     * Persist the artikel with the trelloApi
     * @param trelloApi the API
     * @param artikel the artikel to persist
     * @private
     */
    _persistArtikel(trelloApi, artikel) {
        trelloApi.set('card', 'shared', ArtikelController.SHARED_NAME, artikel);
    }

}
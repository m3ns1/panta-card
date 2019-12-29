class Import {

    constructor(title) {
        /**
         * @type {string}
         */
        this.title = title;
        /**
         * @type {HeaderNode}
         */
        this.header = null;

        /**
         * Data holder
         * @type {DataNode[]}
         */
        this.data = [];
    }

    /**
     * @param address
     * @return {HeaderNode}
     */
    getHeader(address) {
        const headers = this.getHeaders(this.header);
        return Object.entries(headers).filter(it => {
            return XLSX.utils.decode_cell(it[0]).c === address.c;
        }).map(it => it[1])[0];
    }

    /**
     * @param {HeaderNode} node
     */
    getHeaders(node) {
        const that = this;
        const headers = {};
        node.children.forEach(it => {
            if (it.hasChildren()) {
                Object.entries(that.getHeaders(it)).forEach(it => {
                    headers[it[0]] = it[1];
                });
            } else {
                if (it.address.hasOwnProperty('c') && it.address.hasOwnProperty('r')) {
                    headers[XLSX.utils.encode_cell(it.address)] = it;
                } else if (it.address.hasOwnProperty('constant')) {
                    headers[XLSX.utils.encode_cell(it.address)] = it.address.constant;
                }
            }
        });
        return headers;
    }

    /**
     * @return {HeaderNode[]}
     */
    getNormalizedHeaders() {
        return this.getHeaders(this.header);
    }

    put(node) {
       this.data.push(node);
    }

    /**
     * Get a sample value if there's one at the given position
     * @param {HeaderNode} header
     * @return {{header: string, value: any}|null}
     */
    getSample(header) {
        if (this.data.length > 0) {
            return this.data[0].get(header);
        } else {
            return null;
        }
    }

    getSampleText(sample, field) {
        if (field && sample) {
            return field.getValue(sample);
        } else if (sample && sample.value) {
            const type = sample.value.t;
            const raw = sample.value.v;
            switch (type) {
                case "b":
                    return raw === true ? 'An' : 'Aus';
                case "e":
                    return "Ungültiger Wert";
                case "n": // number
                    return sample.value.w ? sample.value.w : raw;
                case "d": // date
                    console.debug(`got a date ${raw}`);
                    return raw.toISOString();
                case "s":
                    return sample.value.w ? sample.value.w : raw;
                default:
                    return sample.value.w ? sample.value.w : raw;
            }
        } else {
            return '';
        }
    }

    /**
     * @param {{header: string, value: any}|null} sample
     * @param {Document} document
     * @param {AbstractField} field
     */
    getSampleHtml(sample, document, field = null) {
        if (field && sample) {
            return this._getHtml(field.getValue(sample), document);
        } else if (sample && sample.value) {
            const type = sample.value.t;
            const raw = sample.value.v;
            return this._getSampleHtml(sample, raw, type, document);
        } else {
            return '';
        }
    }

    _getSampleHtml(sample, raw, type, document) {
        switch (type) {
            case "b":
                return this._getHtml(raw, document);
            case "e":
                return "Ungültiger Wert";
            case "n": // number
                return this._getHtml(sample.value.w ? sample.value.w : raw, document);
            case "d": // date
                return this._getHtml(raw, document);
            case "s":
                return this._getHtml(this.getSampleText(sample), document);
            default:
                return this._getHtml(sample.value.w ? sample.value.w : raw, document);
        }
    }

    _getHtml(raw, document) {
        if (typeof raw === 'boolean') {
            return this._getSwitch(raw, document);
        } else if (raw instanceof Date) {
            return this._getDateTime(raw);
        } else if (isNumber(raw)) {
            return raw;
        } else if (Array.isArray(raw)) {
            return raw.map(it => this._getHtml(it, document)).reduce((prev,cur) => {
                prev += cur;
                return prev;
            }, '');
        } else if (raw !== null) {
            return `<p class="nobreak" title="${raw}">${raw}</p>`;
        } else {
            return '';
        }
    }

    _getDateTime(raw) {
        const dateOf = raw instanceof Date ? raw : DateField.getDateOf(raw);
        return dateOf ? dateOf.toLocaleDateString() : raw;
    }

    _getSwitch(raw, document) {
        const bvalue = typeof raw === 'boolean' ? raw : BooleanField.getBooleanValue(raw);
        const item = new SwitchItem(document, "", bvalue, true);
        item.additionalStyles = "borderless";
        return item.render().innerHTML;
    }

}